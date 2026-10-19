import { test, expect, type Page } from "@playwright/test";
import { createPlaythrough, transition } from "../src/lib/game-rules/engine";
import { QUESTIONS } from "../src/data/questions";
import type { GameId, PlaythroughState } from "../src/types/game";
const key = "aurora.standalone.v1";
async function observe(page: Page) {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api/"))
      failures.push(request.url());
  });
  page.on("response", (response) => {
    if (response.status() >= 400)
      failures.push(`${response.status()} ${response.url()}`);
  });
  await page.addInitScript(() => {
    Crypto.prototype.getRandomValues = function <
      T extends ArrayBufferView | null,
    >(array: T): T {
      if (array instanceof Uint32Array) array.fill(0);
      return array;
    };
  });
  return failures;
}
async function seed(page: Page, game: GameId, blockWrites = false) {
  let state = createPlaythrough();
  state = transition(state, { type: "select_game", game });
  state = transition(state, { type: "show_rules" });
  await page.addInitScript(
    ({ key, state, blockWrites }) => {
      if (!localStorage.getItem(key))
        localStorage.setItem(
          key,
          JSON.stringify({
            version: 1,
            unlocked: true,
            active: state,
            results: [],
          }),
        );
      if (blockWrites)
        Storage.prototype.setItem = () => {
          throw new DOMException("Storage unavailable", "QuotaExceededError");
        };
    },
    { key, state, blockWrites },
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Start Challenge" }).click();
}
async function verifyResult(page: Page) {
  await expect(page.locator(".finale")).toBeVisible();
  await expect(page.locator(".screenshot-note")).toContainText(
    "Take a screenshot and send it to Tom",
  );
  await expect(page.locator(".result-reference")).toContainText(
    /[0-9a-f-]{36}/,
  );
  await expect(page.locator(".result-card")).toContainText("ICT");
  await expect(page.locator(".demo-banner, .demo-stamp")).toHaveCount(0);
  await expect(page.locator(".finale")).not.toContainText(
    /email|saved on.*server|demo/i,
  );
}
async function reward(page: Page) {
  await page.getByRole("button", { name: "Next: Choose Your Reward" }).click();
  await page.getByRole("button", { name: /One special gift/ }).click();
  await page
    .getByLabel(/A gift you have your eye on/)
    .fill("Something thoughtful");
  await page.getByRole("button", { name: "Choose This Reward" }).click();
  await page.getByRole("button", { name: "Yes, This One!" }).click();
  await page.getByRole("button", { name: "Next: Our Little Ending" }).click();
  await verifyResult(page);
}
test("production welcome, actual assets, wheel result, reload and unlimited replay without backend", async ({
  page,
  request,
}) => {
  const failures = await observe(page);
  await page.goto("/");
  await expect(page.locator(".demo-banner")).toHaveCount(0);
  await page.getByLabel("Our secret password").fill("aurora");
  await page.getByRole("button", { name: "Unlock My Surprise" }).click();
  await expect(page.locator(".opening .polaroid")).toHaveCount(8);
  await expect
    .poll(() =>
      page
        .locator(".opening .polaroid img")
        .evaluateAll(
          (images) =>
            images.length === 8 &&
            images.every(
              (image) => (image as HTMLImageElement).naturalWidth > 0,
            ),
        ),
    )
    .toBe(true);
  await expect
    .poll(() =>
      page
        .getByTestId("background-music")
        .evaluate((el: HTMLAudioElement) => !el.paused && el.duration > 0),
    )
    .toBe(true);
  await page
    .getByRole("button", { name: "Open My Surprise" })
    .click({ timeout: 15000 });
  await expect(page.locator(".tom-sprite-stack")).toHaveAttribute(
    "data-sprite",
    "greeting",
  );
  await page.getByRole("button", { name: /Play, Tom!/ }).click();
  await page.getByRole("button", { name: /Lucky Wheel/ }).click();
  await page.getByRole("button", { name: "Play This Game" }).click();
  await page.getByRole("button", { name: "Start Challenge" }).click();
  await page.getByRole("button", { name: "Spin the Wheel" }).click();
  await page.getByRole("button", { name: "Keep This Reward" }).click();
  await page.getByRole("button", { name: "Next: Our Little Ending" }).click();
  await verifyResult(page);
  const before = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    key,
  );
  expect(before.results).toHaveLength(1);
  expect(before.active.final.reward).not.toBeNull();
  await page.reload();
  await page.getByRole("button", { name: "Next: Our Little Ending" }).click();
  await verifyResult(page);
  await page
    .getByRole("button", { name: "Look at Our Memories", exact: true })
    .click();
  await expect(page.locator(".memory-gallery img")).toHaveCount(8);
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Play Again" }).click();
  const after = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    key,
  );
  expect(after.active.id).not.toBe(before.active.id);
  expect(after.results[0].final.id).toBe(before.active.final.id);
  expect(failures).toEqual([]);
  expect((await request.post("/api/email/retry")).status()).toBe(404);
  expect((await request.get("/api/session")).status()).toBe(404);
});
test("production mobile dice win, unchanged Next/reward flow and local result", async ({
  page,
}) => {
  const failures = await observe(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await seed(page, "dice");
  await page.getByRole("button", { name: "Even", exact: true }).click();
  await page.getByRole("button", { name: "Roll the Dice" }).click();
  await expect(page.locator(".game-outcome.victory")).toBeVisible();
  await expect(page.locator(".reward-choice")).toHaveCount(0);
  await reward(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(failures).toEqual([]);
});
test("production quiz passes at unchanged score and saves selected reward", async ({
  page,
}) => {
  const failures = await observe(page);
  await seed(page, "quiz");
  for (let i = 0; i < 10; i++) {
    const active = await page.evaluate(
      (key) =>
        JSON.parse(localStorage.getItem(key)!).active as PlaythroughState,
      key,
    );
    const id =
      active.quiz.attempts.at(-1)!.questionIds[active.quiz.questionIndex];
    const answer = QUESTIONS.find((q) => q.id === id)!.correctAnswer;
    await page
      .locator(".quiz-options .answer")
      .filter({ hasText: new RegExp(`^${answer}`) })
      .click();
    await page
      .getByRole("button", { name: i === 9 ? "See My Score" : "Next Question" })
      .click();
  }
  await expect(page.locator(".victory-score")).toContainText("10");
  await reward(page);
  expect(failures).toEqual([]);
});
test("storage failure keeps dice playable with screenshot fallback", async ({
  page,
}) => {
  const failures = await observe(page);
  await seed(page, "dice", true);
  await page.getByRole("button", { name: "Even", exact: true }).click();
  await page.getByRole("button", { name: "Roll the Dice" }).click();
  await reward(page);
  await expect(page.locator(".screenshot-note")).toContainText(
    "only stay available while this page is open",
  );
  expect(failures).toEqual([]);
});
