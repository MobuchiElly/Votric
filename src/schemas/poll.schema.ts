import { z } from "zod";

export const createPollSchema = z
  .object({
    title: z.string().trim().min(1, "Poll title is required").max(160),
    description: z.string().trim().max(1000).optional(),
    options: z
      .array(
        z.string().trim().min(1, "Option cannot be empty").max(100)
      )
      .min(2, "A poll must have at least two options")
      .max(10, "A poll cannot have more than ten options")
      .refine(
        (options) =>
          new Set(options.map((option) => option.toLowerCase())).size ===
          options.length,
        "Poll options must be unique"
      ),
  });

export type CreatePollInput = z.infer<typeof createPollSchema>;

export const updatePollSchema = z
  .object({
    title: z.string().trim().min(1).max(160).optional(),

    description: z
      .string()
      .trim()
      .max(1000)
      .nullable()
      .optional(),

    options: z
      .array(z.string().trim().min(1).max(100))
      .min(2)
      .max(10)
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (
      data.title === undefined &&
      data.description === undefined &&
      data.options === undefined
    ) {
      ctx.addIssue({
        code: "custom",
        message: "At least one field must be provided for an update",
      });
    }

    if (data.options !== undefined) {
      const normalized = data.options.map((option) =>
        option.toLocaleLowerCase()
      );

      if (new Set(normalized).size !== normalized.length) {
        ctx.addIssue({
          code: "custom",
          path: ["options"],
          message: "Poll options must be unique. Duplicate options are not allowed.",
        });
      }
    }
  });

export type UpdatePollInput = z.infer<typeof updatePollSchema>;