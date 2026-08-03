// Act 1 / early Act 2 scripted beat content — the user's own outline,
// implemented as DecisionEvents reusing the exact same Choice/apply pattern
// as the ordinary trainingMoment events (content.ts). Orchestration (when
// each beat fires, the nemesis mechanics) lives in story.ts; this file is
// just the words and their stat effects.
import { COURSES, OR, YARD, clamp, drawField, nid, ri } from "@/lib/sim";
import type { CalendarRace, CourseName, Horse } from "@/lib/sim";
import { note } from "./stateUtils";
import type { ClassicOutcome, DecisionEvent, GameState } from "./types";

// ---------- Beat 3: the yard, another jockey, first-ambition question ----------
// Defined before Beats 2/2b since their choices need to enqueue it.
export const BEAT3_YARD: DecisionEvent = {
  title: "Out in the yard",
  tag: "YARD",
  text: `A jockey leans on the rail near the last box, watching you find your feet — Rossa Bellini, the stable's number one, sizing up the new assistant the way jockeys size up everything: quickly, and without much interest in being wrong. You tell him the plan anyway — not just to win, but to be the best. A Group 1. Eventually, the Classics. All of them.\n\nHe laughs, not unkindly. "Okay mate. Best win a race first. Ask me again after."`,
  choices: [
    {
      label: "\"Yes — I'll do it.\"",
      apply: st => note(
        { ...st, reputation: clamp(st.reputation - 2, 0, 100), celebrity: clamp(st.celebrity + 3, 0, 100), awaitingHorsePick: true },
        `The jockey raises an eyebrow at the certainty. Word of the big talk gets round the yard before lunch. (Reputation -2, Celebrity +3.)`,
      ),
    },
    {
      label: "\"I'll do my best.\"",
      apply: st => note(
        { ...st, reputation: clamp(st.reputation + 1, 0, 100), awaitingHorsePick: true },
        `"Fair enough," he says. "At least you're not a blowhard." Not much said, but it lands the right way. (Reputation +1.)`,
      ),
    },
  ],
};

// ---------- Beat 2b: Ray Fenwick, the head lad — texture before the pick ----------
// Purely characterisation, same "no repercussions" pattern as Beat 2's
// internal question — added because the run straight from office to horse
// pick felt too rushed in playtesting.
export const BEAT2B_HEAD_LAD: DecisionEvent = {
  title: "Ray Fenwick, head lad",
  tag: "YARD",
  text: `Ray Fenwick meets you at the yard gates before Bridges has finished his coffee — head lad here longer than some of the horses have been alive. He doesn't offer a hand. "So you're the one." A pause, sizing you up properly. "I mucked out for your grandfather one summer, years back. Best horseman I ever worked for. Your father—" he stops himself there. "Well. Let's see what you're made of instead of talking about it."\n\nHe walks you down the row of boxes — six horses, six sets of ears pricking up at a stranger's footsteps. "Feed's at six, work starts at half six, and I don't care whose grandson you are if a horse goes hungry on your watch." He hands you a headcollar without asking if you want it. "Right. Let's get you started."`,
  choices: [
    {
      label: "Get straight to work — no speeches needed.",
      apply: st => note({ ...st, queue: [...st.queue, BEAT3_YARD] }, `Ray almost smiles. Almost. "Good answer."`),
    },
    {
      label: "Ask him what your grandfather was really like.",
      apply: st => note(
        { ...st, queue: [...st.queue, BEAT3_YARD] },
        `Ray considers it a long moment. "Patient. Which is more than I can say for most of you young ones." He leaves it there and gets back to work.`,
      ),
    },
  ],
};

// ---------- Beat 2: Bridges' office ----------
export const BEAT2_BRIDGES_OFFICE: DecisionEvent = {
  title: "In Bridges' office",
  tag: "BOSS",
  text: `Bridges doesn't stand. "A fresh start — for you. I'm taking a bit of a risk here, and I want to be straight about why." He lets that sit. "Your father owed a lot of people money by the end. Rubbed a lot of people up the wrong way, too. He was a good trainer, Tony — a genuinely good one — but he gambled every bit of it away. Can you assure me you won't do the same?"\n\nHe nods at a black-and-white photograph on the wall — two men at the races, sharp suits, a winner's enclosure. "That's my father. And that" — he taps the other man — "is your grandfather. He was a great man, your grandfather. One of the best I ever saw. Your father could have been him. He chose not to be."\n\nHe doesn't wait for an answer out loud. You ask yourself the question instead.`,
  choices: [
    {
      label: "I'll be my grandfather, not my father.",
      apply: st => note(
        { ...st, queue: [...st.queue, BEAT2B_HEAD_LAD] },
        `Bridges: "Good. Go and find Ray — he'll show you round. I've got one horse spare for you to make something of. Just the one, mind — earn the rest."`,
      ),
    },
    {
      label: "I don't know yet — but I intend to find out.",
      apply: st => note(
        { ...st, queue: [...st.queue, BEAT2B_HEAD_LAD] },
        `Bridges: "Fair enough. Go and find Ray — he'll show you round. I've got one horse spare for you to make something of. Just the one, mind — earn the rest."`,
      ),
    },
  ],
};

// ---------- Beat 5: reporter, before the first McLean race (scripted loss) ----------
export const BEAT5_REPORTER_PRE_RACE: DecisionEvent = {
  title: "Before the race",
  tag: "PRESS",
  text: `A reporter catches you in the paddock. "You'll never win this game the way your old man did — everyone knows that story. But today's a simpler question: will you beat McLean?"`,
  choices: [
    {
      label: "\"Beat him? I'll leave him for dead.\"",
      apply: st => note(
        { ...st, celebrity: clamp(st.celebrity + 3, 0, 100) },
        `Your line runs under McLean's photo, not yours. He's already quoted underneath it: "Confidence is free. Trophies aren't." (Celebrity +3.)`,
      ),
    },
    {
      label: "\"We'll see. I just want a clean run.\"",
      apply: st => note(
        { ...st, reputation: clamp(st.reputation + 2, 0, 100) },
        `A modest answer, buried at the bottom of the piece — under McLean's: "Confidence is free. Trophies aren't." (Reputation +2.)`,
      ),
    },
  ],
};

// ---------- Beat 6: McLean taunts him after winning race 1 ----------
export const BEAT6_MCLEAN_TAUNT: DecisionEvent = {
  title: "McLean, in the winner's enclosure",
  tag: "RIVAL",
  text: `He doesn't even look tired. "There it is. Told you — stick to the punting." A couple of stable lads laugh along.`,
  choices: [
    {
      label: "\"Enjoy it. I'll knuckle down and be the best there is.\"",
      apply: st => note(
        { ...st, reputation: clamp(st.reputation + 2, 0, 100), skill: clamp(st.skill + 2, 0, 100) },
        `You say it flat, no heat in it. McLean's smile flickers, just slightly — he was expecting a reaction, not a plan. (Reputation +2, Skill +2.)`,
      ),
    },
    {
      label: "\"Say that again and see what happens.\"",
      apply: st => note(
        { ...st, celebrity: clamp(st.celebrity + 2, 0, 100), reputation: clamp(st.reputation - 2, 0, 100) },
        `A stable lad has to physically get between you. It's in the racing pages by Monday, and not flatteringly. (Celebrity +2, Reputation -2.)`,
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
  tag: "BOSS",
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
    tag: "YARD",
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

// ---------- Act 2: the Classics ----------
// Same mini-arc runs for each of the five real Classics (see calendar.ts) —
// horse choice, McLean's entry + media doubts folded into one decision, then
// the race itself. Diminishing narrative weight per outing is applied in
// story.ts, not here; this file only builds the content.
export function makeClassicHorseChoice(horses: Horse[], race: CalendarRace): DecisionEvent {
  const going = clamp(COURSES[race.course].going + ri(-1, 1), 1, 4);
  return {
    title: `${race.name} — who goes?`,
    tag: "BOSS",
    text: `Bridges corners you in the yard: "${race.name} is coming up. Biggest prize of the season so far, and reputations get made or lost on a day like that. Who are we sending?"`,
    choices: horses.map(h => ({
      label: h.name,
      apply: (st: GameState) => {
        const raceCard = {
          id: nid(), course: race.course, dist: race.dist, going, grade: race.grade,
          raceDay: race.day, name: `${race.name} (${race.grade})`, isClassic: true,
        };
        const { entries } = drawField(st.roster, raceCard, new Set(), st.usedNames);
        const fieldPreview = entries.map(e => ({ name: e.horse.name, trainerName: e.trainerName ?? "unattached", mark: e.horse.mark ?? Math.round(OR(e.horse)) }));
        return note(
          {
            ...st,
            entered: [...st.entered, { ...raceCard, horseId: h.id, fieldPreview }],
            story: { ...st.story, classicArc: { ...st.story.classicArc, stage: "horseChosen", horseId: h.id } },
          },
          `Declared: ${h.name} for the ${race.name}. No taking it back now.`,
        );
      },
    })),
  };
}

export function makeClassicDoubts(horseName: string, raceName: string): DecisionEvent {
  return {
    title: "Doubts in the press",
    tag: "PRESS",
    text: `Word's out that McLean has one entered for the ${raceName} too. The papers are full of it: is ${horseName} really ready for this? Rumour has it the biggest jockeys in the weighing room won't touch the ride.`,
    choices: [
      {
        label: "Defend the horse publicly",
        apply: (st: GameState) => note(
          { ...st, reputation: clamp(st.reputation + 2, 0, 100), celebrity: clamp(st.celebrity + 1, 0, 100) },
          `You back your horse in print, no hedging. Bold — and a week later, word comes through that a genuinely top jockey has agreed to take the ride after all. (Reputation +2, Celebrity +1.)`,
        ),
      },
      {
        label: "Let the form do the talking",
        apply: (st: GameState) => note(
          { ...st, reputation: clamp(st.reputation + 2, 0, 100) },
          `You say nothing to the papers. A week later, word comes through anyway: a genuinely top jockey has agreed to take the ride. Say what you like about the doubters — nobody argues with a leg-up like that. (Reputation +2.)`,
        ),
      },
    ],
  };
}

export function classicOutcomeMessage(outcome: Exclude<ClassicOutcome, "scratched">, raceName: string, horseName: string): string {
  switch (outcome) {
    case "win": return `${horseName} WINS the ${raceName}! Pandemonium in the stands — this is the kind of day people remember for years.`;
    case "place": return `${horseName} runs a huge race in the ${raceName}, right there without quite getting up. Nobody's disappointed with that.`;
    case "okay": return `${horseName} runs its race in the ${raceName} without ever really threatening — competitive, no more than that.`;
    case "tank": return `${horseName} never gets competitive in the ${raceName}. A day to forget, on the biggest stage there is.`;
  }
}

export function classicScratchedMessage(raceName: string, horseName: string): string {
  return `${horseName} is scratched from the ${raceName} — not fit to take its chance. The biggest race of the season so far, and it slips by without you. No time to dwell on it; the next one comes round soon enough.`;
}

// Occasional press callback referencing the most recent Classic result —
// folded into the ordinary trainingMoment pool (content.ts), not a separate
// bespoke system.
export function makeClassicCallback(lastResult: { name: string; outcome: ClassicOutcome }): DecisionEvent {
  return {
    title: "The press remember",
    tag: "PRESS",
    text: `A reporter brings up the ${lastResult.name} again — ${
      lastResult.outcome === "win" ? "your win there still gets mentioned whenever your name comes up"
      : lastResult.outcome === "place" ? "that near-miss still comes up in conversation"
      : lastResult.outcome === "okay" ? "even a quiet run there still gets a mention these days"
      : lastResult.outcome === "scratched" ? "the fact you never even got a run still puzzles people"
      : "even the bad days get raked over, apparently"
    }.`,
    choices: [
      { label: "Bask in it a little", apply: (st: GameState) => note({ ...st, celebrity: clamp(st.celebrity + 2, 0, 100) }, `You let the moment breathe. People like a trainer who enjoys the game. (Celebrity +2.)`) },
      { label: "Deflect — it's the horse, not you", apply: (st: GameState) => note({ ...st, reputation: clamp(st.reputation + 2, 0, 100) }, `A modest answer. The right people notice modesty. (Reputation +2.)`) },
    ],
  };
}

// ---------- Act 3: the Diamond Cup, the father subplot, the ending ----------
export const DIAMOND_CUP_COURSE: CourseName = "Ascot";
export const DIAMOND_CUP_DIST = 10;
export const FATHER_NAME = "Michael Vincenzo";

export const DIAMOND_CUP_ANNOUNCEMENT = [
  `Racing's biggest story in years breaks overnight: a new prize has arrived, bigger than the Breeders' Cup itself, bigger than anything British racing has ever put up before. They're calling it the Diamond Cup.`,
  `Bridges corners you within the hour. "Well? Are we going for it?" As if there was ever a question.`,
  `By the following morning it's confirmed: Martin McLean has an entry in too. Of course he does.`,
];

export const BEAT_FATHER_BACKS_MCLEAN: DecisionEvent = {
  title: "A voice from the past",
  tag: "FAMILY",
  text: `A name you haven't seen in the papers in years turns up backing a horse: ${FATHER_NAME} — your father — quoted supporting Martin McLean for the Diamond Cup. "McLean's a proper horseman. Class always tells." ${YARD.boss} reads it over your shoulder and says nothing at all, which is somehow worse.`,
  choices: [
    {
      label: "Ignore it — he's not your business anymore",
      apply: (st: GameState) => note({ ...st, reputation: clamp(st.reputation + 3, 0, 100) }, `You don't dignify it with a reply. The right people notice you didn't rise to it. (Reputation +3.)`),
    },
    {
      label: "Fire back publicly",
      apply: (st: GameState) => note(
        { ...st, celebrity: clamp(st.celebrity + 4, 0, 100), reputation: clamp(st.reputation - 2, 0, 100) },
        `Your reply runs alongside his quote. Good copy. A few insiders wince at a trainer trading barbs with a disgraced old punter — even if he is your father. (Celebrity +4, Reputation -2.)`,
      ),
    },
  ],
};

export const BEAT_FATHER_CONFRONTED: DecisionEvent = {
  title: "The truth of it",
  tag: "FAMILY",
  text: `It doesn't take long to find out why he said it: McLean paid him for the quote, outright. He's still drowning in the same debts that ran him out of this game in the first place. You find him in a betting shop two towns over — smaller and greyer than you remember. He can't quite look at you. "I'm sorry, son. I'm sorry for all of it." First time in your life you've heard him say that.`,
  choices: [
    {
      label: "Accept it",
      apply: (st: GameState) => note(
        { ...st, trust: clamp(st.trust + 5, 0, 100), reputation: clamp(st.reputation + 3, 0, 100) },
        `You don't forgive everything. But you take the apology for what it is. Word of it reaches ${YARD.boss}, somehow, and this time the silence means something good. (Trust +5, Reputation +3.)`,
      ),
    },
    {
      label: "Walk away and say your piece in the press instead",
      apply: (st: GameState) => note(
        { ...st, celebrity: clamp(st.celebrity + 5, 0, 100), trust: clamp(st.trust - 3, 0, 100) },
        `You give the papers a better story than his — the whole sorry tale, on your terms. It runs everywhere. ${YARD.boss} isn't sure the family's dirty laundry needed quite that wide an audience. (Celebrity +5, Trust -3.)`,
      ),
    },
  ],
};

export function makeDiamondCupHorseChoice(horses: Horse[], raceDay: number): DecisionEvent {
  const going = clamp(COURSES[DIAMOND_CUP_COURSE].going + ri(-1, 1), 1, 4);
  return {
    title: "The Diamond Cup — who goes?",
    tag: "BOSS",
    text: `This is the one. The biggest purse in the sport, and it's yours to enter. Who carries the silks?`,
    choices: horses.map(h => ({
      label: h.name,
      apply: (st: GameState) => {
        const raceCard = {
          id: nid(), course: DIAMOND_CUP_COURSE, dist: DIAMOND_CUP_DIST, going, grade: "G1" as const,
          raceDay, name: "The Diamond Cup", isDiamondCup: true,
        };
        const { entries } = drawField(st.roster, raceCard, new Set(), st.usedNames);
        const fieldPreview = entries.map(e => ({ name: e.horse.name, trainerName: e.trainerName ?? "unattached", mark: e.horse.mark ?? Math.round(OR(e.horse)) }));
        return note(
        {
          ...st,
          entered: [...st.entered, { ...raceCard, horseId: h.id, fieldPreview }],
          story: { ...st.story, diamondCup: { ...st.story.diamondCup, stage: "horseChosen", horseId: h.id } },
        },
          `Declared: ${h.name} for the Diamond Cup. Everything comes down to this.`,
        );
      },
    })),
  };
}

export function diamondCupScareFlash(horseName: string): string[] {
  return [
    `A bad step on the gallops — ${horseName} pulls up sharply, head low, and for one heart-stopping minute nobody in the yard says a word.`,
    `The vet's already running a hand down the tendon before you've crossed the yard. Scans booked for the morning.`,
  ];
}

export function diamondCupClearFlash(horseName: string): string[] {
  return [
    `Forty-eight hours of scans, walking in hand, and holding your breath — and the vet finally says what you were praying to hear: nothing wrong. ${horseName} is fine. It was a scare, nothing more.`,
  ];
}

export function diamondCupOutcomeMessage(outcome: Exclude<ClassicOutcome, "scratched">, horseName: string): string {
  switch (outcome) {
    case "win": return `${horseName} WINS THE DIAMOND CUP! The biggest prize in the sport, and it's yours. Whatever happens next, this day is permanent.`;
    case "place": return `${horseName} goes down fighting in the Diamond Cup, beaten but never disgraced, in the biggest field of the year.`;
    case "okay": return `${horseName} holds its own in the Diamond Cup without ever truly threatening. Nothing to be ashamed of, on this stage.`;
    case "tank": return `${horseName} never gets into the Diamond Cup at all. The biggest day of the year, and it never arrives for you.`;
  }
}
