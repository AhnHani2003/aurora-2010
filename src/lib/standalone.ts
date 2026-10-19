import {
  createPlaythrough,
  gameActionSchema,
  publicView,
  transition,
} from "./game-rules/engine";
import type { PlaythroughState } from "@/types/game";

export const LOCAL_RESULTS_KEY = "aurora.standalone.v1";
type LocalData = {
  version: 1;
  unlocked: boolean;
  active: PlaythroughState | null;
  results: PlaythroughState[];
};
let memory: LocalData | undefined;
let storageAvailable = true;
function load(): LocalData {
  if (memory) return memory;
  try {
    const raw = localStorage.getItem(LOCAL_RESULTS_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as LocalData;
      if (
        saved.version === 1 &&
        typeof saved.unlocked === "boolean" &&
        Array.isArray(saved.results)
      ) {
        if (saved.active) publicView(saved.active);
        return (memory = saved);
      }
    }
  } catch {
    storageAvailable = false;
  }
  return (memory = { version: 1, unlocked: false, active: null, results: [] });
}
function save(data: LocalData) {
  memory = data;
  if (
    data.active?.final &&
    !data.results.some((result) => result.final?.id === data.active?.final?.id)
  )
    data.results.push(structuredClone(data.active));
  try {
    localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(data));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  } // Continue in memory, including when storage is full/blocked.
}
function response(data: LocalData) {
  return Response.json({
    authenticated: data.unlocked,
    demo: false,
    emailStatus: null,
    storageAvailable,
    state: data.unlocked && data.active ? publicView(data.active) : null,
  });
}
/** Playful local gate, not secure authentication. Never reads server credentials. */
export function standaloneRequest(path: string, init?: RequestInit): Response {
  const data = load();
  try {
    if (path === "/api/session") return response(data);
    const body = init?.body ? JSON.parse(String(init.body)) : {};
    if (path === "/api/login") {
      if (body.password !== "aurora")
        return Response.json(
          {
            error:
              "Hmm... that's not our secret password, princess. Try again!",
          },
          { status: 401 },
        );
      data.unlocked = true;
      data.active ??= createPlaythrough();
      save(data);
      return response(data);
    }
    if (path === "/api/logout") {
      if (data.active && ["playing", "reward"].includes(data.active.phase))
        data.active = transition(data.active, { type: "forfeit" });
      data.unlocked = false;
      save(data);
      return response(data);
    }
    if (path !== "/api/game")
      return Response.json({ error: "Unavailable." }, { status: 404 });
    if (!data.unlocked || !data.active)
      return Response.json(
        { error: "Your garden is waiting. Please unlock it again." },
        { status: 401 },
      );
    if (
      body.playthroughId !== data.active.id ||
      body.expectedVersion !== data.active.version
    )
      return Response.json(
        { error: "This adventure has moved on. Please try again." },
        { status: 409 },
      );
    if (body.action?.type === "new_playthrough") {
      if (data.active.phase !== "finalized")
        throw new Error("Finish this adventure before beginning another.");
      data.active = createPlaythrough();
    } else
      data.active = transition(
        data.active,
        gameActionSchema.parse(body.action),
      );
    save(data);
    return response(data);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Please try that little step again.",
      },
      { status: 409 },
    );
  }
}
