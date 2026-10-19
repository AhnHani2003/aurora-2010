import { STANDALONE_RELEASE } from "@/lib/release";
import { after } from "next/server";
import { z } from "zod";
import {
  errorResponse,
  requireSession,
  sessionResponse,
} from "@/lib/auth/http";
import { assertSameOrigin } from "@/lib/auth/security";
import { applyAction, enforceRateLimit } from "@/lib/db/store";
import { deliverOutbox } from "@/lib/email/outbox";
import { gameActionSchema } from "@/lib/game-rules/engine";
import { readJson } from "@/lib/validation/request";

export const runtime = "nodejs";
const schema = z
  .object({
    action: z.union([
      gameActionSchema,
      z.object({ type: z.literal("new_playthrough") }).strict(),
    ]),
    expectedVersion: z.number().int().nonnegative(),
    playthroughId: z.string().uuid(),
    operationId: z.string().uuid(),
  })
  .strict();

export async function POST(request: Request) {
  if (STANDALONE_RELEASE)
    return Response.json({ error: "Unavailable." }, { status: 404 });
  try {
    assertSameOrigin(request);
    const { hash, stored: current } = await requireSession();
    await enforceRateLimit(`game:${current.session.id}`, 100, 60_000);
    const { action, expectedVersion, operationId, playthroughId } =
      schema.parse(await readJson(request));
    const stored = await applyAction(
      hash,
      action,
      expectedVersion,
      operationId,
      playthroughId,
    );
    if (stored.state?.final) {
      const id = stored.state.id;
      after(async () => {
        try {
          await deliverOutbox(id);
        } catch {
          console.error(
            "[Aurora email] Delivery worker deferred; saved result remains available.",
          );
        }
      });
    }
    return sessionResponse(stored);
  } catch (error) {
    return errorResponse(error);
  }
}
