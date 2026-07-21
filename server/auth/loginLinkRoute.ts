import type { Express, Request, Response } from "express";
import {
  hashLoginToken,
  isLoginTokenExpired,
  loginTokenMatches,
} from "./loginLink";
import { issueSessionCookie } from "./session";
import { applyAdminAllowlist, usersRepo } from "../repos";

/**
 * Redeems an emailed sign-in link.
 *
 * A plain GET, because it is reached by clicking a link in an email client. That
 * means it must be safe to hit with a stale or wrong token: every failure lands
 * on the login page with a reason, and never reveals whether the token merely
 * expired or never existed.
 */
export function registerLoginLinkRoute(app: Express) {
  app.get("/api/auth/login-link", async (req: Request, res: Response) => {
    const token = typeof req.query.token === "string" ? req.query.token : "";
    if (!token) return res.redirect(302, "/login?error=invalid-link");

    try {
      // Looked up by hash: the raw token is never compared against stored data.
      const user = await usersRepo.findByLoginTokenHash(hashLoginToken(token));

      if (!user || !loginTokenMatches(token, user.loginTokenHash)) {
        return res.redirect(302, "/login?error=invalid-link");
      }

      if (isLoginTokenExpired(user.loginTokenExpiresAt)) {
        // Clear it so an expired link cannot linger in the database.
        await usersRepo.clearLoginToken(user.id);
        return res.redirect(302, "/login?error=expired-link");
      }

      // Consume before issuing the session, so a double-click cannot produce two
      // sessions from one link.
      await usersRepo.clearLoginToken(user.id);
      await usersRepo.touchLastSignedIn(user.id);

      const promoted = await applyAdminAllowlist(user);
      await issueSessionCookie(req, res, promoted);

      return res.redirect(302, promoted.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      console.error("[Auth] Login link redemption failed:", error);
      return res.redirect(302, "/login?error=link-failed");
    }
  });
}
