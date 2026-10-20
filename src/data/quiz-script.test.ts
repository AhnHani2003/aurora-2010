import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  approvedEnglish,
  readQuizScript,
  quizState,
} from "../../tests/quiz-script";
import { QUIZ_REACTIONS } from "./character-dialogue";
import { QUESTIONS } from "./questions";
import { reactionFor } from "@/components/character/reactions";
import { FACES } from "@/components/character/model";
import { spriteFor, TOM_SPRITES } from "@/components/character/sprites";
import { transition } from "@/lib/game-rules/engine";

const script = readQuizScript();
describe("authoritative Love Quiz integration", () => {
  it("preserves the original edited Markdown byte for byte and covers exactly 31 unique options", () => {
    expect(
      createHash("sha256")
        .update(readFileSync("QUIZ_DIALOGUE_SCRIPT.md"))
        .digest("hex"),
    ).toBe("d976a8987788eba3e750c347732c03816c358b24df82484d7a901dfaa5b07337");
    expect(script).toHaveLength(31);
    expect(new Set(script.map((r) => `${r.id}.${r.option}`)).size).toBe(31);
    expect(Object.keys(QUIZ_REACTIONS)).toEqual(QUESTIONS.map((q) => q.id));
    for (const q of QUESTIONS)
      expect(Object.keys(QUIZ_REACTIONS[q.id])).toEqual(
        q.options.map((o) => o.label),
      );
    expect(QUESTIONS.map((q) => q.correctAnswer)).toEqual([
      "A",
      "A",
      "B",
      "B",
      "B",
      "B",
      "B",
      "C",
      "A",
      "B",
      "A",
      "A",
      "A",
      "A",
      "A",
    ]);
  });

  it.each(script)(
    "$id.$option matches exact VI, reviewed EN, sprite/effect and engine correctness",
    (row) => {
      const configured = QUIZ_REACTIONS[row.id][row.option];
      expect(configured.dialogueVi).toBe(row.vi);
      expect(configured.dialogue).toBe(
        approvedEnglish[
          `${row.id}.${row.option}` as keyof typeof approvedEnglish
        ],
      );
      expect(configured.expression).toBe(row.expression);
      expect(configured.gesture).toBe(row.gesture);
      expect(FACES[configured.expression]).toBeDefined();
      expect(configured.effect).toBe(row.effect);
      expect(spriteFor(configured.expression, configured.gesture)).toBe(
        row.sprite,
      );
      expect(TOM_SPRITES[row.sprite as keyof typeof TOM_SPRITES]).toBeDefined();
      const state = transition(quizState(row.id), {
        type: "answer",
        questionId: row.id,
        answer: row.option,
      });
      const correct =
        QUESTIONS.find((q) => q.id === row.id)!.correctAnswer === row.option;
      expect(state.quiz.feedback?.correct).toBe(correct);
      expect(state.quiz.attempts[0].score).toBe(Number(correct));
      const reaction = reactionFor({
        type: correct ? "QUESTION_ANSWER_CORRECT" : "QUESTION_ANSWER_WRONG",
        questionId: row.id,
        answer: row.option,
      });
      expect(reaction).toMatchObject(configured);
      expect(reaction.duration).toBe(6000);
    },
  );

  it("uses the author's confirmed q2.B heading", () => {
    const row = script.find((r) => r.id === "q2" && r.option === "B")!;
    expect(QUIZ_REACTIONS.q2.B.feedbackHeading?.vi).toBe(row.headingVi);
    expect(QUIZ_REACTIONS.q2.B.feedbackHeading?.en).toBe(
      "Hey! Are you saying I'm bad at this? 😡",
    );
  });

  it.each([6, 7])("keeps the original pass boundary at %i / 10", (score) => {
    let state = quizState("q1");
    for (const [i, id] of state.quiz.attempts[0].questionIds.entries()) {
      const question = QUESTIONS.find((q) => q.id === id)!;
      const answer =
        i < score
          ? question.correctAnswer
          : question.options.find((o) => o.label !== question.correctAnswer)!
              .label;
      state = transition(state, { type: "answer", questionId: id, answer });
      state = transition(state, { type: "next_question" });
    }
    expect(state.quiz.attempts[0].score).toBe(score);
    expect(state.phase).toBe(score === 7 ? "reward" : "playing");
    expect(state.quiz.attempts[0].completed).toBe(true);
  });
});
