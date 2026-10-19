import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/data/questions";
import { SELF_CHOICE_REWARDS, WHEEL_REWARDS } from "@/data/rewards";
import {
  countEnglishWords,
  createPlaythrough,
  drawQuestions,
  gameActionSchema,
  isCorrectPrediction,
  publicView,
  transition,
} from "@/lib/game-rules";
import type { GameAction, GameId, PlaythroughState } from "@/types/game";

const message = (word = "please", count = 31) =>
  Array.from({ length: count }, () => word).join(" ");
const fixed = (value: number) => ({ randomInt: () => value });
function act(state: PlaythroughState, action: GameAction, value = 0) {
  return transition(state, action, fixed(value));
}
function start(game: GameId) {
  let state = createPlaythrough();
  state = act(state, { type: "select_game", game });
  state = act(state, { type: "show_rules" });
  return act(state, { type: "start_game" });
}
function completeQuiz(
  state: PlaythroughState,
  correctCount: number,
  reviewFinalAnswer = true,
) {
  for (let index = 0; index < 10; index++) {
    const question = publicView(state).quiz.currentQuestion!;
    const key = QUESTIONS.find(
      (item) => item.id === question.id,
    )!.correctAnswer;
    const answer =
      index < correctCount
        ? key
        : question.options.find((option) => option.label !== key)!.label;
    state = act(state, { type: "answer", questionId: question.id, answer });
    if (index < 9 || reviewFinalAnswer)
      state = act(state, { type: "next_question" });
  }
  return state;
}
function wheelAtThree() {
  let state = start("wheel");
  for (let index = 0; index < 3; index++)
    state = act(state, { type: "spin" }, 5);
  return state;
}

describe("selection and authoritative transitions", () => {
  it("requires Play This Game and Start Challenge in order", () => {
    const initial = createPlaythrough();
    expect(() => act(initial, { type: "start_game" })).toThrow(/rules/i);
    expect(() => act(initial, { type: "show_rules" })).toThrow(/choose/i);
    const selected = act(initial, { type: "select_game", game: "wheel" });
    expect(selected.phase).toBe("hub");
    expect(() => act(selected, { type: "start_game" })).toThrow();
    expect(() => act(selected, { type: "spin" })).toThrow();
    expect(
      act(act(selected, { type: "show_rules" }), { type: "start_game" }).phase,
    ).toBe("playing");
  });
  it("allows changing selection and going back before starting, then locks the game", () => {
    let state = act(createPlaythrough(), { type: "select_game", game: "dice" });
    state = act(state, { type: "select_game", game: "quiz" });
    state = act(state, { type: "show_rules" });
    state = act(state, { type: "back_to_games" });
    state = act(state, { type: "select_game", game: "wheel" });
    expect(state.game).toBe("wheel");
    expect(() =>
      act(start("wheel"), { type: "select_game", game: "dice" }),
    ).toThrow(/locked/);
  });
  it("does not mutate the previous snapshot and advances one version per action", () => {
    const previous = start("wheel");
    const next = act(previous, { type: "spin" });
    expect(previous.wheel.spins).toHaveLength(0);
    expect(next.version).toBe(previous.version + 1);
  });
  it("rejects additional client-provided score, dice, or reward payload fields", () => {
    expect(
      gameActionSchema.safeParse({
        type: "roll",
        prediction: "even",
        dice: [6, 6],
      }).success,
    ).toBe(false);
    expect(
      gameActionSchema.safeParse({
        type: "answer",
        questionId: "q1",
        answer: "A",
        score: 10,
      }).success,
    ).toBe(false);
    expect(
      gameActionSchema.safeParse({
        type: "claim_reward",
        rewardId: "hotpot",
        amount: 9000000,
      }).success,
    ).toBe(false);
  });
  it("preserves attempts and history across JSON persistence and creates independent replays", () => {
    const played = act(start("wheel"), { type: "spin" });
    const resumed = JSON.parse(JSON.stringify(played)) as PlaythroughState;
    const completed = act(resumed, { type: "keep_reward" });
    const replay = createPlaythrough();
    expect(resumed.wheel.spins).toHaveLength(1);
    expect(completed.wheel.spins).toHaveLength(1);
    expect(replay.id).not.toBe(completed.id);
    expect(replay.wheel.spins).toHaveLength(0);
    expect(completed.final?.status).toBe("won");
  });
});

describe("Lucky Wheel", () => {
  it("has exactly six distinct equal-probability segment outcomes", () => {
    expect(WHEEL_REWARDS).toHaveLength(6);
    expect(
      new Set(WHEEL_REWARDS.map((reward) => reward?.id ?? "no-prize")).size,
    ).toBe(6);
    for (let index = 0; index < 6; index++) {
      const state = act(start("wheel"), { type: "spin" }, index);
      expect(state.wheel.spins[0].segmentIndex).toBe(index);
      expect(state.wheel.candidate).toEqual(WHEEL_REWARDS[index]);
    }
  });
  it("uses the correct one-gift and combined two-gift budgets", () => {
    expect(WHEEL_REWARDS[0]?.budget).toMatchObject({
      min: 500000,
      max: 1000000,
      giftCount: 1,
    });
    expect(WHEEL_REWARDS[1]?.budget).toMatchObject({
      min: 1000000,
      max: 1200000,
      giftCount: 2,
    });
    expect(SELF_CHOICE_REWARDS[0].budget).toMatchObject({
      min: 1000000,
      max: 1200000,
      giftCount: 1,
    });
  });
  it("allows three free spins and requires a separate unlock for both bonus spins", () => {
    let state = wheelAtThree();
    expect(state.wheel.spins).toHaveLength(3);
    expect(() => act(state, { type: "spin" }, 5)).toThrow(/message/);
    state = act(state, { type: "unlock_attempt", message: message() });
    expect(state.begging[0].attempt).toBe(4);
    state = act(state, { type: "spin" }, 5);
    expect(state.begging[0].consumed).toBe(true);
    expect(() => act(state, { type: "spin" }, 5)).toThrow(/message/);
    state = act(state, { type: "unlock_attempt", message: message("darling") });
    state = act(state, { type: "spin" }, 5);
    expect(state.wheel.spins).toHaveLength(5);
    expect(state.final?.status).toBe("lost");
    expect(() => act(state, { type: "spin" })).toThrow(/complete/);
  });
  it("requires confirmation to replace a prize and never accumulates rewards", () => {
    let state = act(start("wheel"), { type: "spin" });
    expect(() => act(state, { type: "spin" }, 1)).toThrow(/replace/);
    state = act(state, { type: "spin", replace: true }, 1);
    expect(state.wheel.candidate?.id).toBe("wheel-two-gifts");
    state = act(state, { type: "keep_reward" });
    expect(state.final?.reward?.id).toBe("wheel-two-gifts");
    expect(state.wheel.spins).toHaveLength(2);
  });
  it("does not restore abandoned prizes when the fifth spin loses", () => {
    let state = act(start("wheel"), { type: "spin" });
    state = act(state, { type: "spin", replace: true }, 5);
    state = act(state, { type: "spin" }, 5);
    state = act(state, { type: "unlock_attempt", message: message() });
    state = act(state, { type: "spin" }, 5);
    state = act(state, { type: "unlock_attempt", message: message("darling") });
    state = act(state, { type: "spin" }, 5);
    expect(state.final?.reward).toBeNull();
    expect(state.final?.status).toBe("lost");
    expect(state.wheel.spins[0].reward).not.toBeNull();
  });
  it("discards the candidate immediately when a replacement is confirmed, before bonus unlocking", () => {
    let state = wheelAtThree();
    // Establish a prize as the third result without bypassing domain transitions.
    let prizeState = start("wheel");
    prizeState = act(prizeState, { type: "spin" }, 5);
    prizeState = act(prizeState, { type: "spin" }, 5);
    prizeState = act(prizeState, { type: "spin" }, 0);
    state = act(prizeState, { type: "discard_reward" });
    expect(state.wheel.candidate).toBeNull();
    expect(state.wheel.spins).toHaveLength(3);
    expect(() => act(state, { type: "keep_reward" })).toThrow(/no prize/);
    expect(() => act(state, { type: "spin" })).toThrow(/message/);
  });
  it("automatically accepts a real prize on spin five", () => {
    let state = wheelAtThree();
    state = act(state, { type: "unlock_attempt", message: message() });
    state = act(state, { type: "spin" }, 5);
    state = act(state, { type: "unlock_attempt", message: message("darling") });
    state = act(state, { type: "spin" }, 2);
    expect(state.final).toMatchObject({
      status: "won",
      attemptsUsed: 5,
      reward: { id: "hotpot" },
    });
  });
  it("cannot keep Better Luck Next Time as a real reward", () => {
    const state = act(start("wheel"), { type: "spin" }, 5);
    expect(() => act(state, { type: "keep_reward" })).toThrow(/no prize/);
  });
});

describe("Dice Challenge", () => {
  it.each([
    ["even", 6, true],
    ["odd", 6, false],
    ["greater", 6, false],
    ["less", 6, false],
    ["even", 12, true],
    ["odd", 7, true],
    ["greater", 7, true],
    ["less", 5, true],
    ["even", 7, false],
    ["odd", 12, false],
    ["greater", 5, false],
    ["less", 7, false],
  ] as const)("grades %s for total %i as %s", (prediction, sum, expected) => {
    expect(isCorrectPrediction(prediction, sum)).toBe(expected);
  });
  it("generates values in 1–6 and computes the sum exactly", () => {
    for (let index = 0; index < 36; index++) {
      let count = 0;
      const state = transition(
        start("dice"),
        { type: "roll", prediction: "even" },
        {
          randomInt: () => (count++ === 0 ? Math.floor(index / 6) : index % 6),
        },
      );
      const roll = state.dice.rolls[0];
      expect(roll.dice[0]).toBeGreaterThanOrEqual(1);
      expect(roll.dice[1]).toBeLessThanOrEqual(6);
      expect(roll.sum).toBe(roll.dice[0] + roll.dice[1]);
    }
  });
  it("one correct prediction immediately unlocks exactly one reward", () => {
    let state = act(start("dice"), { type: "roll", prediction: "even" });
    expect(state.phase).toBe("reward");
    expect(() => act(state, { type: "roll", prediction: "even" })).toThrow();
    state = act(state, {
      type: "claim_reward",
      rewardId: "hotpot",
      preference: "Our favorite place",
    });
    expect(state.final).toMatchObject({
      status: "won",
      attemptsUsed: 1,
      reward: { id: "hotpot" },
      preference: "Our favorite place",
    });
    expect(() => act(state, { type: "claim_reward", rewardId: "bbq" })).toThrow(
      /complete/,
    );
  });
  it("five losses with separate unlocks produce no prize", () => {
    let state = start("dice");
    for (let index = 0; index < 3; index++)
      state = act(state, { type: "roll", prediction: "odd" });
    expect(() => act(state, { type: "roll", prediction: "odd" })).toThrow(
      /message/,
    );
    state = act(state, { type: "unlock_attempt", message: message() });
    state = act(state, { type: "roll", prediction: "odd" });
    expect(() => act(state, { type: "roll", prediction: "odd" })).toThrow(
      /message/,
    );
    state = act(state, { type: "unlock_attempt", message: message("darling") });
    state = act(state, { type: "roll", prediction: "odd" });
    expect(state.final).toMatchObject({
      status: "lost",
      reward: null,
      attemptsUsed: 5,
    });
  });
  it("can explicitly decline a retry after losing", () => {
    const state = act(act(start("dice"), { type: "roll", prediction: "odd" }), {
      type: "end_without_prize",
    });
    expect(state.final).toMatchObject({ status: "lost", reward: null });
  });
});

describe("Love Quiz", () => {
  it("contains exactly the supplied fifteen questions and answer mappings", () => {
    expect(QUESTIONS).toHaveLength(15);
    expect(QUESTIONS.map((question) => question.correctAnswer).join("")).toBe(
      "AABBBBBCABA AAAA".replace(/ /g, ""),
    );
    expect(
      QUESTIONS.find((question) => question.id === "q5")?.options[1],
    ).toEqual({ label: "B", text: "Jungkook" });
    expect(
      QUESTIONS.find((question) => question.id === "q8")?.options[2],
    ).toEqual({ label: "C", text: "Both of them" });
  });
  it("draws ten unique questions without changing the original option labels", () => {
    for (let index = 0; index < 20; index++) {
      const ids = drawQuestions();
      expect(ids).toHaveLength(10);
      expect(new Set(ids).size).toBe(10);
      expect(
        ids.every((id) => QUESTIONS.some((question) => question.id === id)),
      ).toBe(true);
    }
    const state = start("quiz");
    const current = publicView(state).quiz.currentQuestion!;
    expect(current.options).toEqual(
      QUESTIONS.find((question) => question.id === current.id)?.options,
    );
  });
  it("does not reveal unanswered answer keys or future questions in public state", () => {
    const state = start("quiz");
    const view = publicView(state);
    expect(JSON.stringify(view)).not.toContain("correctAnswer");
    expect(JSON.stringify(view)).not.toContain("questionIds");
    expect(view.quiz.currentQuestion?.id).toBe(
      state.quiz.attempts[0].questionIds[0],
    );
  });
  it("requires an answer, grades server-side, reveals feedback, and prevents repeated answers", () => {
    let state = start("quiz");
    expect(() => act(state, { type: "next_question" })).toThrow();
    const question = publicView(state).quiz.currentQuestion!;
    expect(() =>
      act(state, { type: "answer", questionId: "unknown", answer: "A" }),
    ).toThrow(/currently/);
    state = act(state, {
      type: "answer",
      questionId: question.id,
      answer: "A",
    });
    expect(state.quiz.feedback?.correctAnswer).toBe(
      QUESTIONS.find((item) => item.id === question.id)?.correctAnswer,
    );
    expect(() =>
      act(state, { type: "answer", questionId: question.id, answer: "B" }),
    ).toThrow(/next question/);
  });
  it("passes with seven correct answers and unlocks a single self-choice reward", () => {
    let state = completeQuiz(start("quiz"), 7);
    expect(state.phase).toBe("reward");
    expect(state.quiz.attempts[0].score).toBe(7);
    expect(() => act(state, { type: "retry_quiz" })).toThrow();
    state = act(state, { type: "claim_reward", rewardId: "choice-one-gift" });
    expect(state.final?.status).toBe("won");
    expect(() =>
      act(state, { type: "claim_reward", rewardId: "hotpot" }),
    ).toThrow();
  });
  it("keeps the tenth answer feedback visible until See My Score before unlocking a win", () => {
    let state = completeQuiz(start("quiz"), 7, false);
    expect(state.phase).toBe("playing");
    expect(state.quiz.attempts[0].completed).toBe(true);
    expect(publicView(state).quiz.feedback?.correctAnswer).toBeTruthy();
    expect(() =>
      act(state, { type: "claim_reward", rewardId: "hotpot" }),
    ).toThrow();
    state = act(state, { type: "next_question" });
    expect(state.phase).toBe("reward");
    expect(state.quiz.feedback).toBeNull();
  });
  it("requires reviewing the tenth answer before retrying or declining a failed quiz", () => {
    let state = completeQuiz(start("quiz"), 6, false);
    expect(state.quiz.feedback).not.toBeNull();
    expect(() => act(state, { type: "retry_quiz" })).toThrow(/final answer/);
    expect(() => act(state, { type: "end_without_prize" })).toThrow();
    state = act(state, { type: "next_question" });
    expect(state.phase).toBe("playing");
    expect(state.quiz.feedback).toBeNull();
    expect(act(state, { type: "retry_quiz" }).quiz.attempts).toHaveLength(2);
  });
  it("fails with six correct answers and allows only two free complete attempts", () => {
    let state = completeQuiz(start("quiz"), 6);
    expect(state.phase).toBe("playing");
    expect(state.quiz.attempts[0].completed).toBe(true);
    state = act(state, { type: "retry_quiz" });
    expect(state.quiz.attempts).toHaveLength(2);
    state = completeQuiz(state, 6);
    expect(() => act(state, { type: "retry_quiz" })).toThrow(/message/);
    state = act(state, { type: "unlock_attempt", message: message() });
    state = act(state, { type: "retry_quiz" });
    expect(state.begging[0]).toMatchObject({ attempt: 3, consumed: true });
    state = completeQuiz(state, 6, false);
    expect(state.final).toBeNull();
    expect(state.phase).toBe("playing");
    expect(publicView(state).quiz.feedback?.correctAnswer).toBeTruthy();
    state = act(state, { type: "next_question" });
    expect(state.final).toMatchObject({
      status: "lost",
      reward: null,
      attemptsUsed: 3,
    });
    expect(() => act(state, { type: "retry_quiz" })).toThrow(/complete/);
  });
});

describe("begging, rewards, and terminal results", () => {
  it("rejects 30 words and accepts 31 words tied to exactly one attempt", () => {
    let state = wheelAtThree();
    expect(countEnglishWords(message("please", 30))).toBe(30);
    expect(() =>
      act(state, { type: "unlock_attempt", message: message("please", 30) }),
    ).toThrow(/31/);
    state = act(state, { type: "unlock_attempt", message: message() });
    expect(state.begging).toHaveLength(1);
    expect(state.begging[0].wordCount).toBe(31);
    expect(() =>
      act(state, { type: "unlock_attempt", message: message("darling") }),
    ).toThrow(/already unlocked/);
  });
  it("rejects empty, overly long, and reused accepted messages", () => {
    let state = wheelAtThree();
    expect(() => act(state, { type: "unlock_attempt", message: "  " })).toThrow(
      /31/,
    );
    expect(() =>
      act(state, { type: "unlock_attempt", message: "a".repeat(4001) }),
    ).toThrow(/valid/);
    state = act(state, { type: "unlock_attempt", message: message() });
    state = act(state, { type: "spin" }, 5);
    expect(() =>
      act(state, {
        type: "unlock_attempt",
        message: `  ${message().toUpperCase().replaceAll(" ", "  ")}  `,
      }),
    ).toThrow(/new message/);
  });
  it("never unlocks self-choice rewards after a loss or before starting", () => {
    expect(SELF_CHOICE_REWARDS).toHaveLength(4);
    expect(() =>
      act(start("quiz"), { type: "claim_reward", rewardId: "hotpot" }),
    ).toThrow(/win/i);
    expect(() =>
      act(act(start("dice"), { type: "roll", prediction: "odd" }), {
        type: "claim_reward",
        rewardId: "bbq",
      }),
    ).toThrow(/win/i);
    expect(() =>
      act(act(start("dice"), { type: "roll", prediction: "even" }), {
        type: "claim_reward",
        rewardId: "wheel-two-gifts",
      }),
    ).toThrow(/four/);
  });
  it("finalizes only once with a unique result reference and no reward on forfeit", () => {
    const state = act(act(start("wheel"), { type: "spin" }), {
      type: "forfeit",
    });
    expect(state.final).toMatchObject({
      status: "forfeited",
      reward: null,
      attemptsUsed: 1,
    });
    expect(state.final?.id).toBeTruthy();
    expect(state.final?.finalizedAt).toBeTruthy();
    expect(state.wheel.candidate).toBeNull();
    expect(() => act(state, { type: "forfeit" })).toThrow(/complete/);
    expect(() => act(state, { type: "keep_reward" })).toThrow(/complete/);
  });
});
