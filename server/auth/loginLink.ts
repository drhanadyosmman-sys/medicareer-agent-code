import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Email login links ("magic links").
 *
 * The token is a plain random secret, not a JWT: there is nothing to read inside
 * it, and validity is decided entirely by what the database holds. Only the
 * SHA-256 of the token is stored, so a leaked database does not yield working
 * links.
 *
 * Requesting a link overwrites any previous hash, so only the newest link works;
 * redeeming clears it, so each link works once.
 */

export const LOGIN_LINK_TTL_MS = 15 * 60 * 1000; // 15 minutes

/** 256 bits of entropy, url-safe. Far beyond guessing within the 15-minute window. */
export function generateLoginToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashLoginToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Constant-time compare, so a mismatch cannot be narrowed down by timing. */
export function loginTokenMatches(token: string, storedHash: string | null | undefined): boolean {
  if (!storedHash) return false;
  const actual = Buffer.from(hashLoginToken(token), "hex");
  let expected: Buffer;
  try {
    expected = Buffer.from(storedHash, "hex");
  } catch {
    return false;
  }
  if (actual.length !== expected.length || expected.length === 0) return false;
  return timingSafeEqual(actual, expected);
}

export function isLoginTokenExpired(expiresAt: Date | null | undefined, now = new Date()): boolean {
  if (!expiresAt) return true;
  return expiresAt.getTime() <= now.getTime();
}

export function loginTokenExpiryFrom(now = new Date()): Date {
  return new Date(now.getTime() + LOGIN_LINK_TTL_MS);
}

/**
 * The link a doctor clicks. Built from the request's own origin so it works in
 * local development, on a preview URL, and in production without configuration.
 */
export function buildLoginLinkUrl(origin: string, token: string): string {
  const url = new URL("/api/auth/login-link", origin);
  url.searchParams.set("token", token);
  return url.toString();
}
