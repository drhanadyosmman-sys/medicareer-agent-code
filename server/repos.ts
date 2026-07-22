import { and, desc, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  adminNotes,
  applications,
  documents,
  messages,
  users,
  type InsertAdminNote,
  type InsertApplication,
  type InsertDocument,
  type InsertMessage,
  type User,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { getDb } from "./db";

/**
 * Every query goes through here so a missing DATABASE_URL fails with one clear
 * message instead of a null-dereference deep inside a procedure.
 */
async function db() {
  const conn = await getDb();
  if (!conn) {
    throw new Error("Database is not configured - set DATABASE_URL in the environment.");
  }
  return conn;
}

/* ------------------------------------------------------------------ users */

export const usersRepo = {
  async findByEmail(email: string): Promise<User | undefined> {
    const conn = await db();
    const rows = await conn
      .select()
      .from(users)
      .where(eq(users.email, normalizeEmail(email)))
      .limit(1);
    return rows[0];
  },

  async findById(id: number): Promise<User | undefined> {
    const conn = await db();
    const rows = await conn.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0];
  },

  /**
   * Create a doctor account with a password. `openId` is minted locally so the
   * row is compatible with the shared session/lookup machinery used by OAuth users.
   *
   * Relies on the unique index on `email`; a concurrent duplicate registration
   * fails at the database rather than racing past an application-level check.
   */
  async createPasswordUser(input: {
    email: string;
    passwordHash: string;
    name: string;
  }): Promise<User> {
    const conn = await db();
    const openId = `local_${nanoid(24)}`;

    await conn.insert(users).values({
      openId,
      email: normalizeEmail(input.email),
      passwordHash: input.passwordHash,
      name: input.name,
      loginMethod: "password",
      role: "user",
      lastSignedIn: new Date(),
    });

    const created = await conn.select().from(users).where(eq(users.openId, openId)).limit(1);
    if (!created[0]) throw new Error("Failed to load user immediately after insert");
    return created[0];
  },

  async touchLastSignedIn(id: number): Promise<void> {
    const conn = await db();
    await conn.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, id));
  },

  async setRole(id: number, role: "user" | "admin"): Promise<void> {
    const conn = await db();
    await conn.update(users).set({ role }).where(eq(users.id, id));
  },

  /** Replaces any outstanding login link, so only the newest one works. */
  async setLoginToken(id: number, hash: string, expiresAt: Date): Promise<void> {
    const conn = await db();
    await conn
      .update(users)
      .set({ loginTokenHash: hash, loginTokenExpiresAt: expiresAt })
      .where(eq(users.id, id));
  },

  /** Called on redeem so a link cannot be used twice. */
  async clearLoginToken(id: number): Promise<void> {
    const conn = await db();
    await conn
      .update(users)
      .set({ loginTokenHash: null, loginTokenExpiresAt: null })
      .where(eq(users.id, id));
  },

  /**
   * Finds the account holding this login token.
   *
   * Looked up by hash rather than scanning, so the token itself never has to be
   * compared against every row.
   */
  async findByLoginTokenHash(hash: string): Promise<User | undefined> {
    const conn = await db();
    const rows = await conn
      .select()
      .from(users)
      .where(eq(users.loginTokenHash, hash))
      .limit(1);
    return rows[0];
  },
};

/**
 * Whether this account should be promoted to admin right now.
 *
 * Pure so it can be tested without a database. Deliberately one-way: it never
 * demotes, so removing an entry from ADMIN_EMAILS does not silently strip access
 * from someone mid-session.
 */
export function shouldPromoteToAdmin(
  user: { email: string | null; role: string },
  allowlist: string[] = ENV.adminEmails
): boolean {
  if (user.role === "admin") return false;
  const email = user.email?.trim().toLowerCase();
  if (!email) return false;
  return allowlist.includes(email);
}

/**
 * Grants the admin role to accounts listed in ADMIN_EMAILS. Called on sign-in so
 * a first admin can exist at all - roles default to "user", and only an admin
 * could otherwise grant one.
 */
export async function applyAdminAllowlist(user: User): Promise<User> {
  if (!shouldPromoteToAdmin(user)) return user;
  await usersRepo.setRole(user.id, "admin");
  return { ...user, role: "admin" };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/* ----------------------------------------------------------- applications */

export const applicationsRepo = {
  async create(input: InsertApplication) {
    const conn = await db();
    const result = await conn.insert(applications).values(input);
    // mysql2 returns insertId on the result header.
    const insertId = Number((result as unknown as { insertId: number }).insertId);
    return insertId;
  },

  async findById(id: number) {
    const conn = await db();
    const rows = await conn.select().from(applications).where(eq(applications.id, id)).limit(1);
    return rows[0];
  },

  async listForUser(userId: number) {
    const conn = await db();
    return conn
      .select()
      .from(applications)
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.createdAt));
  },

  async listAll(opts: { status?: (typeof applications.status.enumValues)[number] } = {}) {
    const conn = await db();
    const query = conn.select().from(applications);
    const rows = opts.status
      ? await query.where(eq(applications.status, opts.status)).orderBy(desc(applications.createdAt))
      : await query.orderBy(desc(applications.createdAt));
    return rows;
  },

  async update(id: number, updates: Partial<InsertApplication>) {
    const conn = await db();
    await conn.update(applications).set(updates).where(eq(applications.id, id));
  },

  async countAll(): Promise<number> {
    const conn = await db();
    const rows = await conn.select({ n: sql<number>`count(*)` }).from(applications);
    return Number(rows[0]?.n ?? 0);
  },
};

/* -------------------------------------------------------------- documents */

export const documentsRepo = {
  async create(input: InsertDocument) {
    const conn = await db();
    await conn.insert(documents).values(input);
  },

  async listForApplication(applicationId: number) {
    const conn = await db();
    return conn
      .select()
      .from(documents)
      .where(eq(documents.applicationId, applicationId))
      .orderBy(desc(documents.uploadedAt));
  },

  async findById(id: number) {
    const conn = await db();
    const rows = await conn.select().from(documents).where(eq(documents.id, id)).limit(1);
    return rows[0];
  },

  /**
   * Resolves a stored file back to its document row, so a download request can
   * be checked against who owns the application it belongs to.
   */
  async findByStorageKey(storageKey: string) {
    const conn = await db();
    const rows = await conn
      .select()
      .from(documents)
      .where(eq(documents.storageKey, storageKey))
      .limit(1);
    return rows[0];
  },

  async remove(id: number) {
    const conn = await db();
    await conn.delete(documents).where(eq(documents.id, id));
  },
};

/* --------------------------------------------------------------- messages */

export const messagesRepo = {
  async create(input: InsertMessage) {
    const conn = await db();
    await conn.insert(messages).values(input);
  },

  async listForApplication(applicationId: number) {
    const conn = await db();
    return conn
      .select()
      .from(messages)
      .where(eq(messages.applicationId, applicationId))
      .orderBy(messages.createdAt);
  },

  /** Marks the other party's messages as read - never the reader's own. */
  async markRead(applicationId: number, readerIs: "admin" | "user") {
    const conn = await db();
    const from = readerIs === "admin" ? "user" : "admin";
    await conn
      .update(messages)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(messages.applicationId, applicationId),
          eq(messages.sender, from),
          sql`${messages.readAt} is null`
        )
      );
  },
};

/* ------------------------------------------------------------ admin notes */

export const adminNotesRepo = {
  async create(input: InsertAdminNote) {
    const conn = await db();
    await conn.insert(adminNotes).values(input);
  },

  async listForApplication(applicationId: number) {
    const conn = await db();
    return conn
      .select()
      .from(adminNotes)
      .where(eq(adminNotes.applicationId, applicationId))
      .orderBy(desc(adminNotes.createdAt));
  },
};
