"use client";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import type { PublicPlaythrough } from "@/types/game";
import { gameNames } from "../game-hub/GameHub";
import { Die } from "./GamePanel";
import { CelebrationEffects } from "../shared/CelebrationEffects";
import { useAudio } from "../audio/AudioProvider";
export const outcomeKey = (state: PublicPlaythrough) =>
  `${state.id}:${state.phase}:${state.final?.id ?? "reward"}`;
/** Presentation-only acknowledgement: the authoritative server state is never changed by Next. */
export function GameOutcome({
  state,
  onNext,
}: {
  state: PublicPlaythrough;
  onNext: () => void;
}) {
  const { manager: audio } = useAudio();
  const won = state.phase === "reward" || state.final?.status === "won";
  useEffect(() => {
    void audio.play(won ? "victory" : "wrong");
  }, [audio, won]);
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), reduce ? 0 : 650);
    return () => clearTimeout(t);
  }, [reduce]);
  const roll = state.dice.rolls.at(-1),
    spin = state.wheel.spins.at(-1);
  const choice = state.phase === "reward";
  return (
    <section
      className={`paper-panel game-outcome ${won ? "victory" : "comfort"}`}
      data-outcome={won ? "won" : "lost"}
      aria-label={`${state.game ? gameNames[state.game] : "Adventure"} ${won ? "victory" : "result"}`}
    >
      <CelebrationEffects kind={won ? "victory" : "comfort"} />
      <div className="outcome-content">
        <span className="eyebrow">
          {state.game ? gameNames[state.game] : "Our little adventure"} ·{" "}
          {won ? "A LITTLE VICTORY LAP" : "A MOMENT TO CATCH YOUR BREATH"}
        </span>
        {state.game === "dice" && roll && (
          <>
            <div className="dice-stage final-dice">
              <Die value={roll.dice[0]} rolling={false} />
              <Die value={roll.dice[1]} rolling={false} />
            </div>
            <p className="frozen-sum">
              {roll.dice[0]} + {roll.dice[1]} = {roll.sum}
            </p>
          </>
        )}
        {state.game === "quiz" && (
          <motion.div
            className="victory-score"
            initial={{ opacity: 0, scale: reduce ? 1 : 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 130, damping: 14 }}
          >
            {state.quiz.score}
            <span>/ 10</span>
            <small>YOUR FINAL SCORE</small>
          </motion.div>
        )}
        {state.game === "wheel" && (
          <div className="wheel-outcome-medallion" aria-hidden="true">
            {won ? "✧" : "♡"}
          </div>
        )}
        <h1>
          {won ? (
            state.game === "quiz" ? (
              <>
                YOU DID IT,
                <br />
                <em>PRINCESS!</em>
              </>
            ) : (
              <>
                YOU <em>WON!</em>
              </>
            )
          ) : state.final?.status === "forfeited" ? (
            <>
              A little <em>intermission.</em>
            </>
          ) : (
            <>
              Still my
              <br />
              <em>favorite girl.</em>
            </>
          )}
        </h1>
        <p className="outcome-message">
          {won
            ? state.game === "quiz"
              ? "Your boyfriend is officially impressed. Well... even more than usual!"
              : state.game === "dice"
                ? "One prediction. Two dice. One very proud boyfriend."
                : "A little luck, a lovely reward, and one trembling boyfriend wallet."
            : state.final?.status === "forfeited"
              ? "Every good adventure deserves a snack break. No prize this time, but I am always on your team."
              : "No wheel, dice, or quiz could ever decide how special you are to me. Come here, princess. You are still my favorite winner."}
        </p>
        {state.game === "wheel" && (
          <p className="outcome-prize">
            {state.final?.reward?.title ??
              spin?.reward?.title ??
              "Better Luck Next Time · No prize"}
          </p>
        )}
        <p className="outcome-caption">
          {choice
            ? "Enjoy this little moment. Your reward is waiting when you are ready."
            : "Your result is saved. Let’s give this chapter its little ending."}
        </p>
        <div className="outcome-next-slot">
          {ready && (
            <motion.button
              className="primary"
              initial={{ opacity: 0, y: reduce ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onNext}
            >
              {choice
                ? "Next: Choose Your Reward 💝"
                : "Next: Our Little Ending"}{" "}
              <ArrowRight size={16} />
            </motion.button>
          )}
        </div>
      </div>
    </section>
  );
}
