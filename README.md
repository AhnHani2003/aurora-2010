# A little love, a lot of luck

A private October 20 surprise from Tom to Aurora: a botanical garden and eight memories, a ten-second gift reveal, an expressive illustrated chibi host, three complete games, held victory celebrations, rewards, saved result cards, romantic endings, and unlimited fresh adventures. The website is entirely English.

## Run locally

Requires Node 20.9 or newer (developed with Node 24) and npm. Work directly in this folder, without creating a nested project.

```powershell
npm.cmd ci
npm.cmd run dev
```

Open **http://localhost:3000**. On Windows, `npm.cmd` avoids PowerShell's script execution-policy restriction. On macOS/Linux, use `npm` instead.

The release defaults to **standalone mode in both development and production**, without Supabase, Resend, a writable server filesystem, server sessions or production secrets. The entry code is **aurora**. This is a playful client-side gate, not secure authentication; the client-side rules and answers are inspectable and results can be edited by the visitor.

`NEXT_PUBLIC_RELEASE_MODE=standalone` is the explicit Vercel release setting (also the default when unset). Only `backend` enables the preserved server integrations. Rebuild after changing it; `NODE_ENV=production` never enables backend mode automatically.

Active progress and completed results, including their unique reference, date/time and reward, are saved under `aurora.standalone.v1` in localStorage. **Storage is device/browser/origin-specific, is not cloud backup, and can be cleared by the browser or visitor.** Private browsing may discard it. If blocked or full, gameplay continues in memory, and the result asks Aurora to keep her screenshot because it only lasts while the page remains open. Every completed result asks her to screenshot and send it to Tom. There is no email or server-save claim. Replay starts a new independent adventure while retaining completed local results when storage works. Clear site storage to reset this browser's progress.

The current UI does not call gameplay/login/session APIs. All preserved `/api/*` handlers immediately return 404 in standalone mode, including email retries. Migrations and retry workers are not run. Assets, audio, all game rules and the Next-button flow are unchanged.

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run build
npx.cmd --no-install playwright test --config playwright.release.config.ts
npm.cmd start
```

`start` serves the production build with the same standalone behavior; no backend environment variables are needed. The release browser suite starts/stops its own production server on port 3001. The older `e2e/` suite is retained for backend-mode regression checks; stop an existing port-3000 server before running it.

## Stack and organization

Next.js App Router, strict TypeScript, React, Tailwind 4, Motion for React, lightweight SVG/CSS artwork, Zod, PostgreSQL on Supabase, Resend, Vitest, and Playwright. Versions are resolved in `package-lock.json`.

- `src/components/Experience.tsx`: journey, session recovery, opening, timer and gift; narrow components implement individual scenes.
- `src/components/garden/`: SVG botanicals, graceful missing-photo cards.
- `src/components/character/`: eight extracted chibi sprites, stable framing and cancellable event-driven reactions.
- `src/components/game-hub/`, `games/`, `rewards/`, `results/`: game selection, separate rules, gameplay, reward confirmation and result/ending.
- `src/lib/game-rules/`: shared unchanged game transitions; unbiased Web Crypto randomness in Node and the browser.
- `src/lib/auth/`, `db/`, `email/`: private server-only authentication, transactions, audit history and delivery.
- `src/app/api/`: validated HTTP endpoints, origin checks and cookie authentication.
- `supabase/migrations/`: production tables, constraints, indexes and RLS.
- `e2e/`: browser journeys plus a real HTTP persistence/concurrency test.

## Photos and music

Tom now renders eight transparent lossless WebP sprites extracted from the existing generated sheet at `public/assets/tom/illustrated/expression-sheet.png`. The original portrait and source sheet are untouched. The previous separate SVG recreation has been removed. See [the character and audio upgrade report](docs/phase-3.md) for assets, mappings, changed files and browser screenshots.

Place Aurora's real photos at these exact paths. They are centrally configured in `src/data/photos.ts`; refresh after adding files. Missing files show botanical placeholders, never unrelated women's photos or a broken-image icon.

| Caption             | Exact file                                        |
| ------------------- | ------------------------------------------------- |
| My Favorite Smile   | `public/assets/aurora/01-my-favorite-smile.jpg`   |
| The Prettiest Girl  | `public/assets/aurora/02-prettiest-girl.jpg`      |
| My Little Sunshine  | `public/assets/aurora/03-little-sunshine.jpg`     |
| Cute but Chaotic    | `public/assets/aurora/04-cute-and-chaotic.jpg`    |
| My Princess         | `public/assets/aurora/05-my-princess.jpg`         |
| The Heart Stealer   | `public/assets/aurora/06-heart-stealer.jpg`       |
| Our Little Moments  | `public/assets/aurora/07-our-little-moments.jpg`  |
| Forever My Favorite | `public/assets/aurora/08-forever-my-favorite.jpg` |

The supplied music at `public/assets/music/background.mp3` is connected to one persistent root audio player, looping at 35% volume. It attempts autoplay and uses the first trusted interaction if blocked. Sound on/off controls music and all fifteen original synthesized effects under `public/assets/sounds/`, remembers the preference, and resumes music from its paused position. A missing music file shows a graceful unavailable state. See `public/assets/sounds/README.md` for sound provenance and reproduction.

## Illustrated Tom and celebrations

Tom uses idle, greeting, happy, excited, proud, angry, shocked and crying poses from the exact supplied artwork. All share a 512 by 560 transparent canvas, uniform scale and measured head anchor. The sprite stack preloads every pose and crossfades between decoded assets without changing layout. Semantic reactions still use fourteen mood labels, mapped to the closest of those eight sprites. Subtle breathing, celebration bounce and the five-poke interaction remain. Reduced motion disables decorative movement. Desktop dialogue has a reserved slot so text length cannot shift Tom's head and gift box; mobile keeps the compact sticky dock.

All fifteen quiz questions have configurable, answer-specific dialogue in `src/data/character-dialogue.ts`. Correctness comes from the unchanged shared rules engine (in the browser for standalone, on the server for backend mode). A correct Jungkook answer can still make Tom facepalm; the joke never changes scoring. Reaction timers return safely to a baseline, and optional idle/poke reactions cannot interrupt important gameplay. Mobile uses a compact sticky dock that reserves layout space, with scroll offsets keeping controls clear. Reduced motion keeps readable facial/gesture states while disabling repeated movement and decorative bursts.

Dice and quiz victories hold the game result/score with bounded confetti, fireworks, hearts and Tom celebrating. **Next: Choose Your Reward 💝** is required to open reward selection. Final failures and finalized wheel results similarly wait for **Next: Our Little Ending**. These acknowledgements make no API call and do not finalize again. Reloading preserves server progress and may show the celebration acknowledgement again. See [docs/phase-2.md](docs/phase-2.md) for the changed-file list, architecture, tests and limitations.

## Customize

- Greeting and introductions: `src/data/dialogue.ts`.
- Contextual Tom lines: `src/data/character-dialogue.ts` and `src/components/character/reactions.ts`. Ending letters: `src/components/results/Finale.tsx`.
- Six wheel categories, four self-choice rewards and budgets: `src/data/rewards.ts`. The two-gift budget is a combined total, not an amount for each gift.
- All fifteen exact quiz questions/answer labels: `src/data/questions.ts`. In backend mode, answers are graded on the server; in standalone mode, the same rules and questions run locally.
- Colors, spacing, typography, responsive layouts: `src/app/globals.css`; character styling: `src/components/character/character.css`.

## Deploy this standalone release to Vercel

1. Push this project root to your Git repository. Include `package-lock.json`, `src/` and all `public/` assets. `.gitignore` already excludes `.env.local` (all `.env*` except `.env.example`), `.next/`, `.data/` and `.vercel/`. Never commit credentials. If an environment file was previously tracked, remove it from Git tracking before pushing.
2. In Vercel, choose **Add New > Project**, import that repository, select **Next.js**, and use the directory containing `package.json` as **Root Directory** (`./` if the repository is this folder).
3. Use **Install Command: `npm ci`**, **Build Command: `npm run build`**, **Output Directory: framework default**, and **Node.js: 24.x** (the version verified locally). Do not set a custom start command or static-export output directory.
4. Set **`NEXT_PUBLIC_RELEASE_MODE=standalone`** for Production and Preview before building. No other variables are required. Leave Supabase/Resend integrations, database migrations and scheduled email retries disabled; remove any existing Vercel cron entry for `/api/email/retry` if one was set up outside this checkout.
5. Click **Deploy**. Open the HTTPS URL, unlock with `aurora`, check the photo gallery/audio, complete a game, screenshot the result and use Play Again. If changing the mode later, redeploy so its build-time value is updated.

Vercel references: [Git import](https://vercel.com/docs/git), [build settings](https://vercel.com/docs/builds/configure-a-build). Deployment itself has not been performed by this release-preparation task.

## Preserved integrations: backend mode only

The following setup and server-specific notes apply **only** after explicitly selecting `NEXT_PUBLIC_RELEASE_MODE=backend` and rebuilding. They are not required for this standalone release. Supabase migrations and all email/auth/outbox code remain intact for future use. Standalone data is local and is not automatically migrated to a future backend.

### Optional private authentication, Supabase and Resend

Copy `.env.example` to **`.env.local`** and fill it locally. Never paste keys/passwords into chat and never commit the environment file.

| Variable                 | Purpose                                                          |
| ------------------------ | ---------------------------------------------------------------- |
| `AURORA_ACCESS_PASSWORD` | Aurora's private entrance password                               |
| `SESSION_SECRET`         | Random secret of at least 32 characters                          |
| `SUPABASE_DATABASE_URL`  | Private Supabase transaction-pooler PostgreSQL connection string |
| `RESEND_API_KEY`         | Server-only Resend API key                                       |
| `RESULT_EMAIL_FROM`      | A sender on a verified Resend domain                             |
| `RESULT_EMAIL_TO`        | `manhthong2003@gmail.com` (notification recipient)               |
| `EMAIL_RETRY_SECRET`     | Separate 32+ character token for the delivery retry worker       |

Generate independent secrets locally, for example `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Enter the output only in your local/server environment.

1. Create a Supabase project and run `supabase/migrations/202610190001_initial.sql` in its SQL editor. The migration is rerunnable for the defined schema. Use a dedicated project for this private experience.
2. Copy the transaction-pooler connection string from **Connect** into `SUPABASE_DATABASE_URL`, URL-encoding special characters in the database password. TLS is used; prepared statements are disabled for pooler compatibility.
3. Set the entrance password and session secret. Restart the dev server after changing environment settings. With all three auth/database variables present, the demo banner disappears and real persistence is active.
4. Verify a sender/domain in Resend, then set `RESEND_API_KEY` and `RESULT_EMAIL_FROM`. The recipient address is **not** an assumed verified sender.
5. Set `EMAIL_RETRY_SECRET`. Use an external scheduler to POST `/api/email/retry` with `Authorization: Bearer <EMAIL_RETRY_SECRET>` every minute. The token stays outside the browser. Finalization and result reloads also attempt eligible notification delivery.

The server uses a direct private PostgreSQL connection, so `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are not required. Detailed SQL verification and retry operations are in **[supabase/README.md](supabase/README.md)**.

Authentication uses a random opaque token in a 30-day HttpOnly, SameSite cookie (Secure in production); only its keyed hash is stored. Login/game endpoints have rate limits and reject mismatched Origin. A transaction locks each session before applying a game action. Every action carries the active playthrough ID, expected version and operation UUID. Attempt limits and terminal state/version consistency also have database constraints.

Finalization and the unique outbox record commit together. Email delivery never blocks the saved result card. HTML and plain-text messages include reference, Asia/Ho_Chi_Minh timestamp, all relevant histories, begging messages/attempt numbers, preferences and final outcome. Retries use a fixed provider idempotency key plus database locking and a crash-safe first-attempt marker; ambiguous delivery stops after eight attempts or 23 hours and needs review. `sent` means the provider accepted the message; check Resend's dashboard for final delivery/bounces.

To test real email: configure the verified sender and credentials, complete one deliberate test playthrough, inspect `playthroughs` and its one `email_outbox` record in Supabase, then confirm the corresponding Resend log and recipient inbox. Missing credentials must show pending/unconfigured rather than sent. Refreshing/retrying must retain one logical job. **Live Supabase and Resend were not exercised during implementation because no credentials were provided.**

## Tests and verification

Unit tests cover selection gates, locked games, wheel category/attempt limits, discarded rewards, separate one-use begging unlocks, dice sums/boundaries and immediate win, fifteen-question mappings/ten-question sampling, seven-versus-six threshold, quiz retries and final-answer review, answer secrecy, one reward/finalization, server persistence, concurrency/idempotency, replay/history, auth/rate/origin/body validation, and email safety.

Playwright uses installed Google Chrome (`channel: 'chrome'`). Install Chrome or change the channel and install a Playwright Chromium browser on another machine. Tests reuse/start a development server on port 3000. UI tests use **deterministic API fixtures** to cover success/loss for each game, the complete timed opening/hub/rules flow, actual sprite changes, safe idle return, celebration gates, particle cleanup, consistent sprite framing, final failure and photo fallbacks. A separate **real HTTP test** exercises authentication, origin rejection, duplicate spins, server reload recovery and logout forfeiture against the actual local persistent backend. Fixture UI tests are not evidence of live Supabase/Resend connectivity.

Desktop and mobile screenshots are written into `artifacts/`; current character/audio upgrade screenshots start with `phase3-`. Failure traces go to ignored `test-results/`. See [docs/phase-3.md](docs/phase-3.md) for current verification results and limits. Re-run after customization.

Dependency audit: production packages were upgraded to patched releases. There remains an upstream high-severity **development-only** `braces → micromatch → fast-glob → eslint-config-next` advisory chain with no patched compatible `braces` release available at implementation time. Do not run lint on untrusted pathological glob inputs; monitor upstream updates. `npm audit --omit=dev` reports no production vulnerabilities. Avoid `npm audit fix --force`, which proposes downgrading Next's lint configuration across major versions.

## Vercel deployment

1. Create a private Git repository from this root and commit source plus `package-lock.json`, keeping `.env.local`, `.data/`, caches and generated output ignored.
2. Import into Vercel using the Next.js preset. Use Node 22 or 24, `npm ci` for installation, `npm run build`, and the root directory itself.
3. Add all environment variables above in Vercel; use the verified HTTPS deployment URL. Do not expose the PostgreSQL URL, password or service keys as public variables.
4. Run the Supabase migration before opening the deployed app. Configure the secure POST retry scheduler.
5. On the deployed site, verify password rejection/acceptance, all three games, refresh during an attempt, one finalized database record/outbox job, and a real notification delivered to `manhthong2003@gmail.com`. Confirm mobile layout before sharing with Aurora.

No deployment has been made by this implementation. Hosting and sender verification remain owner setup steps. The optional “Save Result as Image” control is not implemented; the result has a screenshot-friendly card and print stylesheet, and explicitly asks Aurora to take/send a screenshot herself. Tom uses extracted 2D sprites with complete illustrated poses; there is no independent pupil/limb rig, audio lip sync or 3D simulation.

## Hướng dẫn nhanh cho chủ dự án

1. Chạy `npm.cmd ci`, sau đó `npm.cmd run dev`; mở `http://localhost:3000`. Bản demo dùng mật khẩu `aurora`, không gửi email thật.
2. Thêm tám ảnh Aurora đúng tên trong bảng phía trên. Ảnh Tom thật đã được xử lý nền đen; ảnh gốc vẫn được giữ nguyên.
3. Sao chép `.env.example` thành `.env.local`, tự nhập mật khẩu, khóa bí mật, URL PostgreSQL Supabase và cấu hình Resend tại máy. Không gửi khóa/mật khẩu qua chat.
4. Chạy SQL trong `supabase/migrations/202610190001_initial.sql` bằng SQL Editor của Supabase. Xác minh domain gửi email trên Resend; người nhận là `manhthong2003@gmail.com`.
5. Cấu hình các biến môi trường tương tự trên Vercel và bộ lập lịch POST cho email retry. Kiểm tra một lượt chơi thật, dữ liệu đã lưu và email trước khi gửi link cho Aurora.
