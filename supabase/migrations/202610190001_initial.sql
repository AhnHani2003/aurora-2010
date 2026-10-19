-- Run in the Supabase SQL editor. All access goes through the server's direct PostgreSQL connection.
create table if not exists public.authenticated_sessions (
  id uuid primary key,
  token_hash text not null unique,
  expires_at timestamptz not null,
  active_playthrough_id uuid,
  created_at timestamptz not null default now()
);
create table if not exists public.playthroughs (
  id uuid primary key,
  session_id uuid not null references public.authenticated_sessions(id),
  state jsonb not null,
  version integer not null default 0 check (version >= 0),
  finalized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint playthrough_state_id check (state->>'id' = id::text),
  constraint playthrough_state_version check ((state->>'version')::integer = version),
  constraint playthrough_finalization_matches_phase check ((state->>'phase' = 'finalized') = (finalized_at is not null)),
  constraint wheel_attempt_cap check (jsonb_array_length(coalesce(state #> '{wheel,spins}', '[]'::jsonb)) <= 5),
  constraint dice_attempt_cap check (jsonb_array_length(coalesce(state #> '{dice,rolls}', '[]'::jsonb)) <= 5),
  constraint quiz_attempt_cap check (jsonb_array_length(coalesce(state #> '{quiz,attempts}', '[]'::jsonb)) <= 3)
);
create unique index if not exists one_active_playthrough_per_session on public.playthroughs(session_id) where finalized_at is null;
create table if not exists public.game_operations (
  session_id uuid not null references public.authenticated_sessions(id),
  operation_id uuid not null,
  request_hash text not null,
  response_state jsonb not null,
  created_at timestamptz not null default now(),
  primary key (session_id, operation_id)
);
create table if not exists public.email_outbox (
  id uuid primary key,
  playthrough_id uuid not null unique references public.playthroughs(id),
  status text not null default 'pending' check(status in ('pending','sent','failed','unconfigured')),
  attempts integer not null default 0 check (attempts >= 0),
  first_attempt_at timestamptz,
  next_attempt_at timestamptz not null default now(),
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.request_limits (
  key text primary key,
  count integer not null default 1,
  reset_at timestamptz not null
);
create index if not exists email_outbox_pending on public.email_outbox(next_attempt_at) where status <> 'sent';
-- JSON state contains the full immutable attempt/message/reward audit; no browser can write it directly.
alter table public.authenticated_sessions enable row level security;
alter table public.playthroughs enable row level security;
alter table public.game_operations enable row level security;
alter table public.email_outbox enable row level security;
alter table public.request_limits enable row level security;
revoke all on public.authenticated_sessions, public.playthroughs, public.game_operations, public.email_outbox, public.request_limits from anon, authenticated;
