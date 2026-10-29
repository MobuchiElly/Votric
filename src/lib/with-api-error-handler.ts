import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

type RouteHandler<TContext = unknown> = (
  request: Request,
  context: TContext,
) => Promise<Response>;

export function withApiErrorHandler<TContext = unknown>(handler: RouteHandler<TContext>) {
  return async (request: Request, context: TContext): Promise<Response> => {
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