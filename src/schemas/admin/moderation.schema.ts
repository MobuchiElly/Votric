import { z } from "zod";

export const moderatePollSchema = z
  .object({
    action: z.literal("DELETE"),
    note: z
      .string()
      .trim()
      .min(10, "Moderation note must be at least 10 characters")
      .max(1000, "Moderation note cannot exceed 1000 characters"),
  })
  .strict();

export type ModeratePollInput = z.infer<
  typeof moderatePollSchema
>;