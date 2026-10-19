import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  queries: [] as string[],
  events: [] as string[],
  values: [] as unknown[][],
  send: vi.fn(),
  state: null as unknown,
}));
vi.mock("server-only", () => ({}));
vi.mock("../auth/config", () => ({ runtimeConfig: () => ({ demo: false }) }));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mocks.send };
  },
}));
vi.mock("../db/connection", () => {
  const query = async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const sql = strings.join("?").replace(/\s+/g, " ").trim();
    mocks.queries.push(sql);
    mocks.values.push(values);
    mocks.events.push(sql);
    if (sql.startsWith("select id from email_outbox"))
      return [{ id: "outbox-id" }];
    if (sql.startsWith("select id,playthrough_id"))
      return [
        {
          id: "outbox-id",
          playthrough_id: "playthrough-id",
          attempts: 0,
          status: "pending",
        },
      ];
    if (sql.startsWith("update email_outbox set first_attempt_at"))
      return [{ id: "outbox-id" }];
    if (sql.startsWith("select state from playthroughs"))
      return [{ state: mocks.state }];
    return [];
  };
  const connection = Object.assign(query, {
    begin: async (callback: (tx: typeof query) => Promise<void>) => {
      mocks.events.push("BEGIN");
      return callback(query);
    },
  });
  return { database: () => connection };
});

import { deliverOutbox } from "./outbox";
import { createPlaythrough, transition } from "../game-rules/engine";

describe("email configuration safety", () => {
  beforeEach(() => {
    mocks.queries.length = 0;
    mocks.events.length = 0;
    mocks.values.length = 0;
    mocks.send.mockReset();
    let state = transition(createPlaythrough(), {
      type: "select_game",
      game: "wheel",
    });
    state = transition(state, { type: "show_rules" });
    state = transition(state, { type: "start_game" });
    mocks.state = transition(state, { type: "forfeit" });
  });

  it("keeps a saved result unconfigured and never sends or marks it sent when credentials are missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("RESULT_EMAIL_FROM", "");
    try {
      await deliverOutbox();
      expect(mocks.send).not.toHaveBeenCalled();
      expect(
        mocks.queries.some((sql) => sql.includes("status='unconfigured'")),
      ).toBe(true);
      expect(
        mocks.queries.some((sql) => sql.includes("set status='sent'")),
      ).toBe(false);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("commits the first-attempt marker before sending and uses a stable provider idempotency key", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-provider-key");
    vi.stubEnv("RESULT_EMAIL_FROM", "Tom <tom@example.com>");
    vi.stubEnv("RESULT_EMAIL_TO", "manhthong2003@gmail.com");
    mocks.send.mockImplementation(async () => {
      mocks.events.push("SEND");
      return { data: { id: "email-id" }, error: null };
    });
    try {
      await deliverOutbox();
      const marker = mocks.events.findIndex((event) =>
        event.startsWith("update email_outbox set first_attempt_at"),
      );
      expect(marker).toBeGreaterThan(-1);
      expect(marker).toBeLessThan(mocks.events.indexOf("BEGIN"));
      expect(mocks.events.indexOf("BEGIN")).toBeLessThan(
        mocks.events.indexOf("SEND"),
      );
      expect(mocks.send).toHaveBeenCalledWith(
        expect.objectContaining({ to: "manhthong2003@gmail.com" }),
        { idempotencyKey: "aurora-result-playthrough-id" },
      );
      expect(
        mocks.queries.some((sql) => sql.includes("set status='sent'")),
      ).toBe(true);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("keeps provider failures retryable without recording false success or exposing the API key", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-provider-key");
    vi.stubEnv("RESULT_EMAIL_FROM", "Tom <tom@example.com>");
    mocks.send.mockResolvedValue({
      data: null,
      error: { message: "Rejected test-provider-key" },
    });
    try {
      await deliverOutbox();
      expect(
        mocks.queries.some((sql) => sql.includes("set status='failed'")),
      ).toBe(true);
      expect(
        mocks.queries.some((sql) => sql.includes("set status='sent'")),
      ).toBe(false);
      expect(JSON.stringify(mocks.values)).toContain("[redacted]");
      expect(JSON.stringify(mocks.values)).not.toContain("test-provider-key");
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
