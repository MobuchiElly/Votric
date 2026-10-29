import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { moderatePollSchema } from "@/schemas/admin/moderation.schema";
import { moderatePoll } from "@/services/admin/moderation.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
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

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "You do not have permission to perform this action",
        },
        { status: 403 },
      );
    }

    const body = await request.json().catch(() => null);
    const validation = moderatePollSchema.safeParse(body);

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

    const { id: pollId } = await params;

    const result = await moderatePoll(
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
        POLL_ALREADY_DELETED: {
          status: 409,
          message: "Poll has already been deleted",
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
        message: "Poll moderated successfully",
        data: result.poll,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH /api/admin/polls/[id]/moderate error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}