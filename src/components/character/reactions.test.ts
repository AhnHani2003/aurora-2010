import { afterEach, describe, expect, it, vi } from "vitest";
import { FACES } from "./model";
import { QUIZ_REACTIONS } from "@/data/character-dialogue";
import { ReactionController, reactionFor, eventAfter } from "./reactions";
import { createPlaythrough, publicView, transition } from "@/lib/game-rules";
import { TOM_SPRITES, spriteFor } from "./sprites";
import sharp from "sharp";
import { resolve } from "node:path";
afterEach(() => vi.useRealTimers());
describe("extracted sprites and contextual reactions", () => {
  it("uses eight transparent, identically sized source-sheet sprites", async () => {
    expect(Object.keys(TOM_SPRITES)).toHaveLength(8);
    for (const sprite of Object.values(TOM_SPRITES)) {
      const path = resolve("public", sprite.src.slice(1));
      const metadata = await sharp(path).metadata();
      expect([metadata.width, metadata.height, metadata.hasAlpha]).toEqual([
        512,
        560,
        true,
      ]);
      const { data, info } = await sharp(path)
        .raw()
        .toBuffer({ resolveWithObject: true });
      let visible = 0;
      for (let i = 3; i < data.length; i += info.channels)
        if (data[i] > 0) visible++;
      expect(visible).toBeGreaterThan(40000);
      expect(visible).toBeLessThan(512 * 560 * 0.7);
      // The padded canvas protects raised hands/hair, with no boundary clipping.
      for (let x = 0; x < info.width; x++) expect(data[x * 4 + 3]).toBe(0);
    }
  });
  it("maps semantic events to visibly distinct poses from that sheet", () => {
    expect(spriteFor("neutral")).toBe("idle");
    expect(spriteFor("happy", "wave")).toBe("greeting");
    expect(spriteFor("blushing")).toBe("happy");
    expect(spriteFor("celebrating")).toBe("excited");
    expect(spriteFor("smug")).toBe("proud");
    expect(spriteFor("mock-angry")).toBe("angry");
    expect(spriteFor("shocked")).toBe("shocked");
    expect(spriteFor("sad")).toBe("crying");
    for (const expression of Object.keys(FACES) as (keyof typeof FACES)[])
      expect(TOM_SPRITES[spriteFor(expression)]).toBeDefined();
  });
  it("provides A/B reactions for all fifteen questions and C for question eight", () => {
    expect(Object.keys(QUIZ_REACTIONS)).toHaveLength(15);
    for (const item of Object.values(QUIZ_REACTIONS)) {
      expect(item.A).toBeTruthy();
      expect(item.B).toBeTruthy();
    }
    expect(QUIZ_REACTIONS.q8.C).toBeTruthy();
  });
  it("reacts to the meaning of the chosen answer without changing correctness", () => {
    const correct = reactionFor({
      type: "QUESTION_ANSWER_CORRECT",
      questionId: "q1",
      answer: "A",
    });
    const wrong = reactionFor({
      type: "QUESTION_ANSWER_WRONG",
      questionId: "q1",
      answer: "B",
    });
    expect(correct.expression).toBe("blushing");
    expect(wrong.expression).toBe("shocked");
    expect(correct.dialogue).toBe(QUIZ_REACTIONS.q1.A.dialogue);
    expect(
      reactionFor({
        type: "QUESTION_ANSWER_CORRECT",
        questionId: "q5",
        answer: "B",
      }).gesture,
    ).toBe("facepalm");
    expect(
      reactionFor({
        type: "QUESTION_ANSWER_CORRECT",
        questionId: "q15",
        answer: "A",
      }).gesture,
    ).toBe("blow-kiss");
  });
  it("maps server correctness to distinct generic happy/wrong reactions", () => {
    expect(
      reactionFor({
        type: "QUESTION_ANSWER_CORRECT",
        questionId: "unknown",
        answer: "A",
      }).expression,
    ).toBe("happy");
    expect(
      reactionFor({
        type: "QUESTION_ANSWER_WRONG",
        questionId: "unknown",
        answer: "A",
      }).expression,
    ).toBe("pouting");
  });
  it("does not change business state or finalization on a presentation event", () => {
    let s = createPlaythrough();
    for (const a of [
      { type: "select_game", game: "dice" },
      { type: "show_rules" },
      { type: "start_game" },
    ] as const)
      s = transition(s, a);
    s = transition(
      s,
      { type: "roll", prediction: "even" },
      { randomInt: () => 0 },
    );
    const before = JSON.stringify(s);
    expect(
      eventAfter({ type: "roll", prediction: "even" }, publicView(s)),
    ).toEqual({ type: "DICE_WIN" });
    reactionFor({ type: "DICE_WIN" });
    expect(JSON.stringify(s)).toBe(before);
    expect(s.phase).toBe("reward");
    expect(s.final).toBeNull();
  });
});
describe("cancellable reaction controller", () => {
  it("lets disappointment become an encouraging smile, with a cancellable return to idle", () => {
    vi.useFakeTimers();
    const c = new ReactionController();
    c.dispatch({ type: "DICE_LOSS" });
    expect(c.getSnapshot()?.expression).toBe("sad");
    vi.advanceTimersByTime(3501);
    expect(c.getSnapshot()?.expression).toBe("happy");
    vi.advanceTimersByTime(2000);
    expect(c.getSnapshot()).toBeNull();
    c.dispose();
  });
  it("returns safely to baseline when its duration ends", () => {
    vi.useFakeTimers();
    const c = new ReactionController();
    c.dispatch({ type: "DICE_WIN" });
    expect(c.getSnapshot()?.expression).toBe("celebrating");
    vi.advanceTimersByTime(8001);
    expect(c.getSnapshot()).toBeNull();
    c.dispose();
  });
  it("replaces rapid events and ignores stale timers", () => {
    vi.useFakeTimers();
    const c = new ReactionController();
    c.dispatch({ type: "DICE_LOSS" });
    vi.advanceTimersByTime(1000);
    c.dispatch({ type: "QUIZ_PASSED" });
    vi.advanceTimersByTime(3000);
    expect(c.getSnapshot()?.event).toBe("QUIZ_PASSED");
    vi.advanceTimersByTime(5001);
    expect(c.getSnapshot()).toBeNull();
    c.dispose();
  });
  it("prioritizes gameplay over optional idle/poke reactions", () => {
    vi.useFakeTimers();
    const c = new ReactionController();
    c.dispatch({ type: "WHEEL_SPIN_START" });
    expect(c.dispatch({ type: "IDLE" })).toBe(false);
    expect(c.dispatch({ type: "POKE" })).toBe(false);
    expect(c.getSnapshot()?.expression).toBe("nervous");
    c.dispose();
  });
  it("cools optional reactions and allows new user input to interrupt a celebration", () => {
    vi.useFakeTimers();
    const c = new ReactionController();
    expect(c.dispatch({ type: "POKE" })).toBe(true);
    vi.advanceTimersByTime(4100);
    expect(c.dispatch({ type: "POKE" })).toBe(false);
    c.dispatch({ type: "QUIZ_PASSED" });
    c.dispatch({ type: "REWARD_SELECTED" });
    expect(c.getSnapshot()?.event).toBe("REWARD_SELECTED");
    c.dispose();
  });
  it("clears timers and subscriptions when disposed", () => {
    vi.useFakeTimers();
    const c = new ReactionController();
    const changed = vi.fn();
    const unsubscribe = c.subscribe(changed);
    c.dispatch({ type: "BEGGING_ACCEPTED" });
    expect(changed).toHaveBeenCalledTimes(1);
    unsubscribe();
    c.dispose();
    vi.advanceTimersByTime(10000);
    expect(c.getSnapshot()).toBeNull();
    expect(changed).toHaveBeenCalledTimes(1);
  });
});
