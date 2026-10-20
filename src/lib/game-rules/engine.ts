import { z } from "zod";
import { countWords } from "../words";
import { QUESTIONS } from "@/data/questions";
import { SELF_CHOICE_REWARDS, WHEEL_REWARDS } from "@/data/rewards";
import type {
  GameAction,
  GameId,
  PlaythroughState,
  Prediction,
  PublicPlaythrough,
  QuizAttempt,
  Reward,
} from "@/types/game";

export type {
  GameAction,
  PlaythroughState,
  PublicPlaythrough,
} from "@/types/game";
const empty = <T extends string>(type: T) =>
  z.object({ type: z.literal(type) }).strict();
export const gameActionSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("select_game"),
      game: z.enum(["wheel", "dice", "quiz"]),
    })
    .strict(),
  empty("show_rules"),
  empty("back_to_games"),
  empty("start_game"),
  z
    .object({ type: z.literal("spin"), replace: z.boolean().optional() })
    .strict(),
  empty("keep_reward"),
  empty("discard_reward"),
  z
    .object({
      type: z.literal("unlock_attempt"),
      message: z.string().max(4000),
    })
    .strict(),
  z
    .object({
      type: z.literal("roll"),
      prediction: z.enum(["even", "odd", "greater", "less"]),
    })
    .strict(),
  z
    .object({
      type: z.literal("answer"),
      questionId: z.string().max(20),
      answer: z.enum(["A", "B", "C"]),
    })
    .strict(),
  empty("next_question"),
  empty("retry_quiz"),
  z
    .object({
      type: z.literal("claim_reward"),
      rewardId: z.string().max(80),
      preference: z.string().max(500).optional(),
    })
    .strict(),
  empty("end_without_prize"),
  empty("forfeit"),
]);

export class GameRuleError extends Error {
  readonly code = "INVALID_GAME_ACTION";
  constructor(message: string) {
    super(message);
    this.name = "GameRuleError";
  }
}
export interface EngineDependencies {
  randomInt: (max: number) => number;
  now: () => string;
  uuid: () => string;
}
const defaults: EngineDependencies = {
  randomInt: (max) => {
    // Web Crypto works in both Node and browsers; reject the modulo-biased tail.
    const limit = Math.floor(0x100000000 / max) * max;
    const sample = new Uint32Array(1);
    do {
      globalThis.crypto.getRandomValues(sample);
    } while (sample[0] >= limit);
    return sample[0] % max;
  },
  now: () => new Date().toISOString(),
  uuid: () => globalThis.crypto.randomUUID(),
};
function requireRule(condition: unknown, message: string): asserts condition {
  if (!condition) throw new GameRuleError(message);
}

export function createPlaythrough(
  id: string = defaults.uuid(),
): PlaythroughState {
  return {
    id,
    version: 0,
    createdAt: defaults.now(),
    phase: "hub",
    game: null,
    wheel: { spins: [], candidate: null },
    dice: { rolls: [] },
    quiz: { attempts: [], questionIndex: 0, feedback: null },
    begging: [],
    final: null,
  };
}

export function countEnglishWords(message: string): number {
  return countWords(message);
}
const normalizeMessage = (message: string) =>
  message.trim().replace(/\s+/g, " ").toLowerCase();
export function isCorrectPrediction(
  prediction: Prediction,
  sum: number,
): boolean {
  return prediction === "even"
    ? sum % 2 === 0
    : prediction === "odd"
      ? sum % 2 !== 0
      : prediction === "greater"
        ? sum > 6
        : sum < 6;
}
export function drawQuestions(
  random: (max: number) => number = defaults.randomInt,
): string[] {
  const ids = QUESTIONS.map((question) => question.id);
  for (let index = ids.length - 1; index > 0; index--) {
    const target = random(index + 1);
    [ids[index], ids[target]] = [ids[target], ids[index]];
  }
  return ids.slice(0, 10);
}
function attemptsUsed(state: PlaythroughState): number {
  return state.game === "wheel"
    ? state.wheel.spins.length
    : state.game === "dice"
      ? state.dice.rolls.length
      : state.quiz.attempts.length;
}
function finish(
  state: PlaythroughState,
  status: "won" | "lost" | "forfeited",
  reward: Reward | null,
  dependencies: EngineDependencies,
  preference?: string,
) {
  requireRule(!state.final, "This adventure already has an official result.");
  state.phase = "finalized";
  state.final = {
    id: dependencies.uuid(),
    status,
    reward,
    attemptsUsed: attemptsUsed(state),
    finalizedAt: dependencies.now(),
    preference: preference?.trim() || null,
  };
}
function consumeAttempt(
  state: PlaythroughState,
  attempt: number,
  freeAttempts: number,
  maxAttempts: number,
) {
  requireRule(attempt <= maxAttempts, "No attempts remain in this adventure.");
  if (attempt <= freeAttempts) return;
  const unlock = state.begging.find(
    (message) =>
      message.game === state.game &&
      message.attempt === attempt &&
      !message.consumed,
  );
  requireRule(
    unlock,
    "This bonus attempt needs its own convincing message of at least 31 English words.",
  );
  unlock.consumed = true;
}
function startQuizAttempt(
  state: PlaythroughState,
  dependencies: EngineDependencies,
) {
  const attempt = state.quiz.attempts.length + 1;
  consumeAttempt(state, attempt, 2, 3);
  state.quiz.attempts.push({
    attempt,
    questionIds: drawQuestions(dependencies.randomInt),
    answers: [],
    score: 0,
    completed: false,
  });
  state.quiz.questionIndex = 0;
  state.quiz.feedback = null;
}
function requirePlaying(state: PlaythroughState, game: GameId) {
  requireRule(
    state.phase === "playing" && state.game === game,
    `Start the ${game} challenge before using this action.`,
  );
}
function currentQuiz(state: PlaythroughState): QuizAttempt {
  const attempt = state.quiz.attempts.at(-1);
  requireRule(attempt, "Start a quiz attempt first.");
  return attempt;
}

/** Pure domain transition: caller atomically compares/persists version and enqueues final results. */
export function transition(
  previous: PlaythroughState,
  input: GameAction,
  overrides: Partial<EngineDependencies> = {},
): PlaythroughState {
  const parsed = gameActionSchema.safeParse(input);
  requireRule(parsed.success, "That request is not a valid game action.");
  const action = parsed.data;
  requireRule(
    !previous.final && previous.phase !== "finalized",
    "This adventure is already complete. Start a new one to play again.",
  );
  const state = structuredClone(previous);
  const dependencies = { ...defaults, ...overrides };
  switch (action.type) {
    case "select_game":
      requireRule(
        state.phase === "hub",
        "Your game is locked after starting the challenge.",
      );
      state.game = action.game;
      break;
    case "show_rules":
      requireRule(
        state.phase === "hub" && state.game,
        "Choose a game before viewing its rules.",
      );
      state.phase = "rules";
      break;
    case "back_to_games":
      requireRule(
        state.phase === "rules",
        "You can return to the games before starting a challenge.",
      );
      state.phase = "hub";
      break;
    case "start_game":
      requireRule(
        state.phase === "rules" && state.game,
        "Choose Play This Game and read the rules before Start Challenge.",
      );
      state.phase = "playing";
      if (state.game === "quiz") startQuizAttempt(state, dependencies);
      break;
    case "spin": {
      requirePlaying(state, "wheel");
      requireRule(
        !state.wheel.candidate || action.replace === true,
        "Confirm that your next spin will replace the current prize.",
      );
      const attempt = state.wheel.spins.length + 1;
      consumeAttempt(state, attempt, 3, 5);
      state.wheel.candidate = null;
      const segmentIndex = dependencies.randomInt(WHEEL_REWARDS.length);
      const reward = WHEEL_REWARDS[segmentIndex];
      requireRule(
        reward !== undefined,
        "The wheel produced an invalid segment.",
      );
      state.wheel.spins.push({
        attempt,
        segmentIndex,
        reward,
        at: dependencies.now(),
      });
      state.wheel.candidate = reward;
      if (attempt === 5)
        finish(state, reward ? "won" : "lost", reward, dependencies);
      break;
    }
    case "discard_reward":
      requirePlaying(state, "wheel");
      requireRule(
        state.wheel.candidate,
        "There is no current prize to replace.",
      );
      state.wheel.candidate = null;
      break;
    case "keep_reward":
      requirePlaying(state, "wheel");
      requireRule(state.wheel.candidate, "There is no prize to keep yet.");
      finish(state, "won", state.wheel.candidate, dependencies);
      break;
    case "unlock_attempt": {
      requireRule(
        state.phase === "playing" && state.game,
        "Bonus attempts are available during a challenge.",
      );
      const attempt = attemptsUsed(state) + 1;
      const free = state.game === "quiz" ? 2 : 3;
      const max = state.game === "quiz" ? 3 : 5;
      requireRule(
        attempt > free && attempt <= max,
        "There is no locked bonus attempt to unlock yet.",
      );
      if (state.game === "quiz")
        requireRule(
          currentQuiz(state).completed && !state.quiz.feedback,
          "Finish this quiz and review its final answer before asking for another attempt.",
        );
      requireRule(
        !state.begging.some(
          (message) =>
            message.game === state.game && message.attempt === attempt,
        ),
        "This particular attempt is already unlocked.",
      );
      const message = action.message.trim();
      const wordCount = countEnglishWords(message);
      requireRule(
        wordCount >= 31,
        "Write at least 31 English words to unlock one more chance.",
      );
      requireRule(
        !state.begging.some(
          (accepted) =>
            normalizeMessage(accepted.message) === normalizeMessage(message),
        ),
        "Write a new message for each bonus attempt, princess.",
      );
      state.begging.push({
        game: state.game,
        attempt,
        message,
        wordCount,
        acceptedAt: dependencies.now(),
        consumed: false,
      });
      break;
    }
    case "roll": {
      requirePlaying(state, "dice");
      const attempt = state.dice.rolls.length + 1;
      consumeAttempt(state, attempt, 3, 5);
      const dice: [number, number] = [
        dependencies.randomInt(6) + 1,
        dependencies.randomInt(6) + 1,
      ];
      requireRule(
        dice.every(
          (value) => Number.isInteger(value) && value >= 1 && value <= 6,
        ),
        "The dice produced an invalid value.",
      );
      const sum = dice[0] + dice[1];
      const correct = isCorrectPrediction(action.prediction, sum);
      state.dice.rolls.push({
        attempt,
        prediction: action.prediction,
        dice,
        sum,
        correct,
        at: dependencies.now(),
      });
      if (correct) state.phase = "reward";
      else if (attempt === 5) finish(state, "lost", null, dependencies);
      break;
    }
    case "answer": {
      requirePlaying(state, "quiz");
      const attempt = currentQuiz(state);
      requireRule(
        !attempt.completed && !state.quiz.feedback,
        "Continue to the next question before answering again.",
      );
      const question = QUESTIONS.find(
        (item) => item.id === attempt.questionIds[state.quiz.questionIndex],
      );
      requireRule(
        question && action.questionId === question.id,
        "Answer the question currently being shown.",
      );
      requireRule(
        question.options.some((option) => option.label === action.answer),
        "Choose one of this question's original answer options.",
      );
      const answer = {
        questionId: question.id,
        answer: action.answer,
        correctAnswer: question.correctAnswer,
        correct: action.answer === question.correctAnswer,
      };
      attempt.answers.push(answer);
      if (answer.correct) attempt.score++;
      state.quiz.feedback = answer;
      if (attempt.answers.length === 10) {
        attempt.completed = true;
      }
      break;
    }
    case "next_question": {
      requirePlaying(state, "quiz");
      requireRule(
        state.quiz.feedback,
        "Answer the current question before continuing.",
      );
      const attempt = currentQuiz(state);
      if (attempt.completed) {
        if (attempt.score >= 7) state.phase = "reward";
        else if (attempt.attempt === 3)
          finish(state, "lost", null, dependencies);
      } else {
        state.quiz.questionIndex++;
      }
      state.quiz.feedback = null;
      break;
    }
    case "retry_quiz":
      requirePlaying(state, "quiz");
      requireRule(
        currentQuiz(state).completed &&
          currentQuiz(state).score < 7 &&
          !state.quiz.feedback,
        "Finish the current quiz attempt and review its final answer before retrying.",
      );
      startQuizAttempt(state, dependencies);
      break;
    case "claim_reward": {
      requireRule(
        state.phase === "reward" &&
          (state.game === "dice" || state.game === "quiz"),
        "Win Dice Challenge or Love Quiz to choose one reward.",
      );
      const reward = SELF_CHOICE_REWARDS.find(
        (option) => option.id === action.rewardId,
      );
      requireRule(reward, "Choose one of the four available rewards.");
      finish(state, "won", reward, dependencies, action.preference);
      break;
    }
    case "end_without_prize":
      requireRule(
        state.phase === "playing",
        "There is no unsuccessful challenge to finish.",
      );
      requireRule(
        state.game === "dice"
          ? state.dice.rolls.length > 0
          : state.game === "wheel"
            ? state.wheel.spins.length > 0 && !state.wheel.candidate
            : currentQuiz(state).completed &&
              currentQuiz(state).score < 7 &&
              !state.quiz.feedback,
        "Finish an unsuccessful attempt before declining a retry.",
      );
      finish(state, "lost", null, dependencies);
      break;
    case "forfeit":
      requireRule(
        (state.phase === "playing" || state.phase === "reward") && state.game,
        "Start a game before forfeiting it.",
      );
      state.wheel.candidate = null;
      finish(state, "forfeited", null, dependencies);
      break;
  }
  state.version++;
  return state;
}

/** Only the current question is visible; unanswered answer keys and future draws stay server-side. */
export function publicView(state: PlaythroughState): PublicPlaythrough {
  const { quiz, ...rest } = structuredClone(state);
  const attempt = quiz.attempts.at(-1);
  const question = attempt
    ? QUESTIONS.find(
        (item) => item.id === attempt.questionIds[quiz.questionIndex],
      )
    : null;
  return {
    ...rest,
    quiz: {
      attempt: attempt?.attempt ?? 0,
      score: attempt?.score ?? 0,
      questionIndex: quiz.questionIndex,
      totalQuestions: 10,
      completed: attempt?.completed ?? false,
      currentQuestion: question
        ? {
            id: question.id,
            text: question.text,
            options: structuredClone(question.options),
          }
        : null,
      feedback: quiz.feedback,
      history: quiz.attempts.map((item) => ({
        attempt: item.attempt,
        answers: item.answers,
        score: item.score,
        completed: item.completed,
      })),
    },
  };
}
