import type { Expression, Gesture } from "./model";
export type SpriteName =
  | "idle"
  | "greeting"
  | "happy"
  | "excited"
  | "proud"
  | "angry"
  | "shocked"
  | "crying";
export const TOM_SPRITES: Record<SpriteName, { src: string; label: string }> = {
  idle: { src: "/assets/tom/sprites/idle.webp", label: "Idle" },
  greeting: { src: "/assets/tom/sprites/greeting.webp", label: "Greeting" },
  happy: { src: "/assets/tom/sprites/happy.webp", label: "Happy" },
  excited: { src: "/assets/tom/sprites/excited.webp", label: "Excited" },
  proud: { src: "/assets/tom/sprites/proud.webp", label: "Proud" },
  angry: { src: "/assets/tom/sprites/angry.webp", label: "Angry" },
  shocked: { src: "/assets/tom/sprites/shocked.webp", label: "Shocked" },
  crying: { src: "/assets/tom/sprites/crying.webp", label: "Crying" },
};
export function spriteFor(
  expression: Expression,
  gesture?: Gesture,
): SpriteName {
  if (expression === "neutral") return "idle";
  if (gesture === "wave" && expression === "happy") return "greeting";
  if (expression === "celebrating" || expression === "excited")
    return "excited";
  if (expression === "smug") return "proud";
  if (expression === "mock-angry" || expression === "pouting") return "angry";
  if (expression === "shocked" || expression === "nervous") return "shocked";
  if (expression === "sad") return "crying";
  if (expression === "thinking") return "idle";
  return "happy";
}
