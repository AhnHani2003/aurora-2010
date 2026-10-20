"use client";
import {
  useLocalizedTree,
  useLanguage,
} from "@/components/i18n/LanguageProvider";
import { countWords } from "@/lib/words";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Gift, Heart, RotateCcw } from "lucide-react";
import type { Prediction, PublicPlaythrough, GameAction } from "@/types/game";
import { WHEEL_REWARDS } from "@/data/rewards";
import { QUIZ_REACTIONS } from "@/data/character-dialogue";
import type { ReactionEvent } from "../character/model";
import { Modal } from "../shared/Modal";
import { gameNames, type Act } from "../game-hub/GameHub";
const colors = [
  "#efd2ce",
  "#e9d5ae",
  "#d6dfc4",
  "#d8d0e5",
  "#f2ddc4",
  "#e8dee0",
];
function Wheel({ rotation }: { rotation: number }) {
  const localize = useLocalizedTree();
  return localize(
    <div className="wheel-wrap">
      <div className="wheel-pointer" />
      <motion.svg
        className="prize-wheel"
        initial={false}
        viewBox="0 0 340 340"
        animate={{ rotate: rotation }}
        transition={{ duration: 2.6, ease: [0.12, 0.7, 0.12, 1] }}
        aria-label="Six equal prize segments"
      >
        <circle cx="170" cy="170" r="168" fill="#fffaf1" />
        {WHEEL_REWARDS.map((r, i) => {
          const a = ((i * 60 - 90) * Math.PI) / 180,
            b = (((i + 1) * 60 - 90) * Math.PI) / 180,
            m = ((i * 60 + 30 - 90) * Math.PI) / 180;
          return (
            <g key={r?.id ?? "no-prize"}>
              <path
                d={`M170 170 L${170 + 158 * Math.cos(a)} ${170 + 158 * Math.sin(a)} A158 158 0 0 1 ${170 + 158 * Math.cos(b)} ${170 + 158 * Math.sin(b)} Z`}
                fill={colors[i]}
                stroke="#fff8ee"
                strokeWidth="2"
              />
              <text
                x={170 + 105 * Math.cos(m)}
                y={170 + 105 * Math.sin(m)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#59493e"
                fontSize="11"
                fontWeight="600"
                transform={`rotate(${i * 60 + 30} ${170 + 105 * Math.cos(m)} ${170 + 105 * Math.sin(m)})`}
              >
                {r?.shortLabel ?? "Next time"}
              </text>
            </g>
          );
        })}
        <circle cx="170" cy="170" r="30" fill="#fffbf5" stroke="#d4a86c" />
        <text x="170" y="179" textAnchor="middle" fontSize="28" fill="#b66b79">
          ♡
        </text>
      </motion.svg>
      <span className="wheel-foot">A LITTLE LOVE · A LOT OF LUCK</span>
    </div>,
  );
}
export function Die({ value, rolling }: { value: number; rolling: boolean }) {
  const localize = useLocalizedTree();
  const positions: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };
  return localize(
    <motion.div
      className="die"
      animate={
        rolling
          ? { rotate: [0, -15, 20, -10, 0], y: [0, -12, 0, -6, 0] }
          : { rotate: 0, y: 0 }
      }
      transition={{ repeat: rolling ? Infinity : 0, duration: 0.5 }}
      aria-label={`Die showing ${value}`}
    >
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className={positions[value].includes(i) ? "pip visible" : "pip"}
        />
      ))}
    </motion.div>,
  );
}
export function GamePanel({
  state,
  act,
  pending,
  onReaction,
}: {
  state: PublicPlaythrough;
  act: Act;
  pending: boolean;
  onReaction?: (event: ReactionEvent) => void;
}) {
  const localize = useLocalizedTree();
  const { language } = useLanguage();
  const feedbackHeading = state.quiz.feedback
    ? QUIZ_REACTIONS[state.quiz.feedback.questionId]?.[
        state.quiz.feedback.answer
      ]?.feedbackHeading
    : undefined;
  const [selectedAnswer, setSelectedAnswer] = useState<{
    questionId: string;
    label: string;
  } | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null),
    [rotation, setRotation] = useState(() => {
      const last = state.wheel.spins.at(-1);
      return last ? 330 - last.segmentIndex * 60 : 0;
    }),
    [confirmSpin, setConfirmSpin] = useState(false),
    [beg, setBeg] = useState<GameAction | null>(null),
    [message, setMessage] = useState("");
  const reduce = useReducedMotion();
  const game = state.game!;
  const count =
    game === "wheel"
      ? state.wheel.spins.length
      : game === "dice"
        ? state.dice.rolls.length
        : state.quiz.attempt;
  const max = game === "quiz" ? 3 : 5;
  const free = game === "quiz" ? 2 : 3;
  const next = count + 1;
  const unlocked = state.begging.some((b) => b.attempt === next && !b.consumed);
  const locked = count >= free && !unlocked;
  const lastRoll = state.dice.rolls.at(-1),
    lastSpin = state.wheel.spins.at(-1);
  const wordCount = countWords(message);
  async function perform(action: GameAction) {
    if (
      (action.type === "spin" ||
        action.type === "roll" ||
        action.type === "retry_quiz") &&
      locked
    ) {
      setBeg(action);
      return;
    }
    await act(action, async (s) => {
      if (action.type === "spin") {
        const idx = s.wheel.spins.at(-1)!.segmentIndex;
        setRotation(
          (v) => v + 1800 + ((330 - idx * 60 - (v % 360) + 360) % 360),
        );
      }
      if (!reduce && (action.type === "spin" || action.type === "roll"))
        await new Promise((r) =>
          setTimeout(r, action.type === "spin" ? 2700 : 1100),
        );
    });
  }
  return localize(
    <section className="play-view paper-panel">
      <div className="play-heading">
        <div>
          <span className="eyebrow">LET’S MAKE A LITTLE MAGIC</span>
          <h1>{gameNames[game]}</h1>
        </div>
        <span className="attempt-badge">
          {game === "quiz" ? "Attempt" : "Used"} {count} / {max}
        </span>
      </div>
      {game !== "quiz" && (
        <div className="attempt-meta">
          <span>{Math.max(0, max - count)} attempts left</span>
          <span>{Math.max(0, free - count)} free left</span>
          <span>
            {Math.max(
              0,
              max -
                Math.max(count, free) -
                state.begging.filter((b) => !b.consumed).length,
            )}{" "}
            locked bonus{" "}
            {language === "en" ? (game === "dice" ? "rolls" : "spins") : ""}
          </span>
        </div>
      )}
      {game === "wheel" && (
        <>
          <Wheel rotation={rotation} />
          <div className="game-feedback" aria-live="polite">
            {pending ? (
              "A little suspense looks good on you…"
            ) : lastSpin ? (
              <>
                <strong>
                  {lastSpin.reward?.title ?? "Better Luck Next Time"}
                </strong>
                <p>
                  {lastSpin.reward
                    ? "A lovely possibility. Keep it, or risk it for something new."
                    : "The wheel is being dramatic. There may be another chance."}
                </p>
              </>
            ) : (
              <p>Six possibilities. One spin away.</p>
            )}
          </div>
          <div className="button-row centered">
            {state.wheel.candidate && (
              <button
                className="primary"
                disabled={pending}
                onClick={() => void act({ type: "keep_reward" })}
              >
                Keep This Reward <Gift size={16} />
              </button>
            )}
            <button
              className={state.wheel.candidate ? "secondary" : "primary"}
              disabled={pending || count >= 5}
              onClick={() =>
                state.wheel.candidate
                  ? (onReaction?.({ type: "WHEEL_REROLL" }),
                    setConfirmSpin(true))
                  : void perform({ type: "spin" })
              }
            >
              {pending
                ? "Spinning…"
                : count === 0
                  ? "Spin the Wheel"
                  : locked
                    ? "Unlock Next Spin"
                    : "Spin Again"}{" "}
              <RotateCcw size={16} />
            </button>
          </div>
          <div className="wheel-legend">
            {WHEEL_REWARDS.map((r, i) => (
              <span key={r?.id ?? "no-prize"}>
                <i style={{ background: colors[i] }} />
                {r?.title ?? "Better Luck Next Time"}
              </span>
            ))}
          </div>
          {count > 0 && !state.wheel.candidate && (
            <button
              className="text-button"
              disabled={pending}
              onClick={() => void act({ type: "end_without_prize" })}
            >
              Finish without a prize
            </button>
          )}
        </>
      )}
      {game === "dice" && (
        <>
          <div className="dice-stage">
            <Die value={lastRoll?.dice[0] ?? 1} rolling={pending} />
            <Die value={lastRoll?.dice[1] ?? 1} rolling={pending} />
          </div>
          <div className="game-feedback" aria-live="polite">
            {pending ? (
              <strong>Come on, destiny…</strong>
            ) : lastRoll ? (
              <>
                <strong>
                  {lastRoll.dice[0]} + {lastRoll.dice[1]} = {lastRoll.sum}
                </strong>
                <p>
                  Not quite this time. Your next prediction could be the one.
                </p>
              </>
            ) : (
              <>
                <strong>What will the two dice add up to?</strong>
                <p>Choose your prediction before you roll.</p>
              </>
            )}
          </div>
          <div className="prediction-grid">
            {(
              [
                ["even", "Even"],
                ["odd", "Odd"],
                ["greater", "Greater Than 6"],
                ["less", "Less Than 6"],
              ] as [Prediction, string][]
            ).map(([id, label]) => (
              <button
                className={`choice ${prediction === id ? "selected" : ""}`}
                disabled={pending}
                key={id}
                onClick={() => setPrediction(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="fine-print">
            A total of 6 is Even. It is neither greater nor less than 6.
          </p>
          <button
            className="primary"
            disabled={!prediction || pending}
            onClick={() =>
              prediction && void perform({ type: "roll", prediction })
            }
          >
            {pending
              ? "Rolling…"
              : locked
                ? "Unlock Next Roll"
                : "Roll the Dice"}{" "}
            <ArrowRight size={16} />
          </button>
          {lastRoll && (
            <button
              className="text-button"
              disabled={pending}
              onClick={() => void act({ type: "end_without_prize" })}
            >
              No more rolls · finish without a prize
            </button>
          )}
        </>
      )}
      {game === "quiz" && (
        <>
          <div className="quiz-progress">
            <span
              style={{
                width: `${((state.quiz.questionIndex + (state.quiz.feedback ? 1 : 0)) / 10) * 100}%`,
              }}
            />
          </div>
          {state.quiz.completed && !state.quiz.feedback ? (
            <div className="quiz-complete">
              <span className="result-flower">✿</span>
              <h2>{state.quiz.score} out of 10</h2>
              <p>So close, princess. You need 7 to win.</p>
              <p>
                {max - count} {max - count === 1 ? "attempt" : "attempts"}{" "}
                remaining{locked ? " · a little convincing required" : ""}.
              </p>
              <button
                className="primary"
                disabled={pending}
                onClick={() => void perform({ type: "retry_quiz" })}
              >
                {locked ? "Convince Tom for Attempt 3" : "Try the Quiz Again"}
              </button>
              <button
                className="text-button"
                disabled={pending}
                onClick={() => void act({ type: "end_without_prize" })}
              >
                Finish without a prize
              </button>
            </div>
          ) : (
            <>
              <div className="quiz-meta">
                <span>QUESTION {state.quiz.questionIndex + 1} OF 10</span>
                <span>{state.quiz.score} correct</span>
              </div>
              <div
                className="chibi-pair"
                aria-label="Illustrated Tom and Aurora"
              >
                <span>
                  👦🏻<small>Tom</small>
                </span>
                <Heart size={18} />
                <span>
                  👧🏻<small>Aurora</small>
                </span>
                {state.quiz.currentQuestion?.text.includes("Jungkook") && (
                  <span>
                    🧑🏻‍🎤<small>Jungkook</small>
                  </span>
                )}
              </div>
              <h2 className="question">{state.quiz.currentQuestion?.text}</h2>
              <div className="quiz-options">
                {state.quiz.currentQuestion?.options.map((o) => (
                  <button
                    key={o.label}
                    className={`answer choice ${state.quiz.feedback?.correctAnswer === o.label ? "correct" : ""} ${state.quiz.feedback?.answer === o.label || (pending && selectedAnswer?.questionId === state.quiz.currentQuestion?.id && selectedAnswer?.label === o.label) ? "selected" : ""} ${pending && selectedAnswer?.label === o.label ? "answer-submitting" : ""} ${state.quiz.feedback?.answer === o.label && !state.quiz.feedback.correct ? "incorrect" : ""}`}
                    disabled={pending || !!state.quiz.feedback}
                    onClick={() => {
                      setSelectedAnswer({
                        questionId: state.quiz.currentQuestion!.id,
                        label: o.label,
                      });
                      void act({
                        type: "answer",
                        questionId: state.quiz.currentQuestion!.id,
                        answer: o.label,
                      });
                    }}
                  >
                    <span>{o.label}</span>
                    {o.text}
                  </button>
                ))}
              </div>
              {state.quiz.feedback && (
                <div
                  className={`answer-feedback ${state.quiz.feedback.correct ? "right" : "wrong"}`}
                  role="status"
                >
                  <strong data-l10n-ignore={!!feedbackHeading}>
                    {feedbackHeading
                      ? feedbackHeading[language]
                      : state.quiz.feedback.correct
                        ? "You know us so well! ♡"
                        : "A tiny plot twist…"}
                  </strong>
                  <p>
                    Correct answer: {state.quiz.feedback.correctAnswer}.{" "}
                    {
                      state.quiz.currentQuestion?.options.find(
                        (o) => o.label === state.quiz.feedback?.correctAnswer,
                      )?.text
                    }
                  </p>
                  <button
                    className="primary"
                    disabled={pending}
                    onClick={() => void act({ type: "next_question" })}
                  >
                    {state.quiz.questionIndex === 9
                      ? "See My Score"
                      : "Next Question"}{" "}
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
      {confirmSpin && (
        <Modal title="A LITTLE RISK?" onClose={() => setConfirmSpin(false)}>
          <h2>Feeling greedy, princess?</h2>
          <p>Your next spin will replace your current prize. Are you sure?</p>
          <p className="fine-print">
            Once confirmed, this reward is discarded before the next spin,
            including if that spin needs an unlock.
          </p>
          <div className="button-row">
            <button
              className="secondary"
              onClick={() => {
                setConfirmSpin(false);
                void act({ type: "keep_reward" });
              }}
            >
              No, I’ll Keep It
            </button>
            <button
              className="primary"
              onClick={async () => {
                setConfirmSpin(false);
                if (locked) {
                  if (await act({ type: "discard_reward" }))
                    setBeg({ type: "spin" });
                } else await perform({ type: "spin", replace: true });
              }}
            >
              Yes, Spin Again!
            </button>
          </div>
        </Modal>
      )}
      {beg && (
        <Modal title="A LITTLE SWEET TALK" onClose={() => setBeg(null)}>
          <h2>Convince Your Boyfriend 💌</h2>
          <p>
            Looks like you need a little extra luck. Write your extremely
            handsome boyfriend a convincing message in English with more than 30
            words, and he might give you another chance!
          </p>
          <label className="field-label" htmlFor="begging-message">
            Your most convincing words
          </label>
          <textarea
            id="begging-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={4000}
            placeholder="Dear my incredibly handsome, charming, generous boyfriend..."
          />
          <div className="word-count">{wordCount} / 31 words minimum</div>
          <p className="fine-print">
            A different message for each bonus attempt. We count words separated
            by spaces; grammar and language aren’t being checked.
          </p>
          <button
            className="primary"
            disabled={wordCount < 31 || pending}
            onClick={async () => {
              if (await act({ type: "unlock_attempt", message })) {
                setBeg(null);
                setMessage("");
              }
            }}
          >
            Please, Tom? 🥺
          </button>
        </Modal>
      )}
    </section>,
  );
}
