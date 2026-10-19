import type { PlaythroughState } from "../game-rules/engine";

const games = {
  wheel: "Lucky Wheel",
  dice: "Dice Challenge",
  quiz: "Love Quiz",
};
export const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ] || character,
  );

export function resultEmail(state: PlaythroughState) {
  if (!state.final)
    throw new Error("Only finalized playthroughs can be emailed.");
  const final = state.final;
  const game = state.game ? games[state.game] : "Adventure";
  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "full",
    timeStyle: "long",
  }).format(new Date(final.finalizedAt));
  const reward = final.reward
    ? `${final.reward.title} — ${final.reward.description}`
    : "No prize";
  const details = [
    `Aurora's Love Game — ${game}`,
    `Playthrough reference: ${state.id}`,
    `Result reference: ${final.id}`,
    `Date: ${date} (Asia/Ho_Chi_Minh)`,
    `Status: ${final.status}`,
    `Final reward: ${reward}`,
    `Attempts consumed: ${final.attemptsUsed}`,
    `Begging unlocks: ${state.begging.length}`,
    `Preference: ${final.preference || "None provided"}`,
    "This is a newly finalized playthrough. This notification has one logical outbox job.",
    "",
    "Complete saved attempt and begging-message history:",
    JSON.stringify(
      {
        begging: state.begging,
        wheel: state.wheel,
        dice: state.dice,
        quiz: state.quiz,
      },
      null,
      2,
    ),
  ];
  const text = details.join("\n");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body style="margin:0;background:#fff8ee;color:#4b293c;font-family:Arial,sans-serif;padding:24px"><main style="max-width:640px;margin:auto;background:#fff;border:1px solid #f8cedd;border-radius:24px;padding:32px"><p style="color:#9d3764;font-size:14px">A LITTLE LOVE, A LOT OF LUCK</p><h1 style="font-family:Georgia,serif;font-size:30px">Aurora's official result 💗</h1><p>${escapeHtml(game)} · <strong>${escapeHtml(final.status)}</strong></p><div style="background:#fff1f6;padding:20px;border-radius:16px"><h2 style="font-size:21px">${escapeHtml(reward)}</h2><p>Attempts: ${final.attemptsUsed} · Begging unlocks: ${state.begging.length}</p></div><p>${escapeHtml(date)} (Asia/Ho_Chi_Minh)</p><p>Reference: ${escapeHtml(state.id)}</p><p>Preference: ${escapeHtml(final.preference || "None provided")}</p><p>This newly finalized result is saved. Every adventure is another little memory.</p><h2 style="font-size:18px">Saved playthrough audit</h2><pre style="white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px;line-height:1.6">${escapeHtml(text)}</pre><p>With love (and a little confidence), Tom</p></main></body></html>`;
  return {
    subject: `💗 Aurora's Love Game — ${game} — ${final.status}`,
    text,
    html,
  };
}
