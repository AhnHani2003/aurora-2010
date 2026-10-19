import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { runtimeConfig } from "../auth/config";
import { HttpError } from "../auth/security";
import {
  createPlaythrough,
  transition,
  type GameAction,
  type PlaythroughState,
} from "../game-rules/engine";
import { database } from "./connection";
import { demoTransaction } from "./demo";
import type { EmailStatus, SessionRecord } from "./types";

type SessionRow = {
  id: string;
  token_hash: string;
  expires_at: Date;
  active_playthrough_id: string | null;
};
type StateRow = { state: PlaythroughState };
export type ApiAction = GameAction | { type: "new_playthrough" };
export type StoredSession = {
  session: SessionRecord;
  state: PlaythroughState | null;
  emailStatus: EmailStatus | null;
};
const isValid = (session: SessionRecord | undefined) =>
  !!session && Date.parse(session.expiresAt) > Date.now();
const fromRow = (row: SessionRow): SessionRecord => ({
  id: row.id,
  tokenHash: row.token_hash,
  expiresAt: row.expires_at.toISOString(),
  activePlaythroughId: row.active_playthrough_id,
});
function advance(state: PlaythroughState, action: ApiAction): PlaythroughState {
  if (action.type === "new_playthrough") {
    if (state.phase !== "finalized")
      throw new HttpError(
        409,
        "Finish or forfeit this adventure before beginning another.",
      );
    return createPlaythrough(randomUUID());
  }
  return transition(state, action);
}
function requestHash(
  action: ApiAction,
  expectedVersion: number,
  playthroughId?: string,
) {
  return createHash("sha256")
    .update(JSON.stringify({ action, expectedVersion, playthroughId }))
    .digest("hex");
}

export async function enforceRateLimit(
  key: string,
  maximum: number,
  windowMs: number,
) {
  const { demo } = runtimeConfig();
  let count: number;
  if (demo) {
    count = await demoTransaction((data) => {
      const current = data.limits[key];
      if (!current || current.resetAt <= Date.now())
        data.limits[key] = { count: 1, resetAt: Date.now() + windowMs };
      else current.count++;
      // Keep local development's shared store bounded.
      for (const [item, limit] of Object.entries(data.limits))
        if (limit.resetAt < Date.now()) delete data.limits[item];
      return data.limits[key].count;
    });
  } else {
    const sql = database();
    const rows = await sql<{ count: number }[]>`
      insert into request_limits(key, count, reset_at) values (${key}, 1, ${new Date(Date.now() + windowMs)})
      on conflict(key) do update set count = case when request_limits.reset_at <= now() then 1 else request_limits.count + 1 end,
      reset_at = case when request_limits.reset_at <= now() then excluded.reset_at else request_limits.reset_at end
      returning count`;
    count = rows[0].count;
  }
  if (count > maximum)
    throw new HttpError(
      429,
      "A little pause, princess! Please try again in a few minutes.",
    );
}

export async function createSession(
  hash: string,
  expiresAt: string,
): Promise<StoredSession> {
  const state = createPlaythrough(randomUUID());
  const session: SessionRecord = {
    id: randomUUID(),
    tokenHash: hash,
    expiresAt,
    activePlaythroughId: state.id,
  };
  if (runtimeConfig().demo) {
    await demoTransaction((data) => {
      data.sessions[hash] = session;
      data.playthroughs[state.id] = { sessionId: session.id, state };
    });
  } else {
    const sql = database();
    await sql.begin(async (tx) => {
      await tx`insert into authenticated_sessions(id, token_hash, expires_at, active_playthrough_id) values (${session.id}, ${hash}, ${expiresAt}, ${state.id})`;
      await tx`insert into playthroughs(id, session_id, state, version) values (${state.id}, ${session.id}, ${tx.json(JSON.parse(JSON.stringify(state)))}, ${state.version})`;
    });
  }
  return { session, state, emailStatus: null };
}

export async function readSession(hash: string): Promise<StoredSession | null> {
  if (runtimeConfig().demo)
    return demoTransaction((data) => {
      const session = data.sessions[hash];
      if (!isValid(session)) return null;
      const state = session.activePlaythroughId
        ? data.playthroughs[session.activePlaythroughId]?.state || null
        : null;
      return {
        session,
        state,
        emailStatus: state ? data.outbox[state.id]?.status || null : null,
      };
    });
  const sql = database();
  const rows = await sql<
    SessionRow[]
  >`select id,token_hash,expires_at,active_playthrough_id from authenticated_sessions where token_hash=${hash} and expires_at>now()`;
  if (!rows[0]) return null;
  const session = fromRow(rows[0]);
  const states = await sql<
    StateRow[]
  >`select state from playthroughs where id=${session.activePlaythroughId}`;
  const outboxes = await sql<
    { status: EmailStatus }[]
  >`select status from email_outbox where playthrough_id=${session.activePlaythroughId}`;
  return {
    session,
    state: states[0]?.state || null,
    emailStatus: outboxes[0]?.status || null,
  };
}

/** A deliberate logout abandons a started challenge; save its forfeited result first. */
export async function expireSession(hash: string): Promise<string | null> {
  if (runtimeConfig().demo)
    return demoTransaction((data) => {
      const session = data.sessions[hash];
      if (!isValid(session)) return null;
      const current = session.activePlaythroughId
        ? data.playthroughs[session.activePlaythroughId]?.state
        : null;
      let finalizedId: string | null = null;
      if (
        current &&
        (current.phase === "playing" || current.phase === "reward")
      ) {
        const next = transition(current, { type: "forfeit" });
        data.playthroughs[next.id] = { sessionId: session.id, state: next };
        if (!data.outbox[next.id])
          data.outbox[next.id] = {
            id: randomUUID(),
            playthroughId: next.id,
            status: "demo",
            attempts: 0,
            nextAttemptAt: new Date().toISOString(),
            lastError: null,
            sentAt: null,
            createdAt: new Date().toISOString(),
          };
        finalizedId = next.id;
      }
      session.expiresAt = new Date(0).toISOString();
      return finalizedId;
    });
  const sql = database();
  return sql.begin(async (tx) => {
    const sessions = await tx<
      SessionRow[]
    >`select id,token_hash,expires_at,active_playthrough_id from authenticated_sessions where token_hash=${hash} and expires_at>now() for update`;
    if (!sessions[0]) return null;
    const session = fromRow(sessions[0]);
    const states = await tx<
      StateRow[]
    >`select state from playthroughs where id=${session.activePlaythroughId} and session_id=${session.id} for update`;
    const current = states[0]?.state;
    let finalizedId: string | null = null;
    if (
      current &&
      (current.phase === "playing" || current.phase === "reward")
    ) {
      const next = transition(current, { type: "forfeit" });
      await tx`update playthroughs set state=${tx.json(JSON.parse(JSON.stringify(next)))},version=${next.version},finalized_at=${next.final!.finalizedAt},updated_at=now() where id=${next.id}`;
      await tx`insert into email_outbox(id,playthrough_id) values (${randomUUID()},${next.id}) on conflict(playthrough_id) do nothing`;
      finalizedId = next.id;
    }
    await tx`update authenticated_sessions set expires_at=now() where id=${session.id}`;
    return finalizedId;
  }) as Promise<string | null>;
}

/** A session row lock serializes game actions, replay, and operation deduplication together. */
export async function applyAction(
  hash: string,
  action: ApiAction,
  expectedVersion: number,
  operationId: string,
  expectedPlaythroughId?: string,
): Promise<StoredSession> {
  const fingerprint = requestHash(
    action,
    expectedVersion,
    expectedPlaythroughId,
  );
  if (runtimeConfig().demo)
    return demoTransaction((data) => {
      const session = data.sessions[hash];
      if (!isValid(session))
        throw new HttpError(
          401,
          "Your garden is waiting. Please unlock it again.",
        );
      const key = `${session.id}:${operationId}`;
      const previous = data.operations[key];
      if (previous) {
        if (previous.requestHash !== fingerprint)
          throw new HttpError(
            409,
            "This request reference was already used. Please refresh.",
          );
        return {
          session,
          state: previous.state,
          emailStatus: data.outbox[previous.state.id]?.status || null,
        };
      }
      const current = session.activePlaythroughId
        ? data.playthroughs[session.activePlaythroughId]?.state
        : null;
      if (!current)
        throw new HttpError(
          409,
          "Your adventure could not be found. Please unlock the garden again.",
        );
      if (expectedPlaythroughId && current.id !== expectedPlaythroughId)
        throw new HttpError(
          409,
          "A new adventure has begun. Refresh to continue it.",
        );
      if (current.version !== expectedVersion)
        throw new HttpError(
          409,
          "Your adventure has moved forward. Refresh to see the saved result.",
        );
      const next = advance(current, action);
      data.playthroughs[next.id] = { sessionId: session.id, state: next };
      session.activePlaythroughId = next.id;
      if (next.final && !data.outbox[next.id])
        data.outbox[next.id] = {
          id: randomUUID(),
          playthroughId: next.id,
          status: "demo",
          attempts: 0,
          nextAttemptAt: new Date().toISOString(),
          lastError: null,
          sentAt: null,
          createdAt: new Date().toISOString(),
        };
      data.operations[key] = {
        sessionId: session.id,
        operationId,
        requestHash: fingerprint,
        state: next,
      };
      return {
        session,
        state: next,
        emailStatus: data.outbox[next.id]?.status || null,
      };
    });

  const sql = database();
  return sql.begin(async (tx) => {
    const sessions = await tx<
      SessionRow[]
    >`select id,token_hash,expires_at,active_playthrough_id from authenticated_sessions where token_hash=${hash} and expires_at>now() for update`;
    if (!sessions[0])
      throw new HttpError(
        401,
        "Your garden is waiting. Please unlock it again.",
      );
    const session = fromRow(sessions[0]);
    const previous = await tx<
      { request_hash: string; response_state: PlaythroughState }[]
    >`select request_hash,response_state from game_operations where session_id=${session.id} and operation_id=${operationId}`;
    if (previous[0]) {
      if (previous[0].request_hash !== fingerprint)
        throw new HttpError(
          409,
          "This request reference was already used. Please refresh.",
        );
      const outbox = await tx<
        { status: EmailStatus }[]
      >`select status from email_outbox where playthrough_id=${previous[0].response_state.id}`;
      return {
        session,
        state: previous[0].response_state,
        emailStatus: outbox[0]?.status || null,
      };
    }
    const states = await tx<
      StateRow[]
    >`select state from playthroughs where id=${session.activePlaythroughId} and session_id=${session.id} for update`;
    const current = states[0]?.state;
    if (!current)
      throw new HttpError(409, "Your adventure could not be found.");
    if (expectedPlaythroughId && current.id !== expectedPlaythroughId)
      throw new HttpError(
        409,
        "A new adventure has begun. Refresh to continue it.",
      );
    if (current.version !== expectedVersion)
      throw new HttpError(
        409,
        "Your adventure has moved forward. Refresh to see the saved result.",
      );
    const next = advance(current, action);
    const payload = tx.json(JSON.parse(JSON.stringify(next)));
    if (next.id !== current.id) {
      await tx`insert into playthroughs(id, session_id, state, version) values (${next.id}, ${session.id}, ${payload}, ${next.version})`;
      await tx`update authenticated_sessions set active_playthrough_id=${next.id} where id=${session.id}`;
      session.activePlaythroughId = next.id;
    } else {
      await tx`update playthroughs set state=${payload},version=${next.version},finalized_at=${next.final?.finalizedAt || null},updated_at=now() where id=${next.id}`;
    }
    if (next.final)
      await tx`insert into email_outbox(id,playthrough_id) values (${randomUUID()},${next.id}) on conflict(playthrough_id) do nothing`;
    await tx`insert into game_operations(session_id,operation_id,request_hash,response_state) values (${session.id},${operationId},${fingerprint},${payload})`;
    const outbox = await tx<
      { status: EmailStatus }[]
    >`select status from email_outbox where playthrough_id=${next.id}`;
    return { session, state: next, emailStatus: outbox[0]?.status || null };
  }) as Promise<StoredSession>;
}
