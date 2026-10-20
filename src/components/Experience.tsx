"use client";
import {
  useLocalizedTree,
  LanguageToggle,
} from "@/components/i18n/LanguageProvider";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import {
  ArrowRight,
  Flower2,
  Heart,
  LogOut,
  Music2,
  VolumeX,
  X,
} from "lucide-react";
import type { PublicPlaythrough } from "@/types/game";
import { greeting } from "@/data/dialogue";
import { photos } from "@/data/photos";
import { GardenDecor } from "./garden/Botanicals";
import { PhotoCard } from "./garden/PhotoCard";
import { TomCharacter } from "./character/TomCharacter";
import { GameHub, type Act } from "./game-hub/GameHub";
import { GameRules } from "./games/GameRules";
import { GamePanel } from "./games/GamePanel";
import { RewardChoice } from "./rewards/RewardChoice";
import { Finale } from "./results/Finale";
import { Modal } from "./shared/Modal";
import { GameOutcome, outcomeKey } from "./games/GameOutcome";
import { useTomReactions } from "@/hooks/useTomReactions";
import { useAudio } from "./audio/AudioProvider";
import type { ReactionEvent } from "./character/model";
import { baselineReaction, eventAfter } from "./character/reactions";
import { experienceRequest } from "@/lib/experience-request";
type Session = {
  storageAvailable?: boolean;
  authenticated: boolean;
  demo: boolean;
  state: PublicPlaythrough | null;
  emailStatus: string | null;
};
type Scene = "garden" | "surprise" | "reveal" | "adventure";
const initial: Session = {
  authenticated: false,
  demo: false,
  state: null,
  emailStatus: null,
};
export function Experience() {
  const localize = useLocalizedTree();
  const [session, setSession] = useState<Session>(initial),
    [loading, setLoading] = useState(true),
    [pending, setPending] = useState(false),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [scene, setScene] = useState<Scene>("garden"),
    [giftOpened, setGiftOpened] = useState(false),
    [memories, setMemories] = useState(false),
    [forfeit, setForfeit] = useState(false),
    [logoutConfirm, setLogoutConfirm] = useState(false),
    [reviewedKey, setReviewedKey] = useState("");
  const { reaction, dispatch: characterDispatch, clear } = useTomReactions();
  const { manager: audio, state: audioState } = useAudio();
  const dispatch = useCallback(
    (event: ReactionEvent) => {
      audio.react(event);
      return characterDispatch(event);
    },
    [audio, characterDispatch],
  );
  const busy = useRef(false);
  const state = session.state;
  useEffect(() => {
    let live = true;
    experienceRequest("/api/session")
      .then((r) => r.json())
      .then((s: Session & { error?: string }) => {
        if (live) {
          if (s.error) setError(s.error);
          else {
            setSession(s);
            if (s.state && s.state.phase !== "hub") setScene("adventure");
          }
        }
      })
      .catch(() =>
        setError("The garden is taking a moment to wake up. Please refresh."),
      )
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => {
    if (
      loading ||
      !session.authenticated ||
      scene !== "garden" ||
      state?.phase === "finalized"
    )
      return;
    const timer = setTimeout(() => setScene("surprise"), 5000);
    return () => clearTimeout(timer);
  }, [loading, session.authenticated, scene, state?.id, state?.phase]);
  useEffect(() => {
    if (scene !== "reveal") return;
    const t = setTimeout(() => setGiftOpened(true), 80);
    return () => clearTimeout(t);
  }, [scene]);
  const act: Act = useCallback(
    async (action, effect) => {
      if (busy.current || !session.state) return false;
      busy.current = true;
      setPending(true);
      setError("");
      if (action.type === "spin") dispatch({ type: "WHEEL_SPIN_START" });
      else if (action.type === "roll") dispatch({ type: "DICE_ROLL_START" });
      else clear();
      try {
        const res = await experienceRequest("/api/game", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            playthroughId: session.state.id,
            expectedVersion: session.state.version,
            operationId: crypto.randomUUID(),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 409) {
            const fresh = await experienceRequest("/api/session").then((r) =>
              r.json(),
            );
            if (fresh.authenticated) setSession(fresh);
          }
          throw new Error(
            data.error ||
              "That little step could not be saved. Please try again.",
          );
        }
        if (effect) await effect(data.state);
        setSession(data);
        const event = eventAfter(action, data.state);
        if (event) dispatch(event);
        return true;
      } catch (e) {
        audio.stopWheel();
        clear();
        setError(
          e instanceof Error
            ? e.message
            : "Something went wrong. Please try again.",
        );
        return false;
      } finally {
        busy.current = false;
        setPending(false);
      }
    },
    [session.state, dispatch, clear, audio],
  );
  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    try {
      const res = await experienceRequest("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.error ||
            "Hmm... that's not our secret password, princess. Try again!",
        );
      setSession(data);
      setScene(data.state?.phase === "hub" ? "garden" : "adventure");
      setPassword("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setPending(false);
      busy.current = false;
    }
  }
  async function replay() {
    if (busy.current || !state) return;
    busy.current = true;
    setPending(true);
    try {
      const res = await experienceRequest("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: { type: "new_playthrough" },
          playthroughId: state.id,
          expectedVersion: state.version,
          operationId: crypto.randomUUID(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSession(data);
      clear();
      setReviewedKey("");
      setGiftOpened(false);
      setScene("garden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  async function logout() {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    try {
      const r = await experienceRequest("/api/logout", { method: "POST" });
      if (!r.ok)
        throw new Error(
          "Your adventure is still saved. Please try logging out again.",
        );
      setSession(initial);
      setScene("garden");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not log out. Please try again.",
      );
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  useEffect(() => {
    if (!session.authenticated) return;
    if (scene === "garden") void audio.play("bloom");
    if (scene === "surprise") void audio.play("gift-shake");
    if (scene === "reveal") void audio.play("tom-appear");
  }, [scene, session.authenticated, audio]);
  const reviewPending =
    !!state &&
    ["reward", "finalized"].includes(state.phase) &&
    reviewedKey !== outcomeKey(state);
  const appearance = reaction ?? baselineReaction(state, scene, reviewPending);
  const { expression, gesture, dialogue, dialogueVi, effect } = appearance;
  return localize(
    <MotionConfig reducedMotion="user">
      <div className={`experience scene-${scene}`}>
        <GardenDecor />
        <header className="site-header">
          <a
            className="wordmark"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (state?.phase === "finalized") setScene("garden");
            }}
          >
            <Flower2 size={24} strokeWidth={1.2} />
            <span>
              Dear Aurora<span className="wordmark-dot">.</span>
            </span>
          </a>
          <span className="header-note">A LITTLE LOVE, A LOT OF LUCK</span>
          <div className="header-actions">
            <LanguageToggle />
            {session.authenticated && (
              <button
                className="icon-button"
                onClick={() => setMemories(true)}
                aria-label="Look at our memories"
              >
                <Heart size={18} />
              </button>
            )}
            <button
              className="audio-button"
              onClick={audio.toggle}
              data-audio-toggle
              aria-pressed={audioState.enabled}
              aria-label={
                audioState.enabled ? "Mute all audio" : "Unmute all audio"
              }
            >
              {audioState.enabled ? (
                <Music2 size={16} />
              ) : (
                <VolumeX size={16} />
              )}
              <span>{audioState.enabled ? "Sound on" : "Sound off"}</span>
            </button>
            {session.authenticated && (
              <button
                className="icon-button"
                onClick={() =>
                  state && ["playing", "reward"].includes(state.phase)
                    ? setLogoutConfirm(true)
                    : void logout()
                }
                aria-label="Log out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </header>
        {audioState.music === "unavailable" && (
          <div className="audio-note" role="status">
            Background music is unavailable right now. Sound effects can still
            play when sound is on.
          </div>
        )}
        {error && (
          <div className="error-banner" role="alert">
            <span>{error}</span>
            <button aria-label="Dismiss message" onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        )}
        <main>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" className="loading-scene">
                <Flower2 size={40} />
                <p>Growing something lovely…</p>
              </motion.div>
            ) : !session.authenticated ? (
              <motion.section
                key="login"
                className="login-scene"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="login-botanical">❀</div>
                <span className="eyebrow">OCTOBER 20 · A LITTLE SECRET</span>
                <h1>
                  Only my
                  <br />
                  <em>favorite girl</em>
                  <br />
                  can enter<span className="pink-dot">.</span>
                </h1>
                <p>
                  Welcome to your little surprise, Aurora.
                  <br />
                  Enter our secret password to unlock the magic.
                </p>
                <form onSubmit={(e) => void login(e)}>
                  <label className="field-label" htmlFor="password">
                    Our secret password
                  </label>
                  <input
                    autoComplete="current-password"
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="A secret between us…"
                    required
                  />
                  <button className="primary" disabled={pending}>
                    {pending ? "Unlocking the magic…" : "Unlock My Surprise"}{" "}
                    <ArrowRight size={17} />
                  </button>
                </form>
                <p className="login-signature">
                  Made with a whole lot of love, by Tom ♡
                </p>
              </motion.section>
            ) : scene === "garden" ? (
              <motion.section
                key="garden"
                className="opening"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="opening-photos">
                  {photos.map((photo) => (
                    <PhotoCard
                      key={photo.src}
                      photo={photo}
                      onClick={() => setMemories(true)}
                    />
                  ))}
                </div>
                <div className="opening-letter">
                  <span className="occasion">
                    <i /> OCTOBER 20 · VIETNAMESE WOMEN’S DAY <i />
                  </span>
                  <h1>
                    For my favorite
                    <br />
                    person in the
                    <br />
                    <em>whole universe.</em>
                    <span className="headline-heart">♡</span>
                  </h1>
                  <div className="small-flourish">
                    ✧ <span /> ♡ <span /> ✧
                  </div>
                  <h2>Happy Vietnamese Women’s Day, Aurora! 💐</h2>
                  <div className="greeting-copy">
                    {greeting.lines.map((line, i) => (
                      <motion.p
                        key={line}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.25 }}
                      >
                        {line}
                      </motion.p>
                    ))}
                  </div>
                  <p className="signature">{greeting.signature}</p>
                  {state?.phase === "finalized" ? (
                    <button
                      className="primary"
                      onClick={() => setScene("adventure")}
                    >
                      Back to My Result <ArrowRight size={16} />
                    </button>
                  ) : (
                    <div className="surprise-hint">
                      <span className="hint-spark">✧</span> Stay a little.
                      Something lovely is on its way.
                      <span className="waiting-dots">
                        <i />
                        <i />
                        <i />
                      </span>
                    </div>
                  )}
                </div>
              </motion.section>
            ) : scene === "surprise" ? (
              <motion.section
                key="surprise"
                className="surprise-scene"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="eyebrow">
                  A SPECIAL DELIVERY. JUST FOR YOU.
                </span>
                <h1>
                  Wait a second…
                  <br />
                  <em>is that a surprise?</em>
                </h1>
                <p>I wonder who could possibly be inside...</p>
                <div className="big-gift" aria-hidden="true">
                  <span className="gift-question q-one">?</span>
                  <span className="gift-question q-two">✧</span>
                  <div className="gift-bow">♡</div>
                  <div className="gift-lid" />
                  <div className="gift-body">
                    <span>for Aurora</span>
                  </div>
                </div>
                <button
                  className="primary"
                  onClick={() => {
                    void audio.play("gift-open");
                    setScene("reveal");
                  }}
                >
                  Open My Surprise 🎁 <ArrowRight size={16} />
                </button>
                <p className="fine-print">
                  Handle with love. Contents may be extremely handsome.
                </p>
              </motion.section>
            ) : scene === "reveal" ? (
              <motion.section
                key="reveal"
                className="reveal-scene"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="eyebrow">YOUR FAVORITE SPECIAL DELIVERY</span>
                <h1>
                  Surprise,
                  <br />
                  <em>princess.</em>
                </h1>
                <TomCharacter
                  expression={expression}
                  gesture="wave"
                  effect="hearts"
                  dialogue={dialogue}
                  sceneKey="reveal"
                  revealed={giftOpened}
                />
                <p>
                  I made something special for you, princess. There are games,
                  prizes, and absolutely no refunds on my love.
                </p>
                <h3>So... are you ready?</h3>
                <button
                  className="primary"
                  onClick={() => setScene("adventure")}
                >
                  Let’s Play, Tom! 💗 <ArrowRight size={16} />
                </button>
              </motion.section>
            ) : state ? (
              <motion.div
                key="adventure"
                className="adventure-layout"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="adventure-content">
                  {reviewPending ? (
                    <GameOutcome
                      key={outcomeKey(state)}
                      state={state}
                      onNext={() => {
                        if (state.phase === "finalized")
                          void audio.play("ending");
                        setReviewedKey(outcomeKey(state));
                        clear();
                      }}
                    />
                  ) : state.phase === "hub" ? (
                    <GameHub state={state} act={act} pending={pending} />
                  ) : state.phase === "rules" && state.game ? (
                    <GameRules game={state.game} act={act} pending={pending} />
                  ) : state.phase === "playing" ? (
                    <GamePanel
                      state={state}
                      act={act}
                      pending={pending}
                      onReaction={dispatch}
                    />
                  ) : state.phase === "reward" ? (
                    <RewardChoice
                      act={act}
                      pending={pending}
                      onSelect={() => dispatch({ type: "REWARD_SELECTED" })}
                    />
                  ) : state.phase === "finalized" ? (
                    <Finale
                      state={state}
                      storageAvailable={session.storageAvailable}
                      pending={pending}
                      onReplay={() => void replay()}
                      onMemories={() => setMemories(true)}
                      onGarden={() => setScene("garden")}
                    />
                  ) : null}
                  {["playing", "reward"].includes(state.phase) && (
                    <button
                      className="forfeit-link"
                      disabled={pending}
                      onClick={() => setForfeit(true)}
                    >
                      Leave this adventure
                    </button>
                  )}
                </div>
                <aside className="character-zone">
                  <div className="character-label">
                    YOUR BOYFRIEND. YOUR BIGGEST FAN.
                  </div>
                  <TomCharacter
                    expression={expression}
                    gesture={gesture}
                    reactionId={reaction?.id}
                    effect={effect}
                    onPoke={() => dispatch({ type: "POKE" })}
                    dialogue={dialogue}
                    dialogueVi={dialogueVi}
                    sceneKey={`${state.phase}-${state.game ?? ""}`}
                  />
                  <span className="character-caption">
                    Tom, reporting for boyfriend duty. ♡
                  </span>
                </aside>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </main>
        <footer className="site-footer">
          <span>
            20.10 <i>♡</i> TOM & AURORA
          </span>
          <span>A small adventure. An enormous amount of love.</span>
          <span>MADE JUST FOR YOU</span>
        </footer>
        {memories && (
          <Modal
            title="EIGHT LITTLE REASONS TO SMILE"
            onClose={() => setMemories(false)}
            wide
          >
            <h2>
              Forever my <em>favorite.</em>
            </h2>
            <p>A little collection of you. Every picture, my favorite view.</p>
            <div className="memory-gallery">
              {photos.map((photo) => (
                <PhotoCard key={photo.src} photo={photo} />
              ))}
            </div>
          </Modal>
        )}
        {logoutConfirm && (
          <Modal
            title="LEAVE AND LOG OUT?"
            onClose={() => setLogoutConfirm(false)}
          >
            <h2>Until next time, princess.</h2>
            <p>
              Logging out now records this adventure as forfeited with no prize.
              You can start a fresh one when you return.
            </p>
            <div className="button-row">
              <button
                className="secondary"
                onClick={() => setLogoutConfirm(false)}
              >
                Stay a Little
              </button>
              <button
                className="primary"
                onClick={async () => {
                  await logout();
                  setLogoutConfirm(false);
                }}
              >
                Leave &amp; Log Out
              </button>
            </div>
          </Modal>
        )}
        {forfeit && (
          <Modal title="A LITTLE GOODBYE?" onClose={() => setForfeit(false)}>
            <h2>Leave this adventure?</h2>
            <p>
              This records a forfeit with no reward, even if you have a prize
              waiting. You can start a fresh adventure afterward.
            </p>
            <div className="button-row">
              <button
                className="secondary"
                disabled={pending}
                onClick={() => setForfeit(false)}
              >
                Stay a Little
              </button>
              <button
                className="primary"
                disabled={pending}
                onClick={async () => {
                  if (await act({ type: "forfeit" })) setForfeit(false);
                }}
              >
                Yes, End This Adventure
              </button>
            </div>
          </Modal>
        )}
      </div>
    </MotionConfig>,
  );
}
