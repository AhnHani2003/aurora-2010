import {
  AUDIO_PREFERENCE_KEY,
  MUSIC_SOURCE,
  MUSIC_VOLUME,
  SOUND_IDS,
  soundForEvent,
  soundSource,
  type SoundId,
} from "./sounds";
import type { ReactionEvent } from "@/components/character/model";
export type MusicState =
  "loading" | "ready" | "playing" | "paused" | "blocked" | "unavailable";
export interface AudioState {
  enabled: boolean;
  music: MusicState;
  unlocked: boolean;
  lastEffect: SoundId | null;
  playingEffects: number;
}
export const INITIAL_AUDIO_STATE: AudioState = {
  enabled: true,
  music: "loading",
  unlocked: false,
  lastEffect: null,
  playingEffects: 0,
};
type Voice = {
  source: AudioBufferSourceNode;
  gain: GainNode;
  priority: number;
  loop: boolean;
};
/** One HTML music element + one lazily unlocked Web Audio context. No per-click Audio instances. */
export class AudioManager {
  private music: HTMLAudioElement | null = null;
  private context: AudioContext | null = null;
  private bus: GainNode | null = null;
  private state: AudioState = { ...INITIAL_AUDIO_STATE };
  private listeners = new Set<() => void>();
  private buffers = new Map<SoundId, Promise<AudioBuffer | null>>();
  private voices = new Set<Voice>();
  private cooldown = new Map<SoundId, number>();
  private epoch = 0;
  private loopToken = 0;
  private loopTimer: ReturnType<typeof setTimeout> | undefined;
  private fadeTimer: ReturnType<typeof setInterval> | undefined;
  private restoreTimer: ReturnType<typeof setTimeout> | undefined;
  private cleanListeners: (() => void) | undefined;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  getSnapshot = () => this.state;
  private update(patch: Partial<AudioState>) {
    if (
      Object.entries(patch).every(
        ([k, v]) => this.state[k as keyof AudioState] === v,
      )
    )
      return;
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((fn) => fn());
  }
  attach(element: HTMLAudioElement) {
    if (this.music === element) return;
    this.cleanListeners?.();
    this.music = element;
    this.epoch++;
    let enabled = true;
    try {
      enabled = localStorage.getItem(AUDIO_PREFERENCE_KEY) !== "false";
    } catch {}
    element.volume = MUSIC_VOLUME;
    element.loop = true;
    element.muted = !enabled;
    this.update({ enabled, music: element.error ? "unavailable" : "loading" });
    const playing = () => this.update({ music: "playing" }),
      pause = () => {
        if (!["unavailable", "blocked"].includes(this.state.music))
          this.update({ music: "paused" });
      },
      ready = () => {
        if (element.error) return;
        if (element.paused) this.update({ music: "ready" });
      },
      error = () => this.update({ music: "unavailable" });
    element.addEventListener("playing", playing);
    element.addEventListener("pause", pause);
    element.addEventListener("canplay", ready);
    element.addEventListener("error", error);
    this.cleanListeners = () => {
      element.removeEventListener("playing", playing);
      element.removeEventListener("pause", pause);
      element.removeEventListener("canplay", ready);
      element.removeEventListener("error", error);
    };
    if (enabled) void this.playMusic();
    else if (!element.error) this.update({ music: "paused" });
  }
  private async playMusic() {
    const music = this.music,
      epoch = this.epoch;
    if (!music || !this.state.enabled || this.state.music === "unavailable")
      return;
    try {
      await music.play();
      if (music !== this.music) return;
      if (!this.state.enabled || epoch !== this.epoch) {
        if (!this.state.enabled) music.pause();
        return;
      }
      this.update({ music: "playing" });
    } catch (error) {
      if (music !== this.music || !this.state.enabled || epoch !== this.epoch)
        return;
      this.update({
        music:
          !music.error &&
          error instanceof Error &&
          error.name === "NotAllowedError"
            ? "blocked"
            : "unavailable",
      });
    }
  }
  /** Call synchronously from a trusted pointer/keyboard handler; browser restrictions remain in charge. */
  unlock = () => {
    if (!this.state.enabled) return;
    if (
      this.state.unlocked &&
      this.context?.state === "running" &&
      this.music &&
      !this.music.paused
    )
      return;
    try {
      if (!this.context || this.context.state === "closed") {
        this.context = new AudioContext();
        this.bus = this.context.createGain();
        this.bus.gain.value = 0.16;
        this.bus.connect(this.context.destination);
      }
      const context = this.context;
      void context
        .resume()
        .then(() => {
          if (context !== this.context || !this.state.enabled) return;
          this.update({ unlocked: context.state === "running" });
          for (const id of SOUND_IDS) void this.buffer(id);
        })
        .catch(() => {});
    } catch {
      /* Background music still works when Web Audio is unavailable. */
    }
    void this.playMusic();
  };
  setEnabled = (enabled: boolean) => {
    this.epoch++;
    try {
      localStorage.setItem(AUDIO_PREFERENCE_KEY, String(enabled));
    } catch {}
    this.update({ enabled });
    if (this.music) this.music.muted = !enabled;
    if (!enabled) {
      this.stopAll();
      clearInterval(this.fadeTimer);
      clearTimeout(this.restoreTimer);
      this.music?.pause();
      if (this.music) this.music.volume = MUSIC_VOLUME;
      if (this.bus) this.bus.gain.value = 0;
      this.update({ unlocked: false });
      void this.context?.suspend().catch(() => {});
      return;
    }
    if (this.bus) this.bus.gain.value = 0.16;
    if (this.state.music === "unavailable" && this.music) {
      this.update({ music: "loading" });
      this.music.load();
    }
    this.unlock();
  };
  toggle = () => this.setEnabled(!this.state.enabled);
  private buffer(id: SoundId): Promise<AudioBuffer | null> {
    const existing = this.buffers.get(id);
    if (existing) return existing;
    const context = this.context;
    if (!context) return Promise.resolve(null);
    const pending = fetch(soundSource(id))
      .then((response) => {
        if (!response.ok) throw new Error("Sound unavailable");
        return response.arrayBuffer();
      })
      .then((bytes) => context.decodeAudioData(bytes))
      .catch(() => {
        this.buffers.delete(id);
        return null;
      });
    this.buffers.set(id, pending);
    return pending;
  }
  play = async (
    id: SoundId,
    options: { loop?: boolean; priority?: number } = {},
  ) => {
    if (
      !this.state.enabled ||
      !this.state.unlocked ||
      !this.context ||
      !this.bus
    )
      return;
    const now = Date.now(),
      cooldown =
        id === "ui-hover"
          ? 600
          : id === "ui-click"
            ? 120
            : id === "victory"
              ? 700
              : 220;
    if ((this.cooldown.get(id) ?? 0) > now) return;
    this.cooldown.set(id, now + cooldown);
    const epoch = this.epoch,
      loopToken = this.loopToken;
    const buffer = await this.buffer(id);
    if (
      !buffer ||
      epoch !== this.epoch ||
      !this.state.enabled ||
      !this.state.unlocked ||
      !this.context ||
      !this.bus ||
      (options.loop && loopToken !== this.loopToken)
    )
      return;
    const priority =
      options.priority ?? (id.startsWith("ui-") ? 0 : id === "victory" ? 5 : 3);
    // Important feedback replaces UI noise; at most three sources can be audible.
    for (const voice of this.voices)
      if (priority >= 3 && voice.priority === 0) this.stopVoice(voice);
    if (this.voices.size >= 3) {
      const quietest = [...this.voices].sort(
        (a, b) => a.priority - b.priority,
      )[0];
      if (quietest.priority > priority) return;
      this.stopVoice(quietest);
    }
    try {
      const source = this.context.createBufferSource(),
        gain = this.context.createGain();
      source.buffer = buffer;
      source.loop = !!options.loop;
      gain.gain.value = options.loop ? 0.45 : 1;
      source.connect(gain);
      gain.connect(this.bus);
      const voice: Voice = { source, gain, priority, loop: !!options.loop };
      source.onended = () => this.removeVoice(voice);
      this.voices.add(voice);
      source.start();
      this.update({ lastEffect: id, playingEffects: this.voices.size });
      if (id === "victory") this.duck();
    } catch {
      /* A missing/unsupported effect must never interrupt gameplay. */
    }
  };
  startWheel = () => {
    this.stopWheel();
    void this.play("wheel-spin", { loop: true, priority: 1 });
    this.loopTimer = setTimeout(this.stopWheel, 6000);
  };
  stopWheel = () => {
    this.loopToken++;
    clearTimeout(this.loopTimer);
    for (const voice of this.voices) if (voice.loop) this.stopVoice(voice);
  };
  react = (event: ReactionEvent) => {
    if (event.type === "WHEEL_SPIN_START") {
      this.startWheel();
      return;
    }
    if (event.type === "WHEEL_PRIZE" || event.type === "WHEEL_BAD_LUCK")
      this.stopWheel();
    const sound = soundForEvent(event);
    if (sound) void this.play(sound);
  };
  private removeVoice(voice: Voice) {
    if (!this.voices.delete(voice)) return;
    voice.source.onended = null;
    try {
      voice.source.disconnect();
      voice.gain.disconnect();
    } catch {}
    this.update({ playingEffects: this.voices.size });
  }
  private stopVoice(voice: Voice) {
    try {
      voice.source.stop();
    } catch {}
    this.removeVoice(voice);
  }
  private stopAll() {
    this.stopWheel();
    for (const voice of this.voices) this.stopVoice(voice);
  }
  private fadeTo(target: number, duration: number) {
    clearInterval(this.fadeTimer);
    const music = this.music;
    if (!music || !this.state.enabled) return;
    const from = music.volume,
      start = Date.now();
    this.fadeTimer = setInterval(() => {
      if (music !== this.music || !this.state.enabled) {
        clearInterval(this.fadeTimer);
        return;
      }
      const progress = Math.min(1, (Date.now() - start) / duration);
      music.volume = Math.max(
        0,
        Math.min(1, from + (target - from) * progress),
      );
      if (progress === 1) clearInterval(this.fadeTimer);
    }, 30);
  }
  private duck() {
    clearTimeout(this.restoreTimer);
    this.fadeTo(0.2, 180);
    this.restoreTimer = setTimeout(() => this.fadeTo(MUSIC_VOLUME, 450), 1800);
  }
  dispose = () => {
    this.epoch++;
    this.stopAll();
    clearInterval(this.fadeTimer);
    clearTimeout(this.restoreTimer);
    this.cleanListeners?.();
    this.cleanListeners = undefined;
    this.music?.pause();
    this.music = null;
    this.update({ unlocked: false });
    this.buffers.clear();
    const context = this.context;
    this.context = null;
    this.bus = null;
    void context?.close().catch(() => {});
  };
}
export { MUSIC_SOURCE };
