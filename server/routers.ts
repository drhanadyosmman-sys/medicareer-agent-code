import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";
import {
  sendWelcomeEmail,
  sendApplicationConfirmationEmail,
  sendNewMessageNotificationEmail,
  sendStatusUpdateEmail,
  sendAdminNewApplicationAlert,
  sendJobSharedEmail,
} from "./email";

// Admin notification email — update this to the real admin inbox
const ADMIN_EMAIL = "support@hqcsai.uk";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Email Procedures ────────────────────────────────────────────────────
  email: router({
    // 1. Welcome email — called after new user registration / first sign-in
    sendWelcome: publicProcedure
      .input(z.object({ to: z.string().email(), name: z.string() }))
      .mutation(async ({ input }) => {
        try {
          await sendWelcomeEmail(input.to, input.name);
          return { success: true };
        } catch (err) {
          console.error("[Email] sendWelcome failed:", err);
          return { success: false, error: String(err) };
        }
      }),

    // 2. Application submitted confirmation — called after onboarding form submission
    sendApplicationConfirmation: publicProcedure
      .input(z.object({
        to: z.string().email(),
        name: z.string(),
        applicationId: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          await sendApplicationConfirmationEmail(input.to, input.name, input.applicationId);
          // Also alert admin
          await sendAdminNewApplicationAlert(ADMIN_EMAIL, input.name, input.to, input.applicationId);
          return { success: true };
        } catch (err) {
          console.error("[Email] sendApplicationConfirmation failed:", err);
          return { success: false, error: String(err) };
        }
      }),

    // 3. New message notification — called when admin sends a message to a doctor
    sendMessageNotification: publicProcedure
      .input(z.object({
        to: z.string().email(),
        name: z.string(),
        messagePreview: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          await sendNewMessageNotificationEmail(input.to, input.name, input.messagePreview);
          return { success: true };
        } catch (err) {
          console.error("[Email] sendMessageNotification failed:", err);
          return { success: false, error: String(err) };
        }
      }),

    // 4. Application status update — called when admin changes application stage
    sendStatusUpdate: publicProcedure
      .input(z.object({
        to: z.string().email(),
        name: z.string(),
        newStatus: z.string(),
        details: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          await sendStatusUpdateEmail(input.to, input.name, input.newStatus, input.details);
          return { success: true };
        } catch (err) {
          console.error("[Email] sendStatusUpdate failed:", err);
          return { success: false, error: String(err) };
        }
      }),

    // 5. Job shared with doctor — called when admin shares a job with a candidate
    sendJobShared: publicProcedure
      .input(z.object({
        to: z.string().email(),
        name: z.string(),
        jobTitle: z.string(),
        hospital: z.string(),
        location: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          await sendJobSharedEmail(input.to, input.name, input.jobTitle, input.hospital, input.location);
          return { success: true };
        } catch (err) {
          console.error("[Email] sendJobShared failed:", err);
          return { success: false, error: String(err) };
        }
      }),
  }),

  // ─── AI Vision - Analyze NHS Job Screenshot ──────────────────────────────
  ai: router({
    analyzeJobScreenshot: publicProcedure
      .input(z.object({
        imageBase64: z.string().describe("Base64 encoded image data (with data:image/... prefix)"),
      }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are an expert at extracting NHS job vacancy information from screenshots. 
Extract the following fields from the image and return them as a JSON object:
- title: Job title (string)
- hospital: Hospital or NHS Trust name (string)
- location: City/region (string)
- salaryRange: Salary range as shown (string, e.g. "£55,329 - £63,152")
- specialty: Medical specialty - must be one of: Internal Medicine, Surgery, Pediatrics, Psychiatry, Emergency Medicine, Obstetrics & Gynecology, Radiology, Anaesthetics, Cardiology, Neurology, Orthopaedics, Ophthalmology, ENT, Dermatology, Gastroenterology, Respiratory Medicine, Geriatric Medicine, Oncology, Haematology, Pathology, General Practice, Other
- rank: Grade/rank - must be one of: Foundation Year (FY1/FY2), Core Training (CT1-CT3), Specialty Registrar (ST3-ST8), Staff Grade / Specialty Doctor, SAS Doctor, Consultant, Clinical Fellow, Trust Grade
- closingDate: Closing date in YYYY-MM-DD format if visible (string or empty)
- nhsJobsLink: Any URL visible in the screenshot (string or empty)
- description: Brief job description extracted from the text (string, 2-3 sentences)

Return ONLY valid JSON, no markdown, no explanation. If a field is not visible in the image, use an empty string "".`,
            },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: input.imageBase64,
                    detail: "high",
                  },
                },
                {
                  type: "text",
                  text: "Please extract the NHS job vacancy details from this screenshot and return as JSON.",
                },
              ],
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "job_extraction",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  hospital: { type: "string" },
                  location: { type: "string" },
                  salaryRange: { type: "string" },
                  specialty: { type: "string" },
                  rank: { type: "string" },
                  closingDate: { type: "string" },
                  nhsJobsLink: { type: "string" },
                  description: { type: "string" },
                },
                required: ["title", "hospital", "location", "salaryRange", "specialty", "rank", "closingDate", "nhsJobsLink", "description"],
                additionalProperties: false,
              },
            },
          },
        });

        try {
          const msg = response.choices[0]?.message;
          const content = typeof msg?.content === 'string' ? msg.content : JSON.stringify(msg?.content) || '{}';
          const parsed = JSON.parse(content);
          return { success: true as const, data: parsed };
        } catch (e) {
          return { success: false as const, data: null, error: "Failed to parse AI response" };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
