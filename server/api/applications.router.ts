import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  ADMIN_NOTE_TYPES,
  APPLICATION_STATUSES,
  DOCUMENT_CATEGORIES,
} from "../../drizzle/schema";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";
import {
  adminNotesRepo,
  applicationsRepo,
  documentsRepo,
  messagesRepo,
} from "../repos";
import { storagePut } from "../storage";
import { evaluateEligibility } from "../eligibility";
import { matchCriteria } from "../criteriaMatch";
import { buildSupportingInfoDraft } from "../draftSupportingInfo";
import { sendEmail } from "../email";
import { ENV } from "../_core/env";

const applicationInput = z.object({
  fullName: z.string().trim().min(1).max(255),
  email: z.string().trim().email().max(320),
  whatsapp: z.string().trim().max(40).optional(),
  countryOfResidence: z.string().trim().max(120).optional(),
  nationality: z.string().trim().max(120).optional(),
  preferredPathway: z.string().trim().max(120).optional(),

  medicalSchool: z.string().trim().max(255).optional(),
  graduationYear: z.string().trim().max(10).optional(),
  internshipCompleted: z.boolean().default(false),
  yearsExperience: z.string().trim().max(20).optional(),
  currentRole: z.string().trim().max(255).optional(),
  specialtyInterest: z.string().trim().max(255).optional(),
  currentCountryOfPractice: z.string().trim().max(120).optional(),

  gmcStatus: z.string().trim().max(120).optional(),
  plabStatus: z.string().trim().max(120).optional(),
  ieltsOetStatus: z.string().trim().max(120).optional(),
  alsBlsStatus: z.string().trim().max(120).optional(),
  ukRightToWork: z.boolean().optional(),
  nhsExperience: z.boolean().default(false),
  previousUkApplications: z.boolean().default(false),
  previousInterviews: z.boolean().default(false),

  careerStory: z.string().max(10_000).optional(),
  readinessScore: z.number().int().min(0).max(100).default(0),
  missingDocuments: z.array(z.string().max(255)).max(50).default([]),
  recommendedSteps: z.array(z.string().max(255)).max(50).default([]),
});

/**
 * Loads an application and refuses it unless the caller owns it or is an admin.
 * Every per-application procedure goes through this - an ownership check written
 * inline in each one is a check that eventually gets forgotten.
 */
async function loadOwned(applicationId: number, user: { id: number; role: string }) {
  const application = await applicationsRepo.findById(applicationId);
  if (!application) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
  }
  if (user.role !== "admin" && application.userId !== user.id) {
    // Same error as a genuine miss, so this cannot be used to probe which
    // application ids exist.
    throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
  }
  return application;
}

export const applicationsRouter = router({
  /** The signed-in doctor's own applications. */
  mine: protectedProcedure.query(async ({ ctx }) => {
    return applicationsRepo.listForUser(ctx.user.id);
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input, ctx }) => {
      const application = await loadOwned(input.id, ctx.user);
      const [docs, msgs] = await Promise.all([
        documentsRepo.listForApplication(application.id),
        messagesRepo.listForApplication(application.id),
      ]);
      // adminNotes deliberately omitted - see `adminNotes` below.
      return { ...application, documents: docs, messages: msgs };
    }),

  submit: protectedProcedure
    .input(applicationInput)
    .mutation(async ({ input, ctx }) => {
      const id = await applicationsRepo.create({
        ...input,
        userId: ctx.user.id,
        status: "submitted",
      });

      await messagesRepo.create({
        applicationId: id,
        sender: "admin",
        content: `Thank you for submitting your application, ${input.fullName}. Our career consultant has received your profile and will begin reviewing your documents within 48 hours.`,
      });

      // Send admin notification email (fire-and-forget)
      const adminEmail = ENV.adminEmails[0] || "healthcarequalityschool@gmail.com";
      sendEmail({
        to: adminEmail,
        subject: `New Application: ${input.fullName} — ${input.specialtyInterest || "General"}`,
        html: `<h2>New Application Received</h2>
          <p>A new doctor has submitted an application on MediCareer Agent:</p>
          <table style="border-collapse:collapse;width:100%;max-width:500px;">
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${input.fullName}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${input.email}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Specialty</td><td style="padding:8px;border-bottom:1px solid #eee;">${input.specialtyInterest || "Not specified"}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Nationality</td><td style="padding:8px;border-bottom:1px solid #eee;">${input.nationality || "Not specified"}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">GMC Status</td><td style="padding:8px;border-bottom:1px solid #eee;">${input.gmcStatus || "Not specified"}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">WhatsApp</td><td style="padding:8px;border-bottom:1px solid #eee;">${input.whatsapp || "Not provided"}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Readiness Score</td><td style="padding:8px;border-bottom:1px solid #eee;">${input.readinessScore}%</td></tr>
          </table>
          <p style="margin-top:20px;"><a href="https://agent.hcqsai.uk/admin/applications" style="background:#14b8a6;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;">Review in Admin Panel</a></p>`,
        text: `New Application: ${input.fullName} (${input.email}) — Specialty: ${input.specialtyInterest || "N/A"}, Nationality: ${input.nationality || "N/A"}, GMC: ${input.gmcStatus || "N/A"}, Score: ${input.readinessScore}%`,
      }).catch(err => console.error("[Email] Admin notification failed:", err));

      return { id };
    }),

  /* ------------------------------------------------------------ messages */

  sendMessage: protectedProcedure
    .input(
      z.object({
        applicationId: z.number().int().positive(),
        content: z.string().trim().min(1).max(5_000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await loadOwned(input.applicationId, ctx.user);
      await messagesRepo.create({
        applicationId: input.applicationId,
        // Derived from the session, never from the client - otherwise a doctor
        // could post messages that appear to come from the consultant.
        sender: ctx.user.role === "admin" ? "admin" : "user",
        content: input.content,
      });
      return { success: true } as const;
    }),

  markMessagesRead: protectedProcedure
    .input(z.object({ applicationId: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      await loadOwned(input.applicationId, ctx.user);
      await messagesRepo.markRead(
        input.applicationId,
        ctx.user.role === "admin" ? "admin" : "user"
      );
      return { success: true } as const;
    }),

  /* ----------------------------------------------------------- documents */

  listDocuments: protectedProcedure
    .input(z.object({ applicationId: z.number().int().positive() }))
    .query(async ({ input, ctx }) => {
      await loadOwned(input.applicationId, ctx.user);
      return documentsRepo.listForApplication(input.applicationId);
    }),

  /**
   * Upload a file (base64) to S3 and record it in the documents table.
   * Accepts the raw file bytes encoded as base64 from the client.
   */
  uploadDocument: protectedProcedure
    .input(
      z.object({
        applicationId: z.number().int().positive(),
        category: z.enum(DOCUMENT_CATEGORIES),
        name: z.string().trim().min(1).max(255),
        mimeType: z.string().trim().max(127).optional(),
        sizeBytes: z.number().int().positive().max(20 * 1024 * 1024),
        base64: z.string().describe("Base64-encoded file content (no data: prefix)"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await loadOwned(input.applicationId, ctx.user);
      const buffer = Buffer.from(input.base64, "base64");
      // Server-side size validation: use actual buffer length, not client-reported size
      const actualSize = buffer.length;
      if (actualSize > 20 * 1024 * 1024) {
        throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "File exceeds 20MB limit" });
      }
      const key = `applications/${input.applicationId}/${input.category}/${input.name}`;
      const { key: storageKey, url } = await storagePut(
        key,
        buffer,
        input.mimeType || "application/octet-stream"
      );
      await documentsRepo.create({
        applicationId: input.applicationId,
        category: input.category,
        name: input.name,
        mimeType: input.mimeType,
        sizeBytes: actualSize, // Use server-computed size, never trust client
        storageKey,
      });
      return { success: true, storageKey, url } as const;
    }),

  /**
   * Records a file that has already been uploaded to object storage.
   * The upload itself is signed separately; this only stores the reference.
   */
  attachDocument: protectedProcedure
    .input(
      z.object({
        applicationId: z.number().int().positive(),
        category: z.enum(DOCUMENT_CATEGORIES),
        name: z.string().trim().min(1).max(255),
        mimeType: z.string().trim().max(127).optional(),
        sizeBytes: z.number().int().positive().max(20 * 1024 * 1024),
        storageKey: z.string().trim().min(1).max(512),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await loadOwned(input.applicationId, ctx.user);
      await documentsRepo.create(input);
      return { success: true } as const;
    }),

  removeDocument: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      const doc = await documentsRepo.findById(input.id);
      if (!doc) throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
      await loadOwned(doc.applicationId, ctx.user);
      await documentsRepo.remove(input.id);
      return { success: true } as const;
    }),

  /* --------------------------------------------------------- admin only */

  listAll: adminProcedure
    .input(z.object({ status: z.enum(APPLICATION_STATUSES).optional() }).optional())
    .query(async ({ input }) => {
      return applicationsRepo.listAll({ status: input?.status });
    }),

  setStatus: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        status: z.enum(APPLICATION_STATUSES),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await applicationsRepo.findById(input.id);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      await applicationsRepo.update(input.id, { status: input.status });

      // Send email notification to the doctor about status change
      const statusLabels: Record<string, string> = {
        submitted: "Submitted",
        "under-review": "Under Review",
        "cv-optimization": "CV Optimisation in Progress",
        "job-matching": "Job Matching in Progress",
        "applications-prepared": "Applications Prepared & Submitted",
        "interview-preparation": "Interview Preparation Stage",
      };
      const label = statusLabels[input.status] || input.status;
      sendEmail({
        to: existing.email,
        subject: `Application Update: ${label} \u2014 MediCareer Agent`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#0a1628,#0d2040);padding:24px 32px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:20px;">MediCareer Agent</h1>
            <p style="color:#14b8a6;margin:4px 0 0;font-size:12px;text-transform:uppercase;">Application Status Update</p>
          </div>
          <div style="padding:28px 32px;background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
            <p style="margin:0 0 16px;">Dear ${existing.fullName},</p>
            <p style="margin:0 0 16px;">Your application status has been updated:</p>
            <div style="background:#f0fdf9;border-left:4px solid #14b8a6;padding:16px;border-radius:6px;margin:16px 0;">
              <p style="margin:0;font-weight:bold;color:#0f766e;">New Status: ${label}</p>
            </div>
            <p style="margin:16px 0;">Log in to your dashboard to see full details and any actions required.</p>
            <p style="text-align:center;margin:24px 0;"><a href="https://agent.hcqsai.uk/dashboard" style="background:#14b8a6;color:#fff;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:600;">View Dashboard</a></p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
            <p style="font-size:12px;color:#64748b;margin:0;">Questions? Reply to this email or contact <a href="mailto:support@hcqsai.uk" style="color:#14b8a6;">support@hcqsai.uk</a></p>
          </div>
        </div>`,
        text: `Dear ${existing.fullName}, your application status has been updated to: ${label}. Log in to https://agent.hcqsai.uk/dashboard for details.`,
      }).catch(err => console.error("[Email] Status notification failed:", err));

      return { success: true } as const;
    }),

  updateGuidance: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        readinessScore: z.number().int().min(0).max(100).optional(),
        missingDocuments: z.array(z.string().max(255)).max(50).optional(),
        recommendedSteps: z.array(z.string().max(255)).max(50).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      const existing = await applicationsRepo.findById(id);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      await applicationsRepo.update(id, updates);
      return { success: true } as const;
    }),

  /** Internal notes. Admin-only on purpose - doctors must never read these. */
  adminNotes: adminProcedure
    .input(z.object({ applicationId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return adminNotesRepo.listForApplication(input.applicationId);
    }),

  addAdminNote: adminProcedure
    .input(
      z.object({
        applicationId: z.number().int().positive(),
        content: z.string().trim().min(1).max(10_000),
        type: z.enum(ADMIN_NOTE_TYPES).default("general"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await applicationsRepo.findById(input.applicationId);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      await adminNotesRepo.create({ ...input, authorUserId: ctx.user.id });
      return { success: true } as const;
    }),

  /* ─────────────────────────────────── Eligibility Engine ─────────────────── */

  /**
   * Evaluates a doctor's eligibility to work in the UK NHS based on real
   * regulatory requirements (visa, degree recognition, GMC registration).
   */
  checkEligibility: protectedProcedure
    .input(z.object({ applicationId: z.number().int().positive() }))
    .query(async ({ input, ctx }) => {
      const application = await loadOwned(input.applicationId, ctx.user);
      return evaluateEligibility({
        nationality: application.nationality ?? undefined,
        countryOfResidence: application.countryOfResidence ?? undefined,
        medicalSchool: application.medicalSchool ?? undefined,
        graduationYear: application.graduationYear ?? undefined,
        gmcStatus: application.gmcStatus ?? undefined,
        plabStatus: application.plabStatus ?? undefined,
        ieltsOetStatus: application.ieltsOetStatus ?? undefined,
        yearsExperience: application.yearsExperience ?? undefined,
        specialtyInterest: application.specialtyInterest ?? undefined,
        internshipCompleted: application.internshipCompleted,
        ukRightToWork: application.ukRightToWork ?? undefined,
        nhsExperience: application.nhsExperience,
        previousUkApplications: application.previousUkApplications,
      });
    }),

  /* ─────────────────────────────── Job criteria matching ──────────────────── */

  /**
   * Matches one doctor's application against a job's person specification,
   * criterion by criterion. Returns which criteria are evidenced by real profile
   * data, which are gaps, and which need a human to judge. Admin-only: this is a
   * consultant's working tool.
   *
   * The criteria are passed in (the admin has them in front of them when
   * assessing a job), so this does not depend on where the job records live.
   */
  matchToJob: adminProcedure
    .input(
      z.object({
        applicationId: z.number().int().positive(),
        essentialCriteria: z.array(z.string().max(500)).max(50).default([]),
        desirableCriteria: z.array(z.string().max(500)).max(50).default([]),
      })
    )
    .query(async ({ input }) => {
      const application = await applicationsRepo.findById(input.applicationId);
      if (!application) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      }
      const docs = await documentsRepo.listForApplication(application.id);
      return matchCriteria(
        {
          essentialCriteria: input.essentialCriteria,
          desirableCriteria: input.desirableCriteria,
        },
        {
          gmcStatus: application.gmcStatus ?? undefined,
          plabStatus: application.plabStatus ?? undefined,
          ieltsOetStatus: application.ieltsOetStatus ?? undefined,
          alsBlsStatus: application.alsBlsStatus ?? undefined,
          yearsExperience: application.yearsExperience ?? undefined,
          specialtyInterest: application.specialtyInterest ?? undefined,
          currentRole: application.currentRole ?? undefined,
          careerStory: application.careerStory ?? undefined,
          internshipCompleted: application.internshipCompleted,
          nhsExperience: application.nhsExperience,
          documentCategories: docs.map(d => d.category),
        }
      );
    }),

  /**
   * Produces a first-draft supporting-information statement for a doctor against
   * a specific post. Assembled only from the doctor's own recorded facts and the
   * criteria that matched as "evidenced" - it never writes about a gap. Admin
   * only, and the result carries a "review before use" disclaimer: it is a
   * starting point for a consultant, not a finished document.
   */
  draftSupportingInfo: adminProcedure
    .input(
      z.object({
        applicationId: z.number().int().positive(),
        jobTitle: z.string().trim().min(1).max(255),
        hospital: z.string().trim().max(255).optional(),
        essentialCriteria: z.array(z.string().max(500)).max(50).default([]),
        desirableCriteria: z.array(z.string().max(500)).max(50).default([]),
      })
    )
    .query(async ({ input }) => {
      const application = await applicationsRepo.findById(input.applicationId);
      if (!application) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
      }
      const docs = await documentsRepo.listForApplication(application.id);
      const match = matchCriteria(
        { essentialCriteria: input.essentialCriteria, desirableCriteria: input.desirableCriteria },
        {
          gmcStatus: application.gmcStatus ?? undefined,
          plabStatus: application.plabStatus ?? undefined,
          ieltsOetStatus: application.ieltsOetStatus ?? undefined,
          alsBlsStatus: application.alsBlsStatus ?? undefined,
          yearsExperience: application.yearsExperience ?? undefined,
          specialtyInterest: application.specialtyInterest ?? undefined,
          currentRole: application.currentRole ?? undefined,
          careerStory: application.careerStory ?? undefined,
          internshipCompleted: application.internshipCompleted,
          nhsExperience: application.nhsExperience,
          documentCategories: docs.map(d => d.category),
        }
      );
      return buildSupportingInfoDraft({
        jobTitle: input.jobTitle,
        hospital: input.hospital,
        profile: {
          fullName: application.fullName,
          currentRole: application.currentRole ?? undefined,
          specialtyInterest: application.specialtyInterest ?? undefined,
          yearsExperience: application.yearsExperience ?? undefined,
          careerStory: application.careerStory ?? undefined,
        },
        match,
      });
    }),
});
