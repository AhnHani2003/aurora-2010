import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { translate, translateText, type TranslationKey } from "./translate";
import { localizeTree } from "@/components/i18n/LanguageProvider";
import { QUESTIONS } from "@/data/questions";
import { WHEEL_REWARDS, SELF_CHOICE_REWARDS } from "@/data/rewards";
import { photos } from "@/data/photos";
import { greeting, introductions } from "@/data/dialogue";
import { QUIZ_REACTIONS } from "@/data/character-dialogue";
import { FACES } from "@/components/character/model";
import { createPlaythrough, transition } from "@/lib/game-rules/engine";
import { countWords } from "@/lib/words";
import { readFileSync } from "node:fs";
import ts from "typescript";
const translated = (value: string) =>
  expect(translateText(value, "vi"), value).not.toBe(value);
describe("complete bilingual presentation", () => {
  it("localizes all fifteen questions without changing IDs, options or correct answers", () => {
    expect(QUESTIONS.map((q) => q.id)).toEqual(
      Array.from({ length: 15 }, (_, i) => `q${i + 1}`),
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
    for (const question of QUESTIONS) translated(question.text);
    expect(translateText("Both of them", "vi")).toBe("Cả hai");
  });
  it("has copy for every reward, photo, opening and question-specific reaction", () => {
    for (const reward of [...WHEEL_REWARDS, ...SELF_CHOICE_REWARDS])
      if (reward)
        for (const value of [
          reward.title,
          reward.description,
          reward.shortLabel,
        ])
          translated(value);
    for (const photo of photos) translated(photo.caption);
    for (const value of [
      greeting.headline,
      greeting.signature,
      ...greeting.lines,
      ...Object.values(introductions),
    ])
      translated(value);
    for (const answers of Object.values(QUIZ_REACTIONS))
      for (const answer of Object.values(answers)) {
        expect(answer.dialogueVi).toBeTruthy();
        expect(answer.dialogueVi).not.toBe(answer.dialogue);
      }
    for (const face of Object.values(FACES)) translated(face.label);
  });
  it("covers static visible text and accessibility labels in every localized component", () => {
    const files = [
      "Experience",
      "game-hub/GameHub",
      "games/GameRules",
      "games/GamePanel",
      "games/GameOutcome",
      "rewards/RewardChoice",
      "results/Finale",
      "garden/PhotoCard",
      "character/TomCharacter",
      "shared/Modal",
    ];
    const properNames = new Set([
      "Tom",
      "Aurora",
      "Jungkook",
      "TOM",
      "TOM & AURORA",
      "ICT",
    ]);
    const decode = (s: string) =>
      s
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
        .replaceAll("&amp;", "&");
    for (const file of files) {
      const source = ts.createSourceFile(
        file,
        readFileSync(`src/components/${file}.tsx`, "utf8"),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      function visit(node: ts.Node) {
        if (ts.isJsxText(node)) {
          const value = decode(node.text.replace(/\s+/g, " ").trim());
          if (/[a-z]/i.test(value) && !properNames.has(value))
            translated(value);
        }
        if (
          ts.isJsxAttribute(node) &&
          ["aria-label", "alt", "title", "placeholder"].includes(
            node.name.getText(source),
          ) &&
          node.initializer &&
          ts.isStringLiteral(node.initializer)
        )
          translated(node.initializer.text);
        ts.forEachChild(node, visit);
      }
      visit(source);
    }
  });
  it("keeps element identity, handlers, input values and user-authored copy intact", () => {
    const onClick = () => {};
    const original = createElement(
      "button",
      { key: "stable", onClick, title: "Play Again" },
      "Play Again",
    );
    const result = localizeTree(original, "vi") as typeof original;
    expect(result.type).toBe(original.type);
    expect(result.key).toBe(original.key);
    expect(result.props.onClick).toBe(onClick);
    expect((result.props as { children?: unknown }).children).toBe(
      "Chơi lại nào",
    );
    const input = createElement("input", {
      value: "One gift",
      placeholder: "A little hint for Tom…",
    });
    expect((localizeTree(input, "vi") as typeof input).props.value).toBe(
      "One gift",
    );
    const wish = createElement(
      "span",
      { "data-l10n-ignore": true },
      "Play Again",
    );
    expect(localizeTree(wish, "vi")).toBe(wish);
  });
  it("supports typed translation keys and English defaults", () => {
    const key: TranslationKey = "Play Again";
    expect(translate(key, "en")).toBe(key);
    expect(translate(key, "vi")).toBe("Chơi lại nào");
    expect(
      translateText("Tom, your illustrated boyfriend — Crying", "vi"),
    ).toContain("Mít ướt");
  });
  it("keeps static siblings and keyed lists on identical key paths across EN/VI", () => {
    const tree = [
      createElement("div", null, "Play Again"),
      [
        createElement("span", { key: "hotpot" }, "Hotpot date"),
        createElement("span", { key: "bbq" }, "BBQ date"),
      ],
      createElement("p", null, "Got it, Tom"),
    ];
    const en = localizeTree(tree, "en") as ReturnType<typeof createElement>[];
    const vn = localizeTree(tree, "vi") as ReturnType<typeof createElement>[];
    expect(en.map((child) => child.key)).toEqual(vn.map((child) => child.key));
    expect(en.every((child) => child.key !== null)).toBe(true);
    expect(new Set(en.map((child) => child.key)).size).toBe(4);
  });
  it("uses the exact requested preview, confirmation and dining copy without changing English", () => {
    expect(translateText(introductions.dice, "vi")).toBe(
      "Làm tí nghiện ngập hong cô nương 🤑 Tưởng dễ nhưng không dễ đâu ku.",
    );
    expect(translateText(introductions.wheel, "vi")).toBe(
      "Quay thử xem anh chuẩn bị gì cho em nha 🤔",
    );
    expect(translateText(introductions.quiz, "vi")).toBe(
      "Em nghĩ em hiểu hai đứa mình hơn anh hả? Tưởng dễ nhưng mà hong dễ đâu Ku🤭",
    );
    for (const intro of Object.values(introductions))
      expect(translateText(intro, "en")).toBe(intro);
    expect(translateText("Got it, Tom", "vi")).toBe("Ok, em hiểu òi");
    expect(translateText("Yes, End This Adventure", "vi")).toBe(
      "Dạ, em muốn dừng cuộc chơi 😟",
    );
    expect(translateText("Stay a Little", "vi")).toBe("Ở lại thêm chút");
    const expected = {
      hotpot: "Hẹn hò ăn lẩu — Anh mời",
      restaurant: "Hẹn hò ăn ngon — Anh mời",
      bbq: "Hẹn hò ăn nướng — Anh mời",
    };
    for (const reward of SELF_CHOICE_REWARDS)
      if (reward.id in expected) {
        expect(translateText(reward.title, "vi")).toBe(
          expected[reward.id as keyof typeof expected],
        );
        expect(translateText(reward.description, "vi")).toBe(
          expected[reward.id as keyof typeof expected],
        );
        expect(translateText(reward.title, "en")).toBe(reward.title);
      }
  });
});
it("accepts 31 Vietnamese words, rejects 30, and unlocks only the intended bonus attempt", () => {
  const thirty = Array(30).fill("thương").join(" "),
    enough = thirty + " nhé";
  expect(countWords(" \n ")).toBe(0);
  expect(countWords(thirty)).toBe(30);
  expect(countWords(enough)).toBe(31);
  expect(countWords(enough.normalize("NFD"))).toBe(31);
  let state = createPlaythrough();
  for (const action of [
    { type: "select_game", game: "wheel" },
    { type: "show_rules" },
    { type: "start_game" },
  ] as const)
    state = transition(state, action);
  for (let i = 0; i < 3; i++)
    state = transition(state, { type: "spin" }, { randomInt: () => 5 });
  expect(() =>
    transition(state, { type: "unlock_attempt", message: thirty }),
  ).toThrow(/31/);
  const next = transition(state, { type: "unlock_attempt", message: enough });
  expect(next.wheel.spins).toEqual(state.wheel.spins);
  expect(next.begging).toHaveLength(1);
  expect(next.begging[0].wordCount).toBe(31);
  expect(next.begging[0].attempt).toBe(4);
});
