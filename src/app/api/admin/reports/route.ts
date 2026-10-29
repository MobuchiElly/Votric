import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { adminReportQuerySchema } from "@/schemas/admin/report.schema";
import { getAdminReports } from "@/services/admin/moderation.service";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate.
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

    // 2. Authorize.
    // if (user.role !== "ADMIN") {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: "You do not have permission to access this resource",
    //     },
    //     { status: 403 },
    //   );
    // }

    // 3. Validate query parameters.
    const searchParams = request.nextUrl.searchParams;

    const validation = adminReportQuerySchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    // 4. Retrieve reports.
    const result = await getAdminReports(validation.data);

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        pagination: result.pagination,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/admin/reports error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}