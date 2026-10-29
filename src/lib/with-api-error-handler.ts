
import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

type RouteHandler = (
  request: Request,
  context: any,
) => Promise<Response>;

export function withApiErrorHandler(handler: RouteHandler) {
  return async (request: Request, context: any): Promise<Response> => {
    try {
      return await handler(request, context);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
          },
          {
            status: error.statusCode,
          },
        );
      }

      console.error("Unexpected API error:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Internal server error",
        },
        {
          status: 500,
        },
      );
    }
  };
}