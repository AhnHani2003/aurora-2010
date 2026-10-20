# Love Quiz integration report

Source: [author-edited script](../QUIZ_DIALOGUE_SCRIPT.md). The original was read in full and never regenerated or edited. SHA-256 before and after: `d976a8987788eba3e750c347732c03816c358b24df82484d7a901dfaa5b07337`.

## Content audit

- All 15 stable question IDs and 31 option reactions are integrated. No missing or duplicate option assignments.
- 27 Vietnamese answer lines changed relative to the previous implementation; all 31 now match the script exactly, including punctuation, slang, quotes and emoji.
- No English answer fields were manually changed in the source Markdown. 25 English lines were translated to match the revised Vietnamese meaning, as authorized. The other six English lines retain their original text. The final English copy is listed below and independently fixed in `tests/quiz-approved-en.json` for review and regression checks.
- No expression, gesture, effect, duration or priority changes. The configured semantic gestures still map to eight existing whole sprites. Heart, blow-kiss, crossed-arm and similar labels remain approximations where the existing sprite does not show that gesture; there is no independent hand/facial rig.
- One additional answer-panel heading changed: q2.B. The script's attached field and question summary differed by the word shown in the attached field. The author explicitly confirmed the attached field during integration: **Ơ kìa! Em có chê anh đúng hong 😡**. Its English equivalent is **Hey! Are you saying I'm bad at this?** (with the same angry emoji). The summary alternative was not applied. No unresolved ambiguities.
- Shared introductions, baselines, question text, correct-answer reveals, retry/begging instructions, celebrations, ending letters and screenshot request already matched their existing localized content. They are preserved. Old English-key source references in the Markdown are historical metadata.

## Stable bilingual mapping

`QUIZ_REACTIONS[questionId][option]` now holds both `dialogue` (EN) and `dialogueVi` (VI), plus the existing pose/effect. Answer events carry both strings; Tom chooses the current language at render time. Switching languages does not dispatch another reaction, reset its timer or remount the character. Exact authored text bypasses the general English-key dictionary. The 31 superseded English-keyed quiz entries were removed from that dictionary; shared dialogue keeps its existing lookup. The q2.B heading uses the same stable ID mapping.

The answer keys remain: q1 A, q2 A, q3 B, q4 B, q5 B, q6 B, q7 B, q8 C, q9 A, q10 B, q11 A, q12 A, q13 A, q14 A, q15 A. Fifteen questions, ten unique random questions per attempt, 7/10 passing, retries/begging, score, rewards, local storage, celebrations, Next and independent replay are unchanged. No Wheel/Dice logic, assets, dependencies, environment variables or backend integrations changed.

## Per-option audit

VI compares byte-for-byte with each Markdown field. English changes below are faithful translations of the author's revised Vietnamese, rather than stale source-reference keys. UI coverage submits each of the 31 options, checks EN, switches to VI and back after submission, verifies selected answer/score/order, checks the pose/effect, and advances with Next without stale speech.

| ID | VI changed | EN updated | Final EN | Exact VI | Expression / gesture | Effect |
| --- | --- | --- | --- | --- | --- | --- |
| q1.A | yes | yes | That's right! I love you the most, most, most. You should know this one by heart 🤭 | Đúng rồi! Anh yêu em nhất nhất nhất. Câu này phải thuộc lòng chứ 🤭 | blushing / heart | hearts |
| q1.B | yes | yes | Excuse me?! Who said they love the other more? WHO??? | Ơ kìa?! Ai nói yêu nhiều hơn? Là ai??? | shocked / point | none |
| q2.A | no | no | Finally! Someone appreciates my photography skills! | Cuối cùng cũng có người công nhận tay nghề nhiếp ảnh gia riêng của em rồi! | smug / thumbs-up | hearts |
| q2.B | yes | yes | Whose photos look better in my camera roll? Yours! So the better photographer is obviously me. | Trong máy của anh ảnh ai đẹp hơn. Là em! Vậy người chụp đẹp hơn chính là anh. | pouting / cross-arms | none |
| q3.A | yes | no | A tempting answer. But even my ego knows you are the adorable one. | Nghe cũng thích đó. Nhưng anh có tự luyến mấy cũng biết em mới là người đáng yêu nhất. | smug / point | none |
| q3.B | yes | yes | Correct. You're the cutest in the whole world, hehe 🤭 | Chính xác. Em đáng yêu nhất trên đời hẹ hẹ 🤭 | happy / heart | hearts |
| q4.A | yes | yes | Me, annoying? Every bit of me loves you, and you call me annoying? | Anh mà đáng ghét hả? Chỗ nào cũng yêu em mà ghét ngta. | shocked / facepalm | none |
| q4.B | yes | yes | You're a little stubborn and a tiny bit feisty, but I still love you so much 😘 | Em hơi lì, hơi dữ xíu hoi nhưng mà vẫn yêu em nhiều 😘 | laughing / clap | hearts |
| q5.A | yes | yes | Wrong answer, but I'll take it. Keep the compliments coming; I can handle them 🤭 | Sai đáp án nhưng mà cũng cũng đi. Em cứ khen tiếp đi, anh chịu được 🤭 | blushing / thumbs-up | none |
| q5.B | yes | yes | So I'll take a step back... Give me a minute to hold my shattered heart, then we'll keep playing 😖 | Nên anh lùi bước về sau... Cho anh một phút ôm trái tim vụn vỡ này rồi mình chơi tiếp nha 😖 | shocked / facepalm | hearts |
| q6.A | yes | yes | Flattery like that deserves ten kisses from me. But the official answer still isn't changing, princess. | Nịnh thế này thì xứng đáng được anh hôn 10 cái đó. Nhưng đáp án đúng vẫn không đổi nha em. | smug / thumbs-up | none |
| q6.B | yes | yes | Obviously you. My taste is second to none, after all 😏 | Tất nhiên là em rồi. Gu thẩm mĩ của anh là số 1 mà lại 😏 | happy / heart | hearts |
| q7.A | yes | yes | Me? Sulk? I wouldn't dream of it 🤥 | Anh chả thèm dỗi 🤥 | pouting / cross-arms | none |
| q7.B | yes | yes | On an unlucky day, even breathing the wrong way has me a little worried 🫣 | Hôm nào xui xui anh lỡ thở sai cách xíu hoi là cũng lo lo rùi á 🫣 | laughing / point | hearts |
| q8.A | yes | no | I miss you a ridiculous amount. But I know you miss me too. | Anh nhớ em siêu siêu nhiều luôn. Nhưng anh biết em cũng nhớ anh mà. | romantic / heart | none |
| q8.B | yes | yes | How could you say I don't miss you? Honestly 🙄 | Nghĩ sao mà kêu tui không nhớ vậy trời 🙄 | pouting / point | none |
| q8.C | yes | yes | Both of us, obviously. Who wouldn't miss the person they love when they're apart? | Cả hai chứ còn gì nữa. Yêu mà hong gặp thì ai chả nhớ | blushing / heart | hearts |
| q9.A | yes | yes | You got me =))))) Can't argue when you're that right | Chịu òi =))))) đúng quá biết sao giờ | laughing / wave | hearts |
| q9.B | yes | yes | Excuse me, do you really think you can out-baby me? | Ơ kìa, nhắm nhõng nhẽo bằng tui hong? | mock-angry / cross-arms | none |
| q10.A | yes | yes | Me, jealous? The winner never gets jealous 😏 | Anh ghen á? Kẻ thắng cuộc không bao giờ ghen 😏 | shocked / point | none |
| q10.B | no | no | I knew it! Caught you, princess! | Biết ngay mà! Bắt quả tang công chúa ghen rồi nha! | smug / point | hearts |
| q11.A | yes | yes | That's right. I'm the baby, after all 🫣 | Đúng rồi. Anh là em bé mà lại 🫣 | blushing / heart | hearts |
| q11.B | yes | yes | 'I'm in a mood today, so don't you dare touch me, okay?' | 'Hôm nay em đang khó chịu đừng có đụng vô người em à nha' | pouting / cross-arms | none |
| q12.A | no | no | Your reactions are too cute. I consider teasing a public service. | Tại em phản ứng cưng quá đó. Anh trêu một chút cho đời vui thôi mà. | smug / point | hearts |
| q12.B | yes | yes | I don't dare get annoyed, because you'd get annoyed right back at me 🤭 | Hong dám bực tại sợ bị bực ngược lại 🤭 | shocked / facepalm | none |
| q13.A | no | no | I built you a secret garden. Consider that Exhibit A. | Anh làm hẳn một khu vườn bí mật cho em. Bằng chứng số một rõ ràng thế còn gì. | romantic / blow-kiss | hearts |
| q13.B | yes | yes | Princess, there's a whole love website right in front of you 😑 | Công chúa ơi, cả một trang web tình yêu đang trước mặt em kìa 😑 | pouting / cross-arms | none |
| q14.A | yes | yes | My toys are expensive, okay? Have a little sympathy. Sniff, sniff 🥹 | Đồ chơi của anh nó mắc quá thông cảm cho anh. Hic hic 🥹 | laughing / cry | hearts |
| q14.B | yes | yes | You save all your money to buy me presents instead 😘 | Em toàn để tiền mua quà cho anh thì có 😘 | shocked / facepalm | none |
| q15.A | yes | yes | Who else but me 🤭 | Anh chứ ai vào đây nữa 🤭 | blushing / blow-kiss | hearts |
| q15.B | yes | yes | You always start with a teeth-and-breath check, that's all 😒 | Em toàn kiểm tra răng miệng trước thôi 😒 | pouting / heart | none |

## Files in this integration

Production code:

- `src/data/character-dialogue.ts`
- `src/components/character/model.ts`
- `src/components/character/TomCharacter.tsx`
- `src/components/Experience.tsx`
- `src/components/games/GamePanel.tsx`
- `src/lib/i18n/dialogue.ts`

Tests and audit:

- `src/data/quiz-script.test.ts`
- `src/components/character/reactions.test.ts`
- `src/lib/i18n/i18n.test.ts`
- `release-e2e/quiz-script.spec.ts`
- `tests/quiz-script.ts` (read-only Markdown parser and controlled quiz fixture)
- `tests/quiz-approved-en.json`
- `docs/quiz-integration-report.md`

Pre-existing uncommitted work is preserved and is not included in this task-specific list.

## Verification and release

- `npm.cmd run typecheck`: passed.
- `npm.cmd run lint`: passed.
- `npm.cmd test`: 129 tests passed in 11 files.
- `npm.cmd run build`: passed with `NEXT_PUBLIC_RELEASE_MODE=standalone` and backend/email secrets cleared.
- `npx.cmd --no-install playwright test --config=playwright.release.config.ts`: 43 production Chrome tests passed, including every one of the 31 reactions, exact EN/VI text, answer locks, unchanged score/order, sprite/effect, post-answer language switching and stale-speech clearing on Next.
- Development Chrome: the same 32 quiz browser checks passed against the existing local dev server. No React key/hydration warnings or page errors were captured. The temporary dev test configuration was removed; the existing dev server was preserved.
- All 31 Markdown → configuration → rendered VI mappings passed. Final English text matched the reviewed translation fixture for all 31. The script's original SHA-256 is unchanged.
- Passing at 7/10 and failure at 6/10 passed; the existing retry, begging, Wheel/Dice, reward, storage-failure and independent replay tests passed. No gameplay API requests or failed asset requests were captured in the quiz and standalone journeys.
- `git diff --check`: passed. `.env.local` remains ignored.
- Screenshots were visually inspected: [correct answer after switching to VI](../artifacts/quiz-integrated-q1-A-vi.png), [incorrect answer on mobile after switching to VI](../artifacts/quiz-integrated-q2-B-vi.png), [completed 7/10 quiz](../artifacts/quiz-integrated-completed-vi.png). Tom stays visible, the authored speech fits, and the existing result/Next layout is intact. Physical mobile devices were not tested.

The local project is ready for review, GitHub push and Vercel redeployment. Keep the existing `NEXT_PUBLIC_RELEASE_MODE=standalone` setting. Supabase, Resend, server sessions and email sending remain disabled; local result storage and screenshot requests remain active. No unresolved content or release blockers were found. No commit, push or deployment was performed.
