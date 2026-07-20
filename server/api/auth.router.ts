import { randomUUID } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { hashPassword, verifyPassword } from "../auth/password";
import {
  buildLoginLinkUrl,
  generateLoginToken,
  hashLoginToken,
  loginTokenExpiryFrom,
} from "../auth/loginLink";
import { clearSessionCookie, issueSessionCookie } from "../auth/session";
import { sendEmail } from "../email";
import { loginLinkEmail } from "../emails/loginLinkEmail";
import { applyAdminAllowlist, normalizeEmail, usersRepo } from "../repos";
import { toPublicUser } from "../publicUser";

const emailSchema = z
  .string()
  .trim()
  .min(3)
  .max(320)
  .email("Please enter a valid email address");

// 8 characters is the NCSC/NIST floor. Length is what matters; composition rules
// mostly push people towards predictable substitutions.
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(1024, "Password is too long");

export const authRouter = router({
  me: publicProcedure.query(opts => toPublicUser(opts.ctx.user)),

  register: publicProcedure
    .input(
      z.object({
        name: z.string().trim().min(1, "Please enter your name").max(255),
        email: emailSchema,
        password: passwordSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const email = normalizeEmail(input.email);

      if (await usersRepo.findByEmail(email)) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists. Try signing in instead.",
        });
      }

      const passwordHash = await hashPassword(input.password);

      let user;
      try {
        user = await usersRepo.createPasswordUser({ email, passwordHash, name: input.name });
        user = await applyAdminAllowlist(user);
      } catch (error) {
        // The unique index on email is the real guard; two simultaneous
        // registrations can both pass the check above and only one insert wins.
        if (isDuplicateKeyError(error)) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "An account with this email already exists. Try signing in instead.",
          });
        }
        throw error;
      }

      await issueSessionCookie(ctx.req, ctx.res, user);
      return toPublicUser(user);
    }),

  login: publicProcedure
    .input(z.object({ email: emailSchema, password: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const user = await usersRepo.findByEmail(input.email);

      // Hash even when the account is missing, so a wrong email and a wrong
      // password take the same time and cannot be told apart by timing.
      const ok = await verifyPassword(
        input.password,
        user?.passwordHash ?? (await getDummyHash())
      );

      if (!user || !ok) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Incorrect email or password",
        });
      }

      await usersRepo.touchLastSignedIn(user.id);
      const promoted = await applyAdminAllowlist(user);
      await issueSessionCookie(ctx.req, ctx.res, promoted);
      return toPublicUser(promoted);
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    clearSessionCookie(ctx.req, ctx.res);
    return { success: true } as const;
  }),

  /**
   * Emails a one-time sign-in link.
   *
   * Always reports success, even when no account has that address. Reporting
   * "no such account" would turn this into a way to check which doctors are
   * registered with the service, which is exactly the kind of thing that should
   * stay private.
   */
  requestLoginLink: publicProcedure
    .input(z.object({ email: emailSchema, lang: z.enum(["en", "ar"]).default("en") }))
    .mutation(async ({ input, ctx }) => {
      const user = await usersRepo.findByEmail(input.email);

      if (user) {
        const token = generateLoginToken();
        await usersRepo.setLoginToken(user.id, hashLoginToken(token), loginTokenExpiryFrom());

        const origin = requestOrigin(ctx.req);
        const email = loginLinkEmail({
          name: user.name,
          url: buildLoginLinkUrl(origin, token),
          lang: input.lang,
        });

        const result = await sendEmail({
          to: user.email!,
          subject: email.subject,
          html: email.html,
          text: email.text,
        });

        if (!result.sent) {
          // Surfaced to the operator in the logs, never to the caller - the
          // response must look identical whether or not the address exists.
          console.error("[Auth] Could not deliver login link:", result.reason, result.detail ?? "");
        }
      }

      return { success: true } as const;
    }),
});

/**
 * The origin to build links against. Behind a proxy the Host header is the
 * public hostname, which is what the doctor needs; falling back to the socket
 * would produce an internal address that fails when clicked.
 */
function requestOrigin(req: { headers: Record<string, unknown>; protocol?: string }): string {
  const forwardedProto = String(req.headers["x-forwarded-proto"] ?? "").split(",")[0].trim();
  const proto = forwardedProto || req.protocol || "https";
  const host = String(req.headers["x-forwarded-host"] ?? req.headers.host ?? "").split(",")[0].trim();
  return `${proto}://${host}`;
}

/**
 * A real scrypt hash of a random value, computed once on first use, so the login
 * path does the same work for an unknown email as for a known one. Because the
 * input is random and discarded, no user-supplied password can ever match it.
 */
let dummyHashPromise: Promise<string> | null = null;
function getDummyHash(): Promise<string> {
  dummyHashPromise ??= hashPassword(randomUUID());
  return dummyHashPromise;
}

function isDuplicateKeyError(error: unknown): boolean {
  const code = (error as { code?: string })?.code;
  const errno = (error as { errno?: number })?.errno;
  return code === "ER_DUP_ENTRY" || errno === 1062;
}
