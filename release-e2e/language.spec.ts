import { test, expect, type Page } from "@playwright/test";
import { createPlaythrough, transition } from "../src/lib/game-rules/engine";
import { QUESTIONS } from "../src/data/questions";
import type { GameId, PlaythroughState } from "../src/types/game";
const storageKey = "aurora.standalone.v1";
async function switchTo(page: Page, language: "en" | "vi") {
  await page
    .locator(`.language-toggle button[lang="${language}"]`)
    .last()
    .click();
  await expect(page.locator("html")).toHaveAttribute("lang", language);
}
async function active(page: Page): Promise<PlaythroughState> {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).active,
    storageKey,
  );
}
async function seed(page: Page, game: GameId, random = 0) {
  let state = createPlaythrough();
  for (const action of [
    { type: "select_game", game },
    { type: "show_rules" },
    { type: "start_game" },
  ] as const)
    state = transition(state, action);
  await page.addInitScript(
    ({ state, storageKey, random }) => {
      if (!localStorage.getItem(storageKey))
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            version: 1,
            unlocked: true,
            active: state,
            results: [],
          }),
        );
      Crypto.prototype.getRandomValues = function <
        T extends ArrayBufferView | null,
      >(array: T): T {
        if (array instanceof Uint32Array) array.fill(random);
        return array;
      };
    },
    { state, storageKey, random },
  );
  await page.goto("/");
  await expect(page.locator(".play-view")).toBeVisible();
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  // The header must also remain inside the viewport even when overflow is clipped.
  const toggle = await page.locator(".language-toggle").first().boundingBox();
  expect(toggle!.x).toBeGreaterThanOrEqual(0);
  expect(toggle!.x + toggle!.width).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
  const actions = await page.locator(".header-actions").boundingBox();
  expect(actions!.x + actions!.width).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
  const brand = await page.locator(".wordmark").boundingBox();
  expect(brand!.x + brand!.width).toBeLessThanOrEqual(toggle!.x);
}
test("English default, requested Vietnamese opening and five-second reveal unaffected by switching", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByLabel("Our secret password").fill("aurora");
  await page.getByRole("button", { name: "Unlock My Surprise" }).click();
  await expect(page.locator(".opening")).toBeVisible();
  const start = Date.now();
  await page.waitForTimeout(2000);
  await switchTo(page, "vi");
  await expect(page.locator(".opening h2")).toHaveText(
    "Chúc mừng ngày 20/10, Trân iu của anh! 💐",
  );
  await expect(page.locator(".greeting-copy")).toContainText(
    "Gương kia ngự ở trên tường",
  );
  await expect(page.locator(".greeting-copy")).toContainText(
    "người bạn trai vừa đẹp trai vừa tâm lý",
  );
  await expect(page.getByRole("button", { name: "Mở quà của em" })).toBeVisible(
    { timeout: 4200 },
  );
  expect(Date.now() - start).toBeGreaterThan(4300);
  expect(Date.now() - start).toBeLessThan(6500);
  await expect(page.locator(".reveal-scene")).toHaveCount(0);
  await page.getByRole("button", { name: "Mở quà của em" }).click();
  await expect(page.locator(".tom-speech")).toContainText(
    "Ú òa! Anh người yêu đẹp trai",
  );
  await page.getByRole("button", { name: "Lụm luôn" }).click();
  await expect(
    page.getByRole("heading", { name: "Vòng quay may mắn" }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await page.setViewportSize({ width: 320, height: 740 });
  await expect(page).toHaveTitle(
    "Một chút yêu, thật nhiều may mắn · Gửi Aurora",
  );
  await noOverflow(page);
  await switchTo(page, "en");
  await noOverflow(page);
  await switchTo(page, "vi");
});
test("quiz language switching keeps order, score, feedback, reaction and active question", async ({
  page,
}) => {
  await seed(page, "quiz");
  const before = await active(page);
  const question = QUESTIONS.find(
    (q) => q.id === before.quiz.attempts[0].questionIds[0],
  )!;
  await page
    .locator(".quiz-options .answer")
    .filter({ hasText: new RegExp(`^${question.correctAnswer}`) })
    .click();
  await expect(page.locator(".answer-feedback")).toBeVisible();
  const answered = await active(page);
  const expression = await page
    .locator(".tom-character")
    .getAttribute("data-expression");
  await switchTo(page, "vi");
  expect(await active(page)).toEqual(answered);
  await expect(page.locator(".question")).not.toHaveText(question.text);
  await expect(page.locator(".answer-feedback")).toContainText("Đáp án đúng:");
  await expect(page.locator(".tom-character")).toHaveAttribute(
    "data-expression",
    expression!,
  );
  await page.screenshot({
    path: "artifacts/bilingual-quiz-vi-desktop.png",
    fullPage: true,
  });
  await switchTo(page, "en");
  expect(await active(page)).toEqual(answered);
  await expect(page.locator(".question")).toHaveText(question.text);
  await switchTo(page, "vi");
  await page.getByRole("button", { name: "Câu tiếp theo" }).click();
  const next = await active(page);
  expect(next.quiz.attempts[0].questionIds).toEqual(
    before.quiz.attempts[0].questionIds,
  );
  expect(next.quiz.attempts[0].score).toBe(1);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  expect(await active(page)).toEqual(next);
  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow(page);
  await expect(page.locator(".adventure-layout")).toHaveCSS("opacity", "1");
  await page.screenshot({
    path: "artifacts/bilingual-quiz-vi-mobile.png",
    fullPage: true,
  });
});
test("wheel switches preserve spins; Vietnamese begging keeps draft, rejects 30 and accepts 31 words", async ({
  page,
}) => {
  await seed(page, "wheel", 5);
  for (let i = 0; i < 3; i++)
    await page
      .getByRole("button", {
        name: i ? "Spin Again" : "Spin the Wheel",
        exact: true,
      })
      .click();
  const before = await active(page);
  await switchTo(page, "vi");
  expect(await active(page)).toEqual(before);
  await expect(page.locator(".attempt-badge")).toContainText("3 / 5");
  await page.getByRole("button", { name: "Mở lượt quay tiếp" }).click();
  const draft = Array(30).fill("thương").join(" ");
  await page.getByLabel("Lời năn nỉ đáng yêu nhất của em").fill(draft);
  await expect(page.locator(".word-count")).toHaveText("30 / 31 từ tối thiểu");
  await expect(
    page.getByRole("button", { name: "Năn nỉ thành công chưa anh?" }),
  ).toBeDisabled();
  await switchTo(page, "en");
  await expect(page.getByLabel("Your most convincing words")).toHaveValue(
    draft,
  );
  await expect(page.getByRole("dialog")).toContainText("message in English");
  expect(await active(page)).toEqual(before);
  await switchTo(page, "vi");
  await expect(page.getByRole("dialog")).toContainText("bằng tiếng Việt");
  await page.getByLabel("Lời năn nỉ đáng yêu nhất của em").fill(draft + " nhé");
  await expect(page.locator(".word-count")).toHaveText("31 / 31 từ tối thiểu");
  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow(page);
  await page.screenshot({
    path: "artifacts/bilingual-begging-vi-mobile.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Năn nỉ thành công chưa anh?" })
    .click();
  const unlocked = await active(page);
  expect(unlocked.wheel.spins).toHaveLength(3);
  expect(unlocked.begging).toHaveLength(1);
  expect(unlocked.begging[0].wordCount).toBe(31);
  await expect(page.locator(".tom-speech")).toContainText(
    "Cho em thêm một lượt",
  );
  await page.getByRole("button", { name: "Quay lần nữa", exact: true }).click();
  expect((await active(page)).wheel.spins).toHaveLength(4);
});
test("dice switches preserve attempts and prediction; rewards, ending and replay stay Vietnamese", async ({
  page,
}) => {
  await seed(page, "dice");
  await page.getByRole("button", { name: "Odd", exact: true }).click();
  await page.getByRole("button", { name: "Roll the Dice" }).click();
  await expect(page.locator(".game-feedback")).toContainText("1 + 1 = 2");
  const before = await active(page);
  await switchTo(page, "vi");
  expect(await active(page)).toEqual(before);
  await expect(
    page.getByRole("button", { name: "Lẻ", exact: true }),
  ).toHaveClass(/selected/);
  await page.getByRole("button", { name: "Chẵn", exact: true }).click();
  await page.getByRole("button", { name: "Lắc xúc xắc", exact: true }).click();
  await expect(page.locator(".game-outcome.victory")).toBeVisible();
  await expect(page.locator(".tom-sprite-stack")).toHaveAttribute(
    "data-sprite",
    "excited",
  );
  await page.getByRole("button", { name: "Tiếp: Chọn quà của em" }).click();
  await page.getByRole("button", { name: /Một món quà đặc biệt/ }).click();
  await page
    .getByLabel("Em đang thích món quà nào hả?")
    .fill("Một bó hoa hồng");
  await page.getByRole("button", { name: "Chọn phần quà này" }).click();
  await page.getByRole("button", { name: "Chốt món này anh ơi!" }).click();
  await page
    .getByRole("button", { name: "Tiếp: Lời thương cuối chương" })
    .click();
  await expect(page.locator(".result-preference")).toContainText(
    "Một bó hoa hồng",
  );
  await expect(page.locator(".screenshot-note")).toContainText(
    "Em chụp màn hình gửi anh Tom nha",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow(page);
  await page.screenshot({
    path: "artifacts/bilingual-ending-vi-mobile.png",
    fullPage: true,
  });
  const result = await active(page);
  await switchTo(page, "en");
  expect(await active(page)).toEqual(result);
  await switchTo(page, "vi");
  await page.getByRole("button", { name: "Chơi lại nào" }).click();
  expect((await active(page)).id).not.toBe(result.id);
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
});
