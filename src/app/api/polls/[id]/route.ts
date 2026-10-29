import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getPollById, updatePoll, archivePoll } from "@/services/poll.service";
import { updatePollSchema } from "@/schemas/poll.schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Poll ID is required",
        },
        { status: 400 }
      );
    }

    const poll = await getPollById(id, user.id);

    if (!poll) {
      return NextResponse.json(
        {
          success: false,
          error: "Poll not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Poll retrieved successfully",
        poll,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/polls/[id] failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to retrieve poll",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const validation = updatePollSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await updatePoll(id, user.id, validation.data);

    if ("error" in result) {
      switch (result.error) {
        case "NOT_FOUND":
          return NextResponse.json(
            { success: false, error: "Poll not found" },
            { status: 404 }
          );

        case "FORBIDDEN":
          return NextResponse.json(
            {
              success: false,
              error: "You are not authorized to edit this poll",
            },
            { status: 403 }
          );

        case "VOTING_STARTED":
          return NextResponse.json(
            {
              success: false,
              error:
                "This poll can no longer be edited because voting has started.",
            },
            { status: 409 }
          );

        case "NOT_EDITABLE":
          return NextResponse.json(
            {
              success: false,
              error: "Only active polls can be edited",
            },
            { status: 409 }
          );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Poll updated successfully",
        poll: result.poll,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/polls/[id] failed:", error);

    return NextResponse.json(
      { success: false, error: "Unable to update poll" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const result = await archivePoll(id, user.id);

    if ("error" in result) {
      switch (result.error) {
        case "NOT_FOUND":
          return NextResponse.json(
            { success: false, error: "Poll not found" },
            { status: 404 }
          );

        case "FORBIDDEN":
          return NextResponse.json(
            {
              success: false,
              error: "You are not authorized to archive this poll",
            },
            { status: 403 }
          );

        case "ALREADY_ARCHIVED":
          return NextResponse.json(
            { success: false, error: "Poll is already archived" },
            { status: 409 }
          );

        case "NOT_ARCHIVABLE":
          return NextResponse.json(
            { success: false, error: "Poll cannot be archived in its current state" },
            { status: 409 }
          );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Poll archived successfully",
        poll: result.poll,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/polls/[id] failed:", error);

    return NextResponse.json(
      { success: false, error: "Unable to archive poll" },
      { status: 500 }
    );
  }
}