"use client";
import {
  useLanguage,
  useLocalizedTree,
} from "@/components/i18n/LanguageProvider";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { TomSprites } from "./TomSprites";
import { spriteFor } from "./sprites";
import { FACES, type Expression, type Gesture } from "./model";
import "./character.css";
export type { Expression, Gesture } from "./model";
type Props = {
  expression?: Expression;
  gesture?: Gesture;
  dialogue: string;
  dialogueVi?: string;
  compact?: boolean;
  revealed?: boolean;
  sceneKey?: string;
  className?: string;
  reactionId?: number;
  effect?: "hearts" | "sparkles" | "tears";
  onPoke?: () => void;
};
export function TomCharacter({
  expression = "neutral",
  gesture,
  dialogue,
  dialogueVi,
  compact = false,
  revealed = true,
  sceneKey,
  className = "",
  reactionId = 0,
  effect,
  onPoke,
}: Props) {
  const localize = useLocalizedTree();
  const { language } = useLanguage();
  const reduce = !!useReducedMotion(),
    face = FACES[expression];
  const [dismissed, setDismissed] = useState(""),
    [pokeJoke, setPokeJoke] = useState<string | null>(null);
  const pokes = useRef(0),
    cooldown = useRef(0),
    pokeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const activeGesture = gesture ?? face.gesture;
  useEffect(() => {
    pokes.current = 0;
  }, [sceneKey]);
  useEffect(() => () => clearTimeout(pokeTimer.current), []);
  function poke() {
    if (Date.now() < cooldown.current) return;
    if (++pokes.current >= 5) {
      pokes.current = 0;
      cooldown.current = Date.now() + 9000;
      if (onPoke) onPoke();
      else {
        setPokeJoke(sceneKey ?? "reveal");
        pokeTimer.current = setTimeout(() => setPokeJoke(null), 4000);
      }
    }
  }
  const joke = pokeJoke === (sceneKey ?? "reveal");
  const shownExpression = joke ? "laughing" : expression;
  const shownGesture = joke ? "blow-kiss" : activeGesture;
  return localize(
    <div
      className={`tom-character ${compact ? "tom-character--compact" : ""} ${className}`}
      data-expression={shownExpression}
      data-reaction-id={reactionId}
      data-gesture={shownGesture}
      data-revealed={revealed}
    >
      <div className="tom-speech-slot">
        {revealed && (joke || dismissed !== dialogue) && (
          <motion.div
            key={reactionId + "-" + dialogue}
            className="tom-speech"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.16 }}
          >
            <span className="tom-speech-label">
              A LITTLE WORD FROM TOM <span aria-hidden="true">&#9825;</span>
            </span>
            <p data-l10n-ignore={!joke && dialogueVi !== undefined}>
              {joke
                ? "Hey, princess! Stop poking me... unless you're asking for a kiss!"
                : language === "vi" && dialogueVi !== undefined
                  ? dialogueVi
                  : dialogue}
            </p>
            {dialogue.length > 165 && !joke && (
              <button
                className="tom-dismiss"
                onClick={() => setDismissed(dialogue)}
              >
                Got it, Tom <span aria-hidden="true">&#215;</span>
              </button>
            )}
          </motion.div>
        )}
      </div>
      <div className="tom-stage">
        <div className="tom-halo" aria-hidden="true" />
        <div className="tom-orbit tom-orbit--one" aria-hidden="true">
          &#10023;
        </div>
        <div className="tom-orbit tom-orbit--two" aria-hidden="true">
          &#9825;
        </div>
        <div className="tom-gift-back" aria-hidden="true" />
        <motion.div
          className="tom-emergence"
          initial={false}
          animate={{ y: revealed ? 0 : 250, opacity: revealed ? 1 : 0 }}
          transition={
            reduce
              ? { duration: 0 }
              : {
                  type: "spring",
                  stiffness: 90,
                  damping: 18,
                  delay: revealed ? 0.12 : 0,
                }
          }
        >
          <button
            className="tom-sprite-button"
            aria-label="Give Tom a playful poke"
            onClick={poke}
            disabled={!revealed}
            tabIndex={revealed ? 0 : -1}
          >
            <motion.div
              className="tom-sprite-motion"
              animate={
                reduce
                  ? { y: 0, scale: 1 }
                  : {
                      y: shownExpression === "celebrating" ? [0, -5, 0] : 0,
                      scale: 1,
                    }
              }
              transition={{
                duration: 0.65,
                repeat: !reduce && shownExpression === "celebrating" ? 2 : 0,
              }}
            >
              <TomSprites sprite={spriteFor(shownExpression, shownGesture)} />
            </motion.div>
          </button>
        </motion.div>
        {effect && revealed && (
          <div
            key={reactionId}
            className={`tom-reaction-particles ${effect}`}
            aria-hidden="true"
          >
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} style={{ "--i": i } as React.CSSProperties}>
                {effect === "hearts"
                  ? "\u2661"
                  : effect === "tears"
                    ? "\u00b7"
                    : "\u2727"}
              </span>
            ))}
          </div>
        )}
        <motion.div
          className="tom-gift-lid"
          aria-hidden="true"
          initial={false}
          animate={
            revealed
              ? { y: -250, x: -95, rotate: -25, opacity: 0 }
              : { y: 0, x: 0, rotate: 0, opacity: 1 }
          }
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 90, damping: 15 }
          }
        >
          <span className="tom-bow">
            <i />
            <i />
          </span>
          <span className="tom-lid-ribbon" />
        </motion.div>
        <div className="tom-gift-front" aria-hidden="true">
          <div className="tom-gift-ribbon" />
          <div className="tom-gift-heart">&#9825;</div>
          <span className="tom-gift-label">a little love, a lot of luck</span>
        </div>
        <div className="tom-gift-shadow" aria-hidden="true" />
      </div>
      <div className="tom-caption">
        <span className="tom-caption-line" />
        <span>
          TOM <i>&#8212; {FACES[shownExpression].label}</i>
        </span>
        <span className="tom-caption-line" />
      </div>
    </div>,
  );
}
