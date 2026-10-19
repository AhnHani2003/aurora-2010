import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";

vi.mock("server-only", () => ({}));
let workspace: string;
let store: typeof import("./store");

beforeAll(async () => {
  workspace = await mkdtemp(path.join(tmpdir(), "aurora-store-test-"));
  vi.spyOn(process, "cwd").mockReturnValue(workspace);
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("AURORA_ACCESS_PASSWORD", "");
  vi.stubEnv("SESSION_SECRET", "");
  vi.stubEnv("SUPABASE_DATABASE_URL", "");
  store = await import("./store");
});
afterAll(async () => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  await rm(workspace, { recursive: true, force: true });
});

const expires = () => new Date(Date.now() + 60_000).toISOString();

describe("authoritative development persistence", () => {
  it("applies one spin for two identical concurrent submissions and preserves it on reload", async () => {
    let saved = await store.createSession("duplicate-spin-test", expires());
    for (const action of [
      { type: "select_game", game: "wheel" },
      { type: "show_rules" },
      { type: "start_game" },
    ] as const) {
      saved = await store.applyAction(
        "duplicate-spin-test",
        action,
        saved.state!.version,
        randomUUID(),
      );
    }
    const operationId = randomUUID();
    const results = await Promise.all([
      store.applyAction(
        "duplicate-spin-test",
        { type: "spin" },
        saved.state!.version,
        operationId,
      ),
      store.applyAction(
        "duplicate-spin-test",
        { type: "spin" },
        saved.state!.version,
        operationId,
      ),
    ]);
    expect(results[0].state).toEqual(results[1].state);
    expect(results[0].state!.wheel.spins).toHaveLength(1);
    expect(
      (await store.readSession("duplicate-spin-test"))!.state!.wheel.spins,
    ).toHaveLength(1);
  });

  it("saves versions durably and serializes simultaneous conflicting operations", async () => {
    const session = await store.createSession("persistent-test", expires());
    const version = session.state!.version;
    const responses = await Promise.allSettled([
      store.applyAction(
        "persistent-test",
        { type: "select_game", game: "wheel" },
        version,
        randomUUID(),
      ),
      store.applyAction(
        "persistent-test",
        { type: "select_game", game: "dice" },
        version,
        randomUUID(),
      ),
    ]);
    expect(
      responses.filter((response) => response.status === "fulfilled"),
    ).toHaveLength(1);
    expect(
      responses.filter((response) => response.status === "rejected"),
    ).toHaveLength(1);
    const reloaded = await store.readSession("persistent-test");
    expect(reloaded!.state!.version).toBe(version + 1);
    const file = JSON.parse(
      await readFile(path.join(workspace, ".data/2010-demo.json"), "utf8"),
    );
    expect(file.playthroughs[session.state!.id].state.version).toBe(
      version + 1,
    );
  });

  it("deduplicates finalization, keeps history on replay, and never claims demo mail was sent", async () => {
    const initial = await store.createSession("final-test", expires());
    let active = await store.applyAction(
      "final-test",
      { type: "select_game", game: "wheel" },
      initial.state!.version,
      randomUUID(),
    );
    active = await store.applyAction(
      "final-test",
      { type: "show_rules" },
      active.state!.version,
      randomUUID(),
    );
    active = await store.applyAction(
      "final-test",
      { type: "start_game" },
      active.state!.version,
      randomUUID(),
    );
    const operationId = randomUUID();
    const request = { type: "forfeit" } as const;
    const saved = await store.applyAction(
      "final-test",
      request,
      active.state!.version,
      operationId,
    );
    const repeated = await store.applyAction(
      "final-test",
      request,
      active.state!.version,
      operationId,
    );
    expect(repeated.state).toEqual(saved.state);
    expect(saved.state!.final!.status).toBe("forfeited");
    expect(saved.state!.final!.reward).toBeNull();
    expect(saved.emailStatus).toBe("demo");
    await expect(
      store.applyAction(
        "final-test",
        { type: "select_game", game: "wheel" },
        active.state!.version,
        operationId,
      ),
    ).rejects.toThrow("reference was already used");
    const replay = await store.applyAction(
      "final-test",
      { type: "new_playthrough" },
      saved.state!.version,
      randomUUID(),
    );
    expect(replay.state!.id).not.toBe(saved.state!.id);
    expect(replay.state!.version).toBe(0);
    const file = JSON.parse(
      await readFile(path.join(workspace, ".data/2010-demo.json"), "utf8"),
    );
    expect(file.playthroughs[saved.state!.id].state.final).toEqual(
      saved.state!.final,
    );
    expect(
      Object.values(file.outbox).filter(
        (job: unknown) =>
          (job as { playthroughId: string }).playthroughId === saved.state!.id,
      ),
    ).toHaveLength(1);
  });

  it("does not allow replay to abandon an active run", async () => {
    const initial = await store.createSession("no-abandon-test", expires());
    await expect(
      store.applyAction(
        "no-abandon-test",
        { type: "new_playthrough" },
        initial.state!.version,
        randomUUID(),
      ),
    ).rejects.toThrow("Finish or forfeit");
    await expect(
      store.applyAction(
        "no-abandon-test",
        { type: "select_game", game: "wheel" },
        initial.state!.version,
        randomUUID(),
        randomUUID(),
      ),
    ).rejects.toThrow("A new adventure has begun");
  });

  it("requires a live authenticated session and rejects expired sessions", async () => {
    await expect(
      store.applyAction("not-a-session", { type: "forfeit" }, 0, randomUUID()),
    ).rejects.toMatchObject({ status: 401 });
    await store.createSession("expired-test", new Date(0).toISOString());
    expect(await store.readSession("expired-test")).toBeNull();
  });

  it("records a forfeited result and one notification before logging out of a started game", async () => {
    let saved = await store.createSession("logout-test", expires());
    for (const action of [
      { type: "select_game", game: "dice" },
      { type: "show_rules" },
      { type: "start_game" },
    ] as const) {
      saved = await store.applyAction(
        "logout-test",
        action,
        saved.state!.version,
        randomUUID(),
      );
    }
    expect(await store.expireSession("logout-test")).toBe(saved.state!.id);
    expect(await store.readSession("logout-test")).toBeNull();
    const file = JSON.parse(
      await readFile(path.join(workspace, ".data/2010-demo.json"), "utf8"),
    );
    expect(file.playthroughs[saved.state!.id].state.final.status).toBe(
      "forfeited",
    );
    expect(file.playthroughs[saved.state!.id].state.final.reward).toBeNull();
    expect(file.outbox[saved.state!.id].status).toBe("demo");
    expect(await store.expireSession("logout-test")).toBeNull();
  });

  it("persists brute-force rate limits across requests", async () => {
    await store.enforceRateLimit("rate-test", 2, 60_000);
    await store.enforceRateLimit("rate-test", 2, 60_000);
    await expect(
      store.enforceRateLimit("rate-test", 2, 60_000),
    ).rejects.toMatchObject({ status: 429 });
  });

  it("refuses insecure production operations when configuration is missing", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(store.readSession("persistent-test")).rejects.toThrow(
      "Secure configuration is incomplete",
    );
    vi.stubEnv("NODE_ENV", "development");
  });
});
