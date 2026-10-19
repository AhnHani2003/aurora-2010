import type { ReactionEvent } from "@/components/character/model";
export const MUSIC_SOURCE = "/assets/music/background.mp3";
export const AUDIO_PREFERENCE_KEY = "aurora.audio.enabled";
export const MUSIC_VOLUME = 0.35;
export const SOUND_IDS = [
  "bloom",
  "gift-shake",
  "gift-open",
  "tom-appear",
  "ui-hover",
  "ui-click",
  "wheel-spin",
  "wheel-stop",
  "dice-roll",
  "correct",
  "wrong",
  "begging",
  "reward",
  "victory",
  "ending",
] as const;
export type SoundId = (typeof SOUND_IDS)[number];
export const soundSource = (id: SoundId) => `/assets/sounds/${id}.wav`;
export function soundForEvent(event: ReactionEvent): SoundId | null {
  switch (event.type) {
    case "DICE_ROLL_START":
      return "dice-roll";
    case "QUESTION_ANSWER_CORRECT":
      return "correct";
    case "QUESTION_ANSWER_WRONG":
    case "DICE_LOSS":
    case "QUIZ_FAILED":
      return "wrong";
    case "DICE_WIN":
    case "QUIZ_PASSED":
      return "victory";
    case "WHEEL_PRIZE":
    case "WHEEL_BAD_LUCK":
      return "wheel-stop";
    case "BEGGING_ACCEPTED":
      return "begging";
    case "REWARD_SELECTED":
      return "reward";
    case "RESULT_FINALIZED":
      return event.won ? "reward" : null;
    case "POKE":
      return "tom-appear";
    default:
      return null;
  }
}
