import { prisma } from "@/lib/prisma";
import type { UpdateReportInput } from "@/schemas/admin/report.schema";

type UpdateReportResult =
  | {
      success: true;
      report: {
        id: string;
        status: string;
        reviewedById: string | null;
        reviewedAt: Date | null;
        resolutionNote: string | null;
        updatedAt: Date;
      };
    }
  | {
      success: false;
      error: "REPORT_NOT_FOUND" | "REPORT_ALREADY_FINALIZED";
    };

export async function updateReport(
  reportId: string,
  adminId: string,
  input: UpdateReportInput,
): Promise<UpdateReportResult> {
  return prisma.$transaction(async (tx) => {
    // Lock the report so concurrent reviews cannot overwrite each other.
    const lockedReports = await tx.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM poll_reports
      WHERE id = ${reportId}
      FOR UPDATE
    `;

    if (lockedReports.length === 0) {
      return {
        success: false,
        error: "REPORT_NOT_FOUND",
      };
    }

    const existingReport = await tx.pollReport.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!existingReport) {
      return {
        success: false,
        error: "REPORT_NOT_FOUND",
      };
    }

    // Resolved and dismissed reports are final in this workflow.
    if (
      existingReport.status === "RESOLVED" ||
      existingReport.status === "DISMISSED"
    ) {
      return {
        success: false,
        error: "REPORT_ALREADY_FINALIZED",
      };
    }

    const isFinalStatus =
      input.status === "RESOLVED" ||
      input.status === "DISMISSED";

    const report = await tx.pollReport.update({
      where: { id: reportId },
      data: {
        status: input.status,
        reviewedById: adminId,
        reviewedAt: isFinalStatus ? new Date() : null,
        resolutionNote: isFinalStatus
          ? input.resolutionNote!
          : null,
      },
      select: {
        id: true,
        status: true,
        reviewedById: true,
        reviewedAt: true,
        resolutionNote: true,
        updatedAt: true,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: `POLL_REPORT_${input.status}`,
        entityType: "POLL_REPORT",
        entityId: reportId,
        note: input.resolutionNote ?? null,
        metadata: {
          previousStatus: existingReport.status,
          newStatus: input.status,
        },
      },
    });

    return {
      success: true,
      report,
    };
  });
}