import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { GameAction, PublicPlaythrough } from "@/types/game";
let storage: Map<string, string>;
beforeEach(() => {
  vi.resetModules();
  storage = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
});
afterEach(() => vi.unstubAllGlobals());
it("preserves complete local results across reloads and starts independent adventures without APIs", async () => {
  const { standaloneRequest, LOCAL_RESULTS_KEY } = await import("./standalone");
  const login = await standaloneRequest("/api/login", {
    body: JSON.stringify({ password: "aurora" }),
  }).json();
  let state: PublicPlaythrough = login.state;
  const act = async (action: GameAction | { type: "new_playthrough" }) => {
    const result = standaloneRequest("/api/game", {
      body: JSON.stringify({
        action,
        playthroughId: state.id,
        expectedVersion: state.version,
      }),
    });
    expect(result.ok).toBe(true);
    state = (await result.json()).state;
  };
  await act({ type: "select_game", game: "dice" });
  await act({ type: "show_rules" });
  await act({ type: "start_game" });
  await act({ type: "forfeit" });
  const first = state.final!;
  expect(first.id).toMatch(/^[0-9a-f-]{36}$/);
  expect(Date.parse(first.finalizedAt)).toBeGreaterThan(0);
  expect(JSON.parse(storage.get(LOCAL_RESULTS_KEY)!).results).toHaveLength(1);
  vi.resetModules();
  const reloaded = await import("./standalone");
  expect(
    (await reloaded.standaloneRequest("/api/session").json()).state.final.id,
  ).toBe(first.id);
  await act({ type: "new_playthrough" });
  expect(state.final).toBeNull();
  expect(JSON.parse(storage.get(LOCAL_RESULTS_KEY)!).results[0].final.id).toBe(
    first.id,
  );
});
it("continues in memory when storage is blocked and never claims durable storage", async () => {
  vi.stubGlobal("localStorage", {
    getItem: () => {
      throw new Error("Blocked");
    },
    setItem: () => {
      throw new Error("Full");
    },
  });
  const { standaloneRequest } = await import("./standalone");
  const login = await standaloneRequest("/api/login", {
    body: JSON.stringify({ password: "aurora" }),
  }).json();
  expect(login.authenticated).toBe(true);
  expect(login.storageAvailable).toBe(false);
  let current = login.state;
  for (const action of [
    { type: "select_game", game: "dice" },
    { type: "show_rules" },
    { type: "start_game" },
  ]) {
    current = (
      await standaloneRequest("/api/game", {
        body: JSON.stringify({
          action,
          playthroughId: current.id,
          expectedVersion: current.version,
        }),
      }).json()
    ).state;
  }
  const result = await standaloneRequest("/api/game", {
    body: JSON.stringify({
      action: { type: "forfeit" },
      playthroughId: login.state.id,
      expectedVersion: current.version,
    }),
  }).json();
  expect(result.state.final.status).toBe("forfeited");
  expect(result.emailStatus).toBeNull();
  expect((await standaloneRequest("/api/session").json()).state.final.id).toBe(
    result.state.final.id,
  );
});
it("does not advance game state on a wrong gate code or stale action", async () => {
  const { standaloneRequest } = await import("./standalone");
  expect(
    standaloneRequest("/api/login", {
      body: JSON.stringify({ password: "wrong" }),
    }).status,
  ).toBe(401);
  const login = await standaloneRequest("/api/login", {
    body: JSON.stringify({ password: "aurora" }),
  }).json();
  expect(
    standaloneRequest("/api/game", {
      body: JSON.stringify({
        action: { type: "forfeit" },
        playthroughId: login.state.id,
        expectedVersion: 99,
      }),
    }).status,
  ).toBe(409);
  expect((await standaloneRequest("/api/session").json()).state.phase).toBe(
    "hub",
  );
});
