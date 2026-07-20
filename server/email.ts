import { ENV } from "./_core/env";

/**
 * Transactional email via Resend's HTTP API.
 *
 * Called directly over fetch rather than pulling in the SDK - it is one endpoint,
 * and the dependency would need building on a machine that has no compiler.
 */

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type SendEmailResult =
  | { sent: true }
  | { sent: false; reason: "not-configured" | "failed"; detail?: string };

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!ENV.resendApiKey || !ENV.emailFrom) {
    // Not an error in local development, where email is simply not wired up.
    console.warn(
      "[Email] RESEND_API_KEY or EMAIL_FROM is not set - skipping send to",
      redactEmail(input.to)
    );
    return { sent: false, reason: "not-configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${ENV.resendApiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: ENV.emailFrom,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(
        `[Email] Send failed (${response.status}) to ${redactEmail(input.to)}: ${detail}`
      );
      return { sent: false, reason: "failed", detail };
    }

    return { sent: true };
  } catch (error) {
    console.error("[Email] Send threw for", redactEmail(input.to), error);
    return { sent: false, reason: "failed", detail: String(error) };
  }
}

/** Keeps whole addresses out of the logs. */
function redactEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local.slice(0, 2)}***@${domain}`;
}
