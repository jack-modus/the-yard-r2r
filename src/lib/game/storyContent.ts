// Act 1 / early Act 2 scripted beat content — the user's own outline,
// implemented as DecisionEvents reusing the exact same Choice/apply pattern
// as the ordinary trainingMoment events (content.ts). Orchestration (when
// each beat fires, the nemesis mechanics) lives in story.ts; this file is
// just the words and their stat effects.
import { clamp } from "@/lib/sim";
import type { CourseName, Horse } from "@/lib/sim";
import { note } from "./stateUtils";
import type { DecisionEvent, GameState } from "./types";

// ---------- Beat 3: the yard, another jockey, first-ambition question ----------
// Defined before Beat 2 since Beat 2's choices need to enqueue it.
export const BEAT3_YARD: DecisionEvent = {
  title: "Out in the yard",
  text: `A jockey leans on the rail, watching you find your feet. Friendly enough. You tell him the plan — not just to win, but to be the best. A Group 1. Eventually, the Classics. All of them.\n\nHe laughs, not unkindly. "Okay mate. Best win a race first."`,
  choices: [
    {
      label: "\"Yes — I'll do it.\"",
      hint: "reputation down a little, celebrity up",
      apply: st => note(
        { ...st, reputation: clamp(st.reputation - 2, 0, 100), celebrity: clamp(st.celebrity + 3, 0, 100), awaitingHorsePick: true },
        `The jockey raises an eyebrow at the certainty. Word of the big talk gets round the yard before lunch.`,
      ),
    },
    {
      label: "\"I'll do my best.\"",
      hint: "reputation up slightly",
      apply: st => note(
        { ...st, reputation: clamp(st.reputation + 1, 0, 100), awaitingHorsePick: true },
        `"Fair enough," he says. "At least you're not a blowhard." Not much said, but it lands the right way.`,
      ),
    },
  ],
};

// ---------- Beat 2: Bridges' office ----------
export const BEAT2_BRIDGES_OFFICE: DecisionEvent = {
  title: "In Bridges' office",
  text: `Bridges doesn't stand. "A fresh start — for you. I'm taking a bit of a risk here, and I want to be straight about why." He lets that sit. "Your father owed a lot of people money by the end. Rubbed a lot of people up the wrong way, too. He was a good trainer, Tony — a genuinely good one — but he gambled every bit of it away. Can you assure me you won't do the same?"\n\nHe nods at a black-and-white photograph on the wall — two men at the races, sharp suits, a winner's enclosure. "That's my father. And that" — he taps the other man — "is your grandfather. He was a great man, your grandfather. One of the best I ever saw. Your father could have been him. He chose not to be."\n\nHe doesn't wait for an answer out loud. You ask yourself the question instead.`,
  choices: [
    {
      label: "I'll be my grandfather, not my father.",
      apply: st => note(
        { ...st, queue: [...st.queue, BEAT3_YARD] },
        `Bridges: "I've got six horses out there. Pick three of them tomorrow."`,
      ),
    },
    {
      label: "I don't know yet — but I intend to find out.",
      apply: st => note(
        { ...st, queue: [...st.queue, BEAT3_YARD] },
        `Bridges: "I've got six horses out there. Pick three of them tomorrow."`,
      ),
    },
  ],
};

// ---------- Beat 5: reporter, before the first McLean race (scripted loss) ----------
export const BEAT5_REPORTER_PRE_RACE: DecisionEvent = {
  title: "Before the race",
  text: `A reporter catches you in the paddock. "You'll never win this game the way your old man did — everyone knows that story. But today's a simpler question: will you beat McLean?"`,
  choices: [
    {
      label: "\"Beat him? I'll leave him for dead.\"",
      hint: "celebrity up",
      apply: st => note(
        { ...st, celebrity: clamp(st.celebrity + 3, 0, 100) },
        `Your line runs under McLean's photo, not yours. He's already quoted underneath it: "Confidence is free. Trophies aren't."`,
      ),
    },
    {
      label: "\"We'll see. I just want a clean run.\"",
      hint: "reputation up",
      apply: st => note(
        { ...st, reputation: clamp(st.reputation + 2, 0, 100) },
        `A modest answer, buried at the bottom of the piece — under McLean's: "Confidence is free. Trophies aren't."`,
      ),
    },
  ],
};

// ---------- Beat 6: McLean taunts him after winning race 1 ----------
export const BEAT6_MCLEAN_TAUNT: DecisionEvent = {
  title: "McLean, in the winner's enclosure",
  text: `He doesn't even look tired. "There it is. Told you — stick to the punting." A couple of stable lads laugh along.`,
  choices: [
    {
      label: "\"Enjoy it. I'll knuckle down and be the best there is.\"",
      hint: "reputation up, skill up",
      apply: st => note(
        { ...st, reputation: clamp(st.reputation + 2, 0, 100), skill: clamp(st.skill + 2, 0, 100) },
        `You say it flat, no heat in it. McLean's smile flickers, just slightly — he was expecting a reaction, not a plan.`,
      ),
    },
    {
      label: "\"Say that again and see what happens.\"",
      hint: "celebrity up, reputation down",
      apply: st => note(
        { ...st, celebrity: clamp(st.celebrity + 2, 0, 100), reputation: clamp(st.reputation - 2, 0, 100) },
        `A stable lad has to physically get between you. It's in the racing pages by Monday, and not flatteringly.`,
      ),
    },
    {
      label: "Walk off before you say something you can't take back.",
      apply: st => note(st, `You turn on your heel. Nothing gained, nothing lost — except the last word, which McLean happily takes.`),
    },
  ],
};

// ---------- Beat 7: Bridges' advice — pick a stat, all horses improve ----------
const ADVICE_STATS: [keyof Horse, string, string][] = [
  ["speed", "Speed", "raw pace off the bridle"],
  ["stamina", "Stamina", "seeing out the trip"],
  ["accel", "Turn of foot", "quickening when it matters"],
  ["balance", "Balance", "handling tracks that don't run fair"],
];

export const BEAT7_BRIDGES_ADVICE: DecisionEvent = {
  title: `Bridges' takes you through the notebook`,
  text: `"Right," he says, pulling a chair round. "What do you actually want help with? I'll not pretend I can teach you everything at once — pick one, and we'll work it properly."`,
  choices: ADVICE_STATS.map(([key, label, why]) => ({
    label,
    hint: `+${label.toLowerCase()} across the string, +skill`,
    apply: (st: GameState) => note(
      {
        ...st,
        skill: clamp(st.skill + 3, 0, 100),
        horses: st.horses.map(h => ({ ...h, [key]: clamp((h[key] as number) + 3, 0, 99) })),
      },
      `An hour with Bridges on ${why.toLowerCase()} — every horse in the yard is a little sharper for it.`,
    ),
  })),
};

// ---------- Beat 8: Callum Rees, a fellow new trainer, over pints ----------
export function makeBeat8AllyTrainer(unlockedTracks: CourseName[]): DecisionEvent {
  return {
    title: "Pints with Callum Rees",
    text: `Callum Rees, another trainer barely a year into it himself, buys the first round. He's not much of a horseman by his own admission — "I couldn't pick a Derby winner in a two-horse race" — but he's spent half his life on the road, and he talks tracks like other people talk football. Which one do you want picked apart?`,
    choices: unlockedTracks.map(course => ({
      label: course,
      hint: "big jump in course knowledge",
      apply: (st: GameState) => note(
        { ...st, mastery: { ...st.mastery, [course]: clamp(st.mastery[course] + 25, 0, 100) } },
        `Callum talks you through ${course} for a solid hour, pint going flat. He clearly knows every blade of grass on the place, even if he can't train a winner on it. "Come find me again sometime — I'm always good for another track."`,
      ),
    })),
  };
}
