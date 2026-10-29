import { SignJWT, jwtVerify } from "jose";

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET is not configured");
}

const secretKey = new TextEncoder().encode(secret);

export async function signAccessToken(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .setIssuer("poppoll")
    .setAudience("poppoll-app")
    .sign(secretKey);
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, secretKey, {
    issuer: "poppoll",
    audience: "poppoll-app",
    algorithms: ["HS256"],
  });

  return payload;
}