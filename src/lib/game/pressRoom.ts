// Press Room — player-initiated actions (not random events), one tab in the
// main shell. Each of the four actions is usable once per day
// (GameState.pressRoomUsed, reset every advanceDay()). Outcomes surface
// through the same outcomeText toast page.tsx already uses for decisions.
import { RIVAL_TRAINERS, clamp, pick, ri } from "@/lib/sim";
import { note } from "./stateUtils";
import type { GameState } from "./types";

export type PressRoomActionId = "talkUp" | "interview" | "pickFight" | "courtPress";

export const PRESS_ROOM_ACTIONS: { id: PressRoomActionId; label: string; blurb: string }[] = [
  { id: "talkUp", label: "Talk up a horse", blurb: "A bold public prediction — good for Celebrity, if it doesn't age badly." },
  { id: "interview", label: "Give a measured interview", blurb: "Safe, professional, the kind of answer insiders respect. Good for Reputation." },
  { id: "pickFight", label: "Pick a fight with a rival trainer", blurb: "Needle a rival in print. Big Celebrity, a real Reputation cost, and it might not end there." },
  { id: "courtPress", label: "Court the press for a feature", blurb: "Chase a bit of coverage. Good for Celebrity — the boss won't love the time it takes." },
];

export function pressRoomAction(s: GameState, action: PressRoomActionId, horseId?: number): GameState {
  if (s.pressRoomUsed[action]) return s;
  const used = { ...s.pressRoomUsed, [action]: true };

  if (action === "talkUp") {
    const h = s.horses.find(x => x.id === horseId) ?? s.horses[0];
    if (!h) return s;
    const boost = ri(4, 7);
    return note(
      { ...s, pressRoomUsed: used, celebrity: clamp(s.celebrity + boost, 0, 100) },
      pick([
        `"${h.name}? Best horse in the yard, and I'll say that to anyone." It runs in the paper practically verbatim. (Celebrity +${boost}.)`,
        `You go big on ${h.name} to anyone who'll listen. Whether that ages well is a problem for future you. (Celebrity +${boost}.)`,
        `"Mark my words on ${h.name}." Bold. Quotable. Slightly terrifying in retrospect. (Celebrity +${boost}.)`,
      ]),
    );
  }

  if (action === "interview") {
    const boost = ri(2, 4);
    return note(
      { ...s, pressRoomUsed: used, reputation: clamp(s.reputation + boost, 0, 100) },
      pick([
        `A calm, sensible chat about the yard's progress. Nobody quotes a word of it, and that's exactly the point. (Reputation +${boost}.)`,
        `You talk shop — ground, targets, the daily grind. Dull copy, but the right people read it closely. (Reputation +${boost}.)`,
        `No fireworks, just a straight account of how things are going. Insiders notice the lack of noise. (Reputation +${boost}.)`,
      ]),
    );
  }

  if (action === "pickFight") {
    const rival = pick(RIVAL_TRAINERS);
    const celebBoost = ri(5, 8), repHit = ri(3, 6);
    let next: GameState = { ...s, pressRoomUsed: used, celebrity: clamp(s.celebrity + celebBoost, 0, 100), reputation: clamp(s.reputation - repHit, 0, 100) };
    let followup = "";
    if (Math.random() < 0.35) {
      next = { ...next, pressRoomFollowupDay: s.day + ri(4, 8) };
      followup = " Don't be surprised if that's not the last you hear from them.";
    }
    return note(
      next,
      `${pick([
        `A pointed word about ${rival}'s methods, on the record. It gets picked up everywhere by teatime.`,
        `You suggest — politely, but not that politely — that ${rival} might want to focus on their own yard.`,
        `Nothing libellous, just enough needle about ${rival} to fill a column inch or six.`,
      ])} (Celebrity +${celebBoost}, Reputation -${repHit}.)${followup}`,
    );
  }

  // courtPress
  const celebBoost = ri(4, 6), trustHit = ri(1, 3);
  return note(
    { ...s, pressRoomUsed: used, celebrity: clamp(s.celebrity + celebBoost, 0, 100), trust: clamp(s.trust - trustHit, 0, 100) },
    `${pick([
      `You spend the afternoon chasing a feature piece instead of being in the yard. It runs well.`,
      `A magazine wants "a day in the life" — you oblige, at the cost of an actual afternoon's work.`,
      `You ring round a couple of contacts angling for coverage. It pays off, eventually.`,
    ])} (Celebrity +${celebBoost}, Trust -${trustHit}.)`,
  );
}

export function makeRivalClapback(): { title: string; tag: "RIVAL"; text: string; choices: { label: string; apply: (st: GameState) => GameState }[] } {
  const rival = pick(RIVAL_TRAINERS);
  return {
    title: "The rival claps back",
    tag: "RIVAL",
    text: `${rival} has had a few days to think of a comeback, and the papers are only too happy to print it: a pointed line about your yard, your methods, your father — whatever lands. It's clearly meant to needle you.`,
    choices: [
      {
        label: "Rise to it",
        apply: (st: GameState) => note(
          { ...st, celebrity: clamp(st.celebrity + 4, 0, 100), reputation: clamp(st.reputation - 3, 0, 100) },
          `You fire back in kind. Great copy, two column inches, and precisely nothing achieved. (Celebrity +4, Reputation -3.)`,
        ),
      },
      {
        label: "Ignore it completely",
        apply: (st: GameState) => note(
          { ...st, reputation: clamp(st.reputation + 2, 0, 100) },
          `You don't dignify it with a response. The people who matter notice the restraint. (Reputation +2.)`,
        ),
      },
    ],
  };
}
