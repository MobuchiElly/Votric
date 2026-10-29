import { z } from "zod";

export const voteSchema = z
  .object({
    optionId: z.string().uuid("Invalid poll option ID"),
  })
  .strict();

export type VoteInput = z.infer<typeof voteSchema>;