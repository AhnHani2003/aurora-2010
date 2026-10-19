import { introductions } from "@/data/dialogue";
import { QUIZ_REACTIONS } from "@/data/character-dialogue";
import type { Expression, Gesture, Reaction, ReactionEvent } from "./model";
import type { GameAction, PublicPlaythrough } from "@/types/game";
function make(
  expression: Expression,
  gesture: Gesture,
  dialogue: string,
  priority = 2,
  duration = 4200,
  effect?: Reaction["effect"],
): Reaction {
  return { expression, gesture, dialogue, priority, duration, effect };
}
export function reactionFor(event: ReactionEvent): Reaction {
  switch (event.type) {
    case "GAME_PREVIEW":
      return make("smug", "point", introductions[event.game], 2, 5500);
    case "GAME_START":
      return make(
        "happy",
        event.game === "dice" ? "pray" : "point",
        event.game === "quiz"
          ? "Ready, princess? My very fragile ego is listening."
          : "A little courage. A little luck. I am cheering for you!",
        3,
      );
    case "QUESTION_ANSWER_CORRECT":
    case "QUESTION_ANSWER_WRONG": {
      const contextual = QUIZ_REACTIONS[event.questionId]?.[event.answer];
      return {
        ...make(
          event.type === "QUESTION_ANSWER_CORRECT" ? "happy" : "pouting",
          event.type === "QUESTION_ANSWER_CORRECT" ? "thumbs-up" : "cross-arms",
          event.type === "QUESTION_ANSWER_CORRECT"
            ? "You know us so well!"
            : "Only a little offended. A kiss would probably fix it.",
          4,
          6000,
          event.type === "QUESTION_ANSWER_CORRECT" ? "hearts" : undefined,
        ),
        ...contextual,
      };
    }
    case "QUIZ_LAST_QUESTION":
      return make(
        "thinking",
        "point",
        "One last question, princess. Make it a good little plot twist.",
        3,
      );
    case "QUIZ_PASSED":
      return make(
        "celebrating",
        "clap",
        "YOU DID IT, PRINCESS! Your boyfriend is officially impressed. Well... even more than usual!",
        6,
        8000,
        "hearts",
      );
    case "QUIZ_FAILED":
      return make(
        "sad",
        "cry",
        "Your score cannot measure how much I adore you. A deep breath, then our next little step.",
        6,
        6000,
        "tears",
      );
    case "DICE_ROLL_START":
      return make(
        "nervous",
        "pray",
        "Destiny, be nice to my girl. Please and thank you.",
        3,
        9000,
      );
    case "DICE_WIN":
      return make(
        "celebrating",
        "cheer",
        "YOU WON! My girl is lucky AND adorable! Take your little victory lap.",
        6,
        8000,
        "sparkles",
      );
    case "DICE_LOSS":
      return make(
        "sad",
        "facepalm",
        "Even the dice are being dramatic today. Come here, princess. I am still on your team.",
        4,
        3500,
      );
    case "WHEEL_SPIN_START":
      return make(
        "nervous",
        "point",
        "Ohhh… my eyes are on the wheel. My wallet is holding its breath.",
        3,
        9000,
      );
    case "WHEEL_PRIZE":
      return make(
        "excited",
        "cheer",
        "Okay, okay! That is a lovely one! My extremely generous boyfriend era continues.",
        5,
        5500,
        "sparkles",
      );
    case "WHEEL_BAD_LUCK":
      return make(
        "shocked",
        "facepalm",
        "Excuse me, wheel?! We are having a very serious conversation after this.",
        5,
        5500,
      );
    case "WHEEL_REROLL":
      return make(
        "mock-angry",
        "cross-arms",
        "Again?! My wallet is begging for mercy!",
        4,
        2700,
      );
    case "BEGGING_ACCEPTED":
      return make(
        "smug",
        "thumbs-up",
        "Hmm… suspiciously convincing. Fine, princess. One more chance. Only because you are cute!",
        5,
        5500,
        "hearts",
      );
    case "REWARD_SELECTED":
      return make(
        "blushing",
        "heart",
        "That one? Excellent taste. Are you sure, princess?",
        3,
        4000,
        "hearts",
      );
    case "RESULT_FINALIZED":
      return make(
        event.won ? "romantic" : "happy",
        "heart",
        event.won
          ? "Your reward is official. My heart was already yours."
          : "No result could change it: you are still my favorite person.",
        7,
        6500,
        "hearts",
      );
    case "POKE":
      return make(
        "laughing",
        "blow-kiss",
        "Hey, princess! Stop poking me... unless you're asking for a kiss!",
        1,
        4000,
        "hearts",
      );
    case "IDLE":
      return make(
        "smug",
        "wave",
        "Just checking: still your favorite boyfriend?",
        0,
        1800,
      );
  }
}
export function eventAfter(
  action: GameAction,
  state: PublicPlaythrough,
): ReactionEvent | null {
  switch (action.type) {
    case "select_game":
      return { type: "GAME_PREVIEW", game: action.game };
    case "start_game":
      return { type: "GAME_START", game: state.game! };
    case "answer":
      return {
        type: state.quiz.feedback?.correct
          ? "QUESTION_ANSWER_CORRECT"
          : "QUESTION_ANSWER_WRONG",
        questionId: action.questionId,
        answer: action.answer,
      };
    case "next_question":
      if (state.phase === "reward") return { type: "QUIZ_PASSED" };
      if (state.quiz.completed && !state.quiz.feedback)
        return { type: "QUIZ_FAILED" };
      return state.quiz.questionIndex === 9
        ? { type: "QUIZ_LAST_QUESTION" }
        : null;
    case "roll":
      return {
        type: state.dice.rolls.at(-1)?.correct ? "DICE_WIN" : "DICE_LOSS",
      };
    case "spin":
      return {
        type: state.wheel.spins.at(-1)?.reward
          ? "WHEEL_PRIZE"
          : "WHEEL_BAD_LUCK",
      };
    case "unlock_attempt":
      return { type: "BEGGING_ACCEPTED" };
    case "keep_reward":
    case "claim_reward":
    case "forfeit":
    case "end_without_prize":
      return { type: "RESULT_FINALIZED", won: state.final?.status === "won" };
    default:
      return null;
  }
}
export function baselineReaction(
  state: PublicPlaythrough | null,
  scene: string,
  review: boolean,
): Reaction {
  if (scene === "reveal")
    return make(
      "happy",
      "wave",
      "Surpriseeee! Your extremely handsome boyfriend has officially arrived!",
      0,
    );
  if (review && state) {
    const won = state.phase === "reward" || state.final?.status === "won";
    return make(
      won ? "happy" : "romantic",
      won ? "thumbs-up" : "heart",
      won
        ? "Enjoy your little victory, princess. I am so proud of you."
        : "A deep breath and a little love. I am right here with you.",
      0,
    );
  }
  if (state?.phase === "rules")
    return make(
      "thinking",
      "point",
      "A little reading before a little mischief. Fair rules, lovely rewards, and me cheering for you.",
      0,
    );
  if (state?.phase === "hub")
    return make(
      "neutral",
      "none",
      state.game
        ? "Your adventure is picked. Read the rules whenever you are ready."
        : "Three little adventures. A few lovely prizes. And absolutely no refunds on my love.",
      0,
    );
  if (state?.phase === "reward")
    return make(
      "neutral",
      "none",
      "Exactly one little happiness. Take your time, princess.",
      0,
    );
  if (state?.phase === "finalized")
    return make(
      "romantic",
      "heart",
      "My heart. Every single day. Forever on your team.",
      0,
    );
  if (state?.game === "quiz" && state.quiz.completed && !state.quiz.feedback)
    return make(
      "happy",
      "thumbs-up",
      "A little breather. If you want another chance, I am cheering for you.",
      0,
    );
  return make(
    "neutral",
    "none",
    state?.game === "quiz"
      ? "Take your time, princess. Your extremely handsome quiz host is listening."
      : "A little luck. A little courage. One boyfriend who is very much on your side.",
    0,
  );
}
/** One cancellable active reaction. Equal/higher priority replaces it; stale timers cannot clear a newer event. */
export class ReactionController {
  private active: Reaction | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private serial = 0;
  private listeners = new Set<() => void>();
  private cooldown = new Map<string, number>();
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  getSnapshot = () => this.active;
  private notify() {
    this.listeners.forEach((fn) => fn());
  }
  dispatch = (event: ReactionEvent) => {
    const next = reactionFor(event);
    const optional = event.type === "IDLE" || event.type === "POKE";
    if (
      optional &&
      ((this.cooldown.get(event.type) ?? 0) > Date.now() || this.active)
    )
      return false;
    if (this.active && next.priority < this.active.priority && optional)
      return false; // User actions always interrupt older dialogue, even a celebration.
    if (optional) this.cooldown.set(event.type, Date.now() + 9000);
    if (this.timer) clearTimeout(this.timer);
    const id = ++this.serial;
    this.active = { ...next, id, event: event.type };
    this.notify();
    this.timer = setTimeout(() => {
      if (this.serial !== id) return;
      if (event.type === "DICE_LOSS") {
        this.active = {
          ...make(
            "happy",
            "thumbs-up",
            "One dramatic roll does not get the final word. I believe in you, princess.",
            2,
            2000,
          ),
          id,
          event: event.type,
        };
        this.notify();
        this.timer = setTimeout(() => {
          if (this.serial !== id) return;
          this.active = null;
          this.notify();
        }, 2000);
        return;
      }
      this.active = null;
      this.notify();
    }, next.duration);
    return true;
  };
  clear = () => {
    if (this.timer) clearTimeout(this.timer);
    this.serial++;
    this.active = null;
    this.notify();
  };
  dispose = () => {
    if (this.timer) clearTimeout(this.timer);
    this.serial++;
    this.active = null;
  };
}
