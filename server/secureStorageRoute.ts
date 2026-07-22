import type { Express, Request, Response } from "express";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";
import { applicationsRepo, documentsRepo } from "./repos";

/**
 * Authenticated replacement for the template's `/manus-storage/*` proxy.
 *
 * The version in `_core/storageProxy.ts` redirects anyone who asks to a signed
 * S3 URL, with no identity check at all. These files are passports, medical
 * degrees and CVs, and the object key is largely guessable - the application id
 * counts up from 1, the category comes from a fixed list, and the filename is
 * usually something like `passport.pdf`. Only an 8-character suffix stood
 * between a stranger and a doctor's identity documents.
 *
 * This version resolves the key back to its document row and serves the file
 * only to the doctor whose application it belongs to, or to an admin.
 *
 * Registered INSTEAD of registerStorageProxy - see `_core/index.ts`. If a future
 * change reinstates the template version, this protection is silently lost.
 */
export function registerSecureStorageRoute(app: Express) {
  app.get("/manus-storage/*", async (req: Request, res: Response) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) return res.status(400).send("Missing storage key");

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      return res.status(500).send("Storage is not configured");
    }

    try {
      // Anonymous callers are told the same thing as callers asking for someone
      // else's file: nothing. A 403 would confirm the file exists.
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        return notFound(res);
      }
      if (!user) return notFound(res);

      const document = await documentsRepo.findByStorageKey(key);
      if (!document) return notFound(res);

      const application = await applicationsRepo.findById(document.applicationId);
      if (!application) return notFound(res);

      const isOwner = application.userId === user.id;
      const isAdmin = user.role === "admin";
      if (!isOwner && !isAdmin) return notFound(res);

      const signed = await presignGet(key);
      if (!signed) return res.status(502).send("Storage backend error");

      // Never let a signed URL sit in a shared or intermediary cache.
      res.set("Cache-Control", "no-store, private");
      return res.redirect(307, signed);
    } catch (error) {
      console.error("[SecureStorage] failed:", error);
      return res.status(502).send("Storage error");
    }
  });
}

/** Identical response for "no such file" and "not yours" - see above. */
function notFound(res: Response) {
  return res.status(404).send("Not found");
}

async function presignGet(key: string): Promise<string | null> {
  const forgeUrl = new URL(
    "v1/storage/presign/get",
    ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
  );
  forgeUrl.searchParams.set("path", key);

  const resp = await fetch(forgeUrl, {
    headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    console.error(`[SecureStorage] presign failed: ${resp.status} ${body}`);
    return null;
  }

  const { url } = (await resp.json()) as { url: string };
  return url || null;
}
