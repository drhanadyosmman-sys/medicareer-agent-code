import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "../../drizzle/schema";
import {
  generateLoginToken,
  hashLoginToken,
  loginTokenExpiryFrom,
} from "./loginLink";

/**
 * Exercises the real redemption handler against an in-memory users table. This
 * is the half of the login-link flow a browser cannot reach without a database,
 * and the half where a mistake hands out sessions.
 */

const fakeUsers: User[] = [];

vi.mock("../repos", async () => {
  const actual = await vi.importActual<typeof import("../repos")>("../repos");
  return {
    shouldPromoteToAdmin: actual.shouldPromoteToAdmin,
    applyAdminAllowlist: async (user: User) =>
      actual.shouldPromoteToAdmin(user) ? { ...user, role: "admin" as const } : user,
    usersRepo: {
      findByLoginTokenHash: async (hash: string) =>
        fakeUsers.find(u => u.loginTokenHash === hash),
      clearLoginToken: async (id: number) => {
        const u = fakeUsers.find(x => x.id === id);
        if (u) {
          u.loginTokenHash = null;
          u.loginTokenExpiresAt = null;
        }
      },
      touchLastSignedIn: async () => {},
    },
  };
});

const { registerLoginLinkRoute } = await import("./loginLinkRoute");

/** Captures the handler the route module registers, then drives it directly. */
function buildHandler() {
  let handler!: (req: any, res: any) => Promise<unknown>;
  registerLoginLinkRoute({
    get: (_path: string, h: (req: any, res: any) => Promise<unknown>) => {
      handler = h;
    },
  } as never);
  return handler;
}

function fakeReqRes(token?: string) {
  const cookies: { name: string; value: string; options: Record<string, unknown> }[] = [];
  const redirects: { status: number; to: string }[] = [];
  const req = {
    query: token === undefined ? {} : { token },
    protocol: "https",
    headers: { host: "agent.tmla.com.sa" },
  };
  const res = {
    cookie: (name: string, value: string, options: Record<string, unknown>) =>
      cookies.push({ name, value, options }),
    redirect: (status: number, to: string) => {
      redirects.push({ status, to });
      return undefined;
    },
  };
  return { req, res, cookies, redirects };
}

function seedUser(overrides: Partial<User> = {}): { user: User; token: string } {
  const token = generateLoginToken();
  const user = {
    id: 1,
    openId: "local_seed",
    email: "doc@example.com",
    passwordHash: null,
    loginTokenHash: hashLoginToken(token),
    loginTokenExpiresAt: loginTokenExpiryFrom(),
    name: "Dr Seed",
    loginMethod: "password",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  } as User;
  fakeUsers.push(user);
  return { user, token };
}

beforeEach(() => {
  fakeUsers.length = 0;
});

describe("redeeming a login link", () => {
  it("signs the doctor in and sends them to the dashboard", async () => {
    const { token } = seedUser();
    const { req, res, cookies, redirects } = fakeReqRes(token);

    await buildHandler()(req, res);

    expect(redirects).toEqual([{ status: 302, to: "/dashboard" }]);
    expect(cookies).toHaveLength(1);
    expect(cookies[0].options).toMatchObject({ httpOnly: true, secure: true });
    expect(cookies[0].value).toBeTruthy();
  });

  it("sends an admin to the admin panel instead", async () => {
    // owner@example.com is in ADMIN_EMAILS for the test suite.
    const { token } = seedUser({ email: "owner@example.com" });
    const { req, res, redirects } = fakeReqRes(token);

    await buildHandler()(req, res);

    expect(redirects).toEqual([{ status: 302, to: "/admin" }]);
  });

  it("works only once - a second click is refused", async () => {
    const { token } = seedUser();
    const handler = buildHandler();

    const first = fakeReqRes(token);
    await handler(first.req, first.res);
    expect(first.redirects[0].to).toBe("/dashboard");

    const second = fakeReqRes(token);
    await handler(second.req, second.res);
    expect(second.redirects[0].to).toBe("/login?error=invalid-link");
    expect(second.cookies).toHaveLength(0);
  });

  it("refuses an expired link and issues no session", async () => {
    const { token } = seedUser({
      loginTokenExpiresAt: new Date(Date.now() - 1000),
    });
    const { req, res, cookies, redirects } = fakeReqRes(token);

    await buildHandler()(req, res);

    expect(redirects).toEqual([{ status: 302, to: "/login?error=expired-link" }]);
    expect(cookies).toHaveLength(0);
  });

  it("clears an expired link so it cannot linger", async () => {
    const { user, token } = seedUser({ loginTokenExpiresAt: new Date(Date.now() - 1000) });
    const { req, res } = fakeReqRes(token);

    await buildHandler()(req, res);

    expect(user.loginTokenHash).toBeNull();
  });

  it("refuses a token that belongs to nobody", async () => {
    seedUser();
    const { req, res, cookies, redirects } = fakeReqRes(generateLoginToken());

    await buildHandler()(req, res);

    expect(redirects).toEqual([{ status: 302, to: "/login?error=invalid-link" }]);
    expect(cookies).toHaveLength(0);
  });

  it("refuses a missing or empty token", async () => {
    seedUser();
    for (const token of [undefined, ""]) {
      const { req, res, cookies, redirects } = fakeReqRes(token);
      await buildHandler()(req, res);
      expect(redirects).toEqual([{ status: 302, to: "/login?error=invalid-link" }]);
      expect(cookies).toHaveLength(0);
    }
  });

  it("does not accept the stored hash in place of the token", async () => {
    const { user } = seedUser();
    // Someone who read the database still cannot sign in with what they found.
    const { req, res, cookies, redirects } = fakeReqRes(user.loginTokenHash!);

    await buildHandler()(req, res);

    expect(redirects).toEqual([{ status: 302, to: "/login?error=invalid-link" }]);
    expect(cookies).toHaveLength(0);
  });
});
