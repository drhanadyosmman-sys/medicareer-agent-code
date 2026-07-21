import { LOGIN_LINK_TTL_MS } from "../auth/loginLink";

const MINUTES = Math.round(LOGIN_LINK_TTL_MS / 60000);

export type LoginLinkEmailOptions = {
  name: string | null;
  url: string;
  lang?: "en" | "ar";
};

/**
 * The sign-in email. Deliberately plain: transactional mail that looks like
 * marketing lands in spam, and doctors need this one to arrive.
 *
 * Includes the URL as visible text as well as a button, because some mail
 * clients strip links, and states the expiry so an old email is self-explaining.
 */
export function loginLinkEmail({ name, url, lang = "en" }: LoginLinkEmailOptions) {
  return lang === "ar" ? arabic(name, url) : english(name, url);
}

function english(name: string | null, url: string) {
  const greeting = name ? `Hello ${escapeHtml(name)},` : "Hello,";
  return {
    subject: "Your sign-in link for MediCareer Agent",
    text: [
      name ? `Hello ${name},` : "Hello,",
      "",
      "Use the link below to sign in to your MediCareer Agent account:",
      url,
      "",
      `This link works once and expires in ${MINUTES} minutes.`,
      "If you did not request it, you can ignore this email - nobody can sign in without the link.",
    ].join("\n"),
    html: shell(`
      <p style="margin:0 0 16px">${greeting}</p>
      <p style="margin:0 0 24px">Use the button below to sign in to your MediCareer Agent account.</p>
      ${button(url, "Sign in")}
      <p style="margin:24px 0 8px;font-size:14px;color:#64748B">
        Or paste this address into your browser:
      </p>
      <p style="margin:0 0 24px;font-size:13px;word-break:break-all">
        <a href="${url}" style="color:#0F2A4A">${url}</a>
      </p>
      <p style="margin:0;font-size:13px;color:#64748B">
        This link works once and expires in ${MINUTES} minutes. If you did not request it,
        you can ignore this email &mdash; nobody can sign in without the link.
      </p>
    `),
  };
}

function arabic(name: string | null, url: string) {
  const greeting = name ? `مرحباً ${escapeHtml(name)}،` : "مرحباً،";
  return {
    subject: "رابط الدخول إلى حسابك في MediCareer Agent",
    text: [
      name ? `مرحباً ${name}،` : "مرحباً،",
      "",
      "استخدم الرابط التالي لتسجيل الدخول إلى حسابك:",
      url,
      "",
      `الرابط يعمل مرة واحدة وينتهي خلال ${MINUTES} دقيقة.`,
      "إذا لم تطلب هذا الرابط، تجاهل هذه الرسالة — لا يمكن لأحد الدخول بدونه.",
    ].join("\n"),
    html: shell(
      `
      <p style="margin:0 0 16px">${greeting}</p>
      <p style="margin:0 0 24px">استخدم الزر التالي لتسجيل الدخول إلى حسابك في MediCareer Agent.</p>
      ${button(url, "تسجيل الدخول")}
      <p style="margin:24px 0 8px;font-size:14px;color:#64748B">أو انسخ هذا العنوان إلى متصفحك:</p>
      <p style="margin:0 0 24px;font-size:13px;word-break:break-all">
        <a href="${url}" style="color:#0F2A4A">${url}</a>
      </p>
      <p style="margin:0;font-size:13px;color:#64748B">
        الرابط يعمل مرة واحدة وينتهي خلال ${MINUTES} دقيقة. إذا لم تطلبه، تجاهل هذه الرسالة
        &mdash; لا يمكن لأحد الدخول بدونه.
      </p>
    `,
      "rtl"
    ),
  };
}

function button(url: string, label: string): string {
  return `<a href="${url}" style="display:inline-block;background:#0F2A4A;color:#ffffff;
    text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px">${label}</a>`;
}

function shell(body: string, dir: "ltr" | "rtl" = "ltr"): string {
  return `<!doctype html><html dir="${dir}"><body style="margin:0;padding:0;background:#FAFAF7">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;
       font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
       color:#0F2A4A;line-height:1.6">
    <div style="font-size:18px;font-weight:700;margin-bottom:32px">MediCareer Agent</div>
    ${body}
  </div></body></html>`;
}

/** Names come from user input and land inside HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
