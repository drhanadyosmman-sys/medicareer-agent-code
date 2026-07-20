export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  /**
   * Comma-separated emails that get the admin role on sign-in. Without this
   * there is no way to create the first admin, since roles default to "user"
   * and only an admin could otherwise grant one.
   */
  adminEmails: (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean),
  /** Resend API key for transactional email (login links). */
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  /** Sender address; its domain must be verified in Resend. e.g. "MediCareer Agent <no-reply@hcqsai.uk>" */
  emailFrom: process.env.EMAIL_FROM ?? "",
};
