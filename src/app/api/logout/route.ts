import { STANDALONE_RELEASE } from "@/lib/release";
import { SESSION_COOKIE } from "@/lib/auth/config";
import { currentTokenHash, errorResponse } from "@/lib/auth/http";
import { assertSameOrigin } from "@/lib/auth/security";
import { expireSession } from "@/lib/db/store";
import { deliverOutbox } from "@/lib/email/outbox";
import { after, NextResponse } from "next/server";

export const runtime = "nodejs";
export async function POST(request: Request) {
  if (STANDALONE_RELEASE)
    return Response.json({ error: "Unavailable." }, { status: 404 });
  try {
    assertSameOrigin(request);
    const hash = await currentTokenHash();
    const finalizedId = hash ? await expireSession(hash) : null;
    if (finalizedId)
      after(async () => {
        try {
          await deliverOutbox(finalizedId);
        } catch {
          console.error(
            "[Aurora email] Saved forfeited result is pending notification.",
          );
        }
      });
    const response = NextResponse.json({ authenticated: false });
    response.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
