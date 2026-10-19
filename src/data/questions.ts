import type { AnswerLabel, Question } from "@/types/game";

const couple = [
  { label: "A" as const, text: "Tom" },
  { label: "B" as const, text: "Aurora" },
];
function question(
  id: string,
  text: string,
  correctAnswer: AnswerLabel,
  options = couple,
): Question {
  return { id, text, correctAnswer, options };
}

/** Server-only answer bank. Never import this module into a client component. */
export const QUESTIONS: Question[] = [
  question("q1", "Who loves the other more?", "A"),
  question("q2", "Who takes better photos?", "A"),
  question("q3", "Who is more adorable?", "B"),
  question("q4", "Who is more annoying?", "B"),
  question("q5", "Who's more handsome, Tom or Jungkook?", "B", [
    { label: "A", text: "Tom" },
    { label: "B", text: "Jungkook" },
  ]),
  question("q6", "Who's better-looking, Tom or Aurora?", "B"),
  question("q7", "Who gets sulky more easily?", "B"),
  {
    id: "q8",
    text: "Who misses the other more when they're apart?",
    correctAnswer: "C",
    options: [...couple, { label: "C", text: "Both of them" }],
  },
  question("q9", "Who's more childish in the relationship?", "A"),
  question("q10", "Who gets jealous more often but refuses to admit it?", "B"),
  question("q11", "Who loves cuddles and being spoiled more?", "A"),
  question("q12", "Who loves teasing the other until they get annoyed?", "A"),
  question("q13", "Who's more romantic in the relationship?", "A"),
  question(
    "q14",
    "Who's more likely to spend all their money while shopping?",
    "A",
  ),
  question(
    "q15",
    "Who would ask for a kiss first when they're about to meet?",
    "A",
  ),
];
