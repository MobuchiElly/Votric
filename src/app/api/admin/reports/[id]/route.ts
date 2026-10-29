import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { updateReportSchema } from "@/schemas/admin/report.schema";
import { updateReport } from "@/services/admin/reports.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    // 1. Authenticate the user.
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    // 2. Authorize the user.
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "You do not have permission to perform this action",
        },
        { status: 403 },
      );
    }

    // 3. Validate the request body.
    const body = await request.json().catch(() => null);
    const validation = updateReportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    // 4. Get the report ID.
    const { id: reportId } = await params;

    // 5. Update the report.
    const result = await updateReport(
      reportId,
      user.id,
      validation.data,
    );

    if (!result.success) {
      const errors = {
        REPORT_NOT_FOUND: {
          status: 404,
          message: "Report not found",
        },
        REPORT_ALREADY_FINALIZED: {
          status: 409,
          message: "This report has already been finalized",
        },
      } as const;

      const error = errors[result.error];

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Report updated successfully",
        data: result.report,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH /api/admin/reports/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}