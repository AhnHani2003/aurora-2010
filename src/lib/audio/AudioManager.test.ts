import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AudioManager } from "./AudioManager";
import {
  AUDIO_PREFERENCE_KEY,
  MUSIC_SOURCE,
  SOUND_IDS,
  soundForEvent,
} from "./sounds";
import { readFile } from "node:fs/promises";

class Music extends EventTarget {
  volume = 1;
  loop = false;
  muted = false;
  paused = true;
  currentTime = 42;
  error: unknown = null;
  blocked = false;
  play = vi.fn(async () => {
    if (this.blocked)
      throw new DOMException("Interaction required", "NotAllowedError");
    this.paused = false;
    this.dispatchEvent(new Event("playing"));
  });
  pause = vi.fn(() => {
    this.paused = true;
    this.dispatchEvent(new Event("pause"));
  });
  load = vi.fn();
}
class Source {
  buffer = null;
  loop = false;
  onended: (() => void) | null = null;
  connect = vi.fn();
  disconnect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}
class Context {
  static instances: Context[] = [];
  state = "suspended";
  destination = {};
  sources: Source[] = [];
  constructor() {
    Context.instances.push(this);
  }
  createGain() {
    return { gain: { value: 1 }, connect: vi.fn(), disconnect: vi.fn() };
  }
  createBufferSource() {
    const source = new Source();
    this.sources.push(source);
    return source;
  }
  decodeAudioData = vi.fn(async () => ({}));
  resume = vi.fn(async () => {
    this.state = "running";
  });
  suspend = vi.fn(async () => {
    this.state = "suspended";
  });
  close = vi.fn(async () => {
    this.state = "closed";
  });
}
let manager: AudioManager;
let music: Music;
let preferences: Map<string, string>;
const flush = async () => {
  for (let i = 0; i < 12; i++) await Promise.resolve();
};
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(10000);
  preferences = new Map();
  Context.instances = [];
  vi.stubGlobal("AudioContext", Context);
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => preferences.get(k) ?? null,
    setItem: (k: string, v: string) => preferences.set(k, v),
  });
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
    })),
  );
  manager = new AudioManager();
  music = new Music();
});
afterEach(() => {
  manager.dispose();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
function attach() {
  manager.attach(music as unknown as HTMLAudioElement);
}
async function unlock() {
  attach();
  manager.unlock();
  await flush();
}

describe("persistent audio and browser activation", () => {
  it("uses the supplied music path, loops at 35%, and unlocks after blocked autoplay", async () => {
    expect(MUSIC_SOURCE).toBe("/assets/music/background.mp3");
    music.blocked = true;
    attach();
    await flush();
    expect(manager.getSnapshot().music).toBe("blocked");
    music.blocked = false;
    manager.unlock();
    await flush();
    expect([music.volume, music.loop, music.paused]).toEqual([
      0.35,
      true,
      false,
    ]);
    expect(manager.getSnapshot().unlocked).toBe(true);
    for (let i = 0; i < 8; i++) manager.unlock();
    expect(Context.instances).toHaveLength(1);
    expect(music.play).toHaveBeenCalledTimes(2);
  });
  it("reads explicit mute before autoplay and never overrides it on ordinary interaction", async () => {
    preferences.set(AUDIO_PREFERENCE_KEY, "false");
    attach();
    manager.unlock();
    await flush();
    expect(music.play).not.toHaveBeenCalled();
    expect(Context.instances).toHaveLength(0);
    expect(manager.getSnapshot().enabled).toBe(false);
    await manager.play("victory");
    manager.toggle();
    await flush();
    expect(music.paused).toBe(false);
    expect(music.currentTime).toBe(42);
    expect(preferences.get(AUDIO_PREFERENCE_KEY)).toBe("true");
  });
  it("pauses all audio, cancels voices, resumes the same music position and context", async () => {
    await unlock();
    await manager.play("correct");
    const context = Context.instances[0],
      voice = context.sources[0];
    manager.setEnabled(false);
    expect(voice.stop).toHaveBeenCalled();
    expect(music.paused).toBe(true);
    manager.unlock();
    await manager.play("wrong");
    expect(context.sources).toHaveLength(1);
    manager.setEnabled(true);
    await flush();
    expect(Context.instances).toHaveLength(1);
    expect(music.currentTime).toBe(42);
    expect(music.paused).toBe(false);
  });
  it("shows graceful unavailability for failed music while allowing effects", async () => {
    await unlock();
    music.dispatchEvent(new Event("error"));
    expect(manager.getSnapshot().music).toBe("unavailable");
    await manager.play("correct");
    expect(manager.getSnapshot().lastEffect).toBe("correct");
  });
  it("recognizes a media error that arrived before the provider attached", async () => {
    music.error = { code: 4 };
    music.blocked = true;
    attach();
    await flush();
    expect(manager.getSnapshot().music).toBe("unavailable");
    expect(music.play).not.toHaveBeenCalled();
  });
  it("does not play an effect whose decode completes after muting", async () => {
    let resolve!: (value: unknown) => void;
    vi.stubGlobal(
      "fetch",
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    attach();
    manager.unlock();
    await flush();
    const pending = manager.play("ending");
    manager.setEnabled(false);
    resolve({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) });
    await pending;
    expect(Context.instances[0].sources).toHaveLength(0);
  });
});
describe("balanced event sounds and cleanup", () => {
  it("coalesces repeated hover/click feedback and caps voices at three", async () => {
    await unlock();
    await manager.play("ui-hover");
    await manager.play("ui-hover");
    expect(Context.instances[0].sources).toHaveLength(1);
    await manager.play("correct");
    expect(Context.instances[0].sources[0].stop).toHaveBeenCalled();
    await manager.play("wrong");
    await manager.play("reward");
    await manager.play("victory");
    expect(manager.getSnapshot().playingEffects).toBe(3);
  });
  it("ends wheel ticks on outcome, ducks celebrations then restores volume, and cleans up", async () => {
    await unlock();
    manager.react({ type: "WHEEL_SPIN_START" });
    await flush();
    const context = Context.instances[0],
      loop = context.sources[0];
    expect(loop.loop).toBe(true);
    manager.react({ type: "WHEEL_PRIZE" });
    await flush();
    expect(loop.stop).toHaveBeenCalled();
    await manager.play("victory");
    vi.advanceTimersByTime(200);
    expect(music.volume).toBe(0.2);
    vi.advanceTimersByTime(2100);
    expect(music.volume).toBe(0.35);
    manager.dispose();
    expect(context.close).toHaveBeenCalled();
    expect(manager.getSnapshot().playingEffects).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("maps gameplay feedback without altering game state", () => {
    expect(
      soundForEvent({
        type: "QUESTION_ANSWER_CORRECT",
        questionId: "q1",
        answer: "A",
      }),
    ).toBe("correct");
    expect(
      soundForEvent({
        type: "QUESTION_ANSWER_WRONG",
        questionId: "q1",
        answer: "B",
      }),
    ).toBe("wrong");
    expect(soundForEvent({ type: "DICE_ROLL_START" })).toBe("dice-roll");
    expect(soundForEvent({ type: "BEGGING_ACCEPTED" })).toBe("begging");
    expect(soundForEvent({ type: "REWARD_SELECTED" })).toBe("reward");
    expect(soundForEvent({ type: "IDLE" })).toBeNull();
  });
  it("ships fifteen valid quiet PCM files and the actual non-empty MP3", async () => {
    for (const id of SOUND_IDS) {
      const wav = await readFile(`public/assets/sounds/${id}.wav`);
      expect(wav.toString("ascii", 0, 4)).toBe("RIFF");
      expect(wav.readUInt32LE(24)).toBe(22050);
      for (let i = 44; i < wav.length; i += 2)
        expect(Math.abs(wav.readInt16LE(i))).toBeLessThanOrEqual(8192);
    }
    expect(
      (await readFile("public/assets/music/background.mp3")).length,
    ).toBeGreaterThan(100000);
  });
});
