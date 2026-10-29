import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createPollSchema } from "@/schemas/poll.schema";
import { createPoll, getPolls } from "@/services/poll.service";

export async function POST(request: Request) {
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

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON request body",
        },
        { status: 400 }
      );
    }

    const validation = createPollSchema.safeParse(body);

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

    const poll = await createPoll(user.id, validation.data);

    return NextResponse.json(
      {
        success: true,
        message: "Poll created successfully",
        poll,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/polls failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to create poll",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const voted = url.searchParams.get("voted") === "true";

    const polls = await getPolls(user.id, voted);

    return NextResponse.json(
      {
        success: true,
        polls,
        message: "Request successful",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/polls failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to retrieve polls",
      },
      { status: 500 }
    );
  }
}