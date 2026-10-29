import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { createPollReportSchema } from "@/schemas/poll-report.schema";
import { createPollReport } from "@/services/poll-report.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
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

    // 2. Validate the request body.
    const body = await request.json().catch(() => null);
    const validation = createPollReportSchema.safeParse(body);

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

    // 3. Get the poll ID from the URL.
    const { id: pollId } = await params;

    // 4. Create the report.
    const result = await createPollReport(
      pollId,
      user.id,
      validation.data,
    );

    if (!result.success) {
      const errors = {
        POLL_NOT_FOUND: {
          status: 404,
          message: "Poll not found",
        },
        CANNOT_REPORT_OWN_POLL: {
          status: 403,
          message: "You cannot report your own poll",
        },
        ALREADY_REPORTED: {
          status: 409,
          message: "You have already reported this poll",
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

    // 5. Return the created report.
    return NextResponse.json(
      {
        success: true,
        message: "Poll reported successfully",
        data: result.report,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/polls/[id]/report error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}