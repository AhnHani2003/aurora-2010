import "server-only";
import { Resend } from "resend";
import { runtimeConfig } from "../auth/config";
import { database } from "../db/connection";
import type { PlaythroughState } from "../game-rules/engine";
import { resultEmail } from "./template";

/**
 * Database transaction lock excludes concurrent delivery workers. Resend's stable
 * idempotency key also protects the gap between provider acceptance and DB commit.
 * The first-attempt timestamp is committed before contacting Resend, so a worker
 * crash cannot erase the deduplication window. Ambiguous retries stop at 23 hours,
 * before Resend's 24-hour deduplication expires.
 */
export async function deliverOutbox(playthroughId?: string): Promise<void> {
  if (runtimeConfig().demo) return;
  const sql = database();
  const candidates = playthroughId
    ? await sql<
        { id: string }[]
      >`select id from email_outbox where playthrough_id=${playthroughId} and status <> 'sent' and attempts < 8 and next_attempt_at <= now() and (first_attempt_at is null or first_attempt_at > now()-interval '23 hours') limit 1`
    : await sql<
        { id: string }[]
      >`select id from email_outbox where status <> 'sent' and attempts < 8 and next_attempt_at <= now() and (first_attempt_at is null or first_attempt_at > now()-interval '23 hours') order by created_at limit 10`;
  for (const candidate of candidates) {
    if (process.env.RESEND_API_KEY && process.env.RESULT_EMAIL_FROM) {
      // This autocommit must precede the external side effect, independently of
      // the send transaction below. Keep it even if that transaction rolls back.
      const eligible = await sql<
        { id: string }[]
      >`update email_outbox set first_attempt_at=coalesce(first_attempt_at,now()) where id=${candidate.id} and status <> 'sent' and attempts < 8 and next_attempt_at <= now() and (first_attempt_at is null or first_attempt_at > now()-interval '23 hours') returning id`;
      if (!eligible[0]) continue;
    }
    await sql.begin(async (tx) => {
      const rows = await tx<
        {
          id: string;
          playthrough_id: string;
          attempts: number;
          status: string;
        }[]
      >`select id,playthrough_id,attempts,status from email_outbox where id=${candidate.id} and status <> 'sent' and attempts < 8 and next_attempt_at <= now() and (first_attempt_at is null or first_attempt_at > now()-interval '23 hours') for update skip locked`;
      const job = rows[0];
      if (!job) return;
      const apiKey = process.env.RESEND_API_KEY;
      const sender = process.env.RESULT_EMAIL_FROM;
      if (!apiKey || !sender) {
        await tx`update email_outbox set status='unconfigured',last_error='Email credentials are not configured; the result is saved.',next_attempt_at=now()+interval '5 minutes' where id=${job.id}`;
        return;
      }
      const states = await tx<
        { state: PlaythroughState }[]
      >`select state from playthroughs where id=${job.playthrough_id}`;
      if (!states[0]?.state.final)
        throw new Error(
          "Outbox references a playthrough that is not finalized.",
        );
      const content = resultEmail(states[0].state);
      try {
        const resend = new Resend(apiKey);
        const { error } = await resend.emails.send(
          {
            from: sender,
            // This is a private result notification, never a client-provided recipient.
            to: process.env.RESULT_EMAIL_TO || "manhthong2003@gmail.com",
            ...content,
          },
          { idempotencyKey: `aurora-result-${job.playthrough_id}` },
        );
        if (error) throw new Error(error.message);
        await tx`update email_outbox set status='sent',attempts=attempts+1,sent_at=now(),last_error=null where id=${job.id}`;
      } catch (error) {
        const backoff = Math.min(3600, 30 * 2 ** job.attempts);
        const reason = (
          error instanceof Error
            ? error.message
            : "Provider did not confirm delivery."
        )
          .replaceAll(apiKey, "[redacted]")
          .slice(0, 500);
        await tx`update email_outbox set status='failed',attempts=attempts+1,last_error=${reason},next_attempt_at=${new Date(Date.now() + backoff * 1000)} where id=${job.id}`;
      }
    });
  }
}
