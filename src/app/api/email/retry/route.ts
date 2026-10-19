import { STANDALONE_RELEASE } from "@/lib/release";
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/auth/http";
import { HttpError } from "@/lib/auth/security";
import { deliverOutbox } from "@/lib/email/outbox";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  if (STANDALONE_RELEASE)
    return Response.json({ error: "Unavailable." }, { status: 404 });
  try {
    const secret = process.env.EMAIL_RETRY_SECRET;
    const bearer =
      request.headers.get("authorization")?.replace(/^Bearer /, "") || "";
    if (!secret || secret.length < 32)
      throw new HttpError(503, "The delivery scheduler is not configured.");
    if (
      Buffer.byteLength(secret) !== Buffer.byteLength(bearer) ||
      !timingSafeEqual(Buffer.from(secret), Buffer.from(bearer))
    )
      throw new HttpError(401, "Unauthorized.");
    await deliverOutbox();
    return NextResponse.json({
      processed: true,
      message:
        "Eligible saved notifications were checked. See email_outbox for delivery status.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
