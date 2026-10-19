import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { runtimeConfig, SESSION_COOKIE } from "./config";
import { HttpError, tokenHash } from "./security";
import { publicView } from "../game-rules/engine";
import { readSession, type StoredSession } from "../db/store";

export async function currentTokenHash() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token && /^[a-zA-Z0-9_-]{43}$/.test(token) ? tokenHash(token) : null;
}
export async function requireSession() {
  const hash = await currentTokenHash();
  const stored = hash ? await readSession(hash) : null;
  if (!stored || !hash)
    throw new HttpError(401, "Your garden is waiting. Please unlock it again.");
  return { hash, stored };
}
export function sessionResponse(stored: StoredSession | null) {
  return NextResponse.json(
    {
      authenticated: !!stored,
      demo: runtimeConfig().demo,
      state: stored?.state ? publicView(stored.state) : null,
      emailStatus: stored?.emailStatus || null,
    },
    { headers: { "Cache-Control": "no-store, private" } },
  );
}
export function errorResponse(error: unknown) {
  if (error instanceof HttpError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status, headers: { "Cache-Control": "no-store" } },
    );
  if (error instanceof ZodError)
    return NextResponse.json(
      { error: "Please check your choice or message and try again." },
      { status: 400 },
    );
  // Engine violations are user-facing; all infrastructure/configuration errors stay private.
  if (error instanceof Error && error.name === "GameRuleError")
    return NextResponse.json({ error: error.message }, { status: 409 });
  console.error(
    "[Aurora server]",
    error instanceof Error ? error.name : "Unknown error",
  );
  return NextResponse.json(
    {
      error:
        "The garden needs a moment. Your saved adventure is safe. Please check the server configuration and try again.",
    },
    { status: 503 },
  );
}
