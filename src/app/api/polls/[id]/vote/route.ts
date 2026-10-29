import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { voteSchema } from "@/schemas/vote.schema";
import { castVote } from "@/services/vote.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: Request,
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

    const { id: pollId } = await params;

    // 3. Validate the request body.
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON request body",
        },
        { status: 400 },
      );
    }

    const validation = voteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    // 4. Record the vote.
    const result = await castVote(
      pollId,
      user.id,
      validation.data.optionId,
    );

    // 5. Map service errors to HTTP responses.
    if ("error" in result) {
      switch (result.error) {
        case "NOT_FOUND":
          return NextResponse.json(
            { success: false, error: "Poll not found" },
            { status: 404 },
          );

        case "POLL_NOT_ACTIVE":
          return NextResponse.json(
            {
              success: false,
              error: "This poll is not accepting votes",
            },
            { status: 409 },
          );

        case "INVALID_OPTION":
          return NextResponse.json(
            {
              success: false,
              error: "The selected option does not belong to this poll",
            },
            { status: 400 },
          );

        case "ALREADY_VOTED":
          return NextResponse.json(
            {
              success: false,
              error: "You have already voted on this poll",
            },
            { status: 409 },
          );
      }
    }

    // 6. Return the successful vote.
    return NextResponse.json(
      {
        success: true,
        message: "Vote recorded successfully",
        data: result,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/polls/[id]/vote error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while recording your vote",
      },
      { status: 500 },
    );
  }
}