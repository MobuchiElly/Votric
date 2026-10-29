import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/jwt";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  
  if (!token) {
    return null;
  }

  let userId: string;

  try {
    const payload = await verifyAccessToken(token);

    if (typeof payload.sub !== "string") {
      return null;
    }

    userId = payload.sub;
  } catch {
    // Missing, expired, or invalid JWT.
    return null;
  }

  // Keep database errors visible so API routes can handle outages.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      emailVerifiedAt: true,
    },
  });

  if (!user || user.status !== "ACTIVE") {
    return null;
  }

  return user;
}