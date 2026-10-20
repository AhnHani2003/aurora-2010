# LOVE QUIZ — COMPLETE IMPLEMENTED EN / VI INTERACTION SCRIPT

This is an editable reference extracted from the current source after the requested content fixes. Editing this Markdown does **not** change the website until the edits are explicitly applied to its configuration. No dialogue in this document is a future recommendation.

## Reading and editing this script

- Q01–Q15 below are review headings only. The **real stable IDs are `q1`–`q15`**. Do not replace them with the headings, translate them, reorder A/B/C, or change the official answer keys.
- A playthrough draws ten unique questions from the fifteen-question bank. Question sampling/order is randomized. **Per-answer dialogue is deterministic**; there are no random dialogue variants.
- All **31 implemented options** have their own contextual dialogue (two per question, plus C on q8). No current per-option dialogue is missing. Generic fallbacks are documented separately; they are not extra randomized variants.
- Passing remains **7/10**. Attempts remain 1 free, 2 a free retry, 3 unlocked by a new begging message of at least 31 whitespace-separated words. This document does not change any rule.
- English answer dialogue, expression and gesture are already centralized in typed `QUIZ_REACTIONS` in `src/data/character-dialogue.ts`. Vietnamese is centralized in the typed `dialogueVi` dictionary in `src/lib/i18n/dialogue.ts`, keyed by that exact English line. Shared UI strings remain in their existing components and Vietnamese dictionaries. No risky consolidation/refactor was needed.
- The semantic expression/gesture labels are **not** proof of independent facial or arm animation. The runtime switches among eight whole extracted sprites using `spriteFor()` in `src/components/character/sprites.ts`. Every answer below states the actual sprite and any approximation. There is no invented waving/kissing/pointing animation.
- After submission, feedback is locked to one answer until Next Question. A contextual Tom bubble may disagree jokingly with correctness; the official key and score do not change. A reaction normally lasts up to six seconds, then returns to baseline. Next clears/intercepts the old reaction, so it may be shorter. Reduced motion retains the sprite but disables decorative movement/effects.
- Change the dialogue bullets you want to revise and keep the stable question/option IDs with them. To apply later: update `QUIZ_REACTIONS.<id>.<option>` for English/expression/gesture, update its exact English-keyed Vietnamese entry, and update shared UI translations only when you intend to change shared feedback.

## Official answer overview

| Review heading | Actual ID | Correct label | Correct option EN / VI |
| --- | --- | --- | --- |
| Q01 | `q1` | A | Tom / Tom |
| Q02 | `q2` | A | Tom / Tom |
| Q03 | `q3` | B | Aurora / Aurora |
| Q04 | `q4` | B | Aurora / Aurora |
| Q05 | `q5` | B | Jungkook / Jungkook |
| Q06 | `q6` | B | Aurora / Aurora |
| Q07 | `q7` | B | Aurora / Aurora |
| Q08 | `q8` | C | Both of them / Cả hai |
| Q09 | `q9` | A | Tom / Tom |
| Q10 | `q10` | B | Aurora / Aurora |
| Q11 | `q11` | A | Tom / Tom |
| Q12 | `q12` | A | Tom / Tom |
| Q13 | `q13` | A | Tom / Tom |
| Q14 | `q14` | A | Tom / Tom |
| Q15 | `q15` | A | Tom / Tom |

### Question 1 (Q01) — Who loves the other more?

**Stable Question ID:** `q1`

**English:** Who loves the other more?

**Vietnamese:** Ai yêu người kia nhiều hơn?

**Answer options:**

- **A.** EN: Tom · VI: Tom
- **B.** EN: Aurora · VI: Aurora

**Correct answer:** A — EN: Tom · VI: Tom

**Question source:** `src/data/questions.ts` → `QUESTIONS.find(q => q.id === "q1")` → `text`, `options`, `correctAnswer`.
**Vietnamese question source:** `src/lib/i18n/questions.ts` → `questionVi["Who loves the other more?"]`.

#### When Aurora selects A — Tom

- **Feedback type:** Correct (+1).
- **Dialogue — EN:** "Of course! My love for you is literally unlimited!"
- **Dialogue — VI:** "Đúng rồi! Anh yêu em nhất nhất nhất. Câu này phải thuộc lòng chứ 🤭"
- **Configured expression:** `blushing`.
- **Configured gesture:** `heart` (semantic presentation metadata).
- **Actual rendered sprite:** `happy.webp` — eyes-closed smile with clapping hands.
- **Gesture rendering:** **approximation** — the requested `heart` is not a separate animated limb gesture. The visible pose is the eyes-closed smile with clapping hands sprite above.
- **Decorative effect:** `hearts` particles (disabled by reduced motion).
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "You know us so well! ♡"
- **Generic answer-panel heading — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Correct-answer reveal — EN:** "Correct answer: A. Tom"
- **Correct-answer reveal — VI:** "Đáp án đúng: A. Tom"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q1.A`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["Of course! My love for you is literally unlimited!"]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

#### When Aurora selects B — Aurora

- **Feedback type:** Incorrect (+0).
- **Dialogue — EN:** "Excuse me?! Have you SEEN how obsessed I am with you?"
- **Dialogue — VI:** "Ơ kìa?! Ai nói yêu nhiều hơn? Là ai???"
- **Configured expression:** `shocked`.
- **Configured gesture:** `point` (semantic presentation metadata).
- **Actual rendered sprite:** `shocked.webp` — surprised facepalm.
- **Gesture rendering:** **approximation** — the requested `point` is not a separate animated limb gesture. The visible pose is the surprised facepalm sprite above.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "A tiny plot twist…"
- **Generic answer-panel heading — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"
- **Correct-answer reveal — EN:** "Correct answer: A. Tom"
- **Correct-answer reveal — VI:** "Đáp án đúng: A. Tom"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q1.B`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["Excuse me?! Have you SEEN how obsessed I am with you?"]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

**Generic messages (for review):**

- **Correct-answer panel — EN:** "You know us so well! ♡"
- **Correct-answer panel — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Wrong-answer panel — EN:** "A tiny plot twist…"
- **Wrong-answer panel — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"

**Randomized or fallback dialogue for this question:** none while the configured `QUIZ_REACTIONS.q1` entries exist. See the shared fallback section for the exact generic reaction used if a future entry is missing.

### Question 2 (Q02) — Who takes better photos?

**Stable Question ID:** `q2`

**English:** Who takes better photos?

**Vietnamese:** Ai chụp hình đẹp hơn?

**Answer options:**

- **A.** EN: Tom · VI: Tom
- **B.** EN: Aurora · VI: Aurora

**Correct answer:** A — EN: Tom · VI: Tom

**Question source:** `src/data/questions.ts` → `QUESTIONS.find(q => q.id === "q2")` → `text`, `options`, `correctAnswer`.
**Vietnamese question source:** `src/lib/i18n/questions.ts` → `questionVi["Who takes better photos?"]`.

#### When Aurora selects A — Tom

- **Feedback type:** Correct (+1).
- **Dialogue — EN:** "Finally! Someone appreciates my photography skills!"
- **Dialogue — VI:** "Cuối cùng cũng có người công nhận tay nghề nhiếp ảnh gia riêng của em rồi!"
- **Configured expression:** `smug`.
- **Configured gesture:** `thumbs-up` (semantic presentation metadata).
- **Actual rendered sprite:** `proud.webp` — wink and thumbs up.
- **Gesture rendering:** the complete sprite pose matches the requested gesture; limbs are not independently animated.
- **Decorative effect:** `hearts` particles (disabled by reduced motion).
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "You know us so well! ♡"
- **Generic answer-panel heading — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Correct-answer reveal — EN:** "Correct answer: A. Tom"
- **Correct-answer reveal — VI:** "Đáp án đúng: A. Tom"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q2.A`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["Finally! Someone appreciates my photography skills!"]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

#### When Aurora selects B — Aurora

- **Feedback type:** Incorrect (+0).
- **Dialogue — EN:** "My camera roll would like to submit a formal appeal. You are still my favorite subject."
- **Dialogue — VI:** "Trong máy của anh ảnh ai đẹp hơn. Là em! Vậy người chụp đẹp hơn chính là anh."
- **Configured expression:** `pouting`.
- **Configured gesture:** `cross-arms` (semantic presentation metadata).
- **Actual rendered sprite:** `angry.webp` — playfully angry pointing pose.
- **Gesture rendering:** **approximation** — the requested `cross-arms` is not a separate animated limb gesture. The visible pose is the playfully angry pointing pose sprite above.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "A tiny plot twist…"
- **Generic answer-panel heading — VI:** "Ơ kìa! Em có chê anh đúng hong 😡"
- **Correct-answer reveal — EN:** "Correct answer: A. Tom"
- **Correct-answer reveal — VI:** "Đáp án đúng: A. Tom"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q2.B`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["My camera roll would like to submit a formal appeal. You are still my favorite subject."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

**Generic messages (for review):**

- **Correct-answer panel — EN:** "You know us so well! ♡"
- **Correct-answer panel — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Wrong-answer panel — EN:** "A tiny plot twist…"
- **Wrong-answer panel — VI:** "Ơ kìa! Em chê anh đúng hong 😡"

**Randomized or fallback dialogue for this question:** none while the configured `QUIZ_REACTIONS.q2` entries exist. See the shared fallback section for the exact generic reaction used if a future entry is missing.

### Question 3 (Q03) — Who is more adorable?

**Stable Question ID:** `q3`

**English:** Who is more adorable?

**Vietnamese:** Ai đáng yêu hơn?

**Answer options:**

- **A.** EN: Tom · VI: Tom
- **B.** EN: Aurora · VI: Aurora

**Correct answer:** B — EN: Aurora · VI: Aurora

**Question source:** `src/data/questions.ts` → `QUESTIONS.find(q => q.id === "q3")` → `text`, `options`, `correctAnswer`.
**Vietnamese question source:** `src/lib/i18n/questions.ts` → `questionVi["Who is more adorable?"]`.

#### When Aurora selects A — Tom

- **Feedback type:** Incorrect (+0).
- **Dialogue — EN:** "A tempting answer. But even my ego knows you are the adorable one."
- **Dialogue — VI:** "Nghe cũng thích đó. Nhưng anh có tự luyến mấy cũng biết em mới là người đáng yêu nhất."
- **Configured expression:** `smug`.
- **Configured gesture:** `point` (semantic presentation metadata).
- **Actual rendered sprite:** `proud.webp` — wink and thumbs up.
- **Gesture rendering:** **approximation** — the requested `point` is not a separate animated limb gesture. The visible pose is the wink and thumbs up sprite above.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "A tiny plot twist…"
- **Generic answer-panel heading — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"
- **Correct-answer reveal — EN:** "Correct answer: B. Aurora"
- **Correct-answer reveal — VI:** "Đáp án đúng: B. Aurora"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q3.A`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["A tempting answer. But even my ego knows you are the adorable one."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

#### When Aurora selects B — Aurora

- **Feedback type:** Correct (+1).
- **Dialogue — EN:** "Correct. Dangerously adorable. I never stood a chance."
- **Dialogue — VI:** "Chính xác. Em đáng yêu nhất trên đời hẹ hẹ 🤭"
- **Configured expression:** `happy`.
- **Configured gesture:** `heart` (semantic presentation metadata).
- **Actual rendered sprite:** `happy.webp` — eyes-closed smile with clapping hands.
- **Gesture rendering:** **approximation** — the requested `heart` is not a separate animated limb gesture. The visible pose is the eyes-closed smile with clapping hands sprite above.
- **Decorative effect:** `hearts` particles (disabled by reduced motion).
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "You know us so well! ♡"
- **Generic answer-panel heading — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Correct-answer reveal — EN:** "Correct answer: B. Aurora"
- **Correct-answer reveal — VI:** "Đáp án đúng: B. Aurora"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q3.B`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["Correct. Dangerously adorable. I never stood a chance."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

**Generic messages (for review):**

- **Correct-answer panel — EN:** "You know us so well! ♡"
- **Correct-answer panel — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Wrong-answer panel — EN:** "A tiny plot twist…"
- **Wrong-answer panel — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"

**Randomized or fallback dialogue for this question:** none while the configured `QUIZ_REACTIONS.q3` entries exist. See the shared fallback section for the exact generic reaction used if a future entry is missing.

### Question 4 (Q04) — Who is more annoying?

**Stable Question ID:** `q4`

**English:** Who is more annoying?

**Vietnamese:** Ai đáng ghét hơn?

**Answer options:**

- **A.** EN: Tom · VI: Tom
- **B.** EN: Aurora · VI: Aurora

**Correct answer:** B — EN: Aurora · VI: Aurora

**Question source:** `src/data/questions.ts` → `QUESTIONS.find(q => q.id === "q4")` → `text`, `options`, `correctAnswer`.
**Vietnamese question source:** `src/lib/i18n/questions.ts` → `questionVi["Who is more annoying?"]`.

#### When Aurora selects A — Tom

- **Feedback type:** Incorrect (+0).
- **Dialogue — EN:** "Me? Annoying? I prefer romantically persistent."
- **Dialogue — VI:** "Anh mà đáng ghét hả? Chỗ nào cũng yêu em mà ghét ngta."
- **Configured expression:** `shocked`.
- **Configured gesture:** `facepalm` (semantic presentation metadata).
- **Actual rendered sprite:** `shocked.webp` — surprised facepalm.
- **Gesture rendering:** the complete sprite pose matches the requested gesture; limbs are not independently animated.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "A tiny plot twist…"
- **Generic answer-panel heading — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"
- **Correct-answer reveal — EN:** "Correct answer: B. Aurora"
- **Correct-answer reveal — VI:** "Đáp án đúng: B. Aurora"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q4.A`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["Me? Annoying? I prefer romantically persistent."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

#### When Aurora selects B — Aurora

- **Feedback type:** Correct (+1).
- **Dialogue — EN:** "My cutest little troublemaker. I would choose your chaos every time."
- **Dialogue — VI:** "Em hơi lì, hơi dữ xíu hoi nhưng mà vẫn yêu em nhiều 😘"
- **Configured expression:** `laughing`.
- **Configured gesture:** `clap` (semantic presentation metadata).
- **Actual rendered sprite:** `happy.webp` — eyes-closed smile with clapping hands.
- **Gesture rendering:** the complete sprite pose matches the requested gesture; limbs are not independently animated.
- **Decorative effect:** `hearts` particles (disabled by reduced motion).
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "You know us so well! ♡"
- **Generic answer-panel heading — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Correct-answer reveal — EN:** "Correct answer: B. Aurora"
- **Correct-answer reveal — VI:** "Đáp án đúng: B. Aurora"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q4.B`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["My cutest little troublemaker. I would choose your chaos every time."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

**Generic messages (for review):**

- **Correct-answer panel — EN:** "You know us so well! ♡"
- **Correct-answer panel — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Wrong-answer panel — EN:** "A tiny plot twist…"
- **Wrong-answer panel — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"

**Randomized or fallback dialogue for this question:** none while the configured `QUIZ_REACTIONS.q4` entries exist. See the shared fallback section for the exact generic reaction used if a future entry is missing.

### Question 5 (Q05) — Who's more handsome, Tom or Jungkook?

**Stable Question ID:** `q5`

**English:** Who's more handsome, Tom or Jungkook?

**Vietnamese:** Giữa Tom và Jungkook, ai đẹp trai hơn?

**Answer options:**

- **A.** EN: Tom · VI: Tom
- **B.** EN: Jungkook · VI: Jungkook

**Correct answer:** B — EN: Jungkook · VI: Jungkook

**Question source:** `src/data/questions.ts` → `QUESTIONS.find(q => q.id === "q5")` → `text`, `options`, `correctAnswer`.
**Vietnamese question source:** `src/lib/i18n/questions.ts` → `questionVi["Who's more handsome, Tom or Jungkook?"]`.

#### When Aurora selects A — Tom

- **Feedback type:** Incorrect (+0).
- **Dialogue — EN:** "Incorrect, but excellent boyfriend morale. Please keep the compliments coming."
- **Dialogue — VI:** "Sai đáp án nhưng mà cũng cũng đi. Em cứ khen tiếp đi, anh chịu được 🤭"
- **Configured expression:** `blushing`.
- **Configured gesture:** `thumbs-up` (semantic presentation metadata).
- **Actual rendered sprite:** `happy.webp` — eyes-closed smile with clapping hands.
- **Gesture rendering:** **approximation** — the requested `thumbs-up` is not a separate animated limb gesture. The visible pose is the eyes-closed smile with clapping hands sprite above.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "A tiny plot twist…"
- **Generic answer-panel heading — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"
- **Correct-answer reveal — EN:** "Correct answer: B. Jungkook"
- **Correct-answer reveal — VI:** "Đáp án đúng: B. Jungkook"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q5.A`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["Incorrect, but excellent boyfriend morale. Please keep the compliments coming."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

#### When Aurora selects B — Jungkook

- **Feedback type:** Correct (+1).
- **Dialogue — EN:** "Wow. Betrayed by my own girlfriend. I need a moment."
- **Dialogue — VI:** "Nên anh lùi bước về sau... Cho anh một phút ôm trái tim vụn vỡ này rồi mình chơi tiếp nha 😖"
- **Configured expression:** `shocked`.
- **Configured gesture:** `facepalm` (semantic presentation metadata).
- **Actual rendered sprite:** `shocked.webp` — surprised facepalm.
- **Gesture rendering:** the complete sprite pose matches the requested gesture; limbs are not independently animated.
- **Decorative effect:** `hearts` particles (disabled by reduced motion).
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "You know us so well! ♡"
- **Generic answer-panel heading — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Correct-answer reveal — EN:** "Correct answer: B. Jungkook"
- **Correct-answer reveal — VI:** "Đáp án đúng: B. Jungkook"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q5.B`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["Wow. Betrayed by my own girlfriend. I need a moment."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

**Generic messages (for review):**

- **Correct-answer panel — EN:** "You know us so well! ♡"
- **Correct-answer panel — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Wrong-answer panel — EN:** "A tiny plot twist…"
- **Wrong-answer panel — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"

**Randomized or fallback dialogue for this question:** none while the configured `QUIZ_REACTIONS.q5` entries exist. See the shared fallback section for the exact generic reaction used if a future entry is missing.

### Question 6 (Q06) — Who's better-looking, Tom or Aurora?

**Stable Question ID:** `q6`

**English:** Who's better-looking, Tom or Aurora?

**Vietnamese:** Giữa Tom và Aurora, ai đẹp hơn?

**Answer options:**

- **A.** EN: Tom · VI: Tom
- **B.** EN: Aurora · VI: Aurora

**Correct answer:** B — EN: Aurora · VI: Aurora

**Question source:** `src/data/questions.ts` → `QUESTIONS.find(q => q.id === "q6")` → `text`, `options`, `correctAnswer`.
**Vietnamese question source:** `src/lib/i18n/questions.ts` → `questionVi["Who's better-looking, Tom or Aurora?"]`.

#### When Aurora selects A — Tom

- **Feedback type:** Incorrect (+0).
- **Dialogue — EN:** "Flattery will get you kisses. It will not change the official answer."
- **Dialogue — VI:** "Nịnh thế này thì xứng đáng được anh hôn 10 cái đó. Nhưng đáp án đúng vẫn không đổi nha em."
- **Configured expression:** `smug`.
- **Configured gesture:** `thumbs-up` (semantic presentation metadata).
- **Actual rendered sprite:** `proud.webp` — wink and thumbs up.
- **Gesture rendering:** the complete sprite pose matches the requested gesture; limbs are not independently animated.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "A tiny plot twist…"
- **Generic answer-panel heading — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"
- **Correct-answer reveal — EN:** "Correct answer: B. Aurora"
- **Correct-answer reveal — VI:** "Đáp án đúng: B. Aurora"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q6.A`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["Flattery will get you kisses. It will not change the official answer."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

#### When Aurora selects B — Aurora

- **Feedback type:** Correct (+1).
- **Dialogue — EN:** "Obviously you. I have eyes, princess. Very heart-shaped eyes."
- **Dialogue — VI:** "Tất nhiên là em rồi. Gu thẩm mĩ của anh là số 1 mà lại 😏"
- **Configured expression:** `happy`.
- **Configured gesture:** `heart` (semantic presentation metadata).
- **Actual rendered sprite:** `happy.webp` — eyes-closed smile with clapping hands.
- **Gesture rendering:** **approximation** — the requested `heart` is not a separate animated limb gesture. The visible pose is the eyes-closed smile with clapping hands sprite above.
- **Decorative effect:** `hearts` particles (disabled by reduced motion).
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "You know us so well! ♡"
- **Generic answer-panel heading — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Correct-answer reveal — EN:** "Correct answer: B. Aurora"
- **Correct-answer reveal — VI:** "Đáp án đúng: B. Aurora"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q6.B`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["Obviously you. I have eyes, princess. Very heart-shaped eyes."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

**Generic messages (for review):**

- **Correct-answer panel — EN:** "You know us so well! ♡"
- **Correct-answer panel — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Wrong-answer panel — EN:** "A tiny plot twist…"
- **Wrong-answer panel — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"

**Randomized or fallback dialogue for this question:** none while the configured `QUIZ_REACTIONS.q6` entries exist. See the shared fallback section for the exact generic reaction used if a future entry is missing.

### Question 7 (Q07) — Who gets sulky more easily?

**Stable Question ID:** `q7`

**English:** Who gets sulky more easily?

**Vietnamese:** Ai hay dỗi hơn?

**Answer options:**

- **A.** EN: Tom · VI: Tom
- **B.** EN: Aurora · VI: Aurora

**Correct answer:** B — EN: Aurora · VI: Aurora

**Question source:** `src/data/questions.ts` → `QUESTIONS.find(q => q.id === "q7")` → `text`, `options`, `correctAnswer`.
**Vietnamese question source:** `src/lib/i18n/questions.ts` → `questionVi["Who gets sulky more easily?"]`.

#### When Aurora selects A — Tom

- **Feedback type:** Incorrect (+0).
- **Dialogue — EN:** "I am not sulking. I am conducting a very quiet emotional protest."
- **Dialogue — VI:** "Anh chả thèm dỗi 🤥"
- **Configured expression:** `pouting`.
- **Configured gesture:** `cross-arms` (semantic presentation metadata).
- **Actual rendered sprite:** `angry.webp` — playfully angry pointing pose.
- **Gesture rendering:** **approximation** — the requested `cross-arms` is not a separate animated limb gesture. The visible pose is the playfully angry pointing pose sprite above.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "A tiny plot twist…"
- **Generic answer-panel heading — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"
- **Correct-answer reveal — EN:** "Correct answer: B. Aurora"
- **Correct-answer reveal — VI:** "Đáp án đúng: B. Aurora"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q7.A`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["I am not sulking. I am conducting a very quiet emotional protest."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

#### When Aurora selects B — Aurora

- **Feedback type:** Correct (+1).
- **Dialogue — EN:** "One tiny pout and I am already negotiating with snacks."
- **Dialogue — VI:** "Hôm nào xui xui anh lỡ thở sai cách xíu hoi là cũng lo lo rùi á 🫣"
- **Configured expression:** `laughing`.
- **Configured gesture:** `point` (semantic presentation metadata).
- **Actual rendered sprite:** `happy.webp` — eyes-closed smile with clapping hands.
- **Gesture rendering:** **approximation** — the requested `point` is not a separate animated limb gesture. The visible pose is the eyes-closed smile with clapping hands sprite above.
- **Decorative effect:** `hearts` particles (disabled by reduced motion).
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "You know us so well! ♡"
- **Generic answer-panel heading — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Correct-answer reveal — EN:** "Correct answer: B. Aurora"
- **Correct-answer reveal — VI:** "Đáp án đúng: B. Aurora"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q7.B`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["One tiny pout and I am already negotiating with snacks."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

**Generic messages (for review):**

- **Correct-answer panel — EN:** "You know us so well! ♡"
- **Correct-answer panel — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Wrong-answer panel — EN:** "A tiny plot twist…"
- **Wrong-answer panel — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"

**Randomized or fallback dialogue for this question:** none while the configured `QUIZ_REACTIONS.q7` entries exist. See the shared fallback section for the exact generic reaction used if a future entry is missing.

### Question 8 (Q08) — Who misses the other more when they're apart?

**Stable Question ID:** `q8`

**English:** Who misses the other more when they're apart?

**Vietnamese:** Ai nhớ người kia nhiều hơn khi không ở cạnh nhau?

**Answer options:**

- **A.** EN: Tom · VI: Tom
- **B.** EN: Aurora · VI: Aurora
- **C.** EN: Both of them · VI: Cả hai

**Correct answer:** C — EN: Both of them · VI: Cả hai

**Question source:** `src/data/questions.ts` → `QUESTIONS.find(q => q.id === "q8")` → `text`, `options`, `correctAnswer`.
**Vietnamese question source:** `src/lib/i18n/questions.ts` → `questionVi["Who misses the other more when they're apart?"]`.

#### When Aurora selects A — Tom

- **Feedback type:** Incorrect (+0).
- **Dialogue — EN:** "I miss you a ridiculous amount. But I know you miss me too."
- **Dialogue — VI:** "Anh nhớ em siêu siêu nhiều luôn. Nhưng anh biết em cũng nhớ anh mà."
- **Configured expression:** `romantic`.
- **Configured gesture:** `heart` (semantic presentation metadata).
- **Actual rendered sprite:** `happy.webp` — eyes-closed smile with clapping hands.
- **Gesture rendering:** **approximation** — the requested `heart` is not a separate animated limb gesture. The visible pose is the eyes-closed smile with clapping hands sprite above.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "A tiny plot twist…"
- **Generic answer-panel heading — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"
- **Correct-answer reveal — EN:** "Correct answer: C. Both of them"
- **Correct-answer reveal — VI:** "Đáp án đúng: C. Cả hai"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q8.A`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["I miss you a ridiculous amount. But I know you miss me too."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

#### When Aurora selects B — Aurora

- **Feedback type:** Incorrect (+0).
- **Dialogue — EN:** "My extremely dramatic missing-you playlist disagrees."
- **Dialogue — VI:** "Nghĩ sao mà kêu tui không nhớ vậy trời 🙄"
- **Configured expression:** `pouting`.
- **Configured gesture:** `point` (semantic presentation metadata).
- **Actual rendered sprite:** `angry.webp` — playfully angry pointing pose.
- **Gesture rendering:** the complete sprite pose matches the requested gesture; limbs are not independently animated.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "A tiny plot twist…"
- **Generic answer-panel heading — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"
- **Correct-answer reveal — EN:** "Correct answer: C. Both of them"
- **Correct-answer reveal — VI:** "Đáp án đúng: C. Cả hai"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q8.B`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["My extremely dramatic missing-you playlist disagrees."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

#### When Aurora selects C — Both of them

- **Feedback type:** Correct (+1).
- **Dialogue — EN:** "Both of us. Two hearts, one very unfair distance."
- **Dialogue — VI:** "Cả hai chứ còn gì nữa. Yêu mà hong gặp thì ai chả nhớ"
- **Configured expression:** `blushing`.
- **Configured gesture:** `heart` (semantic presentation metadata).
- **Actual rendered sprite:** `happy.webp` — eyes-closed smile with clapping hands.
- **Gesture rendering:** **approximation** — the requested `heart` is not a separate animated limb gesture. The visible pose is the eyes-closed smile with clapping hands sprite above.
- **Decorative effect:** `hearts` particles (disabled by reduced motion).
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "You know us so well! ♡"
- **Generic answer-panel heading — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Correct-answer reveal — EN:** "Correct answer: C. Both of them"
- **Correct-answer reveal — VI:** "Đáp án đúng: C. Cả hai"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q8.C`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["Both of us. Two hearts, one very unfair distance."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

**Generic messages (for review):**

- **Correct-answer panel — EN:** "You know us so well! ♡"
- **Correct-answer panel — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Wrong-answer panel — EN:** "A tiny plot twist…"
- **Wrong-answer panel — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"

**Randomized or fallback dialogue for this question:** none while the configured `QUIZ_REACTIONS.q8` entries exist. See the shared fallback section for the exact generic reaction used if a future entry is missing.

### Question 9 (Q09) — Who's more childish in the relationship?

**Stable Question ID:** `q9`

**English:** Who's more childish in the relationship?

**Vietnamese:** Ai trẻ con hơn khi yêu?

**Answer options:**

- **A.** EN: Tom · VI: Tom
- **B.** EN: Aurora · VI: Aurora

**Correct answer:** A — EN: Tom · VI: Tom

**Question source:** `src/data/questions.ts` → `QUESTIONS.find(q => q.id === "q9")` → `text`, `options`, `correctAnswer`.
**Vietnamese question source:** `src/lib/i18n/questions.ts` → `questionVi["Who's more childish in the relationship?"]`.

#### When Aurora selects A — Tom

- **Feedback type:** Correct (+1).
- **Dialogue — EN:** "Guilty. Growing up is optional. Loving you is mandatory."
- **Dialogue — VI:** "Chịu òi =))))) đúng quá biết sao giờ"
- **Configured expression:** `laughing`.
- **Configured gesture:** `wave` (semantic presentation metadata).
- **Actual rendered sprite:** `happy.webp` — eyes-closed smile with clapping hands.
- **Gesture rendering:** **approximation** — the requested `wave` is not a separate animated limb gesture. The visible pose is the eyes-closed smile with clapping hands sprite above.
- **Decorative effect:** `hearts` particles (disabled by reduced motion).
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "You know us so well! ♡"
- **Generic answer-panel heading — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Correct-answer reveal — EN:** "Correct answer: A. Tom"
- **Correct-answer reveal — VI:** "Đáp án đúng: A. Tom"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q9.A`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["Guilty. Growing up is optional. Loving you is mandatory."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

#### When Aurora selects B — Aurora

- **Feedback type:** Incorrect (+0).
- **Dialogue — EN:** "Excuse me, I worked very hard for my title of biggest baby."
- **Dialogue — VI:** "Ơ kìa, nhắm nhõng nhẽo bằng tui hong?"
- **Configured expression:** `mock-angry`.
- **Configured gesture:** `cross-arms` (semantic presentation metadata).
- **Actual rendered sprite:** `angry.webp` — playfully angry pointing pose.
- **Gesture rendering:** **approximation** — the requested `cross-arms` is not a separate animated limb gesture. The visible pose is the playfully angry pointing pose sprite above.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "A tiny plot twist…"
- **Generic answer-panel heading — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"
- **Correct-answer reveal — EN:** "Correct answer: A. Tom"
- **Correct-answer reveal — VI:** "Đáp án đúng: A. Tom"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q9.B`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["Excuse me, I worked very hard for my title of biggest baby."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

**Generic messages (for review):**

- **Correct-answer panel — EN:** "You know us so well! ♡"
- **Correct-answer panel — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Wrong-answer panel — EN:** "A tiny plot twist…"
- **Wrong-answer panel — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"

**Randomized or fallback dialogue for this question:** none while the configured `QUIZ_REACTIONS.q9` entries exist. See the shared fallback section for the exact generic reaction used if a future entry is missing.

### Question 10 (Q10) — Who gets jealous more often but refuses to admit it?

**Stable Question ID:** `q10`

**English:** Who gets jealous more often but refuses to admit it?

**Vietnamese:** Ai hay ghen mà không chịu nhận?

**Answer options:**

- **A.** EN: Tom · VI: Tom
- **B.** EN: Aurora · VI: Aurora

**Correct answer:** B — EN: Aurora · VI: Aurora

**Question source:** `src/data/questions.ts` → `QUESTIONS.find(q => q.id === "q10")` → `text`, `options`, `correctAnswer`.
**Vietnamese question source:** `src/lib/i18n/questions.ts` → `questionVi["Who gets jealous more often but refuses to admit it?"]`.

#### When Aurora selects A — Tom

- **Feedback type:** Incorrect (+0).
- **Dialogue — EN:** "Jealous? Me? I am merely monitoring the boyfriend competition."
- **Dialogue — VI:** "Anh ghen á? Kẻ thắng cuộc không bao giờ ghen 😏"
- **Configured expression:** `shocked`.
- **Configured gesture:** `point` (semantic presentation metadata).
- **Actual rendered sprite:** `shocked.webp` — surprised facepalm.
- **Gesture rendering:** **approximation** — the requested `point` is not a separate animated limb gesture. The visible pose is the surprised facepalm sprite above.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "A tiny plot twist…"
- **Generic answer-panel heading — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"
- **Correct-answer reveal — EN:** "Correct answer: B. Aurora"
- **Correct-answer reveal — VI:** "Đáp án đúng: B. Aurora"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q10.A`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["Jealous? Me? I am merely monitoring the boyfriend competition."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

#### When Aurora selects B — Aurora

- **Feedback type:** Correct (+1).
- **Dialogue — EN:** "I knew it! Caught you, princess!"
- **Dialogue — VI:** "Biết ngay mà! Bắt quả tang công chúa ghen rồi nha!"
- **Configured expression:** `smug`.
- **Configured gesture:** `point` (semantic presentation metadata).
- **Actual rendered sprite:** `proud.webp` — wink and thumbs up.
- **Gesture rendering:** **approximation** — the requested `point` is not a separate animated limb gesture. The visible pose is the wink and thumbs up sprite above.
- **Decorative effect:** `hearts` particles (disabled by reduced motion).
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "You know us so well! ♡"
- **Generic answer-panel heading — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Correct-answer reveal — EN:** "Correct answer: B. Aurora"
- **Correct-answer reveal — VI:** "Đáp án đúng: B. Aurora"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q10.B`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["I knew it! Caught you, princess!"]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

**Generic messages (for review):**

- **Correct-answer panel — EN:** "You know us so well! ♡"
- **Correct-answer panel — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Wrong-answer panel — EN:** "A tiny plot twist…"
- **Wrong-answer panel — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"

**Randomized or fallback dialogue for this question:** none while the configured `QUIZ_REACTIONS.q10` entries exist. See the shared fallback section for the exact generic reaction used if a future entry is missing.

### Question 11 (Q11) — Who loves cuddles and being spoiled more?

**Stable Question ID:** `q11`

**English:** Who loves cuddles and being spoiled more?

**Vietnamese:** Ai thích ôm ấp và được chiều chuộng hơn?

**Answer options:**

- **A.** EN: Tom · VI: Tom
- **B.** EN: Aurora · VI: Aurora

**Correct answer:** A — EN: Tom · VI: Tom

**Question source:** `src/data/questions.ts` → `QUESTIONS.find(q => q.id === "q11")` → `text`, `options`, `correctAnswer`.
**Vietnamese question source:** `src/lib/i18n/questions.ts` → `questionVi["Who loves cuddles and being spoiled more?"]`.

#### When Aurora selects A — Tom

- **Feedback type:** Correct (+1).
- **Dialogue — EN:** "Yes. I accept cuddles, forehead kisses, and unlimited spoiling."
- **Dialogue — VI:** "Đúng rồi. Anh là em bé mà lại 🫣"
- **Configured expression:** `blushing`.
- **Configured gesture:** `heart` (semantic presentation metadata).
- **Actual rendered sprite:** `happy.webp` — eyes-closed smile with clapping hands.
- **Gesture rendering:** **approximation** — the requested `heart` is not a separate animated limb gesture. The visible pose is the eyes-closed smile with clapping hands sprite above.
- **Decorative effect:** `hearts` particles (disabled by reduced motion).
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "You know us so well! ♡"
- **Generic answer-panel heading — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Correct-answer reveal — EN:** "Correct answer: A. Tom"
- **Correct-answer reveal — VI:** "Đáp án đúng: A. Tom"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q11.A`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["Yes. I accept cuddles, forehead kisses, and unlimited spoiling."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

#### When Aurora selects B — Aurora

- **Feedback type:** Incorrect (+0).
- **Dialogue — EN:** "You get spoiled too. But I am the official cuddle enthusiast."
- **Dialogue — VI:** "'Hôm nay em đang khó chịu đừng có đụng vô người em à nha'"
- **Configured expression:** `pouting`.
- **Configured gesture:** `cross-arms` (semantic presentation metadata).
- **Actual rendered sprite:** `angry.webp` — playfully angry pointing pose.
- **Gesture rendering:** **approximation** — the requested `cross-arms` is not a separate animated limb gesture. The visible pose is the playfully angry pointing pose sprite above.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "A tiny plot twist…"
- **Generic answer-panel heading — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"
- **Correct-answer reveal — EN:** "Correct answer: A. Tom"
- **Correct-answer reveal — VI:** "Đáp án đúng: A. Tom"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q11.B`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["You get spoiled too. But I am the official cuddle enthusiast."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

**Generic messages (for review):**

- **Correct-answer panel — EN:** "You know us so well! ♡"
- **Correct-answer panel — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Wrong-answer panel — EN:** "A tiny plot twist…"
- **Wrong-answer panel — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"

**Randomized or fallback dialogue for this question:** none while the configured `QUIZ_REACTIONS.q11` entries exist. See the shared fallback section for the exact generic reaction used if a future entry is missing.

### Question 12 (Q12) — Who loves teasing the other until they get annoyed?

**Stable Question ID:** `q12`

**English:** Who loves teasing the other until they get annoyed?

**Vietnamese:** Ai hay chọc người kia tức điên lên hơn?

**Answer options:**

- **A.** EN: Tom · VI: Tom
- **B.** EN: Aurora · VI: Aurora

**Correct answer:** A — EN: Tom · VI: Tom

**Question source:** `src/data/questions.ts` → `QUESTIONS.find(q => q.id === "q12")` → `text`, `options`, `correctAnswer`.
**Vietnamese question source:** `src/lib/i18n/questions.ts` → `questionVi["Who loves teasing the other until they get annoyed?"]`.

#### When Aurora selects A — Tom

- **Feedback type:** Correct (+1).
- **Dialogue — EN:** "Your reactions are too cute. I consider teasing a public service."
- **Dialogue — VI:** "Tại em phản ứng cưng quá đó. Anh trêu một chút cho đời vui thôi mà."
- **Configured expression:** `smug`.
- **Configured gesture:** `point` (semantic presentation metadata).
- **Actual rendered sprite:** `proud.webp` — wink and thumbs up.
- **Gesture rendering:** **approximation** — the requested `point` is not a separate animated limb gesture. The visible pose is the wink and thumbs up sprite above.
- **Decorative effect:** `hearts` particles (disabled by reduced motion).
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "You know us so well! ♡"
- **Generic answer-panel heading — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Correct-answer reveal — EN:** "Correct answer: A. Tom"
- **Correct-answer reveal — VI:** "Đáp án đúng: A. Tom"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q12.A`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["Your reactions are too cute. I consider teasing a public service."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

#### When Aurora selects B — Aurora

- **Feedback type:** Incorrect (+0).
- **Dialogue — EN:** "You are blaming the victim of my own terrible jokes? Wait…"
- **Dialogue — VI:** "Hong dám bực tại sợ bị bực ngược lại 🤭"
- **Configured expression:** `shocked`.
- **Configured gesture:** `facepalm` (semantic presentation metadata).
- **Actual rendered sprite:** `shocked.webp` — surprised facepalm.
- **Gesture rendering:** the complete sprite pose matches the requested gesture; limbs are not independently animated.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "A tiny plot twist…"
- **Generic answer-panel heading — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"
- **Correct-answer reveal — EN:** "Correct answer: A. Tom"
- **Correct-answer reveal — VI:** "Đáp án đúng: A. Tom"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q12.B`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["You are blaming the victim of my own terrible jokes? Wait…"]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

**Generic messages (for review):**

- **Correct-answer panel — EN:** "You know us so well! ♡"
- **Correct-answer panel — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Wrong-answer panel — EN:** "A tiny plot twist…"
- **Wrong-answer panel — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"

**Randomized or fallback dialogue for this question:** none while the configured `QUIZ_REACTIONS.q12` entries exist. See the shared fallback section for the exact generic reaction used if a future entry is missing.

### Question 13 (Q13) — Who's more romantic in the relationship?

**Stable Question ID:** `q13`

**English:** Who's more romantic in the relationship?

**Vietnamese:** Ai lãng mạn hơn?

**Answer options:**

- **A.** EN: Tom · VI: Tom
- **B.** EN: Aurora · VI: Aurora

**Correct answer:** A — EN: Tom · VI: Tom

**Question source:** `src/data/questions.ts` → `QUESTIONS.find(q => q.id === "q13")` → `text`, `options`, `correctAnswer`.
**Vietnamese question source:** `src/lib/i18n/questions.ts` → `questionVi["Who's more romantic in the relationship?"]`.

#### When Aurora selects A — Tom

- **Feedback type:** Correct (+1).
- **Dialogue — EN:** "I built you a secret garden. Consider that Exhibit A."
- **Dialogue — VI:** "Anh làm hẳn một khu vườn bí mật cho em. Bằng chứng số một rõ ràng thế còn gì."
- **Configured expression:** `romantic`.
- **Configured gesture:** `blow-kiss` (semantic presentation metadata).
- **Actual rendered sprite:** `happy.webp` — eyes-closed smile with clapping hands.
- **Gesture rendering:** **approximation** — the requested `blow-kiss` is not a separate animated limb gesture. The visible pose is the eyes-closed smile with clapping hands sprite above.
- **Decorative effect:** `hearts` particles (disabled by reduced motion).
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "You know us so well! ♡"
- **Generic answer-panel heading — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Correct-answer reveal — EN:** "Correct answer: A. Tom"
- **Correct-answer reveal — VI:** "Đáp án đúng: A. Tom"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q13.A`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["I built you a secret garden. Consider that Exhibit A."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

#### When Aurora selects B — Aurora

- **Feedback type:** Incorrect (+0).
- **Dialogue — EN:** "Princess. There is a whole romantic website on your screen. My evidence is overwhelming."
- **Dialogue — VI:** "Công chúa ơi, cả một trang web tình yêu đang trước mặt em kìa 😑"
- **Configured expression:** `pouting`.
- **Configured gesture:** `cross-arms` (semantic presentation metadata).
- **Actual rendered sprite:** `angry.webp` — playfully angry pointing pose.
- **Gesture rendering:** **approximation** — the requested `cross-arms` is not a separate animated limb gesture. The visible pose is the playfully angry pointing pose sprite above.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "A tiny plot twist…"
- **Generic answer-panel heading — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"
- **Correct-answer reveal — EN:** "Correct answer: A. Tom"
- **Correct-answer reveal — VI:** "Đáp án đúng: A. Tom"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q13.B`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["Princess. There is a whole romantic website on your screen. My evidence is overwhelming."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

**Generic messages (for review):**

- **Correct-answer panel — EN:** "You know us so well! ♡"
- **Correct-answer panel — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Wrong-answer panel — EN:** "A tiny plot twist…"
- **Wrong-answer panel — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"

**Randomized or fallback dialogue for this question:** none while the configured `QUIZ_REACTIONS.q13` entries exist. See the shared fallback section for the exact generic reaction used if a future entry is missing.

### Question 14 (Q14) — Who's more likely to spend all their money while shopping?

**Stable Question ID:** `q14`

**English:** Who's more likely to spend all their money while shopping?

**Vietnamese:** Ai dễ tiêu sạch tiền khi đi mua sắm hơn?

**Answer options:**

- **A.** EN: Tom · VI: Tom
- **B.** EN: Aurora · VI: Aurora

**Correct answer:** A — EN: Tom · VI: Tom

**Question source:** `src/data/questions.ts` → `QUESTIONS.find(q => q.id === "q14")` → `text`, `options`, `correctAnswer`.
**Vietnamese question source:** `src/lib/i18n/questions.ts` → `questionVi["Who's more likely to spend all their money while shopping?"]`.

#### When Aurora selects A — Tom

- **Feedback type:** Correct (+1).
- **Dialogue — EN:** "My shopping cart and I would like some privacy, please."
- **Dialogue — VI:** "Đồ chơi của anh nó mắc quá thông cảm cho anh. Hic hic 🥹"
- **Configured expression:** `laughing`.
- **Configured gesture:** `cry` (semantic presentation metadata).
- **Actual rendered sprite:** `happy.webp` — eyes-closed smile with clapping hands.
- **Gesture rendering:** **approximation** — the requested `cry` is not a separate animated limb gesture. The visible pose is the eyes-closed smile with clapping hands sprite above.
- **Decorative effect:** `hearts` particles (disabled by reduced motion).
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "You know us so well! ♡"
- **Generic answer-panel heading — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Correct-answer reveal — EN:** "Correct answer: A. Tom"
- **Correct-answer reveal — VI:** "Đáp án đúng: A. Tom"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q14.A`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["My shopping cart and I would like some privacy, please."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

#### When Aurora selects B — Aurora

- **Feedback type:** Incorrect (+0).
- **Dialogue — EN:** "Nice try. My wallet already confessed. It was me."
- **Dialogue — VI:** "Em toàn để tiền mua quà cho anh thì có 😘"
- **Configured expression:** `shocked`.
- **Configured gesture:** `facepalm` (semantic presentation metadata).
- **Actual rendered sprite:** `shocked.webp` — surprised facepalm.
- **Gesture rendering:** the complete sprite pose matches the requested gesture; limbs are not independently animated.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "A tiny plot twist…"
- **Generic answer-panel heading — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"
- **Correct-answer reveal — EN:** "Correct answer: A. Tom"
- **Correct-answer reveal — VI:** "Đáp án đúng: A. Tom"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q14.B`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["Nice try. My wallet already confessed. It was me."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

**Generic messages (for review):**

- **Correct-answer panel — EN:** "You know us so well! ♡"
- **Correct-answer panel — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Wrong-answer panel — EN:** "A tiny plot twist…"
- **Wrong-answer panel — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"

**Randomized or fallback dialogue for this question:** none while the configured `QUIZ_REACTIONS.q14` entries exist. See the shared fallback section for the exact generic reaction used if a future entry is missing.

### Question 15 (Q15) — Who would ask for a kiss first when they're about to meet?

**Stable Question ID:** `q15`

**English:** Who would ask for a kiss first when they're about to meet?

**Vietnamese:** Ai sẽ đòi hôn trước khi gặp nhau?

**Answer options:**

- **A.** EN: Tom · VI: Tom
- **B.** EN: Aurora · VI: Aurora

**Correct answer:** A — EN: Tom · VI: Tom

**Question source:** `src/data/questions.ts` → `QUESTIONS.find(q => q.id === "q15")` → `text`, `options`, `correctAnswer`.
**Vietnamese question source:** `src/lib/i18n/questions.ts` → `questionVi["Who would ask for a kiss first when they're about to meet?"]`.

#### When Aurora selects A — Tom

- **Feedback type:** Correct (+1).
- **Dialogue — EN:** "Guilty. And I'd do it again!"
- **Dialogue — VI:** "Anh chứ ai vào đây nữa 🤭"
- **Configured expression:** `blushing`.
- **Configured gesture:** `blow-kiss` (semantic presentation metadata).
- **Actual rendered sprite:** `happy.webp` — eyes-closed smile with clapping hands.
- **Gesture rendering:** **approximation** — the requested `blow-kiss` is not a separate animated limb gesture. The visible pose is the eyes-closed smile with clapping hands sprite above.
- **Decorative effect:** `hearts` particles (disabled by reduced motion).
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "You know us so well! ♡"
- **Generic answer-panel heading — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Correct-answer reveal — EN:** "Correct answer: A. Tom"
- **Correct-answer reveal — VI:** "Đáp án đúng: A. Tom"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q15.A`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["Guilty. And I'd do it again!"]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

#### When Aurora selects B — Aurora

- **Feedback type:** Incorrect (+0).
- **Dialogue — EN:** "I admire the confidence. But I am already first in the kiss queue."
- **Dialogue — VI:** "Em toàn kiểm tra răng miệng trước thôi 😒"
- **Configured expression:** `pouting`.
- **Configured gesture:** `heart` (semantic presentation metadata).
- **Actual rendered sprite:** `angry.webp` — playfully angry pointing pose.
- **Gesture rendering:** **approximation** — the requested `heart` is not a separate animated limb gesture. The visible pose is the playfully angry pointing pose sprite above.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

- **Generic answer-panel heading — EN:** "A tiny plot twist…"
- **Generic answer-panel heading — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"
- **Correct-answer reveal — EN:** "Correct answer: A. Tom"
- **Correct-answer reveal — VI:** "Đáp án đúng: A. Tom"
- **English dialogue/expression/gesture source:** `src/data/character-dialogue.ts` → `QUIZ_REACTIONS.q15.B`.
- **Vietnamese dialogue source:** `src/lib/i18n/dialogue.ts` → `dialogueVi["I admire the confidence. But I am already first in the kiss queue."]`.
- **Feedback source:** `src/components/games/GamePanel.tsx` → `.answer-feedback`; heading and `Correct answer:` prefix translations are in `src/lib/i18n/dictionary.ts`.

**Generic messages (for review):**

- **Correct-answer panel — EN:** "You know us so well! ♡"
- **Correct-answer panel — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Wrong-answer panel — EN:** "A tiny plot twist…"
- **Wrong-answer panel — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"

**Randomized or fallback dialogue for this question:** none while the configured `QUIZ_REACTIONS.q15` entries exist. See the shared fallback section for the exact generic reaction used if a future entry is missing.

## Shared dialogue and interaction flow

These sections separate **Tom speech** from the **game panel**, score/retry controls, begging form and celebration/reward screens. Source keys and EN/VI are included so edits do not require hunting through components.

### Quiz introduction — selecting the Love Quiz card

- **Tom's speech — EN:** "Think you know our relationship better than I do? Let's test that beautiful brain of yours!"
- **Tom's speech — VI:** "Em nghĩ em hiểu hai đứa mình hơn anh hả? Tưởng dễ nhưng mà hong dễ đâu Ku🤭"
- **Source:** `src/data/dialogue.ts` → `introductions.quiz`; `reactionFor(GAME_PREVIEW)`; VI `src/lib/i18n/dialogue.ts`; Vietnamese dictionary key "Think you know our relationship better than I do? Let's test that beautiful brain of yours!".
- **Configured expression:** `smug`.
- **Configured gesture:** `point` (semantic presentation metadata).
- **Actual rendered sprite:** `proud.webp` — wink and thumbs up.
- **Gesture rendering:** **approximation** — the requested `point` is not a separate animated limb gesture. The visible pose is the wink and thumbs up sprite above.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 5500 ms; priority 2. A later gameplay action can interrupt it.

The selection sequence remains Select Game → Tom introduction → Play This Game → full rules → Start Challenge. The bubble uses the same English source in both languages and translates only at rendering. Long source dialogue may show a dismiss button:

- **Dismiss action — EN:** "Got it, Tom"
- **Dismiss action — VI:** "Ok, em hiểu òi"
- **Source:** `src/components/character/TomCharacter.tsx`; VI `dialogueVi["Got it, Tom"]`; Vietnamese dictionary key "Got it, Tom".

### Full quiz instructions

**Source:** `src/components/games/GameRules.tsx`. These are implemented screen/button messages, not additional Tom speech.

- **Copy — EN:** "Ten unique questions are randomly chosen from our fifteen-question pool for each attempt. A/B/C labels stay in their original order."
- **Copy — VI:** "Mỗi lượt chọn ngẫu nhiên 10 câu khác nhau trong bộ 15 câu. Thứ tự đáp án A/B/C luôn giữ nguyên."

- **Copy — EN:** "Choose one answer at a time. The correct answer appears only after you submit. Answer all ten questions to finish an attempt."
- **Copy — VI:** "Mỗi câu chọn một đáp án. Gửi xong mới thấy đáp án đúng. Trả lời đủ 10 câu để hoàn thành lượt chơi nhé."

- **Copy — EN:** "Score 7 out of 10 or higher to win and choose exactly one reward. Six correct answers is a loss."
- **Copy — VI:** "Đúng từ 7/10 câu trở lên là thắng và được chọn đúng một phần quà. Đúng 6 câu thì chưa thắng nha."

- **Copy — EN:** "There are three attempts maximum: attempt 1 is free, attempt 2 is a free retry, and attempt 3 needs an English begging message of at least 31 words."
- **Copy — VI:** "Em có tối đa 3 lượt: lượt 1 miễn phí, lượt 2 được thử lại miễn phí, lượt 3 cần lời năn nỉ tiếng Việt dài ít nhất 31 từ."

- **Copy — EN:** "Each retry draws ten unique questions again. After the third failed attempt, the result is no prize."
- **Copy — VI:** "Mỗi lần thử lại sẽ chọn lại 10 câu khác nhau. Nếu cả 3 lượt đều chưa thắng thì kết thúc không có quà."

- **Copy — EN:** "Starting locks this game for this adventure. Leaving early records a forfeit with no reward. Your next adventure is always a fresh start."
- **Copy — VI:** "Bắt đầu rồi là chốt trò này cho cả lượt chơi. Dừng giữa chừng sẽ tính bỏ cuộc và không có quà. Lượt sau luôn là một khởi đầu mới."

- **Copy — EN:** "THE LITTLE DETAILS"
- **Copy — VI:** "MẤY ĐIỀU NHỎ CẦN BIẾT"

- **Copy — EN:** "Before we"
- **Copy — VI:** "Trước khi mình"

- **Copy — EN:** "play."
- **Copy — VI:** "chơi nha."

- **Copy — EN:** "· The rules"
- **Copy — VI:** "· Cách chơi"

- **Copy — EN:** "Something lovely is at stake"
- **Copy — VI:** "Quà xinh đang chờ em nè"

- **Copy — EN:** "Back to Games"
- **Copy — VI:** "Quay lại chọn trò"

- **Copy — EN:** "Start Challenge"
- **Copy — VI:** "Bắt đầu thử thách"

### First-question speech — Start Challenge

- **Tom's speech — EN:** "Ready, princess? My very fragile ego is listening."
- **Tom's speech — VI:** "Sẵn sàng chưa công chúa? Trả lời nhẹ tay, trái tim mong manh của anh đang nghe đó."
- **Source:** `src/components/character/reactions.ts` → `reactionFor(GAME_START)` with `game: quiz`; Vietnamese dictionary key "Ready, princess? My very fragile ego is listening.".
- **Configured expression:** `happy`.
- **Configured gesture:** `point` (semantic presentation metadata).
- **Actual rendered sprite:** `happy.webp` — eyes-closed smile with clapping hands.
- **Gesture rendering:** **approximation** — the requested `point` is not a separate animated limb gesture. The visible pose is the eyes-closed smile with clapping hands sprite above.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 4200 ms; priority 3. A later gameplay action can interrupt it.

### Normal question baseline / after answer reaction expires

- **Tom's speech — EN:** "Take your time, princess. Your extremely handsome quiz host is listening."
- **Tom's speech — VI:** "Cứ từ từ nghĩ nha công chúa. Anh dẫn chương trình đẹp trai đang đợi em nè."
- **Source:** `src/components/character/reactions.ts` → `baselineReaction()`; Vietnamese dictionary key "Take your time, princess. Your extremely handsome quiz host is listening.".
- **Configured expression:** `neutral`.
- **Configured gesture:** `none` (semantic presentation metadata).
- **Actual rendered sprite:** `idle.webp` — neutral resting portrait.
- **Gesture rendering:** the complete sprite pose matches the requested gesture; limbs are not independently animated.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 4200 ms; priority 0. A later gameplay action can interrupt it.

Baseline speech is selected by state when no timed reaction is active; its `duration` value is not an independently scheduled baseline timeout.

### Rules-screen baseline after preview expires

- **Tom's speech — EN:** "A little reading before a little mischief. Fair rules, lovely rewards, and me cheering for you."
- **Tom's speech — VI:** "Đọc chút cách chơi rồi mình quậy nha. Luật công bằng, quà thì xinh, anh thì luôn cổ vũ em."
- **Source:** `src/components/character/reactions.ts` → `baselineReaction()`; Vietnamese dictionary key "A little reading before a little mischief. Fair rules, lovely rewards, and me cheering for you.".
- **Configured expression:** `thinking`.
- **Configured gesture:** `point` (semantic presentation metadata).
- **Actual rendered sprite:** `idle.webp` — neutral resting portrait.
- **Gesture rendering:** **approximation** — the requested `point` is not a separate animated limb gesture. The visible pose is the neutral resting portrait sprite above.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 4200 ms; priority 0. A later gameplay action can interrupt it.

Baseline speech is selected by state when no timed reaction is active; its `duration` value is not an independently scheduled baseline timeout.

### Retry-ready baseline after failure reaction expires

- **Tom's speech — EN:** "A little breather. If you want another chance, I am cheering for you."
- **Tom's speech — VI:** "Nghỉ một chút nha. Nếu em muốn thử lại, anh vẫn cổ vũ hết mình."
- **Source:** `src/components/character/reactions.ts` → `baselineReaction()`; Vietnamese dictionary key "A little breather. If you want another chance, I am cheering for you.".
- **Configured expression:** `happy`.
- **Configured gesture:** `thumbs-up` (semantic presentation metadata).
- **Actual rendered sprite:** `happy.webp` — eyes-closed smile with clapping hands.
- **Gesture rendering:** **approximation** — the requested `thumbs-up` is not a separate animated limb gesture. The visible pose is the eyes-closed smile with clapping hands sprite above.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 4200 ms; priority 0. A later gameplay action can interrupt it.

Baseline speech is selected by state when no timed reaction is active; its `duration` value is not an independently scheduled baseline timeout.

### Held passing-review baseline after celebration reaction expires

- **Tom's speech — EN:** "Enjoy your little victory, princess. I am so proud of you."
- **Tom's speech — VI:** "Tận hưởng chiến thắng đi công chúa. Anh tự hào về em quá trời!"
- **Source:** `src/components/character/reactions.ts` → `baselineReaction()`; Vietnamese dictionary key "Enjoy your little victory, princess. I am so proud of you.".
- **Configured expression:** `happy`.
- **Configured gesture:** `thumbs-up` (semantic presentation metadata).
- **Actual rendered sprite:** `happy.webp` — eyes-closed smile with clapping hands.
- **Gesture rendering:** **approximation** — the requested `thumbs-up` is not a separate animated limb gesture. The visible pose is the eyes-closed smile with clapping hands sprite above.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 4200 ms; priority 0. A later gameplay action can interrupt it.

Baseline speech is selected by state when no timed reaction is active; its `duration` value is not an independently scheduled baseline timeout.

### Held final-failure review baseline

- **Tom's speech — EN:** "A deep breath and a little love. I am right here with you."
- **Tom's speech — VI:** "Hít thở một chút nha. Anh vẫn ở đây với em mà."
- **Source:** `src/components/character/reactions.ts` → `baselineReaction()`; Vietnamese dictionary key "A deep breath and a little love. I am right here with you.".
- **Configured expression:** `romantic`.
- **Configured gesture:** `heart` (semantic presentation metadata).
- **Actual rendered sprite:** `happy.webp` — eyes-closed smile with clapping hands.
- **Gesture rendering:** **approximation** — the requested `heart` is not a separate animated limb gesture. The visible pose is the eyes-closed smile with clapping hands sprite above.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 4200 ms; priority 0. A later gameplay action can interrupt it.

Baseline speech is selected by state when no timed reaction is active; its `duration` value is not an independently scheduled baseline timeout.

### Reward-selection baseline

- **Tom's speech — EN:** "Exactly one little happiness. Take your time, princess."
- **Tom's speech — VI:** "Chọn đúng một món làm em vui nha. Cứ từ từ, công chúa."
- **Source:** `src/components/character/reactions.ts` → `baselineReaction()`; Vietnamese dictionary key "Exactly one little happiness. Take your time, princess.".
- **Configured expression:** `neutral`.
- **Configured gesture:** `none` (semantic presentation metadata).
- **Actual rendered sprite:** `idle.webp` — neutral resting portrait.
- **Gesture rendering:** the complete sprite pose matches the requested gesture; limbs are not independently animated.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 4200 ms; priority 0. A later gameplay action can interrupt it.

Baseline speech is selected by state when no timed reaction is active; its `duration` value is not an independently scheduled baseline timeout.

### Final ending baseline

- **Tom's speech — EN:** "My heart. Every single day. Forever on your team."
- **Tom's speech — VI:** "Tim anh, ngày nào cũng vậy. Luôn đứng về phía em."
- **Source:** `src/components/character/reactions.ts` → `baselineReaction()`; Vietnamese dictionary key "My heart. Every single day. Forever on your team.".
- **Configured expression:** `romantic`.
- **Configured gesture:** `heart` (semantic presentation metadata).
- **Actual rendered sprite:** `happy.webp` — eyes-closed smile with clapping hands.
- **Gesture rendering:** **approximation** — the requested `heart` is not a separate animated limb gesture. The visible pose is the eyes-closed smile with clapping hands sprite above.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 4200 ms; priority 0. A later gameplay action can interrupt it.

Baseline speech is selected by state when no timed reaction is active; its `duration` value is not an independently scheduled baseline timeout.

### Generic correct-answer Tom fallback (only when an entry is missing)

- **Tom's speech — EN:** "You know us so well!"
- **Tom's speech — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"
- **Source:** `src/components/character/reactions.ts` → `reactionFor(QUESTION_ANSWER_CORRECT)` default before contextual override; Vietnamese dictionary key "You know us so well!".
- **Configured expression:** `happy`.
- **Configured gesture:** `thumbs-up` (semantic presentation metadata).
- **Actual rendered sprite:** `happy.webp` — eyes-closed smile with clapping hands.
- **Gesture rendering:** **approximation** — the requested `thumbs-up` is not a separate animated limb gesture. The visible pose is the eyes-closed smile with clapping hands sprite above.
- **Decorative effect:** `hearts` particles (disabled by reduced motion).
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

### Generic wrong-answer Tom fallback (only when an entry is missing)

- **Tom's speech — EN:** "Only a little offended. A kiss would probably fix it."
- **Tom's speech — VI:** "Anh chỉ dỗi xíu thôi. Em hôn một cái chắc anh hết liền."
- **Source:** `src/components/character/reactions.ts` → `reactionFor(QUESTION_ANSWER_WRONG)` default before contextual override; Vietnamese dictionary key "Only a little offended. A kiss would probably fix it.".
- **Configured expression:** `pouting`.
- **Configured gesture:** `cross-arms` (semantic presentation metadata).
- **Actual rendered sprite:** `angry.webp` — playfully angry pointing pose.
- **Gesture rendering:** **approximation** — the requested `cross-arms` is not a separate animated limb gesture. The visible pose is the playfully angry pointing pose sprite above.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 6000 ms; priority 4. A later gameplay action can interrupt it.

### Generic answer panel and question navigation

**Source:** `src/components/games/GamePanel.tsx`. These are implemented screen/button messages, not additional Tom speech.

- **Copy — EN:** "You know us so well! ♡"
- **Copy — VI:** "Đúng rồi! Giỏi quá trời, cho phép em hun anh 1 cái 🤭"

- **Copy — EN:** "A tiny plot twist…"
- **Copy — VI:** "Ơ kìa! Em có thật sự hiểu anh hong 😡"

- **Copy — EN:** "Correct answer:"
- **Copy — VI:** "Đáp án đúng:"

- **Copy — EN:** "Next Question"
- **Copy — VI:** "Câu tiếp theo"

- **Copy — EN:** "See My Score"
- **Copy — VI:** "Xem điểm của em"

The reveal is assembled as `Correct answer: {correctAnswerLabel}. {correctOptionText}` in EN, or `Đáp án đúng: {sameLabel}. {translatedOptionText}` in VI. A/B/C do not change. Each answer is locked after submit. Next Question clears the previous timed reaction; there is no separate next-question joke for questions 2–9. The normal baseline above is used. On reaching the tenth question, the following special line is dispatched.

### Tenth / last question

- **Tom's speech — EN:** "One last question, princess. Make it a good little plot twist."
- **Tom's speech — VI:** "Câu cuối rồi công chúa ơi. Cho anh một pha chốt thật xịn nha."
- **Source:** `src/components/character/reactions.ts` → `eventAfter(next_question)` when `questionIndex === 9`, then `reactionFor(QUIZ_LAST_QUESTION)`; Vietnamese dictionary key "One last question, princess. Make it a good little plot twist.".
- **Configured expression:** `thinking`.
- **Configured gesture:** `point` (semantic presentation metadata).
- **Actual rendered sprite:** `idle.webp` — neutral resting portrait.
- **Gesture rendering:** **approximation** — the requested `point` is not a separate animated limb gesture. The visible pose is the neutral resting portrait sprite above.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 4200 ms; priority 3. A later gameplay action can interrupt it.

### Quiz completion / scoring boundary

After answering the tenth question, its feedback stays visible. **See My Score** sends `next_question`; only then does the completed-attempt review occur. A score of 7–10 enters the reward/victory review. A score of 0–6 offers a retry when allowed; the third failure finalizes as no prize. No hidden randomized completion text is used.

### Passing dialogue

- **Tom's speech — EN:** "YOU DID IT, PRINCESS! Your boyfriend is officially impressed. Well... even more than usual!"
- **Tom's speech — VI:** "EM THẮNG RỒI! 🎉 Giỏi quá công chúa ơi! Anh mê em thêm một chút nữa rồi đó."
- **Source:** `src/components/character/reactions.ts` → `reactionFor(QUIZ_PASSED)`; Vietnamese dictionary key "YOU DID IT, PRINCESS! Your boyfriend is officially impressed. Well... even more than usual!".
- **Configured expression:** `celebrating`.
- **Configured gesture:** `clap` (semantic presentation metadata).
- **Actual rendered sprite:** `excited.webp` — both arms raised with hearts.
- **Gesture rendering:** **approximation** — the requested `clap` is not a separate animated limb gesture. The visible pose is the both arms raised with hearts sprite above.
- **Decorative effect:** `hearts` particles (disabled by reduced motion).
- **Hold / priority:** up to 8000 ms; priority 6. A later gameplay action can interrupt it.

### Failing dialogue

- **Tom's speech — EN:** "Your score cannot measure how much I adore you. A deep breath, then our next little step."
- **Tom's speech — VI:** "Điểm số đâu đo được anh thương em bao nhiêu. Hít thở một chút rồi mình tính tiếp nha, bé yêu."
- **Source:** `src/components/character/reactions.ts` → `reactionFor(QUIZ_FAILED)`; Vietnamese dictionary key "Your score cannot measure how much I adore you. A deep breath, then our next little step.".
- **Configured expression:** `sad`.
- **Configured gesture:** `cry` (semantic presentation metadata).
- **Actual rendered sprite:** `crying.webp` — crying with hands beside the face.
- **Gesture rendering:** the complete sprite pose matches the requested gesture; limbs are not independently animated.
- **Decorative effect:** `tears` particles (disabled by reduced motion).
- **Hold / priority:** up to 6000 ms; priority 6. A later gameplay action can interrupt it.

### Failed-attempt score and retry controls

**Source:** `src/components/games/GamePanel.tsx`. These are implemented screen/button messages, not additional Tom speech.

- **Copy — EN:** "out of 10"
- **Copy — VI:** "trên 10"

- **Copy — EN:** "So close, princess. You need 7 to win."
- **Copy — VI:** "Tiếc quá công chúa ơi. Cần đúng 7 câu để thắng nha."

- **Copy — EN:** "attempt"
- **Copy — VI:** "lượt"

- **Copy — EN:** "attempts"
- **Copy — VI:** "lượt"

- **Copy — EN:** "remaining"
- **Copy — VI:** "còn lại"

- **Copy — EN:** " · a little convincing required"
- **Copy — VI:** " · cần năn nỉ một chút nha"

- **Copy — EN:** "Convince Tom for Attempt 3"
- **Copy — VI:** "Năn nỉ anh mở lượt 3"

- **Copy — EN:** "Try the Quiz Again"
- **Copy — VI:** "Thử lại đố vui"

- **Copy — EN:** "Finish without a prize"
- **Copy — VI:** "Kết thúc không nhận quà"

The score heading is `{score} out of 10` / `{score} trên 10`. Remaining attempts are `{3 - attempt}` with localized fragments. There is no distinct timed retry dialogue: starting the retry clears the previous reaction and returns to the normal quiz baseline. The third-attempt button first opens the begging form if locked; successful submission unlocks it without starting or consuming the retry. The user then clicks Try the Quiz Again.

### Begging-message modal — third quiz attempt

**Source:** `src/components/games/GamePanel.tsx`. These are implemented screen/button messages, not additional Tom speech.

- **Copy — EN:** "A LITTLE SWEET TALK"
- **Copy — VI:** "NĂN NỈ ANH MỘT CHÚT NÀO"

- **Copy — EN:** "Convince Your Boyfriend 💌"
- **Copy — VI:** "Năn nỉ đi rồi tui cho chơi lại 😚"

- **Copy — EN:** "Looks like you need a little extra luck. Write your extremely handsome boyfriend a convincing message in English with more than 30 words, and he might give you another chance!"
- **Copy — VI:** "Muốn có thêm lượt chơi hả công chúa? Vậy em hãy viết một lời năn nỉ thật dễ thương bằng tiếng Việt, dài hơn 30 từ, để thuyết phục anh người yêu đẹp trai này nha!"

- **Copy — EN:** "Your most convincing words"
- **Copy — VI:** "Lời năn nỉ đáng yêu nhất của em"

- **Copy — EN:** "Dear my incredibly handsome, charming, generous boyfriend..."
- **Copy — VI:** "Anh người yêu đẹp trai, dễ thương và hào phóng nhất vũ trụ ơi..."

- **Copy — EN:** "/ 31 words minimum"
- **Copy — VI:** "/ 31 từ tối thiểu"

- **Copy — EN:** "A different message for each bonus attempt. We count words separated by spaces; grammar and language aren’t being checked."
- **Copy — VI:** "Mỗi lượt thêm cần một lời năn nỉ mới nha. Tụi mình đếm theo khoảng trắng, không chấm ngữ pháp hay kiểm tra ngôn ngữ đâu."

- **Copy — EN:** "Please, Tom? 🥺"
- **Copy — VI:** "Năn nỉ thành công chưa anh? 💗"

The word counter is `{count} / 31 words minimum` / `{count} / 31 từ tối thiểu`. It counts whitespace-separated tokens, including Vietnamese diacritics; it does not verify language. The button is disabled below 31 words or during a pending action. Draft text is not translated and is retained when switching language. Closing or switching language does not consume an attempt.

### Begging / quiz validation messages

**Source:** shared engine `src/lib/game-rules/engine.ts`; VI `src/lib/i18n/errors.ts`. All listed strings are actual validation messages.

- **Validation — EN:** "Write at least 31 English words to unlock one more chance."
- **Validation — VI:** "Em viết ít nhất 31 từ tiếng Việt để mở thêm một cơ hội nha."

- **Validation — EN:** "Write a new message for each bonus attempt, princess."
- **Validation — VI:** "Mỗi lượt thêm em cần viết một lời năn nỉ mới nha, công chúa."

- **Validation — EN:** "This particular attempt is already unlocked."
- **Validation — VI:** "Lượt này đã mở rồi nha."

- **Validation — EN:** "There is no locked bonus attempt to unlock yet."
- **Validation — VI:** "Hiện chưa có lượt thêm nào cần mở nha."

- **Validation — EN:** "Finish this quiz and review its final answer before asking for another attempt."
- **Validation — VI:** "Em hoàn thành lượt đố vui và xem đáp án cuối rồi hãy xin thêm lượt nha."

- **Validation — EN:** "This bonus attempt needs its own convincing message of at least 31 English words."
- **Validation — VI:** "Lượt thêm này cần một lời năn nỉ riêng, dài ít nhất 31 từ tiếng Việt nha."

- **Validation — EN:** "Answer the current question before continuing."
- **Validation — VI:** "Em trả lời câu này rồi hãy chuyển tiếp nha."

- **Validation — EN:** "Continue to the next question before answering again."
- **Validation — VI:** "Em chuyển sang câu tiếp theo trước khi chọn đáp án nữa nha."

- **Validation — EN:** "Choose one of this question's original answer options."
- **Validation — VI:** "Em chọn một trong các đáp án của câu này nha."

- **Validation — EN:** "Answer the question currently being shown."
- **Validation — VI:** "Em trả lời câu đang hiện trên màn hình nha."

- **Validation — EN:** "Finish the current quiz attempt and review its final answer before retrying."
- **Validation — VI:** "Em hoàn thành lượt này và xem đáp án cuối trước khi thử lại nha."

### Begging accepted

- **Tom's speech — EN:** "Hmm… suspiciously convincing. Fine, princess. One more chance. Only because you are cute!"
- **Tom's speech — VI:** "Năn nỉ cưng thế này thì anh chịu rồi. Cho em thêm một lượt đó, tại em dễ thương thôi nha!"
- **Source:** `src/components/character/reactions.ts` → `reactionFor(BEGGING_ACCEPTED)`; Vietnamese dictionary key "Hmm… suspiciously convincing. Fine, princess. One more chance. Only because you are cute!".
- **Configured expression:** `smug`.
- **Configured gesture:** `thumbs-up` (semantic presentation metadata).
- **Actual rendered sprite:** `proud.webp` — wink and thumbs up.
- **Gesture rendering:** the complete sprite pose matches the requested gesture; limbs are not independently animated.
- **Decorative effect:** `hearts` particles (disabled by reduced motion).
- **Hold / priority:** up to 5500 ms; priority 5. A later gameplay action can interrupt it.

### Held quiz victory and final-failure review

**Source:** `src/components/games/GameOutcome.tsx`. These are implemented screen/button messages, not additional Tom speech.

- **Copy — EN:** "A LITTLE VICTORY LAP"
- **Copy — VI:** "ĂN MỪNG MỘT CHÚT NÀO"

- **Copy — EN:** "A MOMENT TO CATCH YOUR BREATH"
- **Copy — VI:** "NGHỈ MỘT CHÚT RỒI ANH THƯƠNG"

- **Copy — EN:** "YOUR FINAL SCORE"
- **Copy — VI:** "ĐIỂM CỦA EM"

- **Copy — EN:** "YOU DID IT,"
- **Copy — VI:** "EM THẮNG RỒI,"

- **Copy — EN:** "PRINCESS!"
- **Copy — VI:** "CÔNG CHÚA ƠI! 🎉"

- **Copy — EN:** "Still my"
- **Copy — VI:** "Vẫn là"

- **Copy — EN:** "favorite girl."
- **Copy — VI:** "em bé anh thương."

- **Copy — EN:** "Your boyfriend is officially impressed. Well... even more than usual!"
- **Copy — VI:** "Giỏi quá công chúa ơi! Phần quà này rất may mắn khi được em chọn."

- **Copy — EN:** "No wheel, dice, or quiz could ever decide how special you are to me. Come here, princess. You are still my favorite winner."
- **Copy — VI:** "Vòng quay, xúc xắc hay điểm số đâu quyết định em đặc biệt thế nào với anh. Lại đây, công chúa của anh vẫn là nhất."

- **Copy — EN:** "Enjoy this little moment. Your reward is waiting when you are ready."
- **Copy — VI:** "Tận hưởng một chút nha. Khi nào em sẵn sàng thì quà vẫn chờ em đó."

- **Copy — EN:** "Your result is saved. Let’s give this chapter its little ending."
- **Copy — VI:** "Kết quả của em sẵn sàng rồi. Mình khép lại chương này bằng một lời thương nha."

- **Copy — EN:** "Next: Choose Your Reward 💝"
- **Copy — VI:** "Tiếp: Chọn quà của em 💝"

- **Copy — EN:** "Next: Our Little Ending"
- **Copy — VI:** "Tiếp: Lời thương cuối chương"

The score graphic is `{score} / 10`. `CelebrationEffects` supplies bounded confetti/hearts/fireworks for a victory (cleans up after 4,800 ms) and comfort decoration for a terminal loss. Reduced motion suppresses these decorations. The Next button is made ready after 650 ms (0 with reduced motion). These acknowledgements do not submit another game action or award another prize. Nonterminal failed quiz attempts use the retry panel instead of this held final-result panel.

### Reward selection and confirmation

**Source:** `src/components/rewards/RewardChoice.tsx`. These are implemented screen/button messages, not additional Tom speech.

- **Copy — EN:** "YOU WON, PRINCESS"
- **Copy — VI:** "EM THẮNG RỒI, CÔNG CHÚA ƠI"

- **Copy — EN:** "Something lovely."
- **Copy — VI:** "Một món quà xinh."

- **Copy — EN:** "Just for you."
- **Copy — VI:** "Dành riêng cho em."

- **Copy — EN:** "You earned this. Pick exactly one little happiness."
- **Copy — VI:** "Em xứng đáng mà. Chọn đúng một món quà làm em vui nha."

- **Copy — EN:** "A gift you have your eye on?"
- **Copy — VI:** "Em đang thích món quà nào hả?"

- **Copy — EN:** "Your favorite restaurant?"
- **Copy — VI:** "Em thích ăn ở quán nào?"

- **Copy — EN:** "(optional)"
- **Copy — VI:** "(không bắt buộc)"

- **Copy — EN:** "A little hint for Tom…"
- **Copy — VI:** "Gợi ý anh một chút nè…"

- **Copy — EN:** "Somewhere delicious…"
- **Copy — VI:** "Một chỗ ăn thật ngon…"

- **Copy — EN:** "Choose This Reward"
- **Copy — VI:** "Chọn phần quà này"

- **Copy — EN:** "ONE LAST LITTLE QUESTION"
- **Copy — VI:** "ANH HỎI THÊM MỘT CÂU THÔI"

- **Copy — EN:** "Are you sure, princess?"
- **Copy — VI:** "Em chắc chưa, công chúa?"

- **Copy — EN:** "Is this your final choice?"
- **Copy — VI:** "Em chốt món này nha?"

- **Copy — EN:** "Let Me Think"
- **Copy — VI:** "Để em nghĩ thêm"

- **Copy — EN:** "Yes, This One! 💗"
- **Copy — VI:** "Chốt món này anh ơi! 💗"

Reward titles/descriptions come from `src/data/rewards.ts` and their Vietnamese keys in `src/lib/i18n/dictionary.ts`. This content update does not change reward IDs, budgets or selection rules. The new Vietnamese dining descriptions are Anh mời; the optional preferred-restaurant field remains.

#### Available self-choice reward: `choice-one-gift`

- **Title — EN:** "One Gift — 1,000,000–1,200,000 VND"
- **Title — VI:** "Một món quà — 1.000.000–1.200.000 đồng"
- **Compact label — EN:** "One special gift"
- **Compact label — VI:** "Một món quà đặc biệt"
- **Description — EN:** "One gift you love, with a budget of 1,000,000–1,200,000 VND. Tell Tom what you have in mind."
- **Description — VI:** "Một món em thích với ngân sách 1.000.000–1.200.000 đồng. Nói anh nghe em đang ngắm gì nha."
- **Source:** `src/data/rewards.ts` → `SELF_CHOICE_REWARDS.find(r => r.id === "choice-one-gift")`; VI exact English-keyed entries in `src/lib/i18n/dictionary.ts`.

#### Available self-choice reward: `hotpot`

- **Title — EN:** "Hotpot Date — Your Choice"
- **Title — VI:** "Hẹn hò ăn lẩu — Anh mời"
- **Compact label — EN:** "Hotpot date"
- **Compact label — VI:** "Ăn lẩu"
- **Description — EN:** "A cozy hotpot date, at the place you choose, with your favorite person."
- **Description — VI:** "Hẹn hò ăn lẩu — Anh mời"
- **Source:** `src/data/rewards.ts` → `SELF_CHOICE_REWARDS.find(r => r.id === "hotpot")`; VI exact English-keyed entries in `src/lib/i18n/dictionary.ts`.

#### Available self-choice reward: `restaurant`

- **Title — EN:** "Restaurant Date — Your Choice"
- **Title — VI:** "Hẹn hò ăn ngon — Anh mời"
- **Compact label — EN:** "Dinner date"
- **Compact label — VI:** "Ăn tối"
- **Description — EN:** "Choose the restaurant. Tom will bring the romance (and his best manners)."
- **Description — VI:** "Hẹn hò ăn ngon — Anh mời"
- **Source:** `src/data/rewards.ts` → `SELF_CHOICE_REWARDS.find(r => r.id === "restaurant")`; VI exact English-keyed entries in `src/lib/i18n/dictionary.ts`.

#### Available self-choice reward: `bbq`

- **Title — EN:** "BBQ Date — Your Choice"
- **Title — VI:** "Hẹn hò ăn nướng — Anh mời"
- **Compact label — EN:** "BBQ date"
- **Compact label — VI:** "Ăn nướng"
- **Description — EN:** "Your favorite BBQ spot, a delicious meal, and a little extra time together."
- **Description — VI:** "Hẹn hò ăn nướng — Anh mời"
- **Source:** `src/data/rewards.ts` → `SELF_CHOICE_REWARDS.find(r => r.id === "bbq")`; VI exact English-keyed entries in `src/lib/i18n/dictionary.ts`.

### Selecting a reward card

- **Tom's speech — EN:** "That one? Excellent taste. Are you sure, princess?"
- **Tom's speech — VI:** "Em chọn món này hả? Có gu ghê. Chắc chưa công chúa ơi?"
- **Source:** `src/components/rewards/RewardChoice.tsx` → `onSelect`; `reactionFor(REWARD_SELECTED)`; Vietnamese dictionary key "That one? Excellent taste. Are you sure, princess?".
- **Configured expression:** `blushing`.
- **Configured gesture:** `heart` (semantic presentation metadata).
- **Actual rendered sprite:** `happy.webp` — eyes-closed smile with clapping hands.
- **Gesture rendering:** **approximation** — the requested `heart` is not a separate animated limb gesture. The visible pose is the eyes-closed smile with clapping hands sprite above.
- **Decorative effect:** `hearts` particles (disabled by reduced motion).
- **Hold / priority:** up to 4000 ms; priority 3. A later gameplay action can interrupt it.

### Reward finalized / successful result

- **Tom's speech — EN:** "Your reward is official. My heart was already yours."
- **Tom's speech — VI:** "Chốt quà cho em rồi nha. Còn tim anh thì em giữ từ lâu rồi."
- **Source:** `src/components/character/reactions.ts` → `reactionFor(RESULT_FINALIZED)` with `won: true`; Vietnamese dictionary key "Your reward is official. My heart was already yours.".
- **Configured expression:** `romantic`.
- **Configured gesture:** `heart` (semantic presentation metadata).
- **Actual rendered sprite:** `happy.webp` — eyes-closed smile with clapping hands.
- **Gesture rendering:** **approximation** — the requested `heart` is not a separate animated limb gesture. The visible pose is the eyes-closed smile with clapping hands sprite above.
- **Decorative effect:** `hearts` particles (disabled by reduced motion).
- **Hold / priority:** up to 6500 ms; priority 7. A later gameplay action can interrupt it.

### Lost or forfeited result finalized

- **Tom's speech — EN:** "No result could change it: you are still my favorite person."
- **Tom's speech — VI:** "Kết quả thế nào thì em vẫn là người anh thương nhất thôi."
- **Source:** `src/components/character/reactions.ts` → `reactionFor(RESULT_FINALIZED)` with `won: false` (explicit finalize/forfeit actions; not an automatic replacement for QUIZ_FAILED); Vietnamese dictionary key "No result could change it: you are still my favorite person.".
- **Configured expression:** `happy`.
- **Configured gesture:** `heart` (semantic presentation metadata).
- **Actual rendered sprite:** `happy.webp` — eyes-closed smile with clapping hands.
- **Gesture rendering:** **approximation** — the requested `heart` is not a separate animated limb gesture. The visible pose is the eyes-closed smile with clapping hands sprite above.
- **Decorative effect:** `hearts` particles (disabled by reduced motion).
- **Hold / priority:** up to 6500 ms; priority 7. A later gameplay action can interrupt it.

### Optional character interactions during quiz scenes

The optional POKE reaction requires five character pokes and can be rejected while an important reaction is active. IDLE has a configured line, but no automatic IDLE dispatcher currently exists in `useTomReactions`; do not treat it as a randomly occurring quiz line.

### Five-poke optional speech

- **Tom's speech — EN:** "Hey, princess! Stop poking me... unless you're asking for a kiss!"
- **Tom's speech — VI:** "Công chúa ơi, đừng chọc anh nữa… trừ khi em đang xin một cái hôn nha!"
- **Source:** `src/components/character/TomCharacter.tsx` → `onPoke`; `reactionFor(POKE)`; Vietnamese dictionary key "Hey, princess! Stop poking me... unless you're asking for a kiss!".
- **Configured expression:** `laughing`.
- **Configured gesture:** `blow-kiss` (semantic presentation metadata).
- **Actual rendered sprite:** `happy.webp` — eyes-closed smile with clapping hands.
- **Gesture rendering:** **approximation** — the requested `blow-kiss` is not a separate animated limb gesture. The visible pose is the eyes-closed smile with clapping hands sprite above.
- **Decorative effect:** `hearts` particles (disabled by reduced motion).
- **Hold / priority:** up to 4000 ms; priority 1. A later gameplay action can interrupt it.

### Configured IDLE line (not automatically dispatched)

- **Tom's speech — EN:** "Just checking: still your favorite boyfriend?"
- **Tom's speech — VI:** "Anh hỏi xíu thôi: anh vẫn là người yêu em mê nhất chứ?"
- **Source:** `src/components/character/reactions.ts` → `reactionFor(IDLE)`; Vietnamese dictionary key "Just checking: still your favorite boyfriend?".
- **Configured expression:** `smug`.
- **Configured gesture:** `wave` (semantic presentation metadata).
- **Actual rendered sprite:** `proud.webp` — wink and thumbs up.
- **Gesture rendering:** **approximation** — the requested `wave` is not a separate animated limb gesture. The visible pose is the wink and thumbs up sprite above.
- **Decorative effect:** none configured for this reaction.
- **Hold / priority:** up to 1800 ms; priority 0. A later gameplay action can interrupt it.

### Final ending / screenshot / replay

The ending letter is in `src/components/results/Finale.tsx`, with Vietnamese copy in `src/lib/i18n/results.ts`. It is separate from Tom's bubble. The finalized result review still requires Next: Our Little Ending before showing the screenshot-friendly card. Local references/date/time, selected reward and optional preference remain unchanged. Replay starts an independent playthrough; this document does not change persistence.

### Final result headings and screenshot-card labels

**Source:** `src/components/results/Finale.tsx`. These are implemented screen/button messages, not additional Tom speech.

- **Copy — EN:** "ANOTHER LITTLE CHAPTER OF US"
- **Copy — VI:** "THÊM MỘT CHƯƠNG NHỎ CỦA HAI ĐỨA"

- **Copy — EN:** "Congratulations,"
- **Copy — VI:** "Chúc mừng,"

- **Copy — EN:** "My Lucky Girl!"
- **Copy — VI:** "Em Bé May Mắn Của Anh!"

- **Copy — EN:** "A little intermission,"
- **Copy — VI:** "Nghỉ một chút thôi,"

- **Copy — EN:** "princess."
- **Copy — VI:** "công chúa ơi."

- **Copy — EN:** "Still My"
- **Copy — VI:** "Vẫn Là"

- **Copy — EN:** "Favorite Winner."
- **Copy — VI:** "Người Anh Thương Nhất."

- **Copy — EN:** "AURORA’S OFFICIAL LITTLE HAPPINESS"
- **Copy — VI:** "PHẦN HẠNH PHÚC NHỎ CHÍNH THỨC CỦA AURORA"

- **Copy — EN:** "A lovely win."
- **Copy — VI:** "Một chiến thắng thật xinh."

- **Copy — EN:** "Adventure paused."
- **Copy — VI:** "Tạm dừng cuộc phiêu lưu."

- **Copy — EN:** "Always loved."
- **Copy — VI:** "Lúc nào cũng được thương."

- **Copy — EN:** "No prize this time — all the love, always."
- **Copy — VI:** "Lần này không có quà — nhưng tình yêu thì luôn có."

- **Copy — EN:** "Made for"
- **Copy — VI:** "Dành cho"

- **Copy — EN:** "Adventure"
- **Copy — VI:** "Trò chơi"

- **Copy — EN:** "Result"
- **Copy — VI:** "Kết quả"

- **Copy — EN:** "Attempts used"
- **Copy — VI:** "Số lượt đã dùng"

- **Copy — EN:** "Final score"
- **Copy — VI:** "Điểm cuối"

- **Copy — EN:** "Last roll"
- **Copy — VI:** "Lần lắc cuối"

- **Copy — EN:** "Final spin"
- **Copy — VI:** "Lượt quay cuối"

- **Copy — EN:** "Recorded"
- **Copy — VI:** "Ngày giờ"

- **Copy — EN:** "Garden visit"
- **Copy — VI:** "Dạo khu vườn"

- **Copy — EN:** "Your little wish:"
- **Copy — VI:** "Điều em đang thích:"

- **Copy — EN:** "REFERENCE ·"
- **Copy — VI:** "MÃ KẾT QUẢ ·"

- **Copy — EN:** "“My heart. Every single day.” — Tom"
- **Copy — VI:** "“Tim anh. Ngày nào cũng dành cho em.” — Tom"

- **Copy — EN:** "Screenshot this moment, princess! 📸"
- **Copy — VI:** "Chụp lại khoảnh khắc này nha, công chúa! 📸"

- **Copy — EN:** "Keep this screenshot safe, princess. This result will only stay available while this page is open."
- **Copy — VI:** "Em nhớ giữ ảnh chụp màn hình nha. Kết quả này chỉ còn khi trang đang mở thôi đó."

### Ending letter — win

**Source:** `src/components/results/Finale.tsx`. These are implemented screen/button messages, not additional Tom speech.

- **Copy — EN:** "You did it, princess!"
- **Copy — VI:** "20/10 vui vẻ nha, em yêu."

- **Copy — EN:** "Whether it was your clever brain, your unbelievable luck, or just your talent for making your boyfriend weak in the knees, you’ve officially earned your reward."
- **Copy — VI:** "Dù hôm nay em quay trúng món quà nào, hay có thắng trò chơi nào đi nữa, thì cũng có một điều không bao giờ thay đổi."

- **Copy — EN:** "But between us... you’ve already won something much bigger."
- **Copy — VI:** "Em vẫn luôn là cô gái anh thương yêu nhất."

- **Copy — EN:** "My heart. Every single day."
- **Copy — VI:** "Cảm ơn em vì đã xuất hiện và khiến những ngày bình thường của anh trở nên đặc biệt hơn rất nhiều."

- **Copy — EN:** "Forever your biggest fan, Tom 💗"
- **Copy — VI:** "Yêu em nhiều, Tom. 💗"

### Ending letter — loss

**Source:** `src/components/results/Finale.tsx`. These are implemented screen/button messages, not additional Tom speech.

- **Copy — EN:** "Okay, maybe luck wasn’t exactly on your side this time."
- **Copy — VI:** "Có thể lần này may mắn hơi trốn em một chút."

- **Copy — EN:** "But here’s the thing, Aurora..."
- **Copy — VI:** "Nhưng Aurora ơi, anh nói em nghe nè…"

- **Copy — EN:** "No silly wheel, dice, or quiz could ever decide how special you are to me."
- **Copy — VI:** "Mấy vòng quay, viên xúc xắc hay câu đố đâu quyết định em đặc biệt thế nào với anh."

- **Copy — EN:** "You’ll always be my favorite person, my cutest troublemaker, and the best part of my days."
- **Copy — VI:** "Em vẫn là người anh thương nhất, cô bé quậy đáng yêu nhất, và phần đẹp nhất trong mỗi ngày của anh."

- **Copy — EN:** "And hey... there’s always another adventure waiting for us!"
- **Copy — VI:** "Với lại, lúc nào cũng còn một cuộc phiêu lưu mới chờ hai đứa mình mà!"

- **Copy — EN:** "All my love, Tom"
- **Copy — VI:** "Thương em nhiều, Tom."

### Ending letter — forfeit

**Source:** `src/components/results/Finale.tsx`. These are implemented screen/button messages, not additional Tom speech.

- **Copy — EN:** "Even the best adventures need a snack break."
- **Copy — VI:** "Chơi vui mấy cũng cần nghỉ ăn vặt mà em."

- **Copy — EN:** "No prize for this chapter, princess. But my love has absolutely no exit button. Come back whenever you’re ready for another little adventure."
- **Copy — VI:** "Chương này chưa có quà thôi, chứ tình yêu của anh thì không có nút thoát đâu nha. Khi nào thích mình lại chơi một chuyến mới."

- **Copy — EN:** "Still cheering for you, Tom ♡"
- **Copy — VI:** "Vẫn luôn cổ vũ em, Tom ♡"

### Screenshot request

- **Copy — EN:** "Your result is ready, princess! 💗 Take a screenshot and send it to Tom so he knows what his lucky girl won!"
- **Copy — VI:** "Có kết quả rồi nè, công chúa! 💗 Em chụp màn hình gửi anh Tom nha, để anh biết em bé may mắn của anh đã thắng món gì!"
- **Source:** `src/components/results/Finale.tsx` → `.screenshot-note`; VI `resultVi`; Vietnamese dictionary key "Your result is ready, princess! 💗 Take a screenshot and send it to Tom so he knows what his lucky girl won!".

### Replay / memory / garden controls

**Source:** `src/components/results/Finale.tsx`. These are implemented screen/button messages, not additional Tom speech.

- **Copy — EN:** "Play Again"
- **Copy — VI:** "Chơi lại nào"

- **Copy — EN:** "Look at Our Memories"
- **Copy — VI:** "Ngắm kỷ niệm hai đứa"

- **Copy — EN:** "Back to the Garden"
- **Copy — VI:** "Về khu vườn"

### Quit confirmation, available during the quiz

**Source:** `src/components/Experience.tsx`. These are implemented screen/button messages, not additional Tom speech.

- **Copy — EN:** "Leave this adventure"
- **Copy — VI:** "Dừng lượt chơi này"

- **Copy — EN:** "A LITTLE GOODBYE?"
- **Copy — VI:** "TẠM NGHỈ MỘT CHÚT NHA?"

- **Copy — EN:** "Leave this adventure?"
- **Copy — VI:** "Em muốn dừng lượt chơi này hả?"

- **Copy — EN:** "This records a forfeit with no reward, even if you have a prize waiting. You can start a fresh adventure afterward."
- **Copy — VI:** "Dừng ở đây là kết thúc lượt chơi và không nhận quà, kể cả khi đang có quà chờ em chọn. Sau đó em có thể chơi một lượt mới hoàn toàn."

- **Copy — EN:** "Stay a Little"
- **Copy — VI:** "Ở lại thêm chút"

- **Copy — EN:** "Yes, End This Adventure"
- **Copy — VI:** "Dạ, em muốn dừng cuộc chơi 😟"

## Source index and safe application notes

- `src/data/questions.ts`: official question IDs, EN text, options and correct answers. Keep scoring metadata untouched.
- `src/lib/i18n/questions.ts`: VI question/option display copy.
- `src/data/character-dialogue.ts`: `QUIZ_REACTIONS.<questionId>.<answerLabel>` with EN dialogue + expression + gesture.
- `src/lib/i18n/dialogue.ts`: VI Tom dialogue, including the updated quiz preview and dismiss action.
- `src/components/character/reactions.ts`: contextual fallback, shared events, baseline, duration/priority/effect and cancellable reaction controller.
- `src/components/character/sprites.ts`: the actual eight-pose approximation mapping. `TomCharacter.tsx` renders it; no articulated eye/arm rig exists.
- `src/components/games/GamePanel.tsx`: quiz answer panel, navigation, failed-attempt retry panel and begging form.
- `src/components/games/GameOutcome.tsx`, `src/components/shared/CelebrationEffects.tsx`: held score/result, celebration and Next acknowledgement.
- `src/components/rewards/RewardChoice.tsx`: reward browsing/confirmation. `src/components/results/Finale.tsx`: ending letters and screenshot instruction.
- `src/lib/i18n/dictionary.ts`, `results.ts`, `errors.ts`: VI shared UI, results and validation respectively. `translate.ts` resolves text at render time.
- No new quiz dialogue, randomized line, animation, answer key, rule or retry behavior was introduced during extraction. Only the explicitly requested Vietnamese preview/button/reward copy was updated.
