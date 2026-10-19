export type Expression =
  | "neutral"
  | "happy"
  | "excited"
  | "laughing"
  | "smug"
  | "pouting"
  | "mock-angry"
  | "sad"
  | "shocked"
  | "blushing"
  | "thinking"
  | "celebrating"
  | "nervous"
  | "romantic";
export type Gesture =
  | "none"
  | "wave"
  | "thumbs-up"
  | "point"
  | "facepalm"
  | "cross-arms"
  | "clap"
  | "cheer"
  | "blow-kiss"
  | "heart"
  | "cry"
  | "pray";
export interface Face {
  gesture: Gesture;
  label: string;
}
export const FACES: Record<Expression, Face> = {
  neutral: {
    gesture: "none",
    label: "Your devoted game host",
  },
  happy: {
    gesture: "thumbs-up",
    label: "That’s my girl",
  },
  excited: {
    gesture: "cheer",
    label: "Something wonderful!",
  },
  laughing: {
    gesture: "clap",
    label: "You make my whole day",
  },
  smug: {
    gesture: "thumbs-up",
    label: "Suspiciously handsome",
  },
  pouting: {
    gesture: "cross-arms",
    label: "Only a tiny bit offended",
  },
  "mock-angry": {
    gesture: "cross-arms",
    label: "My wallet has questions",
  },
  sad: {
    gesture: "cry",
    label: "A very dramatic little moment",
  },
  shocked: {
    gesture: "facepalm",
    label: "Excuse me, princess?!",
  },
  blushing: {
    gesture: "blow-kiss",
    label: "You caught me blushing",
  },
  thinking: {
    gesture: "point",
    label: "A very important thought",
  },
  celebrating: {
    gesture: "cheer",
    label: "My clever, lucky girl!",
  },
  nervous: {
    gesture: "pray",
    label: "Destiny, please be nice",
  },
  romantic: {
    gesture: "heart",
    label: "Forever on your team",
  },
};

export interface Reaction {
  expression: Expression;
  gesture: Gesture;
  dialogue: string;
  duration: number;
  priority: number;
  effect?: "hearts" | "sparkles" | "tears";
  id?: number;
  event?: ReactionEvent["type"];
}
export type ReactionEvent =
  | { type: "GAME_PREVIEW" | "GAME_START"; game: "wheel" | "dice" | "quiz" }
  | {
      type: "QUESTION_ANSWER_CORRECT" | "QUESTION_ANSWER_WRONG";
      questionId: string;
      answer: string;
    }
  | {
      type:
        | "QUIZ_LAST_QUESTION"
        | "QUIZ_PASSED"
        | "QUIZ_FAILED"
        | "DICE_ROLL_START"
        | "DICE_WIN"
        | "DICE_LOSS"
        | "WHEEL_SPIN_START"
        | "WHEEL_PRIZE"
        | "WHEEL_BAD_LUCK"
        | "WHEEL_REROLL"
        | "BEGGING_ACCEPTED"
        | "REWARD_SELECTED"
        | "IDLE"
        | "POKE";
    }
  | { type: "RESULT_FINALIZED"; won: boolean };
