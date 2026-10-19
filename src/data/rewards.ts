import type { Reward } from "@/types/game";

const dates: Reward[] = [
  {
    id: "hotpot",
    title: "Hotpot Date — Your Choice",
    shortLabel: "Hotpot date",
    description:
      "A cozy hotpot date, at the place you choose, with your favorite person.",
    icon: "🍲",
  },
  {
    id: "restaurant",
    title: "Restaurant Date — Your Choice",
    shortLabel: "Dinner date",
    description:
      "Choose the restaurant. Tom will bring the romance (and his best manners).",
    icon: "🍽️",
  },
  {
    id: "bbq",
    title: "BBQ Date — Your Choice",
    shortLabel: "BBQ date",
    description:
      "Your favorite BBQ spot, a delicious meal, and a little extra time together.",
    icon: "🥩",
  },
];

/** Array order is also the SVG wheel segment order. Six equal-probability segments. */
export const WHEEL_REWARDS: (Reward | null)[] = [
  {
    id: "wheel-one-gift",
    title: "One Gift — 500,000–1,000,000 VND",
    shortLabel: "One gift",
    description: "One lovely gift with a budget of 500,000–1,000,000 VND.",
    icon: "🎁",
    budget: { min: 500000, max: 1000000, currency: "VND", giftCount: 1 },
  },
  {
    id: "wheel-two-gifts",
    title: "Two Gifts — 1,000,000–1,200,000 VND",
    shortLabel: "Two gifts",
    description:
      "Exactly two gifts with a combined total budget of 1,000,000–1,200,000 VND.",
    icon: "🎁",
    budget: { min: 1000000, max: 1200000, currency: "VND", giftCount: 2 },
  },
  ...dates,
  null,
];

export const SELF_CHOICE_REWARDS: Reward[] = [
  {
    id: "choice-one-gift",
    title: "One Gift — 1,000,000–1,200,000 VND",
    shortLabel: "One special gift",
    description:
      "One gift you love, with a budget of 1,000,000–1,200,000 VND. Tell Tom what you have in mind.",
    icon: "🎀",
    budget: { min: 1000000, max: 1200000, currency: "VND", giftCount: 1 },
  },
  ...dates,
];
