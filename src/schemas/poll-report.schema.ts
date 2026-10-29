import { z } from "zod";

export const createPollReportSchema = z
  .object({
    reason: z.enum([
      "SPAM",
      "HARASSMENT",
      "HATE_OR_ABUSE",
      "SEXUAL_CONTENT",
      "VIOLENCE",
      "MISINFORMATION",
      "OTHER",
    ]),
    details: z
      .string()
      .trim()
      .max(1000, "Details cannot exceed 1000 characters")
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.reason === "OTHER" && !data.details) {
      ctx.addIssue({
        code: "custom",
        path: ["details"],
        message: "Please provide details when selecting OTHER",
      });
    }
  });

export type CreatePollReportInput = z.infer<
  typeof createPollReportSchema
>;