# English / Vietnamese update

The application now has an EN | VI header toggle, with English as the first-visit default. The language is saved separately as `aurora.language`, updates `document.documentElement.lang`, and survives scene changes, refreshes and independent new playthroughs. The existing `aurora.standalone.v1` game/result storage format is unchanged. If storage is unavailable, the language still works for the current page session.

## Structure and future copy

- `src/lib/i18n/dictionary.ts` is the central dictionary and exports the `Language` and `TranslationKey` types. It composes UI/rule/reward copy with `dialogue.ts`, `questions.ts`, `results.ts` and `errors.ts`. English source messages are the stable translation keys; Vietnamese is authored copy, not an external translation service. There are 434 message keys, plus small dynamic accessibility templates in `translate.ts`.
- `src/components/i18n/LanguageProvider.tsx` owns the shared language preference and compact toggle. A toggle also appears inside dialogs because native modal dialogs make the header inert. This lets Aurora change language while keeping a begging draft open.
- The same provider owns the page title (English during server rendering, then the selected language). The layout keeps description/robots metadata; a second static title would overwrite the saved Vietnamese title during refresh.
- `useLocalizedTree()` localizes React render output: text, SVG text, image alternatives, placeholders and accessibility labels. It does not rewrite the DOM or translate component types, keys, event handlers, input values, IDs, actions or game data. Existing components only wrap their render output. They are not duplicated or remounted on language changes.
- `useLanguage().t(key)` provides typed direct lookup for new copy. Add a complete English-message key and natural Vietnamese value to the appropriate dictionary file, then use `t` or the existing localized render wrapper. If English source copy changes, update its dictionary key too. Add coverage for a newly localized component to `i18n.test.ts`.
- To add another language, extend `Language`, add that locale's typed dictionary, extend the provider's saved-locale validation/toggle, and choose its dictionary/date/font in the translation layer. Never create language-specific game IDs or copy a game implementation.
- User-authored reward preferences and begging drafts are preserved verbatim. Dates use `vi-VN` or `en-GB` formatting in the existing ICT time zone. Vietnamese uses the installed Times New Roman serif to keep all diacritics readable; body copy retains the existing Arial font. No remote fonts or new dependencies were added.

## Gameplay and timing

Question IDs, A/B/C mappings and all fifteen correct answers are unchanged. Translations only change displayed questions/options and answer-specific Tom dialogue. Wheel segments/rewards, dice predictions, attempts, quiz scoring/retries, character sprites, audio, celebrations, Next flow, standalone mode and result persistence are unchanged.

`src/lib/words.ts` counts practical whitespace-separated words for both languages, including accented and decomposed Vietnamese. The interface and shared rules engine use the same counter. Thirty words fail; thirty-one words unlock exactly the same one bonus attempt as before. It does not detect or verify which language was written. Instructions request English in EN and Vietnamese in VI. Switching language never submits the message or consumes an attempt.

The opening delay in `Experience.tsx` is now 5,000 ms. Its existing effect starts when the authenticated opening scene is mounted, does not depend on language, and clears its timer on scene changes/unmount. It still only brings in the gift; Aurora must click to open it. The existing gift animation and audio are unchanged.

## Files changed

- Added `src/lib/i18n/{dictionary,dialogue,questions,results,errors,translate}.ts`, `i18n.test.ts`, `src/components/i18n/LanguageProvider.tsx`, `src/lib/words.ts`, `release-e2e/language.spec.ts` and this document.
- Updated `src/app/layout.tsx`, `src/app/globals.css` and `src/components/Experience.tsx` for the provider, compact responsive controls and five-second delay.
- Added presentation wrappers to `GameHub`, `GameRules`, `GamePanel` (including Wheel/Die), `GameOutcome`, `RewardChoice`, `Finale`, `TomCharacter`, `TomSprites`, `PhotoCard` and `Modal`. Finale also formats the date for the selected language and protects free-form reward preferences.
- Updated only the word-count helper in `src/lib/game-rules/engine.ts`; all transition rules, IDs and thresholds remain unchanged. The old exported helper name remains for compatibility.
- Updated `README.md` to describe both languages and the shorter opening.

## Verification

TypeScript, ESLint, unit tests and the production build were executed. Unit coverage verifies all fifteen IDs/correct answers, question/reward/photo/greeting/Tom copy, static component and accessibility copy, unchanged render keys/handlers/input values, and 30/31-word Vietnamese validation. Production browser coverage verifies the real five-second delay while switching language, persisted preference, quiz order/score/feedback, wheel/dice attempts, modal draft preservation, successful Vietnamese unlock, reactions, rewards/endings/replay, and mobile header/page bounds. The pre-existing standalone production journeys are included.

Final results: **92 unit tests passed, 8 production browser tests passed (4 bilingual + 4 existing release journeys), and all 19 original browser/HTTP regression tests passed. TypeScript, ESLint, the Next.js production build and Git whitespace checks passed.** The original HTTP tests used only the local test/demo backend with external credentials cleared; standalone production remains unchanged and makes no gameplay API calls. Screenshots were visually inspected in desktop and mobile Chrome. Physical iOS/Android devices were not tested.

Screenshots:

- [Vietnamese quiz desktop](../artifacts/bilingual-quiz-vi-desktop.png)
- [Vietnamese quiz mobile](../artifacts/bilingual-quiz-vi-mobile.png)
- [Vietnamese begging dialog](../artifacts/bilingual-begging-vi-mobile.png)
- [Vietnamese ending/result card](../artifacts/bilingual-ending-vi-mobile.png)

This is a local source update ready for the existing GitHub/Vercel workflow after verification; it has not been pushed or deployed by this task. Supabase, Resend and email retries remain disabled in the standalone release.
