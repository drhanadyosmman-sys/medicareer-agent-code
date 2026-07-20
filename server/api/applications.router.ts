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
});
