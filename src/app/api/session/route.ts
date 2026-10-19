import { STANDALONE_RELEASE } from "@/lib/release";
import {
  currentTokenHash,
  errorResponse,
  sessionResponse,
} from "@/lib/auth/http";
import { readSession } from "@/lib/db/store";
import { deliverOutbox } from "@/lib/email/outbox";
import { after } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  if (STANDALONE_RELEASE)
    return Response.json({ error: "Unavailable." }, { status: 404 });
  try {
    const hash = await currentTokenHash();
    const stored = hash ? await readSession(hash) : null;
    if (
      stored?.state?.final &&
      stored.emailStatus !== "sent" &&
      stored.emailStatus !== "demo"
    ) {
      const id = stored.state.id;
      after(async () => {
        try {
          await deliverOutbox(id);
        } catch {
          console.error(
            "[Aurora email] Saved notification is waiting for the retry worker.",
          );
        }
      });
    }
    return sessionResponse(stored);
  } catch (error) {
    return errorResponse(error);
  }
}
