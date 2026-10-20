"use client";
import { useLocalizedTree } from "@/components/i18n/LanguageProvider";
import { ArrowLeft, ArrowRight, Check, Heart } from "lucide-react";
import type { GameId } from "@/types/game";
import { WHEEL_REWARDS, SELF_CHOICE_REWARDS } from "@/data/rewards";
import { gameNames, type Act } from "../game-hub/GameHub";
const rules: Record<GameId, string[]> = {
  wheel: [
    "Six equally likely segments. Up to five spins; the first three are free.",
    "Spin 4 and spin 5 each need a different English message of at least 31 words. Each message unlocks only its own spin.",
    "After a real prize, keep it to finish, or confirm a new spin. Confirming discards your old prize before the next spin. Rewards never accumulate.",
    "Better Luck Next Time gives no prize. Continue while attempts remain, or finish without a prize.",
    "Spin 5 is final: you keep that spin’s real prize automatically, or finish with no prize. An abandoned prize never comes back.",
  ],
  dice: [
    "Choose Even, Odd, Greater Than 6, or Less Than 6 before each roll. Two fair six-sided dice are rolled on the server.",
    "Even means an even sum; Odd means an odd sum. Greater Than 6 means strictly above 6, and Less Than 6 means strictly below 6.",
    "A total of 6 wins for Even only. It does not satisfy either Greater Than 6 or Less Than 6.",
    "One correct prediction wins immediately and unlocks exactly one self-choice reward.",
    "You have five rolls maximum. The first three are free. Roll 4 and roll 5 each require a separate English message of at least 31 words.",
    "Five misses means no prize. You can also explicitly end without a prize after a miss.",
  ],
  quiz: [
    "Ten unique questions are randomly chosen from our fifteen-question pool for each attempt. A/B/C labels stay in their original order.",
    "Choose one answer at a time. The correct answer appears only after you submit. Answer all ten questions to finish an attempt.",
    "Score 7 out of 10 or higher to win and choose exactly one reward. Six correct answers is a loss.",
    "There are three attempts maximum: attempt 1 is free, attempt 2 is a free retry, and attempt 3 needs an English begging message of at least 31 words.",
    "Each retry draws ten unique questions again. After the third failed attempt, the result is no prize.",
  ],
};
export function GameRules({
  game,
  act,
  pending,
}: {
  game: GameId;
  act: Act;
  pending: boolean;
}) {
  const localize = useLocalizedTree();
  return localize(
    <section className="rules-view paper-panel">
      <span className="eyebrow">THE LITTLE DETAILS</span>
      <h1>
        Before we <em>play.</em>
      </h1>
      <div className="rules-title">
        <Heart size={20} />
        <h2>{gameNames[game]} · The rules</h2>
      </div>
      <ol className="rules-list">
        {rules[game].map((rule) => (
          <li key={rule}>
            <Check size={16} />
            <span>{rule}</span>
          </li>
        ))}
      </ol>
      <div className="rules-prizes">
        <h3>Something lovely is at stake</h3>
        {(game === "wheel" ? WHEEL_REWARDS : SELF_CHOICE_REWARDS).map((r) => (
          <p key={r?.id ?? "no-prize"}>
            {r?.icon ?? "☁"}{" "}
            <strong>{r?.title ?? "Better Luck Next Time — No Prize"}</strong>
            {r?.budget?.giftCount === 2 && (
              <small>
                Exactly two gifts. The budget is combined, not per gift.
              </small>
            )}
          </p>
        ))}
      </div>
      <p className="fine-print">
        Starting locks this game for this adventure. Leaving early records a
        forfeit with no reward. Your next adventure is always a fresh start.
      </p>
      <div className="button-row">
        <button
          className="secondary"
          disabled={pending}
          onClick={() => void act({ type: "back_to_games" })}
        >
          <ArrowLeft size={16} /> Back to Games
        </button>
        <button
          className="primary"
          disabled={pending}
          onClick={() => void act({ type: "start_game" })}
        >
          Start Challenge <ArrowRight size={16} />
        </button>
      </div>
    </section>,
  );
}
