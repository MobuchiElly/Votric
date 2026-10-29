import { prisma } from "@/lib/prisma";
import type { PollReportStatus } from "../../../generated/prisma/client";
import type { ModeratePollInput } from "@/schemas/admin/moderation.schema";

type GetAdminReportsInput = {
  page: number;
  limit: number;
  status?: PollReportStatus;
};

export async function getAdminReports({
  page,
  limit,
  status,
}: GetAdminReportsInput) {
  const where = status ? { status } : {};

  const [reports, total] = await prisma.$transaction([
    prisma.pollReport.findMany({
      where,
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        pollId: true,
        reporterId: true,
        reason: true,
        details: true,
        status: true,
        reviewedById: true,
        reviewedAt: true,
        resolutionNote: true,
        createdAt: true,
        updatedAt: true,

        poll: {
          select: {
            id: true,
            title: true,
            status: true,
            creator_id: true,
          },
        },

        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        reviewedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    prisma.pollReport.count({ where }),
  ]);

  return {
    data: reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
}


type ModeratePollResult =
  | {
      success: true;
      poll: {
        id: string;
        title: string;
        status: string;
        deletedAt: Date | null;
        deletedById: string | null;
        deletionNote: string | null;
      };
    }
  | {
      success: false;
      error: "POLL_NOT_FOUND" | "POLL_ALREADY_DELETED";
    };

export async function moderatePoll(
  pollId: string,
  adminId: string,
  input: ModeratePollInput,
): Promise<ModeratePollResult> {
  return prisma.$transaction(async (tx) => {
    // Lock the poll row against concurrent moderation or voting.
    const lockedPolls = await tx.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM polls
      WHERE id = ${pollId}
      FOR UPDATE
    `;

    if (lockedPolls.length === 0) {
      return {
        success: false,
        error: "POLL_NOT_FOUND",
      };
    }

    const existingPoll = await tx.poll.findUnique({
      where: { id: pollId },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    if (!existingPoll) {
      return {
        success: false,
        error: "POLL_NOT_FOUND",
      };
    }

    if (existingPoll.status === "DELETED") {
      return {
        success: false,
        error: "POLL_ALREADY_DELETED",
      };
    }

    const deletedAt = new Date();

    const poll = await tx.poll.update({
      where: { id: pollId },
      data: {
        status: "DELETED",
        deletedAt,
        deletedById: adminId,
        deletionNote: input.note,
      },
      select: {
        id: true,
        title: true,
        status: true,
        deletedAt: true,
        deletedById: true,
        deletionNote: true,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: "POLL_SOFT_DELETED",
        entityType: "POLL",
        entityId: pollId,
        note: input.note,
        metadata: {
          previousStatus: existingPoll.status,
          newStatus: "DELETED",
          title: existingPoll.title,
        },
      },
    });

    return {
      success: true,
      poll,
    };
  });
}