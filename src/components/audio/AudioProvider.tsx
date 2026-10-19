"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  AudioManager,
  INITIAL_AUDIO_STATE,
  MUSIC_SOURCE,
} from "@/lib/audio/AudioManager";
import { TOM_SPRITES } from "../character/sprites";
const AudioContextValue = createContext<AudioManager | null>(null);
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [manager] = useState(() => new AudioManager());
  const music = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    if (!music.current) return;
    manager.attach(music.current);
    const pointer = (event: PointerEvent) => {
      if (
        event.isTrusted &&
        !(event.target as Element)?.closest?.("[data-audio-toggle]")
      )
        manager.unlock();
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.isTrusted && (event.key === "Enter" || event.key === " "))
        manager.unlock();
    };
    const click = (event: MouseEvent) => {
      const button = (event.target as Element)?.closest?.("button");
      if (
        !event.isTrusted ||
        !button ||
        button.disabled ||
        button.hasAttribute("data-audio-toggle")
      )
        return;
      void manager.play("ui-click");
    };
    const hover = (event: PointerEvent) => {
      const button = (event.target as Element)?.closest?.("button");
      if (
        event.pointerType !== "mouse" ||
        !button ||
        button.disabled ||
        button.hasAttribute("data-audio-toggle") ||
        (event.relatedTarget instanceof Node &&
          button.contains(event.relatedTarget))
      )
        return;
      void manager.play("ui-hover");
    };
    document.addEventListener("pointerdown", pointer, true);
    document.addEventListener("keydown", keyboard, true);
    document.addEventListener("click", click, true);
    document.addEventListener("pointerover", hover, true);
    // Cache and decode the exact sprites while Aurora reads the opening scene.
    for (const sprite of Object.values(TOM_SPRITES)) {
      const image = new Image();
      image.src = sprite.src;
      void image.decode().catch(() => {});
    }
    return () => {
      document.removeEventListener("pointerdown", pointer, true);
      document.removeEventListener("keydown", keyboard, true);
      document.removeEventListener("click", click, true);
      document.removeEventListener("pointerover", hover, true);
      manager.dispose();
    };
  }, [manager]);
  return (
    <AudioContextValue.Provider value={manager}>
      <audio
        ref={music}
        data-testid="background-music"
        src={MUSIC_SOURCE}
        loop
        preload="auto"
        hidden
      />
      {children}
    </AudioContextValue.Provider>
  );
}
export function useAudio() {
  const manager = useContext(AudioContextValue);
  if (!manager) throw new Error("AudioProvider is required");
  const state = useSyncExternalStore(
    manager.subscribe,
    manager.getSnapshot,
    () => INITIAL_AUDIO_STATE,
  );
  return { manager, state };
}
