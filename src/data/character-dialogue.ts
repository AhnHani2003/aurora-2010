import type { Expression, Gesture } from "@/components/character/model";
type Line = { expression: Expression; gesture: Gesture; dialogue: string };
const line = (
  expression: Expression,
  gesture: Gesture,
  dialogue: string,
): Line => ({ expression, gesture, dialogue });
/** Spoken only AFTER the server answers. These jokes never grade or alter a score. */
export const QUIZ_REACTIONS: Record<string, Record<string, Line>> = {
  q1: {
    A: line(
      "blushing",
      "heart",
      "Of course! My love for you is literally unlimited!",
    ),
    B: line(
      "shocked",
      "point",
      "Excuse me?! Have you SEEN how obsessed I am with you?",
    ),
  },
  q2: {
    A: line(
      "smug",
      "thumbs-up",
      "Finally! Someone appreciates my photography skills!",
    ),
    B: line(
      "pouting",
      "cross-arms",
      "My camera roll would like to submit a formal appeal. You are still my favorite subject.",
    ),
  },
  q3: {
    A: line(
      "smug",
      "point",
      "A tempting answer. But even my ego knows you are the adorable one.",
    ),
    B: line(
      "happy",
      "heart",
      "Correct. Dangerously adorable. I never stood a chance.",
    ),
  },
  q4: {
    A: line(
      "shocked",
      "facepalm",
      "Me? Annoying? I prefer romantically persistent.",
    ),
    B: line(
      "laughing",
      "clap",
      "My cutest little troublemaker. I would choose your chaos every time.",
    ),
  },
  q5: {
    A: line(
      "blushing",
      "thumbs-up",
      "Incorrect, but excellent boyfriend morale. Please keep the compliments coming.",
    ),
    B: line(
      "shocked",
      "facepalm",
      "Wow. Betrayed by my own girlfriend. I need a moment.",
    ),
  },
  q6: {
    A: line(
      "smug",
      "thumbs-up",
      "Flattery will get you kisses. It will not change the official answer.",
    ),
    B: line(
      "happy",
      "heart",
      "Obviously you. I have eyes, princess. Very heart-shaped eyes.",
    ),
  },
  q7: {
    A: line(
      "pouting",
      "cross-arms",
      "I am not sulking. I am conducting a very quiet emotional protest.",
    ),
    B: line(
      "laughing",
      "point",
      "One tiny pout and I am already negotiating with snacks.",
    ),
  },
  q8: {
    A: line(
      "romantic",
      "heart",
      "I miss you a ridiculous amount. But I know you miss me too.",
    ),
    B: line(
      "pouting",
      "point",
      "My extremely dramatic missing-you playlist disagrees.",
    ),
    C: line(
      "blushing",
      "heart",
      "Both of us. Two hearts, one very unfair distance.",
    ),
  },
  q9: {
    A: line(
      "laughing",
      "wave",
      "Guilty. Growing up is optional. Loving you is mandatory.",
    ),
    B: line(
      "mock-angry",
      "cross-arms",
      "Excuse me, I worked very hard for my title of biggest baby.",
    ),
  },
  q10: {
    A: line(
      "shocked",
      "point",
      "Jealous? Me? I am merely monitoring the boyfriend competition.",
    ),
    B: line("smug", "point", "I knew it! Caught you, princess!"),
  },
  q11: {
    A: line(
      "blushing",
      "heart",
      "Yes. I accept cuddles, forehead kisses, and unlimited spoiling.",
    ),
    B: line(
      "pouting",
      "cross-arms",
      "You get spoiled too. But I am the official cuddle enthusiast.",
    ),
  },
  q12: {
    A: line(
      "smug",
      "point",
      "Your reactions are too cute. I consider teasing a public service.",
    ),
    B: line(
      "shocked",
      "facepalm",
      "You are blaming the victim of my own terrible jokes? Wait…",
    ),
  },
  q13: {
    A: line(
      "romantic",
      "blow-kiss",
      "I built you a secret garden. Consider that Exhibit A.",
    ),
    B: line(
      "pouting",
      "cross-arms",
      "Princess. There is a whole romantic website on your screen. My evidence is overwhelming.",
    ),
  },
  q14: {
    A: line(
      "laughing",
      "cry",
      "My shopping cart and I would like some privacy, please.",
    ),
    B: line(
      "shocked",
      "facepalm",
      "Nice try. My wallet already confessed. It was me.",
    ),
  },
  q15: {
    A: line("blushing", "blow-kiss", "Guilty. And I'd do it again!"),
    B: line(
      "pouting",
      "heart",
      "I admire the confidence. But I am already first in the kiss queue.",
    ),
  },
};
