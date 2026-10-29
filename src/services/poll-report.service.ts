import { prisma } from "@/lib/prisma";
import type { CreatePollReportInput } from "@/schemas/poll-report.schema";

type CreatePollReportResult =
  | {
      success: true;
      report: {
        id: string;
        pollId: string;
        reason: string;
        details: string | null;
        status: string;
        createdAt: Date;
      };
    }
  | {
      success: false;
      error:
        | "POLL_NOT_FOUND"
        | "CANNOT_REPORT_OWN_POLL"
        | "ALREADY_REPORTED";
    };

export async function createPollReport(
  pollId: string,
  reporterId: string,
  input: CreatePollReportInput,
): Promise<CreatePollReportResult> {
  try {
    return await prisma.$transaction(async (tx) => {
      const poll = await tx.poll.findFirst({
        where: {
          id: pollId,
          status: { not: "DELETED" },
        },
        select: {
          id: true,
          creator_id: true,
        },
      });

      if (!poll) {
        return {
          success: false,
          error: "POLL_NOT_FOUND",
        };
      }

      if (poll.creator_id === reporterId) {
        return {
          success: false,
          error: "CANNOT_REPORT_OWN_POLL",
        };
      }

      const report = await tx.pollReport.create({
        data: {
          pollId,
          reporterId,
          reason: input.reason,
          details: input.details ?? null,
        },
        select: {
          id: true,
          pollId: true,
          reason: true,
          details: true,
          status: true,
          createdAt: true,
        },
      });

      return {
        success: true,
        report,
      };
    });
  } catch (error) {
    // The unique constraint prevents duplicate reports.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: "ALREADY_REPORTED",
      };
    }

    throw error;
  }
}