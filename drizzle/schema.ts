import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 *
 * Two kinds of user share this table:
 *  - doctors who register with email + password (`passwordHash` set, `openId` is a
 *    locally minted `local_*` id so the existing session machinery still works)
 *  - Manus OAuth users (`passwordHash` null, `openId` from the OAuth provider)
 */
export const users = mysqlTable(
  "users",
  {
    /**
     * Surrogate primary key. Auto-incremented numeric value managed by the database.
     * Use this for relations between tables.
     */
    id: int("id").autoincrement().primaryKey(),
    /** Manus OAuth identifier (openId), or a locally minted `local_*` id for password users. */
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }),
    /** scrypt hash, `scrypt$N$r$p$salt$key`. Null for OAuth users, who have no password. */
    passwordHash: varchar("passwordHash", { length: 255 }),
    /**
     * SHA-256 of the outstanding email login link, hex. Stored hashed so a database
     * leak does not hand out working login links. Cleared when redeemed, and
     * overwritten when a new link is requested, so only the newest link works and
     * only once.
     */
    loginTokenHash: varchar("loginTokenHash", { length: 64 }),
    loginTokenExpiresAt: timestamp("loginTokenExpiresAt"),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  table => [
    // Password login looks users up by email, so it must identify at most one row.
    // MySQL permits many NULLs under a unique index, which is what we want for
    // OAuth users who may arrive without an email.
    uniqueIndex("users_email_unique").on(table.email),
  ]
);

export const APPLICATION_STATUSES = [
  "submitted",
  "under-review",
  "cv-optimization",
  "job-matching",
  "applications-prepared",
  "interview-preparation",
] as const;

/** One doctor's application to the service. */
export const applications = mysqlTable(
  "applications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    status: mysqlEnum("status", APPLICATION_STATUSES).default("submitted").notNull(),
    readinessScore: int("readinessScore").default(0).notNull(),

    // Step 1 - personal details
    fullName: varchar("fullName", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    whatsapp: varchar("whatsapp", { length: 40 }),
    countryOfResidence: varchar("countryOfResidence", { length: 120 }),
    nationality: varchar("nationality", { length: 120 }),
    preferredPathway: varchar("preferredPathway", { length: 120 }),

    // Step 2 - medical background
    medicalSchool: varchar("medicalSchool", { length: 255 }),
    graduationYear: varchar("graduationYear", { length: 10 }),
    internshipCompleted: boolean("internshipCompleted").default(false).notNull(),
    yearsExperience: varchar("yearsExperience", { length: 20 }),
    currentRole: varchar("currentRole", { length: 255 }),
    specialtyInterest: varchar("specialtyInterest", { length: 255 }),
    currentCountryOfPractice: varchar("currentCountryOfPractice", { length: 120 }),

    // Step 3 - UK readiness
    gmcStatus: varchar("gmcStatus", { length: 120 }),
    plabStatus: varchar("plabStatus", { length: 120 }),
    ieltsOetStatus: varchar("ieltsOetStatus", { length: 120 }),
    alsBlsStatus: varchar("alsBlsStatus", { length: 120 }),
    // Nullable on purpose: null means "not answered", which the eligibility
    // engine treats differently from an explicit "no".
    ukRightToWork: boolean("ukRightToWork"),
    nhsExperience: boolean("nhsExperience").default(false).notNull(),
    previousUkApplications: boolean("previousUkApplications").default(false).notNull(),
    previousInterviews: boolean("previousInterviews").default(false).notNull(),

    // Step 5 - career story
    careerStory: text("careerStory"),

    /** string[] - checklist shown to the doctor. */
    missingDocuments: json("missingDocuments").$type<string[]>(),
    /** string[] - next steps shown to the doctor. */
    recommendedSteps: json("recommendedSteps").$type<string[]>(),

    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("applications_userId_idx").on(table.userId)]
);

export const DOCUMENT_CATEGORIES = [
  "cv",
  "passport",
  "medical-degree",
  "internship-certificate",
  "experience-certificates",
  "english-test",
  "gmc-certificate",
  "research-publications",
  "quality-improvement",
  "leadership-evidence",
  "teaching-experience",
  "clinical-audit",
  "voice-note",
  "other",
] as const;

/**
 * A file the doctor uploaded. The bytes live in object storage; only the key is
 * kept here so the database stays small and the file is never inlined into a
 * response by accident.
 */
export const documents = mysqlTable(
  "documents",
  {
    id: int("id").autoincrement().primaryKey(),
    applicationId: int("applicationId").notNull(),
    category: mysqlEnum("category", DOCUMENT_CATEGORIES).notNull(),
    /** Original filename as supplied by the uploader; display only. */
    name: varchar("name", { length: 255 }).notNull(),
    mimeType: varchar("mimeType", { length: 127 }),
    sizeBytes: int("sizeBytes").notNull(),
    /** Object-storage key. Never a public URL - links are signed on demand. */
    storageKey: varchar("storageKey", { length: 512 }).notNull(),
    uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  },
  table => [index("documents_applicationId_idx").on(table.applicationId)]
);

/** Messages between the doctor and the consultant handling their application. */
export const messages = mysqlTable(
  "messages",
  {
    id: int("id").autoincrement().primaryKey(),
    applicationId: int("applicationId").notNull(),
    sender: mysqlEnum("sender", ["admin", "user"]).notNull(),
    content: text("content").notNull(),
    readAt: timestamp("readAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("messages_applicationId_idx").on(table.applicationId)]
);

export const ADMIN_NOTE_TYPES = [
  "general",
  "cv-review",
  "supporting-info",
  "interview-prep",
  "career-assessment",
  "application-package",
  "career-plan",
] as const;

/** Internal notes. Never exposed on any doctor-facing procedure. */
export const adminNotes = mysqlTable(
  "adminNotes",
  {
    id: int("id").autoincrement().primaryKey(),
    applicationId: int("applicationId").notNull(),
    authorUserId: int("authorUserId"),
    type: mysqlEnum("type", ADMIN_NOTE_TYPES).default("general").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("adminNotes_applicationId_idx").on(table.applicationId)]
);

export const usersRelations = relations(users, ({ many }) => ({
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  user: one(users, { fields: [applications.userId], references: [users.id] }),
  documents: many(documents),
  messages: many(messages),
  adminNotes: many(adminNotes),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  application: one(applications, {
    fields: [documents.applicationId],
    references: [applications.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  application: one(applications, {
    fields: [messages.applicationId],
    references: [applications.id],
  }),
}));

export const adminNotesRelations = relations(adminNotes, ({ one }) => ({
  application: one(applications, {
    fields: [adminNotes.applicationId],
    references: [applications.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type AdminNote = typeof adminNotes.$inferSelect;
export type InsertAdminNote = typeof adminNotes.$inferInsert;
