export type GameId = "wheel" | "dice" | "quiz";
export type GamePhase = "hub" | "rules" | "playing" | "reward" | "finalized";
export type AnswerLabel = "A" | "B" | "C";
export type Prediction = "even" | "odd" | "greater" | "less";

export interface Reward {
  id: string;
  title: string;
  shortLabel: string;
  description: string;
  icon: string;
  budget?: { min: number; max: number; currency: "VND"; giftCount: number };
}
export interface PublicQuestion {
  id: string;
  text: string;
  options: { label: AnswerLabel; text: string }[];
}
export interface Question extends PublicQuestion {
  correctAnswer: AnswerLabel;
}
export interface WheelSpin {
  attempt: number;
  segmentIndex: number;
  reward: Reward | null;
  at: string;
}
export interface DiceRoll {
  attempt: number;
  prediction: Prediction;
  dice: [number, number];
  sum: number;
  correct: boolean;
  at: string;
}
export interface QuizAnswer {
  questionId: string;
  answer: AnswerLabel;
  correctAnswer: AnswerLabel;
  correct: boolean;
}
export interface QuizAttempt {
  attempt: number;
  questionIds: string[];
  answers: QuizAnswer[];
  score: number;
  completed: boolean;
}
export interface BeggingUnlock {
  game: GameId;
  attempt: number;
  message: string;
  wordCount: number;
  acceptedAt: string;
  consumed: boolean;
}
export interface FinalResult {
  id: string;
  status: "won" | "lost" | "forfeited";
  reward: Reward | null;
  attemptsUsed: number;
  finalizedAt: string;
  preference: string | null;
}
export interface PlaythroughState {
  id: string;
  version: number;
  createdAt: string;
  phase: GamePhase;
  game: GameId | null;
  wheel: { spins: WheelSpin[]; candidate: Reward | null };
  dice: { rolls: DiceRoll[] };
  quiz: {
    attempts: QuizAttempt[];
    questionIndex: number;
    feedback: QuizAnswer | null;
  };
  begging: BeggingUnlock[];
  final: FinalResult | null;
}
export interface PublicQuizState {
  attempt: number;
  score: number;
  questionIndex: number;
  totalQuestions: number;
  completed: boolean;
  currentQuestion: PublicQuestion | null;
  feedback: QuizAnswer | null;
  history: {
    attempt: number;
    answers: QuizAnswer[];
    score: number;
    completed: boolean;
  }[];
}
export type PublicPlaythrough = Omit<PlaythroughState, "quiz"> & {
  quiz: PublicQuizState;
};
export type GameAction =
  | { type: "select_game"; game: GameId }
  | { type: "show_rules" }
  | { type: "back_to_games" }
  | { type: "start_game" }
  | { type: "spin"; replace?: boolean }
  | { type: "discard_reward" }
  | { type: "keep_reward" }
  | { type: "unlock_attempt"; message: string }
  | { type: "roll"; prediction: Prediction }
  | { type: "answer"; questionId: string; answer: AnswerLabel }
  | { type: "next_question" }
  | { type: "retry_quiz" }
  | { type: "claim_reward"; rewardId: string; preference?: string }
  | { type: "end_without_prize" }
  | { type: "forfeit" };
