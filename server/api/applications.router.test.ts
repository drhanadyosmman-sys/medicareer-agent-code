import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Application, User } from "../../drizzle/schema";
import type { TrpcContext } from "../_core/context";

/** In-memory stand-ins so the real authorisation logic runs without a database. */
const apps: Application[] = [];
const docs: { id: number; applicationId: number }[] = [];
const sentMessages: { applicationId: number; sender: string; content: string }[] = [];
const notes: { applicationId: number; content: string }[] = [];

vi.mock("../repos", () => ({
  normalizeEmail: (e: string) => e.trim().toLowerCase(),
  applicationsRepo: {
    findById: async (id: number) => apps.find(a => a.id === id),
    listForUser: async (userId: number) => apps.filter(a => a.userId === userId),
    listAll: async () => apps,
    create: async (input: Application) => {
      const id = apps.length + 1;
      apps.push({ ...input, id } as Application);
      return id;
    },
    update: async (id: number, updates: Partial<Application>) => {
      const i = apps.findIndex(a => a.id === id);
      if (i >= 0) apps[i] = { ...apps[i], ...updates };
    },
  },
  documentsRepo: {
    findById: async (id: number) => docs.find(d => d.id === id),
    listForApplication: async (applicationId: number) =>
      docs.filter(d => d.applicationId === applicationId),
    create: async () => {},
    remove: async (id: number) => {
      const i = docs.findIndex(d => d.id === id);
      if (i >= 0) docs.splice(i, 1);
    },
  },
  messagesRepo: {
    listForApplication: async (applicationId: number) =>
      sentMessages.filter(m => m.applicationId === applicationId),
    create: async (m: { applicationId: number; sender: string; content: string }) => {
      sentMessages.push(m);
    },
    markRead: async () => {},
  },
  adminNotesRepo: {
    listForApplication: async (applicationId: number) =>
      notes.filter(n => n.applicationId === applicationId),
    create: async (n: { applicationId: number; content: string }) => notes.push(n),
  },
}));

const { appRouter } = await import("../routers");

function user(id: number, role: "user" | "admin" = "user"): User {
  return {
    id,
    openId: `local_${id}`,
    email: `u${id}@example.com`,
    passwordHash: null,
    name: `User ${id}`,
    loginMethod: "password",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  } as User;
}

function ctxFor(u: User | null): TrpcContext {
  return {
    user: u,
    req: { protocol: "https", headers: {} },
    res: { cookie: () => {}, clearCookie: () => {} },
  } as unknown as TrpcContext;
}

const caller = (u: User | null) => appRouter.createCaller(ctxFor(u));

const DOCTOR_A = user(1);
const DOCTOR_B = user(2);
const ADMIN = user(99, "admin");

beforeEach(() => {
  apps.length = 0;
  docs.length = 0;
  sentMessages.length = 0;
  notes.length = 0;

  apps.push({ id: 1, userId: DOCTOR_A.id, fullName: "Dr A", status: "submitted" } as Application);
  apps.push({ id: 2, userId: DOCTOR_B.id, fullName: "Dr B", status: "submitted" } as Application);
  docs.push({ id: 10, applicationId: 1 });
  notes.push({ applicationId: 1, content: "internal: weak CV, needs rewrite" });
});

describe("signed-out access", () => {
  it("is refused everywhere", async () => {
    const c = caller(null);
    await expect(c.applications.mine()).rejects.toThrow();
    await expect(c.applications.byId({ id: 1 })).rejects.toThrow();
    await expect(c.applications.listAll()).rejects.toThrow();
  });
});

describe("a doctor can only reach their own application", () => {
  it("sees their own", async () => {
    const result = await caller(DOCTOR_A).applications.byId({ id: 1 });
    expect(result.fullName).toBe("Dr A");
  });

  it("cannot read another doctor's application", async () => {
    await expect(caller(DOCTOR_A).applications.byId({ id: 2 })).rejects.toThrow(/not found/i);
  });

  it("reports someone else's application the same way as a missing one", async () => {
    const others = await caller(DOCTOR_A)
      .applications.byId({ id: 2 })
      .catch(e => e.message);
    const missing = await caller(DOCTOR_A)
      .applications.byId({ id: 12345 })
      .catch(e => e.message);
    // Identical, so ids cannot be probed for existence.
    expect(others).toBe(missing);
  });

  it("only lists their own applications", async () => {
    const mine = await caller(DOCTOR_A).applications.mine();
    expect(mine.map(a => a.id)).toEqual([1]);
  });

  it("cannot post a message onto another doctor's application", async () => {
    await expect(
      caller(DOCTOR_A).applications.sendMessage({ applicationId: 2, content: "hello" })
    ).rejects.toThrow(/not found/i);
    expect(sentMessages).toHaveLength(0);
  });

  it("cannot list or delete another doctor's documents", async () => {
    await expect(
      caller(DOCTOR_B).applications.listDocuments({ applicationId: 1 })
    ).rejects.toThrow(/not found/i);
    await expect(caller(DOCTOR_B).applications.removeDocument({ id: 10 })).rejects.toThrow(
      /not found/i
    );
    expect(docs).toHaveLength(1);
  });

  it("cannot attach a document to another doctor's application", async () => {
    await expect(
      caller(DOCTOR_A).applications.attachDocument({
        applicationId: 2,
        category: "cv",
        name: "cv.pdf",
        sizeBytes: 1000,
        storageKey: "k",
      })
    ).rejects.toThrow(/not found/i);
  });
});

describe("admin-only procedures reject doctors", () => {
  it("refuses listAll, setStatus, updateGuidance, adminNotes, addAdminNote", async () => {
    const c = caller(DOCTOR_A);
    await expect(c.applications.listAll()).rejects.toThrow();
    await expect(c.applications.setStatus({ id: 1, status: "under-review" })).rejects.toThrow();
    await expect(c.applications.updateGuidance({ id: 1, readinessScore: 90 })).rejects.toThrow();
    await expect(c.applications.adminNotes({ applicationId: 1 })).rejects.toThrow();
    await expect(
      c.applications.addAdminNote({ applicationId: 1, content: "x", type: "general" })
    ).rejects.toThrow();
  });

  it("does not let a doctor change their own application status", async () => {
    await expect(
      caller(DOCTOR_A).applications.setStatus({ id: 1, status: "interview-preparation" })
    ).rejects.toThrow();
    expect(apps.find(a => a.id === 1)?.status).toBe("submitted");
  });
});

describe("internal notes stay internal", () => {
  it("are not included when a doctor reads their own application", async () => {
    const result = await caller(DOCTOR_A).applications.byId({ id: 1 });
    expect(result).not.toHaveProperty("adminNotes");
    expect(JSON.stringify(result)).not.toContain("weak CV");
  });

  it("are readable by an admin", async () => {
    const result = await caller(ADMIN).applications.adminNotes({ applicationId: 1 });
    expect(result[0].content).toContain("weak CV");
  });
});

describe("message sender is taken from the session, not the client", () => {
  it("marks a doctor's message as from the doctor", async () => {
    await caller(DOCTOR_A).applications.sendMessage({ applicationId: 1, content: "hi" });
    expect(sentMessages.at(-1)).toMatchObject({ sender: "user", content: "hi" });
  });

  it("marks an admin's message as from the admin", async () => {
    await caller(ADMIN).applications.sendMessage({ applicationId: 1, content: "reply" });
    expect(sentMessages.at(-1)).toMatchObject({ sender: "admin" });
  });

  it("rejects an empty message", async () => {
    await expect(
      caller(DOCTOR_A).applications.sendMessage({ applicationId: 1, content: "   " })
    ).rejects.toThrow();
  });
});

describe("submit", () => {
  it("files the application against the signed-in user, ignoring any client-supplied id", async () => {
    const result = await caller(DOCTOR_B).applications.submit({
      fullName: "Dr B",
      email: "b@example.com",
      internshipCompleted: true,
      nhsExperience: false,
      previousUkApplications: false,
      previousInterviews: false,
      readinessScore: 60,
      missingDocuments: [],
      recommendedSteps: [],
    });

    const created = apps.find(a => a.id === result.id);
    expect(created?.userId).toBe(DOCTOR_B.id);
  });

  it("sends the confirmation message", async () => {
    const result = await caller(DOCTOR_A).applications.submit({
      fullName: "Dr A",
      email: "a@example.com",
      internshipCompleted: true,
      nhsExperience: false,
      previousUkApplications: false,
      previousInterviews: false,
      readinessScore: 50,
      missingDocuments: [],
      recommendedSteps: [],
    });
    expect(sentMessages.find(m => m.applicationId === result.id)).toMatchObject({
      sender: "admin",
    });
  });

  it("rejects a missing name or bad email", async () => {
    const base = {
      internshipCompleted: false,
      nhsExperience: false,
      previousUkApplications: false,
      previousInterviews: false,
      readinessScore: 0,
      missingDocuments: [],
      recommendedSteps: [],
    };
    await expect(
      caller(DOCTOR_A).applications.submit({ ...base, fullName: "", email: "a@example.com" })
    ).rejects.toThrow();
    await expect(
      caller(DOCTOR_A).applications.submit({ ...base, fullName: "Dr A", email: "nope" })
    ).rejects.toThrow();
  });
});
