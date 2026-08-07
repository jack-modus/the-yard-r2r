// Day-to-day flavour content and the trainingMoment decision generator,
// extracted verbatim from reference/rags-to-riches-v6.jsx.
import { clamp, pick, ri } from "@/lib/sim";
import { YARD } from "@/lib/sim";
import type { Yard } from "@/lib/sim";
import { note, withHorse } from "./stateUtils";
import { makeClassicCallback } from "./storyContent";
import { pickFresh } from "./variety";
import { makeVetBillDecision } from "./vetBills";
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

// Fixed at the true count of templates below (16 base + 1 conditional
// classic-callback slot) — see variety.ts for why this needs to roughly
// match the real pool size rather than being an arbitrary cooldown window.
export const TRAINING_POOL_SIZE = 17;

export function trainingMoment(s: GameState, recent: string[] = []): DecisionEvent | null {
  const fit = s.horses.filter(h => h.injuryDays === 0);
  if (!fit.length) return null;
  const h = pick(fit);
  const yard = YARD;
  const templates: DecisionEvent[] = [
    {
      id: "fresh-morning",
      title: `${h.name} is fresh this morning`,
      tag: "TRAINING",
      text: `Bucking and squealing on the walk out — the horse is jumping out of its skin. Let it have a proper blow-out, or keep the lid on?`,
      choices: [
        { label: "Let it stretch out", hint: "+speed · +fatigue · small strain risk", apply: st => {
          let n = withHorse(st, h.id, x => ({ ...x, speed: clamp(x.speed + 1.5, 0, 99), fatigue: clamp(x.fatigue + 8, 0, 100) }));
          if (Math.random() < 0.12) {
            const days = ri(4, 10);
            n = withHorse(n, h.id, x => ({ ...x, injuryDays: days }));
            n = note(n, `${h.name} came back with heat in a joint. A spell on the easy list.`);
            n = { ...n, queue: [...n.queue, makeVetBillDecision(n, h.id, h.name, days)] };
          } else n = note(n, `${h.name} worked with real zest. Sharper for it.`);
          return n;
        } },
        { label: "Keep it settled", hint: "+morale, nothing risked", apply: st => note(withHorse(st, h.id, x => ({ ...x, morale: clamp(x.morale + 3, 0, 100) })), `${h.name} settles into steady work. A good, calm morning.`) },
      ],
    },
    {
      id: "stalls-practice",
      title: "Stalls practice?",
      tag: "TRAINING",
      text: `${h.name} has been slow into stride. A morning at the practice stalls could fix the break — with the usual small risk of a knock in there.`,
      choices: [
        { label: "School in the stalls", hint: "+break · small knock risk (days off)", apply: st => {
          if (Math.random() >= 0.1) return note(withHorse(st, h.id, x => ({ ...x, brk: clamp(x.brk + 2.5, 0, 99) })), `${h.name} pings the gates all morning. The break is sharper.`);
          const n = note(withHorse(st, h.id, x => ({ ...x, injuryDays: 3 })), `${h.name} banged a knee in the gates. A few days off.`);
          return { ...n, queue: [...n.queue, makeVetBillDecision(n, h.id, h.name, 3)] };
        } },
        { label: "Not today", hint: "no change", apply: st => st },
      ],
    },
    {
      id: "boss-stops-by",
      title: `${yard.boss} stops by your box`,
      tag: "BOSS",
      text: `${yard.boss} leans on the door and watches you work for a long minute. "Tell me your plan for this one." Do you talk targets or talk process?`,
      choices: [
        { label: "Talk targets — name a race", apply: st => note({ ...st, trust: clamp(st.trust + 4, 0, 100) }, `${pick(yard.praise)} — the ambition lands well. Trust grows. (Trust +4.)`) },
        { label: "Talk process — the daily work", apply: st => note({ ...st, trust: clamp(st.trust + 2, 0, 100) }, `A thoughtful answer. ${yard.boss} nods slowly and moves on. (Trust +2.)`) },
      ],
    },
    {
      id: "lead-horse-work",
      title: "Work upsides the stable star",
      tag: "TRAINING",
      text: `The head lad offers you a lead horse for a serious piece of work. It'll build ${h.name} up — and take something out of the horse today.`,
      choices: [
        { label: "Take the work", hint: "+stamina · +fitness · +fatigue", apply: st => note(withHorse(st, h.id, x => ({ ...x, stamina: clamp(x.stamina + 2, 0, 99), fitness: clamp(x.fitness + 4, 0, 100), fatigue: clamp(x.fatigue + 10, 0, 100) })), `${h.name} is made to graft — and thrives on it.`) },
        { label: "Steady canter instead", hint: "recovers fatigue", apply: st => note(withHorse(st, h.id, x => ({ ...x, fatigue: Math.max(0, x.fatigue - 8) })), `An easy day banked.`) },
      ],
    },
    {
      id: "going-theory",
      title: `A theory about ${h.name}`,
      tag: "TRAINING",
      text: `Watching the horse move on ${h.prefGoing >= 3 ? "rain-softened" : "quick"} ground this morning, you have a hunch about its going preference. Test it with a searching piece of work?`,
      choices: [
        { label: "Test the theory", hint: "reveals going preference · +fatigue", apply: st => note(withHorse(st, h.id, x => ({ ...x, goingKnown: true, fatigue: clamp(x.fatigue + 8, 0, 100) })), `Confirmed: ${h.name} clearly wants ${["", "Good to Firm", "Good", "Good to Soft", "Soft"][h.prefGoing]} ground. Written in the notebook.`) },
        { label: "Let it reveal itself in races", hint: "no change — races may reveal it anyway", apply: st => st },
      ],
    },
    {
      id: "local-paper",
      title: "The local paper wants a word",
      tag: "PRESS",
      text: `A reporter's on the phone chasing a line about ${h.name} for the weekend edition. ${yard.boss} leaves it to you — but insiders notice a trainer who's always chasing headlines.`,
      choices: [
        { label: "Give them a big quote", apply: st => note({ ...st, celebrity: clamp(st.celebrity + 6, 0, 100), reputation: clamp(st.reputation - 2, 0, 100) }, `Your quote runs under a big photo of ${h.name}. The public loves it. A couple of trainers you respect raise an eyebrow at the showmanship. (Celebrity +6, Reputation -2.)`) },
        { label: "Keep it modest, stick to the facts", apply: st => note({ ...st, reputation: clamp(st.reputation + 2, 0, 100) }, `A quiet, professional quote. Nothing anyone will remember by name — but it's the kind of answer other trainers respect. (Reputation +2.)`) },
      ],
    },
    {
      id: "sales-tip",
      title: "A tip, for what it's worth",
      tag: "YARD",
      text: `An old jockey's agent corners you at the sales ground, half a pint deep, keen to share a theory about ${h.name}. Some of it's nonsense. Some of it might not be.`,
      choices: [
        { label: "Take it seriously", apply: st => note(withHorse(st, h.id, x => ({ ...x, morale: clamp(x.morale + 4, 0, 100) })), `You nod along and file it away. ${h.name} seems to have picked up on the extra attention — a touch brighter in itself this week.`) },
        { label: "Smile and forget it", apply: st => note(st, `Probably wise. Half the tips in this game are just noise dressed up as wisdom.`) },
      ],
    },
    {
      id: "neighbour-trainer",
      title: "Another trainer, over the fence",
      tag: "YARD",
      text: `A trainer from a neighbouring yard leans on the rail while your string cools off, in the mood to talk shop. "How's yours shaping up, then?" It's the kind of question that's really an invitation to compare notes.`,
      choices: [
        { label: "Swap notes openly", apply: st => note({ ...st, reputation: clamp(st.reputation + 1, 0, 100) }, `You talk plainly, and so does she. Not every conversation in this game needs to be a negotiation. (Reputation +1.)`) },
        { label: "Keep your cards close", apply: st => note(st, `You keep it vague. She takes the hint and the conversation moves on to the weather, as these things do.`) },
      ],
    },
    {
      id: "camera-crew",
      title: "A camera crew in the yard",
      tag: "PRESS",
      text: `A regional TV crew turns up unannounced, doing a piece on "the next generation of British racing" — someone in the press office clearly gave them your name. They want thirty seconds, on camera, right now.`,
      choices: [
        { label: "Do the interview", apply: st => note({ ...st, celebrity: clamp(st.celebrity + 5, 0, 100) }, `You give them something usable. It airs on the local news that evening, ${h.name} getting a two-second cutaway shot of its own. (Celebrity +5.)`) },
        { label: "Point them at the head lad instead", apply: st => note(st, `Ray handles it far better than you would have. The crew leaves happy, and nobody outside the yard ever knows you dodged it.`) },
      ],
    },
    {
      id: "yard-cat",
      title: "The yard cat has opinions",
      tag: "YARD",
      text: `The yard cat — nobody remembers hiring it, it simply arrived one winter and stayed — has taken to sitting in ${h.name}'s doorway every morning and refusing to move. The lads have started calling it a good omen. You're not sure a cat can have opinions about a racehorse, but you've been wrong before.`,
      choices: [
        { label: "Lean into it — let the cat stay", apply: st => note(withHorse(st, h.id, x => ({ ...x, morale: clamp(x.morale + 3, 0, 100) })), `${h.name} seems genuinely calmer with the cat around. Ridiculous. Also, apparently, working.`) },
        { label: "Shoo the cat off, this is a yard not a petting zoo", apply: st => note(st, `The cat gives you a look of profound disappointment and relocates to someone else's box out of spite.`) },
      ],
    },
    {
      id: "moon-system",
      title: "A system that cannot fail", tag: "YARD",
      text: `A man at the sales ground corners you with a betting "system" involving the phases of the moon, ${h.name}'s coat colour, and — he's very insistent about this part — the number of vowels in the racecourse's name. He has charts. He has a whole ring binder of charts.`,
      choices: [
        { label: "Humour him for ten minutes", apply: st => note(st, `You nod along politely. None of it makes any sense, but he seems so happy explaining it that you almost feel bad leaving.`) },
        { label: "Make your excuses immediately", apply: st => note(st, `You've heard enough moon-phase theories for one career. He looks wounded but recovers by the time you're out of earshot.`) },
      ],
    },
    {
      id: "sausage-sponsor",
      title: "A sponsorship enquiry, sort of", tag: "PRESS",
      text: `A local sausage company wants to sponsor ${h.name}'s next race — a modest cash sum in exchange for "Bridges' Bangers" getting a mention in the racecard. It is, by some distance, the least dignified offer the yard has ever received.`,
      choices: [
        { label: "Take the money — dignity is overrated", apply: st => note({ ...st, cash: st.cash + 150, celebrity: clamp(st.celebrity + 2, 0, 100) }, `${h.name} is now, technically, sponsored by sausages. £150 richer and marginally more famous for it. (Celebrity +2.)`) },
        { label: "Politely decline", apply: st => note(st, `You decide the yard's reputation can survive without a sausage-based partnership. Somehow you don't regret it.`) },
      ],
    },
    {
      id: "apprentice-advice",
      title: "The apprentice wants advice", tag: "TRAINING",
      text: `A stable apprentice, all of seventeen and painfully earnest, asks if you have "any tips for making it" in this game. You remember being asked the same thing roughly never, because you were the one asking it a few years back.`,
      choices: [
        { label: "Give him something honest", apply: st => note({ ...st, trust: clamp(st.trust + 2, 0, 100) }, `Word gets back to ${yard.boss} that you took the time. It's noticed. (Trust +2.)`) },
        { label: "Tell him to watch and learn like everyone else did", apply: st => note(st, `Harsh, maybe, but not wrong. He nods and gets back to mucking out, slightly crestfallen.`) },
      ],
    },
    {
      id: "radio-phonein",
      title: "A radio phone-in wants a word", tag: "PRESS",
      text: `A local radio host wants you live on air for "sixty seconds on the state of the yard." His first question is whether ${h.name} is "the next big thing." His second question, before you can answer the first, is also whether ${h.name} is "the next big thing."`,
      choices: [
        { label: "\"Watch this space.\"", apply: st => note({ ...st, celebrity: clamp(st.celebrity + 4, 0, 100) }, `A soundbite with absolutely nothing in it, which is exactly what radio wants. (Celebrity +4.)`) },
        { label: "Give an actually honest answer", apply: st => note({ ...st, reputation: clamp(st.reputation + 2, 0, 100) }, `The host seems faintly disappointed by the nuance, but the racing press notices a trainer who doesn't just say what's expected. (Reputation +2.)`) },
      ],
    },
    {
      id: "lucky-headcollar",
      title: "A lucky headcollar", tag: "YARD",
      text: `One of the lads swears ${h.name} only works well in a specific, extremely battered headcollar that is, by any objective measure, falling apart. He's threatening to quit if you make him use the new one.`,
      choices: [
        { label: "Let superstition win — keep the old one", apply: st => note(withHorse(st, h.id, x => ({ ...x, morale: clamp(x.morale + 2, 0, 100) })), `The lad is vindicated. ${h.name}, entirely unaware of any of this, works well regardless.`) },
        { label: "Retire the headcollar, it's a health hazard", apply: st => note(st, `The lad sulks for exactly one day, then forgets all about it. The new headcollar does its job.`) },
      ],
    },
    {
      id: "budgerigar-owner",
      title: "An owner's very specific request", tag: "YARD",
      text: `A prospective owner rings the yard, keen to get involved — on the condition that any future horse be named after his late budgerigar, Sir Reginald Featherstonehaugh III. ${yard.boss} takes the call in stony silence and hands you the phone without a word of warning.`,
      choices: [
        { label: "Take it in your stride", apply: st => note({ ...st, celebrity: clamp(st.celebrity + 1, 0, 100) }, `You manage to keep a straight face for the whole call. Word of it gets round the yard by teatime regardless. (Celebrity +1.)`) },
        { label: "Politely redirect him to the head lad", apply: st => note(st, `Ray takes the call instead and, remarkably, handles it with total sincerity. Some people are built for this job.`) },
      ],
    },
  ];
  if (s.story.classicResults.length > 0) {
    templates.push({ ...makeClassicCallback(s.story.classicResults[s.story.classicResults.length - 1]), id: "classic-callback" });
  }
  return pickFresh(templates, recent);
}

export const NEWS_LINES = (yard: Yard, courseNames: string[]) => [
  `${yard.boss} is in the racing pages today — ${pick(["a winner at the weekend meeting", "quotes about the yard's spring targets", "a bullish word for the stable's big hope"])}.`,
  `Word from the racecourse: the going at ${pick(courseNames)} is officially ${pick(["quickening", "easing after rain", "riding dead"])}.`,
  `An owner sends a crate of beer to the tack room. Morale up across the yard.`,
  `The head lad reckons your horse "is starting to look like a racehorse". High praise from that quarter.`,
];
