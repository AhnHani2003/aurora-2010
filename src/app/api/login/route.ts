import { STANDALONE_RELEASE } from "@/lib/release";
import { runtimeConfig, SESSION_COOKIE, SESSION_DAYS } from "@/lib/auth/config";
import { errorResponse, sessionResponse } from "@/lib/auth/http";
import {
  assertSameOrigin,
  correctPassword,
  HttpError,
  newSessionToken,
  requestIdentity,
  tokenHash,
} from "@/lib/auth/security";
import { createSession, enforceRateLimit } from "@/lib/db/store";
import { loginSchema, readJson } from "@/lib/validation/request";

export const runtime = "nodejs";
export async function POST(request: Request) {
  if (STANDALONE_RELEASE)
    return Response.json({ error: "Unavailable." }, { status: 404 });
  try {
    runtimeConfig();
    assertSameOrigin(request);
    await enforceRateLimit(`login:${requestIdentity(request)}`, 8, 15 * 60_000);
    const { password } = loginSchema.parse(await readJson(request));
    if (!correctPassword(password))
      throw new HttpError(
        401,
        "Hmm... that's not our secret password, princess. Try again!",
      );
    const token = newSessionToken();
    const stored = await createSession(
      tokenHash(token),
      new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString(),
    );
    const response = sessionResponse(stored);
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DAYS * 86_400,
    });
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
