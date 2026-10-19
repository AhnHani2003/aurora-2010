"use client";
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
/** Bounded, deterministic CSS particles. This layer never receives pointer input. */
export function CelebrationEffects({
  kind = "victory",
}: {
  kind?: "victory" | "comfort";
}) {
  const reduce = useReducedMotion();
  const [finished, setFinished] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setFinished(true), 4800);
    return () => clearTimeout(timer);
  }, []);
  if (finished || reduce) return null;
  return (
    <div
      className={`celebration-effects ${kind}`}
      aria-hidden="true"
      data-testid="celebration-effects"
    >
      {Array.from({ length: kind === "victory" ? 32 : 7 }, (_, i) => (
        <i
          key={i}
          className={i % 5 === 0 ? "confetti-heart" : "confetti-piece"}
          style={
            {
              "--x": `${(i * 37) % 100}%`,
              "--drift": `${(i % 2 ? 1 : -1) * (30 + i * 3)}px`,
              "--delay": `${(i % 8) * 0.065}s`,
              "--turn": `${i * 47}deg`,
              "--c": ["#b97991", "#d5b86f", "#b3c29e", "#bcadd2", "#e6b397"][
                i % 5
              ],
            } as React.CSSProperties
          }
        >
          {i % 5 === 0 ? "♡" : ""}
        </i>
      ))}
      {kind === "victory" &&
        [0, 1, 2].map((n) => (
          <div key={n} className={`firework firework-${n}`}>
            {Array.from({ length: 9 }, (_, i) => (
              <span
                key={i}
                style={
                  {
                    "--angle": `${i * 40}deg`,
                    "--delay": `${0.2 + n * 0.45}s`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        ))}
    </div>
  );
}
