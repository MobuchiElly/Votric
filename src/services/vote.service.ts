import { prisma } from "@/lib/prisma";

export async function castVote(
  pollId: string,
  userId: string,
  optionId: string,
) {
  try {
    return await prisma.$transaction(async (tx) => {
      // Lock the poll row so voting cannot race against editing or archiving the same poll.
      const lockedPoll = await tx.$queryRaw<{ id: string }[]>`
        SELECT id
        FROM polls
        WHERE id = ${pollId}
        FOR UPDATE
      `;

      if (lockedPoll.length === 0) {
        return { error: "NOT_FOUND" as const };
      }

      const poll = await tx.poll.findUnique({
        where: { id: pollId },
        select: {
          id: true,
          status: true,
        },
      });

      if (!poll || poll.status === "DELETED") {
        return { error: "NOT_FOUND" as const };
      }

      if (poll.status !== "ACTIVE") {
        return { error: "POLL_NOT_ACTIVE" as const };
      }

      // Ensure the selected option belongs to this poll.
      const option = await tx.pollOption.findFirst({
        where: {
          id: optionId,
          poll_id: pollId,
        },
        select: {
          id: true,
          option_text: true,
        },
      });

      if (!option) {
        return { error: "INVALID_OPTION" as const };
      }

      // Check whether this user has already voted.
      const existingVote = await tx.vote.findFirst({
        where: {
          poll_id: pollId,
          voter_id: userId,
        },
        select: {
          id: true,
        },
      });

      if (existingVote) {
        return { error: "ALREADY_VOTED" as const };
      }

      // Record the vote.
      const vote = await tx.vote.create({
        data: {
          poll_id: pollId,
          option_id: optionId,
          voter_id: userId,
        },
        select: {
          id: true,
          created_at: true,
        },
      });

      // Return updated vote totals.
      const [optionVotes, totalVotes] = await Promise.all([
        tx.vote.count({
          where: {
            poll_id: pollId,
            option_id: optionId,
          },
        }),
        tx.vote.count({
          where: {
            poll_id: pollId,
          },
        }),
      ]);

      return {
        vote: {
          id: vote.id,
          pollId,
          optionId: option.id,
          optionText: option.option_text,
          votedAt: vote.created_at,
        },
        optionVotes,
        totalVotes,
      };
    });
  } catch (error: unknown) {
    // The database unique constraint is the final safeguard
    // against duplicate votes.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { error: "ALREADY_VOTED" as const };
    }

    throw error;
  }
}