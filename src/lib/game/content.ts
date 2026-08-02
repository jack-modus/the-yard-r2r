// Day-to-day flavour content and the trainingMoment decision generator,
// extracted verbatim from reference/rags-to-riches-v6.jsx.
import { clamp, pick, ri } from "@/lib/sim";
import { YARD } from "@/lib/sim";
import type { Yard } from "@/lib/sim";
import { note, withHorse } from "./stateUtils";
import type { DecisionEvent, GameState } from "./types";

export const QUIET_DAYS = [
  "A quiet one. The string walks out, canters, comes back. Tea in the tack room.",
  "Drizzle all morning. Heads down, routine done, nothing to report.",
  "The farrier's van is in the yard half the day. Everything else ticks over.",
  "Muck out, ride out, feed, sweep. Some days the job is just the job.",
  "A schooling morning for the yearlings. Your horse does steady work and eats up well.",
  "The gallops are busy with other yards' strings. You keep to the inside and get the work done quietly.",
  "Nothing doing. Even the yard cat looks bored.",
  "A visiting owner tours the yard. Lots of nodding. Your horse behaves, mostly.",
];

export function trainingMoment(s: GameState): DecisionEvent | null {
  const fit = s.horses.filter(h => h.injuryDays === 0);
  if (!fit.length) return null;
  const h = pick(fit);
  const yard = YARD;
  const templates: DecisionEvent[] = [
    {
      title: `${h.name} is fresh this morning`,
      text: `Bucking and squealing on the walk out — the horse is jumping out of its skin. Let it have a proper blow-out, or keep the lid on?`,
      choices: [
        { label: "Let it stretch out", hint: "+speed · +fatigue · small strain risk", apply: st => {
          let n = withHorse(st, h.id, x => ({ ...x, speed: clamp(x.speed + 1.5, 0, 99), fatigue: clamp(x.fatigue + 8, 0, 100) }));
          if (Math.random() < 0.12) { n = withHorse(n, h.id, x => ({ ...x, injuryDays: ri(4, 10) })); n = note(n, `${h.name} came back with heat in a joint. A spell on the easy list.`); }
          else n = note(n, `${h.name} worked with real zest. Sharper for it.`);
          return n;
        } },
        { label: "Keep it settled", hint: "+morale, nothing risked", apply: st => note(withHorse(st, h.id, x => ({ ...x, morale: clamp(x.morale + 3, 0, 100) })), `${h.name} settles into steady work. A good, calm morning.`) },
      ],
    },
    {
      title: "Stalls practice?",
      text: `${h.name} has been slow into stride. A morning at the practice stalls could fix the break — with the usual small risk of a knock in there.`,
      choices: [
        { label: "School in the stalls", hint: "+break · small knock risk (days off)", apply: st => Math.random() < 0.1
          ? note(withHorse(st, h.id, x => ({ ...x, injuryDays: 3 })), `${h.name} banged a knee in the gates. A few days off.`)
          : note(withHorse(st, h.id, x => ({ ...x, brk: clamp(x.brk + 2.5, 0, 99) })), `${h.name} pings the gates all morning. The break is sharper.`) },
        { label: "Not today", hint: "no change", apply: st => st },
      ],
    },
    {
      title: `${yard.boss} stops by your box`,
      text: `${yard.boss} leans on the door and watches you work for a long minute. "Tell me your plan for this one." Do you talk targets or talk process?`,
      choices: [
        { label: "Talk targets — name a race", hint: "+trust (more)", apply: st => note({ ...st, trust: clamp(st.trust + 4, 0, 100) }, `${pick(yard.praise)} — the ambition lands well. Trust grows.`) },
        { label: "Talk process — the daily work", hint: "+trust (less)", apply: st => note({ ...st, trust: clamp(st.trust + 2, 0, 100) }, `A thoughtful answer. ${yard.boss} nods slowly and moves on.`) },
      ],
    },
    {
      title: "Work upsides the stable star",
      text: `The head lad offers you a lead horse for a serious piece of work. It'll build ${h.name} up — and take something out of the horse today.`,
      choices: [
        { label: "Take the work", hint: "+stamina · +fitness · +fatigue", apply: st => note(withHorse(st, h.id, x => ({ ...x, stamina: clamp(x.stamina + 2, 0, 99), fitness: clamp(x.fitness + 4, 0, 100), fatigue: clamp(x.fatigue + 10, 0, 100) })), `${h.name} is made to graft — and thrives on it.`) },
        { label: "Steady canter instead", hint: "recovers fatigue", apply: st => note(withHorse(st, h.id, x => ({ ...x, fatigue: Math.max(0, x.fatigue - 8) })), `An easy day banked.`) },
      ],
    },
    {
      title: `A theory about ${h.name}`,
      text: `Watching the horse move on ${h.prefGoing >= 3 ? "rain-softened" : "quick"} ground this morning, you have a hunch about its going preference. Test it with a searching piece of work?`,
      choices: [
        { label: "Test the theory", hint: "reveals going preference · +fatigue", apply: st => note(withHorse(st, h.id, x => ({ ...x, goingKnown: true, fatigue: clamp(x.fatigue + 8, 0, 100) })), `Confirmed: ${h.name} clearly wants ${["", "Good to Firm", "Good", "Good to Soft", "Soft"][h.prefGoing]} ground. Written in the notebook.`) },
        { label: "Let it reveal itself in races", hint: "no change — races may reveal it anyway", apply: st => st },
      ],
    },
    {
      title: "The local paper wants a word",
      text: `A reporter's on the phone chasing a line about ${h.name} for the weekend edition. ${yard.boss} leaves it to you — but insiders notice a trainer who's always chasing headlines.`,
      choices: [
        { label: "Give them a big quote", hint: "+celebrity (more) · -reputation (small)", apply: st => note({ ...st, celebrity: clamp(st.celebrity + 6, 0, 100), reputation: clamp(st.reputation - 2, 0, 100) }, `Your quote runs under a big photo of ${h.name}. The public loves it. A couple of trainers you respect raise an eyebrow at the showmanship.`) },
        { label: "Keep it modest, stick to the facts", hint: "+reputation (small)", apply: st => note({ ...st, reputation: clamp(st.reputation + 2, 0, 100) }, `A quiet, professional quote. Nothing anyone will remember by name — but it's the kind of answer other trainers respect.`) },
      ],
    },
  ];
  return pick(templates);
}

export const NEWS_LINES = (yard: Yard, courseNames: string[]) => [
  `${yard.boss} is in the racing pages today — ${pick(["a winner at the weekend meeting", "quotes about the yard's spring targets", "a bullish word for the stable's big hope"])}.`,
  `Word from the racecourse: the going at ${pick(courseNames)} is officially ${pick(["quickening", "easing after rain", "riding dead"])}.`,
  `An owner sends a crate of beer to the tack room. Morale up across the yard.`,
  `The head lad reckons your horse "is starting to look like a racehorse". High praise from that quarter.`,
];
