import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { getPublicPollFeed } from "@/services/poll.service";

const feedQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  search: z.string().trim().max(100).default(""),
});

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate the user
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

    // 2. Read and validate query parameters
    const searchParams = request.nextUrl.searchParams;

    const queryResult = feedQuerySchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: queryResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { page, limit, search } = queryResult.data;

    // 3. Fetch the public poll feed
    const result = await getPublicPollFeed(
      user.id,
      page,
      limit,
      search,
    );

    // 4. Return the response
    return NextResponse.json(
      {
        success: true,
        data: result.data,
        pagination: result.pagination,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/polls/feed error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}