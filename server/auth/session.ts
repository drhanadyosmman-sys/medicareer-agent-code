import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Request, Response } from "express";
import { getSessionCookieOptions } from "../_core/cookies";
import { ENV } from "../_core/env";
import { sdk } from "../_core/sdk";

/** Session lifetime for password logins. Shorter than the OAuth default year. */
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * `sdk.verifySession` rejects a token whose `appId` is empty, and ENV.appId is
 * empty whenever VITE_APP_ID is unset (local dev). Fall back to a fixed value so
 * sign and verify agree in every environment.
 */
const APP_ID = ENV.appId || "medicareer-agent";

/**
 * Refuse to mint sessions with an empty signing key. Without this an unset
 * JWT_SECRET silently produces tokens anyone can forge.
 */
function assertSigningKey(): void {
  if (!ENV.cookieSecret) {
    throw new Error(
      "JWT_SECRET is not set - refusing to issue session cookies. Set JWT_SECRET in the environment."
    );
  }
}

export async function issueSessionCookie(
  req: Request,
  res: Response,
  user: { openId: string; name: string | null }
): Promise<void> {
  assertSigningKey();

  const token = await sdk.signSession(
    { openId: user.openId, appId: APP_ID, name: user.name || "" },
    { expiresInMs: SESSION_TTL_MS }
  );

  res.cookie(COOKIE_NAME, token, {
    ...getSessionCookieOptions(req),
    maxAge: SESSION_TTL_MS,
  });
}

export function clearSessionCookie(req: Request, res: Response): void {
  res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(req), maxAge: -1 });
}

export { ONE_YEAR_MS };
