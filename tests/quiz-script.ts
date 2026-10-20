import { readFileSync } from "node:fs";
import { createPlaythrough, transition } from "../src/lib/game-rules/engine";
import { QUESTIONS } from "../src/data/questions";

export const approvedEnglish: Record<string, string> = JSON.parse(
  readFileSync("tests/quiz-approved-en.json", "utf8"),
);

/** Read-only audit of the author's script. Never writes or regenerates it. */
export function readQuizScript() {
  const markdown = readFileSync("QUIZ_DIALOGUE_SCRIPT.md", "utf8");
  const rows = [];
  for (const section of markdown
    .split("## Shared dialogue")[0]
    .split(/^### Question /m)
    .slice(1)) {
    const id = section.match(/Stable Question ID:\*\* `(q\d+)`/)![1];
    for (const block of section.split(/^#### When Aurora selects /m).slice(1)) {
      const field = (label: string) => {
        const found = block.match(
          new RegExp(`^- \\*\\*${label}:\\*\\* (.*)$`, "m"),
        );
        if (!found) throw new Error(`Missing ${id}.${block[0]} ${label}`);
        return found[1].trim();
      };
      const quoted = (label: string) => {
        const value = field(label);
        if (!value.startsWith('"') || !value.endsWith('"'))
          throw new Error(`Unquoted ${id}.${block[0]} ${label}`);
        return value.slice(1, -1);
      };
      rows.push({
        id,
        option: block[0] as "A" | "B" | "C",
        en: quoted("Dialogue — EN"),
        vi: quoted("Dialogue — VI"),
        expression: field("Configured expression").match(/`([^`]+)`/)![1],
        gesture: field("Configured gesture").match(/`([^`]+)`/)![1],
        effect: field("Decorative effect").match(/`([^`]+)`/)?.[1],
        sprite: field("Actual rendered sprite").match(/`([^`.]+)\.webp`/)![1],
        headingEn: quoted("Generic answer-panel heading — EN"),
        headingVi: quoted("Generic answer-panel heading — VI"),
      });
    }
  }
  return rows;
}

/** Test fixture only: place each stable ID first without changing production sampling. */
export function quizState(firstId: string) {
  let state = createPlaythrough();
  for (const action of [
    { type: "select_game", game: "quiz" },
    { type: "show_rules" },
    { type: "start_game" },
  ] as const)
    state = transition(state, action);
  state.quiz.attempts[0].questionIds = [
    firstId,
    ...QUESTIONS.filter((q) => q.id !== firstId)
      .slice(0, 9)
      .map((q) => q.id),
  ];
  return state;
}
