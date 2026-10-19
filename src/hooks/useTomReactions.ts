"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ReactionController } from "@/components/character/reactions";
export function useTomReactions() {
  const [controller] = useState(() => new ReactionController());
  const reaction = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    () => null,
  );
  useEffect(() => () => controller.dispose(), [controller]);
  return { reaction, dispatch: controller.dispatch, clear: controller.clear };
}
