import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;

  let isAuthenticated = false;

  if (token) {
    try {
      const payload = await verifyAccessToken(token);

      isAuthenticated = typeof payload.sub === "string";
    } catch {
      // Token is expired, invalid, or malformed.
      isAuthenticated = false;
    }
  }

  if (!isAuthenticated) {
    const redirectUrl = req.nextUrl.clone();

    redirectUrl.pathname = "/auth/login";
    redirectUrl.search = "";

    redirectUrl.searchParams.set(
      "redirectedFrom",
      `${req.nextUrl.pathname}${req.nextUrl.search}`,
    );

    const response = NextResponse.redirect(redirectUrl);

    // Clear an invalid or expired cookie.
    if (token) {
      response.cookies.set("access_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/polls/:path*",
  ],
};