import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "../../drizzle/schema";
import type { TrpcContext } from "../_core/context";
import { loginTokenMatches } from "../auth/loginLink";
import { hashPassword } from "../auth/password";

/**
 * In-memory stand-in for the users table. Lets the real router logic run - the
 * duplicate check, the password comparison, the response shaping - without a
 * database, which is where the bugs that matter actually live.
 */
const fakeUsers: User[] = [];

vi.mock("../repos", async () => {
  // Keep the real promotion decision; only the database access is faked.
  const actual = await vi.importActual<typeof import("../repos")>("../repos");
  return {
  shouldPromoteToAdmin: actual.shouldPromoteToAdmin,
  applyAdminAllowlist: async (user: User) =>
    actual.shouldPromoteToAdmin(user) ? { ...user, role: "admin" as const } : user,
  normalizeEmail: (e: string) => e.trim().toLowerCase(),
  usersRepo: {
    findByEmail: async (email: string) =>
      fakeUsers.find(u => u.email === email.trim().toLowerCase()),
    findById: async (id: number) => fakeUsers.find(u => u.id === id),
    createPasswordUser: async (input: {
      email: string;
      passwordHash: string;
      name: string;
    }) => {
      const user = {
        id: fakeUsers.length + 1,
        openId: `local_test_${fakeUsers.length + 1}`,
        email: input.email.trim().toLowerCase(),
        passwordHash: input.passwordHash,
        name: input.name,
        loginMethod: "password",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      } as User;
      fakeUsers.push(user);
      return user;
    },
    touchLastSignedIn: async () => {},
    setRole: async () => {},
    setLoginToken: async (id: number, hash: string, expiresAt: Date) => {
      storedTokens.push({ id, hash, expiresAt });
    },
    clearLoginToken: async () => {},
    findByLoginTokenHash: async (hash: string) => {
      const rec = storedTokens.find(t => t.hash === hash);
      return rec ? fakeUsers.find(u => u.id === rec.id) : undefined;
    },
  },
  };
});

/** Login-link hashes written by the router, so tests can inspect what was stored. */
const storedTokens: { id: number; hash: string; expiresAt: Date }[] = [];

/** Emails the router tried to send. */
const sentEmails: { to: string; subject: string; html: string; text: string }[] = [];

vi.mock("../email", () => ({
  sendEmail: async (input: { to: string; subject: string; html: string; text: string }) => {
    sentEmails.push(input);
    return { sent: true as const };
  },
}));

const { appRouter } = await import("../routers");

type SetCookie = { name: string; value: string; options: Record<string, unknown> };

function createContext(user: User | null = null) {
  const cookies: SetCookie[] = [];
  const ctx = {
    user,
    req: { protocol: "https", headers: {} },
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) =>
        cookies.push({ name, value, options }),
      clearCookie: () => {},
    },
  } as unknown as TrpcContext;
  return { ctx, cookies };
}

beforeEach(() => {
  fakeUsers.length = 0;
  storedTokens.length = 0;
  sentEmails.length = 0;
});

describe("auth.register", () => {
  it("creates an account and starts a session", async () => {
    const { ctx, cookies } = createContext();
    const result = await appRouter.createCaller(ctx).auth.register({
      name: "Dr Sara",
      email: "sara@example.com",
      password: "a-good-password",
    });

    expect(result).toMatchObject({ email: "sara@example.com", name: "Dr Sara", role: "user" });
    expect(cookies).toHaveLength(1);
    expect(cookies[0].options).toMatchObject({ httpOnly: true, secure: true });
  });

  it("never returns the password hash", async () => {
    const { ctx } = createContext();
    const result = await appRouter.createCaller(ctx).auth.register({
      name: "Dr Sara",
      email: "sara@example.com",
      password: "a-good-password",
    });

    expect(result).not.toHaveProperty("passwordHash");
    expect(JSON.stringify(result)).not.toContain("scrypt");
  });

  it("stores the password hashed, never in plain text", async () => {
    const { ctx } = createContext();
    await appRouter.createCaller(ctx).auth.register({
      name: "Dr Sara",
      email: "sara@example.com",
      password: "plaintext-should-not-appear",
    });

    expect(fakeUsers[0].passwordHash).not.toBe("plaintext-should-not-appear");
    expect(fakeUsers[0].passwordHash).toMatch(/^scrypt\$/);
  });

  it("rejects a duplicate email", async () => {
    const { ctx } = createContext();
    const caller = appRouter.createCaller(ctx);
    await caller.auth.register({ name: "A", email: "dup@example.com", password: "password1" });

    await expect(
      caller.auth.register({ name: "B", email: "dup@example.com", password: "password2" })
    ).rejects.toThrow(/already exists/i);
    expect(fakeUsers).toHaveLength(1);
  });

  it("treats email as case-insensitive for duplicates", async () => {
    const { ctx } = createContext();
    const caller = appRouter.createCaller(ctx);
    await caller.auth.register({ name: "A", email: "Case@Example.com", password: "password1" });

    await expect(
      caller.auth.register({ name: "B", email: "case@example.com", password: "password2" })
    ).rejects.toThrow(/already exists/i);
  });

  it("rejects short passwords and malformed emails", async () => {
    const { ctx } = createContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.register({ name: "A", email: "a@example.com", password: "short" })
    ).rejects.toThrow();
    await expect(
      caller.auth.register({ name: "A", email: "not-an-email", password: "password1" })
    ).rejects.toThrow();
    await expect(
      caller.auth.register({ name: "", email: "a@example.com", password: "password1" })
    ).rejects.toThrow();
  });
});

describe("auth.login", () => {
  async function seedDoctor(email = "doc@example.com", password = "correct-password") {
    fakeUsers.push({
      id: 1,
      openId: "local_seed",
      email,
      passwordHash: await hashPassword(password),
      name: "Dr Seed",
      loginMethod: "password",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as User);
  }

  it("signs in with the right password", async () => {
    await seedDoctor();
    const { ctx, cookies } = createContext();
    const result = await appRouter
      .createCaller(ctx)
      .auth.login({ email: "doc@example.com", password: "correct-password" });

    expect(result).toMatchObject({ email: "doc@example.com" });
    expect(cookies).toHaveLength(1);
  });

  it("rejects the wrong password and sets no cookie", async () => {
    await seedDoctor();
    const { ctx, cookies } = createContext();

    await expect(
      appRouter.createCaller(ctx).auth.login({ email: "doc@example.com", password: "wrong" })
    ).rejects.toThrow(/incorrect email or password/i);
    expect(cookies).toHaveLength(0);
  });

  it("gives the same error for an unknown email as for a wrong password", async () => {
    await seedDoctor();
    const { ctx } = createContext();
    const caller = appRouter.createCaller(ctx);

    const wrongPassword = await caller.auth
      .login({ email: "doc@example.com", password: "wrong" })
      .catch(e => e.message);
    const unknownEmail = await caller.auth
      .login({ email: "nobody@example.com", password: "wrong" })
      .catch(e => e.message);

    expect(wrongPassword).toBe(unknownEmail);
  });

  it("refuses password login for an account that has no password (OAuth user)", async () => {
    fakeUsers.push({
      id: 2,
      openId: "oauth-user",
      email: "oauth@example.com",
      passwordHash: null,
      name: "OAuth User",
      loginMethod: "google",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as User);

    const { ctx } = createContext();
    await expect(
      appRouter.createCaller(ctx).auth.login({ email: "oauth@example.com", password: "" })
    ).rejects.toThrow();
    await expect(
      appRouter.createCaller(ctx).auth.login({ email: "oauth@example.com", password: "anything" })
    ).rejects.toThrow(/incorrect email or password/i);
  });
});

describe("admin allowlist", () => {
  it("promotes an account listed in ADMIN_EMAILS on registration", async () => {
    const { ctx } = createContext();
    const result = await appRouter.createCaller(ctx).auth.register({
      name: "Owner",
      email: "owner@example.com",
      password: "a-good-password",
    });
    expect(result?.role).toBe("admin");
  });

  it("matches the allowlist case-insensitively", async () => {
    const { ctx } = createContext();
    const result = await appRouter.createCaller(ctx).auth.register({
      name: "Second",
      email: "second.admin@example.com",
      password: "a-good-password",
    });
    expect(result?.role).toBe("admin");
  });

  it("leaves everyone else as a normal user", async () => {
    const { ctx } = createContext();
    const result = await appRouter.createCaller(ctx).auth.register({
      name: "Dr Sara",
      email: "sara@example.com",
      password: "a-good-password",
    });
    expect(result?.role).toBe("user");
  });

  it("promotes on login too, not only at registration", async () => {
    fakeUsers.push({
      id: 5,
      openId: "local_owner",
      email: "owner@example.com",
      passwordHash: await hashPassword("a-good-password"),
      name: "Owner",
      loginMethod: "password",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as User);

    const { ctx } = createContext();
    const result = await appRouter
      .createCaller(ctx)
      .auth.login({ email: "owner@example.com", password: "a-good-password" });
    expect(result?.role).toBe("admin");
  });
});

describe("auth.requestLoginLink", () => {
  async function seedDoctor(email = "doc@example.com") {
    fakeUsers.push({
      id: 1,
      openId: "local_seed",
      email,
      passwordHash: null,
      loginTokenHash: null,
      loginTokenExpiresAt: null,
      name: "Dr Seed",
      loginMethod: "password",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as User);
  }

  const ctxWithHost = () => {
    const { ctx } = createContext();
    (ctx.req as unknown as { headers: Record<string, string> }).headers = {
      host: "agent.tmla.com.sa",
      "x-forwarded-proto": "https",
    };
    return ctx;
  };

  it("emails a link to a known address", async () => {
    await seedDoctor();
    const result = await appRouter
      .createCaller(ctxWithHost())
      .auth.requestLoginLink({ email: "doc@example.com", lang: "en" });

    expect(result).toEqual({ success: true });
    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0].to).toBe("doc@example.com");
    expect(sentEmails[0].text).toContain("https://agent.tmla.com.sa/api/auth/login-link?token=");
  });

  it("reports success for an unknown address without sending anything", async () => {
    await seedDoctor();
    const result = await appRouter
      .createCaller(ctxWithHost())
      .auth.requestLoginLink({ email: "nobody@example.com", lang: "en" });

    // Identical response, so this cannot be used to discover who is registered.
    expect(result).toEqual({ success: true });
    expect(sentEmails).toHaveLength(0);
  });

  it("responds identically whether or not the account exists", async () => {
    await seedDoctor();
    const caller = appRouter.createCaller(ctxWithHost());
    const known = await caller.auth.requestLoginLink({ email: "doc@example.com", lang: "en" });
    const unknown = await caller.auth.requestLoginLink({ email: "nobody@example.com", lang: "en" });
    expect(known).toEqual(unknown);
  });

  it("stores only the hash of the token, never the token itself", async () => {
    await seedDoctor();
    await appRouter
      .createCaller(ctxWithHost())
      .auth.requestLoginLink({ email: "doc@example.com", lang: "en" });

    const token = new URL(
      sentEmails[0].text.split("\n").find(l => l.startsWith("https://"))!
    ).searchParams.get("token")!;

    expect(storedTokens).toHaveLength(1);
    expect(storedTokens[0].hash).not.toBe(token);
    expect(storedTokens[0].hash).toMatch(/^[0-9a-f]{64}$/);
    // and the stored value must genuinely be that token's hash
    expect(loginTokenMatches(token, storedTokens[0].hash)).toBe(true);
  });

  it("issues a token that expires within 15 minutes", async () => {
    await seedDoctor();
    await appRouter
      .createCaller(ctxWithHost())
      .auth.requestLoginLink({ email: "doc@example.com", lang: "en" });

    const ttl = storedTokens[0].expiresAt.getTime() - Date.now();
    expect(ttl).toBeGreaterThan(13 * 60 * 1000);
    expect(ttl).toBeLessThanOrEqual(15 * 60 * 1000);
  });

  it("replaces the previous link when a new one is requested", async () => {
    await seedDoctor();
    const caller = appRouter.createCaller(ctxWithHost());
    await caller.auth.requestLoginLink({ email: "doc@example.com", lang: "en" });
    await caller.auth.requestLoginLink({ email: "doc@example.com", lang: "en" });

    expect(storedTokens).toHaveLength(2);
    expect(storedTokens[0].hash).not.toBe(storedTokens[1].hash);
  });

  it("sends the Arabic email when asked", async () => {
    await seedDoctor();
    await appRouter
      .createCaller(ctxWithHost())
      .auth.requestLoginLink({ email: "doc@example.com", lang: "ar" });

    expect(sentEmails[0].subject).toMatch(/رابط الدخول/);
    expect(sentEmails[0].html).toContain('dir="rtl"');
  });

  it("rejects a malformed email", async () => {
    await expect(
      appRouter.createCaller(ctxWithHost()).auth.requestLoginLink({ email: "nope", lang: "en" })
    ).rejects.toThrow();
  });
});

describe("auth.me", () => {
  it("returns null when signed out", async () => {
    const { ctx } = createContext(null);
    expect(await appRouter.createCaller(ctx).auth.me()).toBeNull();
  });

  it("never exposes the password hash of the signed-in user", async () => {
    const user = {
      id: 9,
      openId: "local_me",
      email: "me@example.com",
      passwordHash: await hashPassword("secret-password"),
      name: "Me",
      loginMethod: "password",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as User;

    const { ctx } = createContext(user);
    const me = await appRouter.createCaller(ctx).auth.me();

    expect(me).toMatchObject({ id: 9, email: "me@example.com" });
    expect(me).not.toHaveProperty("passwordHash");
    expect(me).not.toHaveProperty("openId");
    expect(JSON.stringify(me)).not.toContain("scrypt");
  });
});
