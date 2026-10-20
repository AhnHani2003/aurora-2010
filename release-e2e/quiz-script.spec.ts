import { test, expect, type Page } from "@playwright/test";
import {
  approvedEnglish,
  readQuizScript,
  quizState,
} from "../tests/quiz-script";
import { QUESTIONS } from "../src/data/questions";
import type { PlaythroughState } from "../src/types/game";

const key = "aurora.standalone.v1";
const script = readQuizScript();
async function active(page: Page): Promise<PlaythroughState> {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!).active,
    key,
  );
}
async function language(page: Page, lang: "en" | "vi") {
  await page.locator(`.language-toggle button[lang="${lang}"]`).last().click();
  await expect(page.locator("html")).toHaveAttribute("lang", lang);
}
async function seed(page: Page, id: string) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (/unique.*key|same key|hydrati|did not match/i.test(m.text()))
      errors.push(m.text());
  });
  page.on("request", (r) => {
    if (new URL(r.url()).pathname.startsWith("/api/")) errors.push(r.url());
  });
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  await page.addInitScript(
    ({ key, state }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          unlocked: true,
          active: state,
          results: [],
        }),
      );
    },
    { key, state: quizState(id) },
  );
  await page.goto("/");
  await expect(page.locator(".question")).toBeVisible();
  return errors;
}

for (const row of script) {
  test(`${row.id}.${row.option}: Markdown → config → EN/VI bubble and unchanged answer`, async ({
    page,
  }) => {
    if (row.id === "q2" && row.option === "B")
      await page.setViewportSize({ width: 390, height: 844 });
    const errors = await seed(page, row.id);
    const before = await active(page);
    await page
      .locator(".quiz-options .answer")
      .filter({ hasText: new RegExp(`^${row.option}`) })
      .click();
    await expect(page.locator(".answer-feedback")).toBeVisible();
    const answer = await active(page);
    const correct =
      QUESTIONS.find((q) => q.id === row.id)!.correctAnswer === row.option;
    expect(answer.quiz.attempts[0].score).toBe(Number(correct));
    expect(answer.quiz.feedback?.answer).toBe(row.option);
    expect(answer.quiz.attempts[0].questionIds).toEqual(
      before.quiz.attempts[0].questionIds,
    );
    const finalEn =
      approvedEnglish[
        `${row.id}.${row.option}` as keyof typeof approvedEnglish
      ];
    await expect(page.locator(".tom-speech p")).toHaveText(finalEn);
    await expect(page.locator(".tom-character")).toHaveAttribute(
      "data-expression",
      row.expression,
    );
    await expect(page.locator(".tom-character")).toHaveAttribute(
      "data-gesture",
      row.gesture,
    );
    await expect(page.locator(".tom-sprite-stack")).toHaveAttribute(
      "data-sprite",
      row.sprite,
    );
    await expect(page.locator(".tom-reaction-particles")).toHaveCount(
      row.effect ? 1 : 0,
    );
    await language(page, "vi");
    await expect(page.locator(".tom-speech p")).toHaveText(row.vi);
    await expect(page.locator(".answer-feedback strong")).toHaveText(
      row.headingVi,
    );
    expect(await active(page)).toEqual(answer);
    await expect(page.locator(".quiz-options .answer.selected")).toHaveCount(1);
    await expect(
      page.locator(".quiz-options .answer.selected span"),
    ).toHaveText(row.option);
    if (
      (row.id === "q1" && row.option === "A") ||
      (row.id === "q2" && row.option === "B")
    )
      await page.screenshot({
        path: `artifacts/quiz-integrated-${row.id}-${row.option}-vi.png`,
        fullPage: true,
      });
    await language(page, "en");
    await expect(page.locator(".tom-speech p")).toHaveText(finalEn);
    expect(await active(page)).toEqual(answer);
    await page.getByRole("button", { name: "Next Question" }).click();
    await expect(page.locator(".tom-speech p")).not.toHaveText(finalEn);
    const next = await active(page);
    expect(next.quiz.questionIndex).toBe(1);
    expect(next.quiz.attempts[0].score).toBe(Number(correct));
    expect(next.quiz.attempts[0].questionIds).toEqual(
      before.quiz.attempts[0].questionIds,
    );
    expect(errors).toEqual([]);
  });
}

test("seven correct answers complete the quiz; held celebration, reward, local screenshot result and replay", async ({
  page,
}) => {
  const errors = await seed(page, "q1");
  for (let i = 0; i < 10; i++) {
    const state = await active(page);
    const id = state.quiz.attempts[0].questionIds[i];
    const q = QUESTIONS.find((q) => q.id === id)!;
    const option =
      i < 7
        ? q.correctAnswer
        : q.options.find((o) => o.label !== q.correctAnswer)!.label;
    await page
      .locator(".quiz-options .answer")
      .filter({ hasText: new RegExp(`^${option}`) })
      .click();
    await page
      .getByRole("button", { name: i === 9 ? "See My Score" : "Next Question" })
      .click();
  }
  await expect(page.locator(".game-outcome.victory")).toBeVisible();
  await expect(page.locator(".victory-score")).toContainText("7");
  await expect(page.locator(".tom-sprite-stack")).toHaveAttribute(
    "data-sprite",
    "excited",
  );
  await expect(page.locator(".reward-choice")).toHaveCount(0);
  await language(page, "vi");
  await page.screenshot({
    path: "artifacts/quiz-integrated-completed-vi.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Tiếp: Chọn quà của em" }).click();
  await page.getByRole("button", { name: /Ăn lẩu/ }).click();
  await page.getByRole("button", { name: "Chọn phần quà này" }).click();
  await page.getByRole("button", { name: "Chốt món này anh ơi!" }).click();
  await page
    .getByRole("button", { name: "Tiếp: Lời thương cuối chương" })
    .click();
  await expect(page.locator(".screenshot-note")).toContainText(
    "Em chụp màn hình gửi anh Tom nha",
  );
  const finished = await active(page);
  expect(finished.final?.reward?.id).toBe("hotpot");
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).results.length,
      key,
    ),
  ).toBe(1);
  await page.getByRole("button", { name: "Chơi lại nào" }).click();
  expect((await active(page)).id).not.toBe(finished.id);
  expect(errors).toEqual([]);
});
