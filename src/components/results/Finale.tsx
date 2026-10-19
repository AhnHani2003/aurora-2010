"use client";
import { Camera, Flower2, Heart, RotateCcw } from "lucide-react";
import type { PublicPlaythrough } from "@/types/game";
import { gameNames } from "../game-hub/GameHub";
export function Finale({
  state,
  storageAvailable = true,
  onReplay,
  onMemories,
  onGarden,
  pending,
}: {
  state: PublicPlaythrough;
  storageAvailable?: boolean;
  onReplay: () => void;
  onMemories: () => void;
  onGarden: () => void;
  pending: boolean;
}) {
  const final = state.final!,
    won = final.status === "won",
    forfeit = final.status === "forfeited";
  return (
    <section className="finale">
      <span className="eyebrow">ANOTHER LITTLE CHAPTER OF US</span>
      <h1>
        {won ? (
          <>
            Congratulations,
            <br />
            <em>My Lucky Girl!</em>
          </>
        ) : forfeit ? (
          <>
            A little intermission,
            <br />
            <em>princess.</em>
          </>
        ) : (
          <>
            Still My
            <br />
            <em>Favorite Winner.</em>
          </>
        )}
      </h1>
      <div className="result-card" id="official-result">
        <span className="result-flower">✿</span>
        <span className="eyebrow">AURORA’S OFFICIAL LITTLE HAPPINESS</span>
        <h2>
          {won
            ? "A lovely win."
            : forfeit
              ? "Adventure paused."
              : "Always loved."}
        </h2>
        <p className="result-reward">
          {final.reward?.title ?? "No prize this time — all the love, always."}
        </p>
        <dl>
          <div>
            <dt>Made for</dt>
            <dd>Aurora</dd>
          </div>
          <div>
            <dt>Adventure</dt>
            <dd>{state.game ? gameNames[state.game] : "Garden visit"}</dd>
          </div>
          <div>
            <dt>Result</dt>
            <dd>{final.status}</dd>
          </div>
          <div>
            <dt>Attempts used</dt>
            <dd>{final.attemptsUsed}</dd>
          </div>
          {state.game === "quiz" && (
            <div>
              <dt>Final score</dt>
              <dd>{state.quiz.score} / 10</dd>
            </div>
          )}
          {state.game === "dice" && state.dice.rolls.at(-1) && (
            <div>
              <dt>Last roll</dt>
              <dd>
                {state.dice.rolls.at(-1)!.dice.join(" + ")} ={" "}
                {state.dice.rolls.at(-1)!.sum}
              </dd>
            </div>
          )}
          {state.game === "wheel" && (
            <div>
              <dt>Final spin</dt>
              <dd>
                {state.wheel.spins.at(-1)?.reward?.shortLabel ??
                  "Better Luck Next Time"}
              </dd>
            </div>
          )}
          <div>
            <dt>Recorded</dt>
            <dd>
              {new Date(final.finalizedAt).toLocaleString("en-GB", {
                timeZone: "Asia/Ho_Chi_Minh",
                dateStyle: "medium",
                timeStyle: "short",
              })}{" "}
              ICT
            </dd>
          </div>
        </dl>
        {final.preference && (
          <p className="result-preference">
            Your little wish: {final.preference}
          </p>
        )}
        <span className="result-reference">REFERENCE · {final.id}</span>
        <p className="result-love">“My heart. Every single day.” — Tom</p>
      </div>
      <div className="screenshot-note">
        <Camera size={23} />
        <h3>Screenshot this moment, princess! 📸</h3>
        <p>
          Your result is ready, princess! &#128151; Take a screenshot and send
          it to Tom so he knows what his lucky girl won!
        </p>
        {!storageAvailable && (
          <small role="status">
            Keep this screenshot safe, princess. This result will only stay
            available while this page is open.
          </small>
        )}
      </div>
      <div className="ending-letter">
        {won ? (
          <>
            <p>You did it, princess!</p>
            <p>
              Whether it was your clever brain, your unbelievable luck, or just
              your talent for making your boyfriend weak in the knees, you’ve
              officially earned your reward.
            </p>
            <p>But between us... you’ve already won something much bigger.</p>
            <strong>My heart. Every single day.</strong>
            <p className="signature">Forever your biggest fan, Tom 💗</p>
          </>
        ) : forfeit ? (
          <>
            <p>Even the best adventures need a snack break.</p>
            <p>
              No prize for this chapter, princess. But my love has absolutely no
              exit button. Come back whenever you’re ready for another little
              adventure.
            </p>
            <p className="signature">Still cheering for you, Tom ♡</p>
          </>
        ) : (
          <>
            <p>Okay, maybe luck wasn’t exactly on your side this time.</p>
            <p>But here’s the thing, Aurora...</p>
            <p>
              No silly wheel, dice, or quiz could ever decide how special you
              are to me.
            </p>
            <p>
              You’ll always be my favorite person, my cutest troublemaker, and
              the best part of my days.
            </p>
            <p>And hey... there’s always another adventure waiting for us!</p>
            <p className="signature">All my love, Tom</p>
          </>
        )}
      </div>
      <div className="button-row centered">
        <button className="primary" disabled={pending} onClick={onReplay}>
          Play Again <RotateCcw size={16} />
        </button>
        <button className="secondary" onClick={onMemories}>
          Look at Our Memories <Heart size={16} />
        </button>
        <button className="text-button" onClick={onGarden}>
          Back to the Garden <Flower2 size={16} />
        </button>
      </div>
    </section>
  );
}
