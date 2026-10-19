# Character sprites and audio upgrade

This is an in-place upgrade in `D:\2010`. No new project, deployment, character generation, dependency installation, server API, database migration, reward, authentication, scoring or email changes were made.

## Artwork and the original mismatch

The actual old runtime rendered a separately authored SVG in `TomPuppet.tsx`. The much more polished generated sheet was only a design reference, so its proportions, drawing detail, hands and faces never appeared in the browser. Scaling or animating that SVG could not reproduce the source artwork.

The current runtime uses **eight extracted transparent lossless WebP sprites directly from that exact existing sheet**, `public/assets/tom/illustrated/expression-sheet.png`. The source is a 1312 by 1199 RGBA image with twelve poses in a four-by-three grid, despite being described in the request as an eight-expression sheet. Eight appropriate poses were selected; the original sheet and portrait are untouched. No replacement art was generated.

`scripts/extract-tom-sprites.mjs` reproduces the extraction. Alpha-connected-component cleanup removes detached white specks and neighboring-cell fragments, preserving the white shirt, dark hair, expressive hands and antialiased edges. Every sprite has a 512 by 560 transparent canvas, the same uniform 1.2 scale and a measured head/eye anchor at 256, 215. Source rectangles, offsets and provenance are recorded in `public/assets/tom/sprites/manifest.json`.

All eight images are preloaded/decoded from the root and eagerly mounted in a fixed stack. Switching uses a 200 ms opacity crossfade and small scale transition. An unavailable or still-loading next image retains the last decoded pose. The fixed canvas, `object-fit: contain`, reserved desktop dialogue slot and gift/torso anchor prevent reframing between poses. Celebration has a bounded subtle bounce; reduced motion suppresses decorative animation. The original gift, theme, dialogue, compact sticky mobile dock and five-poke interaction remain.

## Expression mappings

The presentation controller retains its existing fourteen semantic mood labels and answer-specific jokes. Rendering maps them to these eight complete poses; it does not claim independent moving eyes or limbs.

| Sprite | Source cell (column, row; zero based) | Uses |
| --- | --- | --- |
| `idle.webp` | 0, 0 | Neutral baseline, rules/thinking, reward browsing |
| `greeting.webp` | 1, 0 | Happy + wave at the gift reveal |
| `happy.webp` | 3, 0 | Happy/laughing/blushing/romantic; most correct answers, reward selection, ending |
| `excited.webp` | 3, 2 | Excited/celebrating; wheel prizes, dice/quiz wins and victory |
| `proud.webp` | 0, 1 | Smug; game preview, successful begging and some quiz answers |
| `angry.webp` | 2, 1 | Pouting/mock angry; playful wrong-answer reactions and wheel rerolls |
| `shocked.webp` | 0, 2 | Shocked/nervous; spinning/rolling suspense, bad luck and surprised quiz reactions |
| `crying.webp` | 3, 1 | Sad; dice loss and failed quiz/result comfort |

Correctness remains authoritative on the server. Contextual jokes still choose the closest pose; for example, q1 correct shows happy, q1 wrong shows shocked, while the Jungkook answer can prompt mock anger. Reactions last 3.5 to 8 seconds and the existing cancellable controller prevents stale timers from replacing a newer reaction. Dice disappointment changes to encouragement before returning to baseline.

## Music and effects

The supplied **`public/assets/music/background.mp3` exists (3,467,193 bytes)** and the root player now references `/assets/music/background.mp3`. The obsolete missing-file instruction was removed from the UI and current README.

`AudioProvider` is mounted once in `src/app/layout.tsx`. `AudioManager` owns that one HTML music element and one lazily unlocked Web Audio context for cached effect buffers. Music loops at volume 0.35. Autoplay is attempted normally; a blocked attempt waits for a trusted pointer/keyboard action. There is no policy bypass. Repeated actions reuse the same player/context.

The single header toggle controls everything. It saves `aurora.audio.enabled` in localStorage, reads it before autoplay, pauses music without resetting its playback time, stops all active/pending effects and wheel ticks, and suspends the effects context. Ordinary taps never override explicit mute. Enabling resumes the same position and context. Missing music displays a graceful unavailable message while effects and gameplay still work. Errors already present before provider attachment are also recognized.

Fifteen original deterministic tone/noise effects were synthesized with `scripts/generate-sounds.mjs`. They contain no sampled third-party recordings. Usage provenance is in `public/assets/sounds/README.md`; the separately supplied BGM's rights are unchanged. Total effects size is 407,052 bytes, mono 22.05 kHz PCM WAV.

| Files under `public/assets/sounds/` | Trigger |
| --- | --- |
| `bloom.wav`, `gift-shake.wav`, `gift-open.wav`, `tom-appear.wav` | Garden entrance, gift arrival/open, Tom reveal/poke |
| `ui-hover.wav`, `ui-click.wav` | Entering a button, clicking a button; rate limited |
| `wheel-spin.wav`, `wheel-stop.wav` | Bounded ticking loop during spin; stop and chime on outcome |
| `dice-roll.wav` | Dice animation starts |
| `correct.wav`, `wrong.wav` | Quiz grading; wrong also covers loss/comfort feedback |
| `begging.wav` | Server accepts a begging request |
| `reward.wav` | Reward choice / successful finalization |
| `victory.wav` | Dice/quiz wins and held celebration |
| `ending.wav` | Explicit Next into the romantic ending |

Effects have short fades and peak amplitude at most 0.25, followed by a quiet 0.16 effects bus. At most three voices play simultaneously; important feedback displaces UI noise. Hover/click/repeated events have cooldowns. Wheel loops stop on outcome/error/mute/unmount and have a six-second safety cap. Victory smoothly ducks BGM to 0.20, then restores 0.35. Cleanup cancels timers, pending playback and source nodes. Missing/unsupported effects cannot block gameplay.

## Changed files

- Modified: `src/app/layout.tsx`, `src/components/Experience.tsx`, `src/components/games/GameOutcome.tsx` for the global provider, scene/event hooks and universal toggle.
- Modified: `src/components/character/TomCharacter.tsx`, `character.css`, `model.ts`, `reactions.test.ts`; removed obsolete `TomPuppet.tsx` and its unused SVG geometry/styles/tests.
- Added: `src/components/character/TomSprites.tsx`, `sprites.ts`.
- Added: `src/components/audio/AudioProvider.tsx`, `src/lib/audio/AudioManager.ts`, `sounds.ts`, `AudioManager.test.ts`.
- Added: the two reproducible scripts, eight sprite WebPs, sprite manifest and QA contact sheet, fifteen WAVs and their provenance README.
- Modified: `e2e/experience.spec.ts`, `README.md`; marked `docs/phase-2.md` historical and added this report.
- Generated: current browser screenshots under `artifacts/phase3-*.png`.

No business-rule, server persistence, authentication, route-handler, outbox, email, question or reward source files changed in this upgrade.

## Verification and screenshots

Unit tests cover all prior game/backend rules plus sprite transparency/framing/mappings, autoplay/mute/resume, early media errors, deferred decode cancellation, mixing limits, looping cleanup, volume ducking and sound asset integrity. Browser tests use the real MP3 decoder/player and real Web Audio buffer sources; probes record native playback, and one deliberate test gate simulates a rejected autoplay attempt without bypassing browser restrictions.

Browser coverage includes the full opening and all games, correct/wrong image changes, stable framing, decoded crossfades, delayed sprite loading, held victory/reward gates, real local HTTP auth/idempotency/reload/logout, MP3 decoding and end-of-track wrap, one persistent player/context, muted effects, saved preference after reload, resumed position, touch-based first activation, scene persistence, wheel/dice/reward/ending effect starts, unavailable music, and no console/runtime errors in the normal audio flow.

Screenshots were visually inspected against the source sheet:

- [Idle desktop](../artifacts/phase3-idle-desktop.png)
- [Greeting desktop](../artifacts/phase3-greeting-desktop.png) and [mobile](../artifacts/phase3-greeting-mobile.png)
- [Correct quiz answer](../artifacts/phase3-quiz-correct-desktop.png)
- [Wrong quiz answer desktop](../artifacts/phase3-quiz-wrong-desktop.png) and [mobile](../artifacts/phase3-quiz-wrong-mobile.png)
- [Dice victory](../artifacts/phase3-dice-celebration-desktop.png)
- [Quiz victory desktop](../artifacts/phase3-quiz-victory-desktop.png) and [mobile](../artifacts/phase3-quiz-victory-mobile.png)
- [Eight extracted poses](../public/assets/tom/sprites/contact-sheet.png)

Final verification: **83 unit tests passed (8 files), 19 browser/HTTP tests passed, TypeScript passed, ESLint passed, and `next build` passed** on Next.js 16.4.2. The idle screenshot test was also rerun successfully after adding an explicit entrance-animation wait for a clear capture. Build output retains `/`, `/_not-found`, `/api/session`, `/api/login`, `/api/logout`, `/api/game` and `/api/email/retry`.

## Limits

Browser verification uses installed Chrome, including a touch/mobile viewport; physical iPhone Safari, Android hardware, speakers and subjective listening balance were not directly tested. Autoplay permission remains browser-dependent. Sprite transitions preserve complete source artwork rather than independently animating pupils/fingers. Live Supabase/Resend services and real email delivery were not exercised; their code remains unchanged. No deployment was requested or performed.
