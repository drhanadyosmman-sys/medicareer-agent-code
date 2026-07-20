import { describe, expect, it } from "vitest";
import {
  buildLoginLinkUrl,
  generateLoginToken,
  hashLoginToken,
  isLoginTokenExpired,
  loginTokenExpiryFrom,
  loginTokenMatches,
  LOGIN_LINK_TTL_MS,
} from "./loginLink";

describe("login link tokens", () => {
  it("generates a different token every time", () => {
    const tokens = new Set(Array.from({ length: 200 }, () => generateLoginToken()));
    expect(tokens.size).toBe(200);
  });

  it("generates tokens with enough entropy to be unguessable", () => {
    const token = generateLoginToken();
    // 32 random bytes in base64url.
    expect(token.length).toBeGreaterThanOrEqual(42);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("never stores the token itself", () => {
    const token = generateLoginToken();
    const hash = hashLoginToken(token);
    expect(hash).not.toContain(token);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("matches the right token", () => {
    const token = generateLoginToken();
    expect(loginTokenMatches(token, hashLoginToken(token))).toBe(true);
  });

  it("rejects a different token", () => {
    const hash = hashLoginToken(generateLoginToken());
    expect(loginTokenMatches(generateLoginToken(), hash)).toBe(false);
  });

  it("fails closed when there is no stored hash (link already used)", () => {
    const token = generateLoginToken();
    expect(loginTokenMatches(token, null)).toBe(false);
    expect(loginTokenMatches(token, undefined)).toBe(false);
    expect(loginTokenMatches(token, "")).toBe(false);
  });

  it("fails closed on a malformed stored hash instead of throwing", () => {
    const token = generateLoginToken();
    for (const bad of ["zzzz", "abc", "not-hex-at-all", "0".repeat(63)]) {
      expect(loginTokenMatches(token, bad)).toBe(false);
    }
  });

  it("treats a missing expiry as expired", () => {
    expect(isLoginTokenExpired(null)).toBe(true);
    expect(isLoginTokenExpired(undefined)).toBe(true);
  });

  it("expires exactly at the boundary, not after", () => {
    const now = new Date("2026-07-19T12:00:00Z");
    expect(isLoginTokenExpired(new Date(now.getTime() + 1), now)).toBe(false);
    expect(isLoginTokenExpired(now, now)).toBe(true);
    expect(isLoginTokenExpired(new Date(now.getTime() - 1), now)).toBe(true);
  });

  it("issues a 15 minute expiry", () => {
    const now = new Date("2026-07-19T12:00:00Z");
    expect(loginTokenExpiryFrom(now).getTime() - now.getTime()).toBe(LOGIN_LINK_TTL_MS);
    expect(isLoginTokenExpired(loginTokenExpiryFrom(now), now)).toBe(false);
    // ...and is expired sixteen minutes later
    const later = new Date(now.getTime() + 16 * 60 * 1000);
    expect(isLoginTokenExpired(loginTokenExpiryFrom(now), later)).toBe(true);
  });
});

describe("buildLoginLinkUrl", () => {
  it("builds a link against the given origin", () => {
    expect(buildLoginLinkUrl("https://agent.tmla.com.sa", "abc123")).toBe(
      "https://agent.tmla.com.sa/api/auth/login-link?token=abc123"
    );
  });

  it("works for local development", () => {
    expect(buildLoginLinkUrl("http://localhost:3000", "t")).toBe(
      "http://localhost:3000/api/auth/login-link?token=t"
    );
  });

  it("url-encodes tokens", () => {
    const url = buildLoginLinkUrl("https://example.com", "a+b/c=d");
    expect(new URL(url).searchParams.get("token")).toBe("a+b/c=d");
  });
});
