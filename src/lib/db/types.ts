import type { PlaythroughState } from "../game-rules/engine";

export type EmailStatus =
  "pending" | "sent" | "failed" | "demo" | "unconfigured";
export type SessionRecord = {
  id: string;
  tokenHash: string;
  expiresAt: string;
  activePlaythroughId: string | null;
};
export type OutboxRecord = {
  id: string;
  playthroughId: string;
  status: EmailStatus;
  attempts: number;
  nextAttemptAt: string;
  lastError: string | null;
  sentAt: string | null;
  createdAt: string;
};
export type OperationRecord = {
  sessionId: string;
  operationId: string;
  requestHash: string;
  state: PlaythroughState;
};
export type DemoStore = {
  sessions: Record<string, SessionRecord>;
  playthroughs: Record<string, { sessionId: string; state: PlaythroughState }>;
  outbox: Record<string, OutboxRecord>;
  operations: Record<string, OperationRecord>;
  limits: Record<string, { count: number; resetAt: number }>;
};
