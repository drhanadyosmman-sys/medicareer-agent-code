import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Application, Document, User } from "../drizzle/schema";

/**
 * These files are passports and medical certificates. The route they are served
 * from previously had no identity check at all, so these tests exist to make
 * sure that never quietly comes back.
 */

const docs: Document[] = [];
const apps: Application[] = [];
let authedUser: User | null = null;

vi.mock("./repos", () => ({
  documentsRepo: {
    findByStorageKey: async (key: string) => docs.find(d => d.storageKey === key),
  },
  applicationsRepo: {
    findById: async (id: number) => apps.find(a => a.id === id),
  },
}));

vi.mock("./_core/sdk", () => ({
  sdk: {
    authenticateRequest: async () => {
      if (!authedUser) throw new Error("no session");
      return authedUser;
    },
  },
}));

// Pretend storage is configured, and make presign observable.
vi.mock("./_core/env", () => ({
  ENV: { forgeApiUrl: "https://forge.test", forgeApiKey: "test-key" },
}));

const { registerSecureStorageRoute } = await import("./secureStorageRoute");

function buildHandler() {
  let handler!: (req: any, res: any) => Promise<unknown>;
  registerSecureStorageRoute({
    get: (_p: string, h: (req: any, res: any) => Promise<unknown>) => {
      handler = h;
    },
  } as never);
  return handler;
}

function fakeRes() {
  const state: {
    status?: number;
    body?: string;
    redirectedTo?: string;
    headers: Record<string, string>;
  } = { headers: {} };
  const res: any = {
    status(code: number) {
      state.status = code;
      return res;
    },
    send(body: string) {
      state.body = body;
      return res;
    },
    set(k: string, v: string) {
      state.headers[k] = v;
      return res;
    },
    redirect(code: number, to: string) {
      state.status = code;
      state.redirectedTo = to;
      return res;
    },
  };
  return { res, state };
}

const req = (key: string) => ({ params: { 0: key }, headers: {} });

function user(id: number, role: "user" | "admin" = "user"): User {
  return { id, role, openId: `o${id}`, email: `u${id}@x.com`, name: `U${id}` } as User;
}

beforeEach(() => {
  docs.length = 0;
  apps.length = 0;
  authedUser = null;
  apps.push({ id: 1, userId: 10 } as Application);
  docs.push({
    id: 100,
    applicationId: 1,
    storageKey: "applications/1/passport/passport_ab12cd34.pdf",
  } as Document);

  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      json: async () => ({ url: "https://s3.test/signed-url" }),
      text: async () => "",
    }))
  );
});

const KEY = "applications/1/passport/passport_ab12cd34.pdf";

describe("downloading a stored document", () => {
  it("refuses an anonymous request", async () => {
    authedUser = null;
    const { res, state } = fakeRes();
    await buildHandler()(req(KEY), res);

    expect(state.status).toBe(404);
    expect(state.redirectedTo).toBeUndefined();
  });

  it("refuses another doctor, and does not reveal that the file exists", async () => {
    authedUser = user(99); // not the owner (owner is user 10)
    const { res, state } = fakeRes();
    await buildHandler()(req(KEY), res);

    expect(state.status).toBe(404);
    expect(state.redirectedTo).toBeUndefined();
  });

  it("gives the same answer for someone else's file as for a file that does not exist", async () => {
    authedUser = user(99);
    const other = fakeRes();
    await buildHandler()(req(KEY), other.res);

    const missing = fakeRes();
    await buildHandler()(req("applications/1/passport/does-not-exist.pdf"), missing.res);

    expect(other.state.status).toBe(missing.state.status);
    expect(other.state.body).toBe(missing.state.body);
  });

  it("serves the file to the doctor it belongs to", async () => {
    authedUser = user(10); // the owner
    const { res, state } = fakeRes();
    await buildHandler()(req(KEY), res);

    expect(state.status).toBe(307);
    expect(state.redirectedTo).toBe("https://s3.test/signed-url");
  });

  it("serves the file to an admin", async () => {
    authedUser = user(77, "admin");
    const { res, state } = fakeRes();
    await buildHandler()(req(KEY), res);

    expect(state.status).toBe(307);
    expect(state.redirectedTo).toBe("https://s3.test/signed-url");
  });

  it("never lets a signed URL be cached", async () => {
    authedUser = user(10);
    const { res, state } = fakeRes();
    await buildHandler()(req(KEY), res);

    expect(state.headers["Cache-Control"]).toMatch(/no-store/);
    expect(state.headers["Cache-Control"]).toMatch(/private/);
  });

  it("rejects an empty key", async () => {
    authedUser = user(10);
    const { res, state } = fakeRes();
    await buildHandler()({ params: { 0: "" }, headers: {} }, res);

    expect(state.status).toBe(400);
  });

  it("refuses a document whose application has vanished", async () => {
    apps.length = 0;
    authedUser = user(10);
    const { res, state } = fakeRes();
    await buildHandler()(req(KEY), res);

    expect(state.status).toBe(404);
    expect(state.redirectedTo).toBeUndefined();
  });
});
