import { test, expect, type Page } from "@playwright/test";
import { createPlaythrough, transition } from "../src/lib/game-rules/engine";
import { introductions } from "../src/data/dialogue";
import type { PlaythroughState } from "../src/types/game";
const key = "aurora.standalone.v1";
const previews = {
  wheel: "Quay thử xem anh chuẩn bị gì cho em nha 🤔",
  dice: "Làm tí nghiện ngập hong cô nương 🤑 Tưởng dễ nhưng không dễ đâu ku.",
  quiz: "Em nghĩ em hiểu hai đứa mình hơn anh hả? Tưởng dễ nhưng mà hong dễ đâu Ku🤭",
};
const dining = [
  "Hẹn hò ăn lẩu — Anh mời",
  "Hẹn hò ăn ngon — Anh mời",
  "Hẹn hò ăn nướng — Anh mời",
];
let keyWarnings: string[] = [];
test.beforeEach(async ({ page }) => {
  keyWarnings = [];
  page.on("console", (message) => {
    if (/unique.*key|same key|two children.*key/i.test(message.text()))
      keyWarnings.push(message.text());
  });
});
test.afterEach(() => expect(keyWarnings).toEqual([]));
async function seed(page: Page, state: PlaythroughState, random = 2) {
  await page.addInitScript(
    ({ state, key, random }) => {
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
      localStorage.setItem("aurora.language", "vi");
      Crypto.prototype.getRandomValues = function <
        T extends ArrayBufferView | null,
      >(array: T): T {
        if (array instanceof Uint32Array) array.fill(random);
        return array;
      };
    },
    { state, key, random },
  );
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
}
const language = async (page: Page, lang: "en" | "vi") =>
  page.locator(`.language-toggle button[lang="${lang}"]`).last().click();
function dicePlaying() {
  let state = createPlaythrough();
  for (const action of [
    { type: "select_game", game: "dice" },
    { type: "show_rules" },
    { type: "start_game" },
  ] as const)
    state = transition(state, action);
  return state;
}
test("exact previews and dismiss copy; full rules, wheel result and screenshot card use Anh mời", async ({
  page,
}) => {
  let state = createPlaythrough();
  state = transition(state, { type: "select_game", game: "wheel" });
  state = transition(state, { type: "show_rules" });
  await seed(page, state);
  await page.getByRole("button", { name: "Quay lại chọn trò" }).click();
  for (const game of ["dice", "quiz", "wheel"] as const) {
    await page.locator(`.game-card.${game}`).click();
    await expect(page.locator(".tom-speech p")).toHaveText(previews[game]);
    await language(page, "en");
    await expect(page.locator(".tom-speech p")).toHaveText(introductions[game]);
    await language(page, "vi");
    await expect(page.locator(".tom-speech p")).toHaveText(previews[game]);
  }
  await expect(
    page.getByRole("button", { name: "Ok, em hiểu òi", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Ok, em hiểu òi", exact: true })
    .click();
  await expect(page.locator(".tom-speech")).toHaveCount(0);
  await page.getByRole("button", { name: "Chơi trò này", exact: true }).click();
  for (const title of dining)
    await expect(page.locator(".rules-prizes")).toContainText(title);
  await page.getByRole("button", { name: "Bắt đầu thử thách" }).click();
  await page.getByRole("button", { name: "Quay thôi nào" }).click();
  await expect(page.locator(".game-feedback strong")).toHaveText(dining[0]);
  await expect(page.locator(".wheel-legend")).toContainText(dining[1]);
  await page.getByRole("button", { name: "Giữ món quà này" }).click();
  await expect(page.locator(".outcome-prize")).toHaveText(dining[0]);
  await page
    .getByRole("button", { name: "Tiếp: Lời thương cuối chương" })
    .click();
  await expect(page.locator(".result-reward")).toHaveText(dining[0]);
  await page.screenshot({
    path: "artifacts/content-hotpot-result-vi.png",
    fullPage: true,
  });
  await language(page, "en");
  await expect(page.locator(".result-reward")).toHaveText(
    "Hotpot Date — Your Choice",
  );
  await language(page, "vi");
  await expect(page.locator(".result-reward")).toHaveText(dining[0]);
  const stored = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    key,
  );
  expect(stored.results.at(-1).final.reward.id).toBe("hotpot");
  await expect(page.locator(".garden-decor .bloom")).toHaveCount(10);
});
test("self-choice dining descriptions, confirmation and final result preserve restaurant preferences", async ({
  page,
}) => {
  const state = transition(
    dicePlaying(),
    { type: "roll", prediction: "even" },
    { randomInt: () => 0 },
  );
  await seed(page, state);
  await page.getByRole("button", { name: "Tiếp: Chọn quà của em" }).click();
  for (const title of dining) {
    const card = page.locator(".reward-card").filter({ hasText: title });
    await expect(card.locator("p")).toHaveText(title);
    await card.click();
    await page
      .getByLabel("Em thích ăn ở quán nào?")
      .fill("Quán hai đứa mình thích");
    await page.getByRole("button", { name: "Chọn phần quà này" }).click();
    await expect(page.locator(".confirm-reward")).toContainText(title);
    await page.getByRole("button", { name: "Đóng cửa sổ" }).click();
  }
  await page.getByRole("button", { name: "Chọn phần quà này" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "artifacts/content-dining-confirmation-vi-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Chốt món này anh ơi!" }).click();
  await page
    .getByRole("button", { name: "Tiếp: Lời thương cuối chương" })
    .click();
  await expect(page.locator(".result-reward")).toHaveText(dining[2]);
  await expect(page.locator(".result-preference")).toContainText(
    "Quán hai đứa mình thích",
  );
});
test("quit buttons use exact copy and keep cancel/forfeit behavior", async ({
  page,
}) => {
  await seed(page, dicePlaying());
  await page
    .getByRole("button", { name: "Dừng lượt chơi này", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Em muốn dừng lượt chơi này hả?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Dạ, em muốn dừng cuộc chơi 😟",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Ở lại thêm chút", exact: true })
    .click();
  await expect(page.locator(".play-view")).toBeVisible();
  await page
    .getByRole("button", { name: "Dừng lượt chơi này", exact: true })
    .click();
  await language(page, "en");
  await expect(
    page.getByRole("button", { name: "Yes, End This Adventure", exact: true }),
  ).toBeVisible();
  await language(page, "vi");
  await page
    .getByRole("button", { name: "Dạ, em muốn dừng cuộc chơi 😟", exact: true })
    .click();
  await expect(page.locator(".game-outcome.comfort")).toBeVisible();
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).active.final.status,
      key,
    ),
  ).toBe("forfeited");
});
