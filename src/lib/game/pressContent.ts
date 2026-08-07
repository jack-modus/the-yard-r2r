// Pre-race and post-race press moments for *any* race, not just the
// scripted McLean arc (which already has its own BEAT5_REPORTER_PRE_RACE).
// Generic/parameterised rather than one-off per race, per playtesting
// feedback asking for more frequent, funnier press content specifically
// around race day. Light, tabloid-ish tone — distinct from the more
// serious scripted narrative beats, which is fine since this is ambient
// colour, not the main story.
import { YARD, clamp, pick } from "@/lib/sim";
import { note } from "./stateUtils";
import type { DecisionEvent, GameState } from "./types";

const YARD_JOCKEY_NOTE = `a swipe at ${YARD.jockey.name}'s tactics gets back to him before you're even out of the car park`;

export function makePreRacePress(horseName: string, raceName: string): DecisionEvent {
  const variant = pick([
    {
      title: "The paddock press pack",
      text: `A reporter catches you by the rail before the ${raceName}, notebook already out. "Go on then — bold prediction for ${horseName}?"`,
      choices: [
        { label: "\"We're winning it.\"", apply: (st: GameState) => note({ ...st, celebrity: clamp(st.celebrity + 3, 0, 100) }, `Bold. It runs exactly as said, word for word, under a photo of ${horseName} looking supremely unbothered by the pressure you've just put on it. (Celebrity +3.)`) },
        { label: "\"Let's see what happens.\"", apply: (st: GameState) => note({ ...st, reputation: clamp(st.reputation + 1, 0, 100) }, `The safest answer in racing. Nobody quotes it, but nobody laughs at it either. (Reputation +1.)`) },
      ],
    },
    {
      title: "A word about the opposition",
      text: `"Word is one of the rival trainers fancies their chances today more than yours," the reporter says, watching for a reaction before the ${raceName}. It might even be true. It might just be a reporter trying to get a rise out of you.`,
      choices: [
        { label: "\"Let the horses sort that out.\"", apply: (st: GameState) => note({ ...st, reputation: clamp(st.reputation + 2, 0, 100) }, `Unbothered, professional, the kind of answer that ages well either way. (Reputation +2.)`) },
        { label: "\"We'll see who's still fancied at the line.\"", apply: (st: GameState) => note({ ...st, celebrity: clamp(st.celebrity + 3, 0, 100) }, `Good copy, a bit of needle — it makes the papers regardless of what happens next. (Celebrity +3.)`) },
      ],
    },
    {
      title: "A question you weren't expecting",
      text: `Between the serious questions about ${horseName}'s prospects in the ${raceName}, the reporter asks, entirely deadpan, whether you have any pre-race superstitions. You did not prepare an answer for this.`,
      choices: [
        { label: "Invent a superstition on the spot", apply: (st: GameState) => note({ ...st, celebrity: clamp(st.celebrity + 4, 0, 100) }, `You claim you always tie your left boot first. This is not true. It will now be true forever, because you said it on the record. (Celebrity +4.)`) },
        { label: "\"No, just the work.\"", apply: (st: GameState) => note({ ...st, reputation: clamp(st.reputation + 1, 0, 100) }, `A refreshingly boring answer. The reporter looks faintly disappointed and moves on to the next trainer. (Reputation +1.)`) },
      ],
    },
  ]);
  return { ...variant, tag: "PRESS" as const };
}

export function makePostRacePress(horseName: string, raceName: string, won: boolean): DecisionEvent {
  const variant = won
    ? pick([
      {
        title: "In the winner's enclosure",
        text: `Cameras are already on you before you've got the saddle off. "Talk us through that one" — as if the last ten minutes weren't still a blur.`,
        choices: [
          { label: "Milk the moment", apply: (st: GameState) => note({ ...st, celebrity: clamp(st.celebrity + 5, 0, 100) }, `You give them the full performance. It's exactly what the evening bulletin wanted, and ${horseName} gets a longer cutaway shot than usual for it. (Celebrity +5.)`) },
          { label: "Keep it short and credit the horse", apply: (st: GameState) => note({ ...st, reputation: clamp(st.reputation + 2, 0, 100) }, `A modest, professional line. The kind of answer that quietly earns respect rather than headlines. (Reputation +2.)`) },
        ],
      },
      {
        title: "Straight after the line",
        text: `A reporter wants "one word" to sum up the win with ${horseName} in the ${raceName}. Nobody ever actually gives one word.`,
        choices: [
          { label: "Give a genuinely quotable line", apply: (st: GameState) => note({ ...st, celebrity: clamp(st.celebrity + 4, 0, 100) }, `It makes the back page as a pull-quote. Not bad for something you made up on the spot. (Celebrity +4.)`) },
          { label: "\"Job done.\"", apply: (st: GameState) => note({ ...st, reputation: clamp(st.reputation + 2, 0, 100) }, `Two words, not one, but nobody's counting. Insiders like a trainer who doesn't need the moment to be about them. (Reputation +2.)`) },
        ],
      },
    ])
    : pick([
      {
        title: "Fishing for a reaction",
        text: `A reporter catches you on the way back to the yard after ${horseName}'s below-par run in the ${raceName}, clearly hoping for something juicier than "the horse ran badly."`,
        choices: [
          { label: "Give them a spicy line about the ride", apply: (st: GameState) => note({ ...st, celebrity: clamp(st.celebrity + 3, 0, 100), trust: clamp(st.trust - 2, 0, 100) }, `Good copy, bad idea — ${YARD_JOCKEY_NOTE}. ${YARD.boss} hears about it before you're back in the yard. (Celebrity +3, Trust -2.)`) },
          { label: "Take it on the chin", apply: (st: GameState) => note({ ...st, reputation: clamp(st.reputation + 2, 0, 100) }, `"On the day, we weren't good enough. Simple as that." Boring, honest, and exactly what earns long-term respect. (Reputation +2.)`) },
        ],
      },
      {
        title: "The kind question",
        text: `Not every reporter is circling for blood — this one just asks what went wrong with ${horseName} today, straight and simple.`,
        choices: [
          { label: "Be candid about it", apply: (st: GameState) => note({ ...st, reputation: clamp(st.reputation + 2, 0, 100) }, `An honest, unglamorous answer. It won't make headlines, but the people who matter clock it. (Reputation +2.)`) },
          { label: "Deflect — no excuses", apply: (st: GameState) => note(st, `"No excuses, we'll regroup." Safe, forgettable, and by tomorrow nobody remembers it was even asked.`) },
        ],
      },
    ]);
  return { ...variant, tag: "PRESS" as const };
}
