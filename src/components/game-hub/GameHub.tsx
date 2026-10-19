"use client";
import { ArrowRight, CircleHelp, Dices, Sparkles } from "lucide-react";
import type { GameAction, GameId, PublicPlaythrough } from "@/types/game";
export const gameNames: Record<GameId, string> = {
  wheel: "Lucky Wheel",
  dice: "Dice Challenge",
  quiz: "Love Quiz",
};
export type Act = (
  action: GameAction,
  effect?: (next: PublicPlaythrough) => Promise<void>,
) => Promise<boolean>;
export function GameHub({
  state,
  act,
  pending,
}: {
  state: PublicPlaythrough;
  act: Act;
  pending: boolean;
}) {
  return (
    <section className="game-hub">
      <div className="eyebrow">A LITTLE COURAGE. A LITTLE CHEMISTRY.</div>
      <h1>
        Pick your kind of <em>magic.</em>
      </h1>
      <p className="section-intro">
        Three little adventures. One very lucky girl.
        <br />
        Which one is calling your name, princess?
      </p>
      <div className="game-cards">
        {(["wheel", "dice", "quiz"] as GameId[]).map((game, i) => (
          <button
            disabled={pending}
            className={`game-card ${game} ${state.game === game ? "selected" : ""}`}
            key={game}
            onClick={() => void act({ type: "select_game", game })}
          >
            <span className="card-number">0{i + 1}</span>
            <div className="game-art">
              {game === "wheel" ? (
                <div className="mini-wheel">
                  <Sparkles size={25} />
                </div>
              ) : game === "dice" ? (
                <>
                  <Dices size={72} strokeWidth={1} />
                  <span className="art-spark">✧</span>
                </>
              ) : (
                <>
                  <div className="love-envelope">♡</div>
                  <span className="art-spark">✧</span>
                </>
              )}
            </div>
            <span className="card-tag">
              {
                [
                  "LET FATE FLIRT",
                  "TRUST YOUR INSTINCTS",
                  "HOW WELL DO YOU KNOW US?",
                ][i]
              }
            </span>
            <h2>{gameNames[game]}</h2>
            <p>
              {
                [
                  "A little spin. A lovely possibility. What has luck wrapped up for you?",
                  "Make a prediction, roll the dice, and let destiny do its thing.",
                  "Our little quirks. Our favorite jokes. A quiz that’s very, very us.",
                ][i]
              }
            </p>
            <span className="card-link">
              {state.game === game ? "Your adventure" : "Take a little look"}{" "}
              <ArrowRight size={16} />
            </span>
          </button>
        ))}
      </div>
      <div className="hub-action">
        {state.game ? (
          <button
            className="primary"
            disabled={pending}
            onClick={() => void act({ type: "show_rules" })}
          >
            Play This Game <ArrowRight size={17} />
          </button>
        ) : (
          <span>
            <CircleHelp size={15} /> Choose a card first. Tom will explain the
            rest.
          </span>
        )}
      </div>
    </section>
  );
}
