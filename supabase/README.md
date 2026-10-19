# Private backend setup

1. Create a Supabase project. Paste `migrations/202610190001_initial.sql` into its SQL editor and run it.
2. Copy the **transaction pooler** PostgreSQL URL from Supabase's Connect panel into `SUPABASE_DATABASE_URL` in your local `.env.local`, and later into Vercel's server environment. The server uses TLS and disables prepared statements for pooler compatibility. Never use a `NEXT_PUBLIC_` variable for this URL.
3. Set `AURORA_ACCESS_PASSWORD` locally and a random `SESSION_SECRET` containing at least 32 characters. Do not put secrets into chat, source files, or Git.
4. Set `RESEND_API_KEY` and `RESULT_EMAIL_FROM` using a verified Resend sender/domain. `RESULT_EMAIL_TO` defaults to `manhthong2003@gmail.com`; it is a recipient, not an assumed verified sender.
5. Set a separate random `EMAIL_RETRY_SECRET` of at least 32 characters. Configure your scheduler to POST `/api/email/retry` every minute with `Authorization: Bearer <EMAIL_RETRY_SECRET>`. Never expose this token in browser code. Finalization and result-page reloads also start eligible delivery attempts.

`NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are unnecessary here: all database access uses the private PostgreSQL connection. Anonymous/authenticated Supabase API roles cannot read or write these tables. Keep the database URL private.

## Persistence and delivery checks

Complete or forfeit a run, then inspect these queries in the Supabase SQL editor:

```sql
select id, version, state->>'phase' as phase, finalized_at
from public.playthroughs order by created_at desc limit 10;

select playthrough_id, status, attempts, first_attempt_at, sent_at, last_error
from public.email_outbox order by created_at desc limit 10;

select id, state->'final' as result,
       state->'begging' as begging,
       state->'wheel' as wheel,
       state->'dice' as dice,
       state->'quiz' as quiz
from public.playthroughs where finalized_at is not null
order by finalized_at desc limit 10;
```

These records contain personal messages. Keep them private. A finalized result and its unique outbox job are committed in the same transaction. A session row lock serializes game actions, and operation UUIDs plus expected playthrough/version checks prevent duplicate submissions. Past playthroughs remain stored when Play Again creates a new one.

`sent` means Resend accepted the notification; it does not guarantee inbox delivery. Check Resend's delivery dashboard for bounces or spam filtering. Missing email credentials produce `unconfigured`, never `sent`. A mail error never removes the saved result or blocks its result card.

Delivery uses a fixed provider idempotency key for each playthrough and a database row lock. The first-attempt timestamp is committed **before** contacting Resend to survive worker crashes. Automatic retries use exponential backoff, stop after eight recorded attempts, and stop 23 hours after the first possible send so retries stay inside Resend's 24-hour idempotency window. After that, review the provider dashboard and `email_outbox` manually before deciding whether to resend. Do not blindly reset ambiguous jobs or change recipients/senders while a retry is pending.

## Local demo

When password, session secret, or database configuration is incomplete in development, the API explicitly reports `demo: true`. The fallback password is `aurora` unless a password is set. State is server-authoritative and saved in the ignored `.data/2010-demo.json`, including histories and logical demo outbox entries. It survives refreshes and local server restarts. Demo notifications always report `demo`; they never send real email. This local store supports one Node process and must not be used for hosting.

Production rejects secret-dependent operations if the security/database configuration is incomplete. It never silently falls back to demo storage. Real Supabase/Resend connectivity must be tested with your own credentials before sharing the deployed site.

Logging out during a started challenge atomically records a forfeited, no-prize result before expiring the authentication session. Closing the browser leaves the valid 30-day cookie/session available for resuming the same adventure.
