import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { authRouter } from "./api/auth.router";
import { applicationsRouter } from "./api/applications.router";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  applications: applicationsRouter,

  // AI Vision - Analyze NHS Job Screenshot
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
