"use client";
import { useLocalizedTree } from "@/components/i18n/LanguageProvider";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { SELF_CHOICE_REWARDS } from "@/data/rewards";
import type { Act } from "../game-hub/GameHub";
import { Modal } from "../shared/Modal";
export function RewardChoice({
  act,
  pending,
  onSelect,
}: {
  act: Act;
  pending: boolean;
  onSelect?: () => void;
}) {
  const localize = useLocalizedTree();
  const [selected, setSelected] = useState<string | null>(null),
    [confirm, setConfirm] = useState(false),
    [preference, setPreference] = useState("");
  const reward = SELF_CHOICE_REWARDS.find((r) => r.id === selected);
  return localize(
    <section className="paper-panel reward-choice">
      <span className="eyebrow">YOU WON, PRINCESS</span>
      <h1>
        Something lovely.
        <br />
        <em>Just for you.</em>
      </h1>
      <p className="section-intro">
        You earned this. Pick exactly one little happiness.
      </p>
      <div className="reward-grid">
        {SELF_CHOICE_REWARDS.map((r) => (
          <button
            disabled={pending}
            key={r.id}
            className={`reward-card ${selected === r.id ? "selected" : ""}`}
            onClick={() => {
              setSelected(r.id);
              onSelect?.();
            }}
          >
            <span>{r.icon}</span>
            <h2>{r.shortLabel}</h2>
            <p>{r.description}</p>
          </button>
        ))}
      </div>
      {reward && (
        <div className="preference-field">
          <label className="field-label" htmlFor="preference">
            {reward.budget
              ? "A gift you have your eye on?"
              : "Your favorite restaurant?"}{" "}
            <span>(optional)</span>
          </label>
          <input
            id="preference"
            value={preference}
            onChange={(e) => setPreference(e.target.value)}
            maxLength={500}
            placeholder={
              reward.budget ? "A little hint for Tom…" : "Somewhere delicious…"
            }
          />
          <button
            className="primary"
            disabled={pending}
            onClick={() => setConfirm(true)}
          >
            Choose This Reward <ArrowRight size={16} />
          </button>
        </div>
      )}
      {confirm && reward && (
        <Modal
          title="ONE LAST LITTLE QUESTION"
          onClose={() => setConfirm(false)}
        >
          <h2>Are you sure, princess?</h2>
          <p>Is this your final choice?</p>
          <div className="confirm-reward">
            {reward.icon} {reward.title}
          </div>
          <div className="button-row">
            <button className="secondary" onClick={() => setConfirm(false)}>
              Let Me Think
            </button>
            <button
              className="primary"
              disabled={pending}
              onClick={async () => {
                if (
                  await act({
                    type: "claim_reward",
                    rewardId: reward.id,
                    preference,
                  })
                )
                  setConfirm(false);
              }}
            >
              Yes, This One! 💗
            </button>
          </div>
        </Modal>
      )}
    </section>,
  );
}
