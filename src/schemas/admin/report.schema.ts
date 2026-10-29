import { z } from "zod";

export const adminReportQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
    status: z
      .enum(["OPEN", "UNDER_REVIEW", "RESOLVED", "DISMISSED"])
      .optional(),
  })
  .strict();

export type AdminReportQuery = z.infer<
  typeof adminReportQuerySchema
>;


export const updateReportSchema = z
  .object({
    status: z.enum([
      "UNDER_REVIEW",
      "RESOLVED",
      "DISMISSED",
    ]),
    resolutionNote: z
      .string()
      .trim()
      .max(1000, "Resolution note cannot exceed 1000 characters")
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (
      (data.status === "RESOLVED" ||
        data.status === "DISMISSED") &&
      !data.resolutionNote
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["resolutionNote"],
        message:
          "A resolution note is required when resolving or dismissing a report",
      });
    }
  });

export type UpdateReportInput = z.infer<
  typeof updateReportSchema
>;