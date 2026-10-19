> Historical Phase 2 report. The SVG runtime described below was replaced by the exact extracted sprites and global audio in [Phase 3](phase-3.md).

# Phase 2: illustrated Tom and responsive reactions

The production game engine, authentication, database schema, reward definitions, quiz answer bank, email outbox and recipient are unchanged. This phase replaces presentation and interaction code in place.

## Changed and added files

- `src/components/character/TomCharacter.tsx`: SVG puppet host, gaze, blinking, idle gestures, gift reveal, five-poke interaction, bubbles and particles. The runtime no longer loads a portrait image.
- `src/components/character/TomPuppet.tsx`: independently rendered torso, head, eyes/pupils, brows, mouth, blush, sleeves and hands. Motion values animate SVG arm rotations around explicit shoulder coordinates; every interrupted gesture stops its previous animation/subscription.
- `src/components/character/model.ts`: fourteen face configurations and twelve gesture configurations, including the resting pose.
- `src/components/character/reactions.ts`: events, server-response event mapping, baseline poses, and a cancellable reaction controller.
- `src/data/character-dialogue.ts`: contextual A/B dialogue for all fifteen questions, plus Q8's C response. Reactions run after server grading and never determine correctness.
- `src/hooks/useTomReactions.ts`: React subscription/lifecycle integration.
- `src/components/character/character.css`: puppet, gift, speech, gesture and particle styling; obsolete portrait styles removed.
- `src/components/Experience.tsx`: event dispatch, exact “Dear Aurora.” branding, and explicit presentation acknowledgements.
- `src/components/games/GamePanel.tsx`: immediate selected-answer animation/lock, wheel reroll reaction and shared dice visuals.
- `src/components/games/GameOutcome.tsx`: held victories/final failures with frozen values, scores and explicit Next controls.
- `src/components/shared/CelebrationEffects.tsx`: bounded, decorative confetti/hearts/fireworks; effects clean up after 4.8 seconds.
- `src/components/rewards/RewardChoice.tsx`: reward-selection reaction callback.
- `src/app/globals.css`: celebration layout, clean quiz question styling and responsive controls. The original global pink text-selection color was the likely source of the screenshot highlight; question text now has a neutral background and a soft green selection color.
- `src/components/character/reactions.test.ts`, `e2e/experience.spec.ts`: reaction, real SVG facial-part, lifecycle, layout, celebration, failure and preserved-game-flow checks.
- `public/assets/tom/illustrated/expression-sheet.png`: generated design/reference sheet.
- `README.md`, `docs/phase-2.md`: updated handoff and implementation notes.

## Facial changes and gestures

Functional faces: neutral, happy, excited, laughing, smug, pouting, mock angry, sad, shocked, blushing, thinking, celebrating, nervous and romantic. Faces change actual SVG eye paths, pupil presentation, eyebrow rotations, mouth paths and blush opacity. The mouth is an independent illustrated part; this is not moving a photograph or swapping speech text alone.

Functional gestures: wave, thumbs up, point, facepalm, crossed arms, clap, raised-arm cheer, blow kiss, send heart, dramatic crying, good-luck/praying hands, and rest. Crossed arms use a dedicated connected forearm pose. Clap, wave and cheer have bounded arm animation; kisses/hearts combine an arm pose, facial change and floating hearts. Crying adds animated tears. Normal idle is restrained breathing, periodic blinks and occasional small gaze/head/arm changes. Desktop pupil tracking is smoothed and clamped; during spins/rolls the gaze targets the actual wheel pointer/dice area. The phone dock remains visible while scrolling, with reserved layout space and control scroll offsets. Reduced-motion keeps the expressions and gestures visible while removing repeated movement and decorative bursts.

The original `public/assets/tom/portrait.png` and earlier transparent cutout are preserved as references. Their facial pixels are not used by the new runtime character. The illustrated hair, youthful face and white collared shirt are inspired by the source.

## Event ordering

Gameplay events start before an actual spin/roll request and settle after the existing animation resolves and authoritative server response is received. Every answered quiz question emits an event using its question ID, selected answer and server correctness. Every new deliberate user action replaces the older reaction and cancels its timer. Optional idle/poke events cannot override active gameplay reactions and have a cooldown. Expired reactions return to the current scene's baseline. A dice miss progresses from disappointment to an encouraging smile, then baseline; new input can interrupt either stage.

Exceptions are intentional: choosing Jungkook is officially correct, but Tom still facepalms about the “betrayal.” A joke never changes the score or hides correct-answer feedback.

## Held results and Next

The server still enters `reward` after a winning dice roll or passed quiz. The client presents `GameOutcome` before rendering `RewardChoice`. A player must click **Next: Choose Your Reward 💝**; time passing or the confetti ending cannot open rewards. Final failures and accepted/final wheel prizes similarly hold before **Next: Our Little Ending**. Wheel candidate Keep/Spin Again choices remain unchanged, and the wheel never opens self-choice rewards.

This acknowledgement is presentation-only and makes no API call. Finalization/outbox creation still happen exactly once through the existing backend. Reloading a held result displays it again from the saved authoritative state, preserving attempts and final values; it does not create a new result. Reloading after Next can show the acknowledgement again. Retries still available inside a failed quiz/dice game retain their retry/unlock controls.

## Art generation provenance

Used the built-in imagegen tool with the portrait as design inspiration and transparent output. The [exact full prompt](../public/assets/tom/illustrated/generation.txt) is saved with the asset; its brief was:

> Create a cohesive 4-column by 3-row waist-up expression sprite sheet of the same cute romantic anime/chibi Vietnamese boyfriend. Short side-parted voluminous black hair, youthful rounded face, brown eyes, white collared shirt; warm skin, charcoal hair, rose blush, clean brown outlines and subtle cel shading. Transparent background. Neutral; happy wave; excited raised hands; laughing/clapping; smug wink/thumbs up; pouting/crossed arms; mock angry/pointing; dramatic crying; shocked/facepalm; blushing/blowing kiss; thinking; celebrating with hearts. Keep scale, identity and shirt consistent. Complete visible arms/hands, no box, no cropped or overlapping cells, no text, labels, logo or watermark. Use the photo only for original illustrated design inspiration.

The saved sheet is a visual design/reference deliverable. The runtime uses the separately authored layered SVG puppet so eyes, pupils, brows, mouth and arms can be controlled independently. It is not advertised as an automatically vectorized/generated layered rig. No external API key was requested.

## Verification and limits

See the current README for executed check totals. Browser coverage includes correct/wrong Q1 faces and mouth shapes, question-specific gestures/dialogue, rapid double-click answer locking, safe idle return, exact branding, a frozen dice win, measured shoulder attachment during animation, particle cleanup/pointer passthrough, explicit Next to rewards, a held five-roll failure, no refinalization from Next, missing-photo fallback, and desktop/320–390 px mobile layouts. Existing wheel/dice/quiz rules and real local HTTP persistence/idempotency tests remain in the suite.

The puppet is a stylized 2D illustration. Gesture fingers are deliberately simplified, and there is no audio lip sync or 3D skeletal simulation. New sound recordings were not added. Existing live Supabase/Resend connectivity still needs owner credentials; this presentation change does not claim a live email test.
