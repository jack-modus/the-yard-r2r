// Act 1 scripted-narrative state machine and nemesis (Martin McLean)
// mechanics. Orchestration only — the actual beat dialogue lives in
// storyContent.ts. See CLAUDE.md / the approved plan for the full design.
import { CALENDAR, OR, YARD, makeHorse, ri } from "@/lib/sim";
import type { FieldEntry, Horse, ScoredEntry } from "@/lib/sim";
import {
  BEAT7_BRIDGES_ADVICE, BEAT_FATHER_BACKS_MCLEAN, BEAT_FATHER_CONFRONTED, DIAMOND_CUP_ANNOUNCEMENT,
  classicOutcomeMessage, diamondCupClearFlash, diamondCupOutcomeMessage, diamondCupScareFlash,
  makeBeat8AllyTrainer, makeClassicDoubts, makeClassicHorseChoice, makeDiamondCupHorseChoice,
} from "./storyContent";
import { unlockedCourses } from "./tracks";
import type { ClassicArcState, ClassicOutcome, GameState, StoryState } from "./types";

// Trust is the primary gate for a contract extension (user's own framing);
// high Reputation or Celebrity without enough Trust reads as "someone else
// wants you" rather than "Bridges keeps you" — a different, not worse,
// ending.
const CONTRACT_TRUST_THRESHOLD = 60;
const POACHED_THRESHOLD = 50;

export function computeEnding(trust: number, reputation: number, celebrity: number): { verdict: "contract" | "poached" | "released"; text: string } {
  if (trust >= CONTRACT_TRUST_THRESHOLD) {
    return {
      verdict: "contract",
      text: `${YARD.boss} doesn't make a show of it. "You've more than earned another year here — long as you're still keen." It's not effusive. It's exactly the kind of trust you set out to earn.`,
    };
  }
  if (reputation >= POACHED_THRESHOLD || celebrity >= POACHED_THRESHOLD) {
    return {
      verdict: "poached",
      text: `${YARD.boss} is polite about it, which somehow stings more than anger would. But the phone's already ringing — Marina Delacroix-Hale's yard has heard plenty, and they're not shy about saying so. A different box, a different name on the gate. The story continues, just not here.`,
    };
  }
  return {
    verdict: "released",
    text: `${YARD.boss} shakes your hand. "It didn't come together this time. That's racing." No contract, no cushion — just the notebook full of what you learned, and whatever you do with it next.`,
  };
}

export const NEMESIS_TRAINER = "Martin McLean";
export const NEMESIS_YARD = "McLean Racing, Middleham";
const NEMESIS_SILK = "#1a1a2e";

// Days before each Classic's fixed CALENDAR day that the horse-choice /
// media-doubts beats fire. Kept short of the real "a month or two" for the
// later Classics simply because CALENDAR's gaps between them don't leave
// room for a full month each — see CLAUDE.md "The Classics".
const HORSE_CHOICE_LEAD = [35, 20, 25, 20, 40];
const DOUBTS_LEAD = [15, 8, 10, 8, 15];

export function scheduleClassicArc(index: number, fromDay: number): ClassicArcState {
  if (index >= CALENDAR.length) return { stage: "pending", horseId: null, horseChoiceDay: null, doubtsDay: null };
  const raceDay = CALENDAR[index].day;
  const horseChoiceDay = Math.max(raceDay - HORSE_CHOICE_LEAD[index], fromDay + 3);
  const doubtsDay = Math.max(raceDay - DOUBTS_LEAD[index], horseChoiceDay + 3);
  return { stage: "pending", horseId: null, horseChoiceDay, doubtsDay };
}

// Called when a horse declared for a Classic gets scratched (injured before
// race day) — a real Classic is a fixed calendar date, not something you can
// re-run later, so this counts as a missed opportunity (no stat penalty,
// just bad luck) and moves straight on to the next one. Without this, the
// arc would stall forever: classicArc.stage stays "horseChosen" and nothing
// else ever re-triggers it — caught via scripted-playthrough testing, not
// tsc/lint, same as the Act 1 unc-cleared-trigger bug.
export function skipClassic(story: StoryState, day: number): StoryState {
  const index = story.classicIndex;
  const name = CALENDAR[index]?.name ?? "the Classic";
  const nextIndex = index + 1;
  return {
    ...story,
    classicIndex: nextIndex,
    classicResults: [...story.classicResults, { name, outcome: "scratched" }],
    classicArc: scheduleClassicArc(nextIndex, day),
  };
}

// Same idea for the Diamond Cup, but since it's scripted-only (no fixed
// CALENDAR date), a scratch just pushes the race back and lets the player
// pick again rather than skipping the finale entirely.
export function rescheduleDiamondCup(story: StoryState, day: number): StoryState {
  return { ...story, diamondCup: { stage: "confronted", horseId: null, raceDay: day + 15, nextBeatDay: null } };
}

// Diminishing returns per Classic index (1st→5th) — user's own framing:
// "the same thing happens for each classic except the impact is less each time".
const CLASSIC_DIMINISH = [1, 0.7, 0.5, 0.35, 0.25];
// "scratched" is deliberately excluded here — it's never returned by
// classifyClassicOutcome (only reached via skipClassic/rescheduleDiamondCup,
// which don't apply stat deltas at all), so these tables don't need an entry
// for it. Keeps the type system honest about which outcomes actually reach
// resolveClassicOutcome/resolveDiamondCupOutcome.
type RaceOutcome = Exclude<ClassicOutcome, "scratched">;
const CLASSIC_DELTAS: Record<RaceOutcome, { trust: number; reputation: number; celebrity: number; skill: number }> = {
  win: { trust: 15, reputation: 20, celebrity: 8, skill: 5 },
  place: { trust: 8, reputation: 10, celebrity: 3, skill: 3 },
  okay: { trust: 2, reputation: 3, celebrity: 0, skill: 2 },
  tank: { trust: -8, reputation: -10, celebrity: -2, skill: 1 },
};

export function classifyClassicOutcome(pos: number, fieldSize: number): RaceOutcome {
  if (pos === 1) return "win";
  if (pos <= 3) return "place";
  if (pos <= Math.ceil(fieldSize / 2)) return "okay";
  return "tank";
}

// Called from resolveRaceDay when the resolved race has isClassic set.
// Takes the CURRENT (possibly already-mutated-this-call, e.g. by the nemesis
// block) story object, not st.story directly — resolveRaceDay may touch
// story more than once in the same call if a Classic happens to coincide
// with a forced nemesis race, and building off a stale snapshot would
// silently discard those other changes.
// Returns the stat deltas (already diminishing-returns-scaled) and the
// updated story state (classicIndex bumped, next arc scheduled).
export function resolveClassicOutcome(
  story: StoryState, day: number, raceName: string, horseName: string, pos: number, fieldSize: number,
): { trust: number; reputation: number; celebrity: number; skill: number; message: string; story: StoryState } {
  const outcome = classifyClassicOutcome(pos, fieldSize);
  const index = story.classicIndex;
  const mult = CLASSIC_DIMINISH[Math.min(index, CLASSIC_DIMINISH.length - 1)];
  const base = CLASSIC_DELTAS[outcome];
  const nextIndex = index + 1;
  return {
    trust: Math.round(base.trust * mult),
    reputation: Math.round(base.reputation * mult),
    celebrity: Math.round(base.celebrity * mult),
    skill: Math.round(base.skill * mult),
    message: classicOutcomeMessage(outcome, raceName, horseName),
    story: {
      ...story,
      classicIndex: nextIndex,
      classicResults: [...story.classicResults, { name: raceName, outcome }],
      classicArc: scheduleClassicArc(nextIndex, day),
    },
  };
}

// The Diamond Cup is a one-off — no diminishing-returns scaling, and the
// deltas are the biggest in the game, matching its "biggest prize in the
// sport" framing. Same story-freshness caveat as resolveClassicOutcome.
const DIAMOND_CUP_DELTAS: Record<RaceOutcome, { trust: number; reputation: number; celebrity: number; skill: number }> = {
  win: { trust: 25, reputation: 30, celebrity: 15, skill: 8 },
  place: { trust: 12, reputation: 15, celebrity: 6, skill: 4 },
  okay: { trust: 3, reputation: 5, celebrity: 1, skill: 2 },
  tank: { trust: -10, reputation: -15, celebrity: -3, skill: 1 },
};

export function resolveDiamondCupOutcome(
  story: StoryState, horseName: string, pos: number, fieldSize: number,
): { trust: number; reputation: number; celebrity: number; skill: number; message: string; story: StoryState } {
  const outcome = classifyClassicOutcome(pos, fieldSize);
  const base = DIAMOND_CUP_DELTAS[outcome];
  return {
    trust: base.trust, reputation: base.reputation, celebrity: base.celebrity, skill: base.skill,
    message: diamondCupOutcomeMessage(outcome, horseName),
    story: { ...story, diamondCup: { ...story.diamondCup, stage: "done" } },
  };
}

export function newStoryState(): StoryState {
  return {
    stage: "yard",
    nemesisHorseId: null,
    nemesisIntroDay: null,
    bridgesAdviceDay: null,
    allyTrainerDay: null,
    secondRaceDay: null,
    forceNemesisNextRace: false,
    scriptedFirstRaceLoss: false,
    headToHead: { wins: 0, losses: 0 },

    classicIndex: 0,
    classicResults: [],
    classicArc: scheduleClassicArc(0, 1),
    diamondCup: { stage: "pending", horseId: null, raceDay: null, nextBeatDay: null },
    fatherIntroduced: false,
  };
}

// Called once the horse pick resolves — schedules beat 4 (nemesis arrival).
// Deliberately early (~day 4) — an earlier hook, per playtesting feedback.
export function scheduleNemesisIntro(story: StoryState, day: number): StoryState {
  return { ...story, stage: "preNemesis", nemesisIntroDay: day + ri(3, 5) };
}

// Checked early in advanceDay, after training/walking/study but before the
// normal random day-content roll — a scripted beat, when due, replaces that
// roll for the day entirely (matching how the existing going-changed/race-day
// checks already monopolise a day). Returns null when nothing is due.
export function checkStoryTriggers(s: GameState): GameState | null {
  const story = s.story;

  if (story.stage === "preNemesis" && story.nemesisIntroDay !== null && s.day >= story.nemesisIntroDay) {
    const nemesisHorse = makeHorse(ri(55, 70), s.usedNames, { age: ri(3, 5), fitness: ri(55, 75) });
    nemesisHorse.mark = OR(nemesisHorse);
    return {
      ...s,
      roster: [...s.roster, nemesisHorse],
      story: { ...story, stage: "nemesisPending", nemesisHorseId: nemesisHorse.id, forceNemesisNextRace: true, scriptedFirstRaceLoss: true },
      flash: [
        `A new face in the yard car park — Martin McLean, all easy confidence, leaning on a horsebox stencilled "${NEMESIS_YARD}".`,
        `"Vincenzo, is it? I know your name. Everyone in this game does — for all the wrong reasons." He looks you up and down. "My father's a champion trainer. Yours is a champion mug punter. Best stick to the betting, eh? Leave the training to people who know what they're doing."`,
        `You feel your jaw tighten. Fine. Let the horses do the talking. I'll get him.`,
      ],
    };
  }

  if (story.stage === "preSecondRace") {
    // bridgesAdviceDay/allyTrainerDay are nulled out the moment they fire —
    // otherwise the same day re-triggers the beat on every advanceDay call
    // until the day actually advances (it doesn't, when a beat is queued).
    if (story.bridgesAdviceDay !== null && s.day >= story.bridgesAdviceDay) {
      return { ...s, story: { ...story, bridgesAdviceDay: null }, queue: [...s.queue, BEAT7_BRIDGES_ADVICE] };
    }
    if (story.allyTrainerDay !== null && s.day >= story.allyTrainerDay) {
      return { ...s, story: { ...story, allyTrainerDay: null }, queue: [...s.queue, makeBeat8AllyTrainer(unlockedCourses(s.reputation))] };
    }
    if (story.secondRaceDay !== null && s.day >= story.secondRaceDay) {
      return {
        ...s,
        story: { ...story, stage: "secondRacePending", forceNemesisNextRace: true, scriptedFirstRaceLoss: false },
        flash: [
          `McLean's name keeps cropping up — a big run here, a sly word in the press there. It's been a while since your horses actually met his in a race.`,
          `That's about to change: he's already talking you up before the declarations are even out. "Should be a good renewal this year," he tells anyone who'll listen. "Might even be competitive."`,
        ],
      };
    }
  }

  // --- the Classics: run on their own CALENDAR-day schedule, independent of
  // Act 1's story.stage — the two arcs overlap in real time (McLean's second
  // meeting can land mid-Classics), which is fine, they don't touch the same
  // state. Guarded by !s.entered so a scripted declaration never clobbers
  // whatever the player already has entered. ---
  if (!s.entered && story.classicIndex < CALENDAR.length && story.classicArc.stage === "pending"
    && story.classicArc.horseChoiceDay !== null && s.day >= story.classicArc.horseChoiceDay) {
    const eligible = s.horses.filter(h => h.injuryDays === 0);
    if (eligible.length) {
      return { ...s, queue: [...s.queue, makeClassicHorseChoice(eligible, CALENDAR[story.classicIndex])] };
    }
  }
  if (story.classicArc.stage === "horseChosen" && story.classicArc.doubtsDay !== null && s.day >= story.classicArc.doubtsDay) {
    const race = CALENDAR[story.classicIndex];
    const horse = s.horses.find(h => h.id === story.classicArc.horseId);
    return {
      ...s,
      story: { ...story, classicArc: { ...story.classicArc, doubtsDay: null } },
      queue: [...s.queue, makeClassicDoubts(horse?.name ?? "your horse", race.name)],
    };
  }

  // --- Act 3: the Diamond Cup + father subplot. Only begins once all five
  // Classics are done, then runs entirely on relative "days since the last
  // beat" scheduling (nextBeatDay), not fixed calendar days — there's no
  // fixed CALENDAR entry backing this race, it's scripted-only. ---
  const dc = story.diamondCup;
  if (dc.stage === "pending" && story.classicIndex >= CALENDAR.length) {
    const raceDay = s.day + ri(35, 45);
    return {
      ...s,
      story: { ...story, diamondCup: { stage: "announced", horseId: null, raceDay, nextBeatDay: s.day + ri(8, 12) } },
      flash: DIAMOND_CUP_ANNOUNCEMENT,
    };
  }
  if (dc.stage === "announced" && dc.nextBeatDay !== null && s.day >= dc.nextBeatDay) {
    return {
      ...s,
      story: { ...story, fatherIntroduced: true, diamondCup: { ...dc, stage: "fatherRevealed", nextBeatDay: null } },
      queue: [...s.queue, BEAT_FATHER_BACKS_MCLEAN],
    };
  }
  if (dc.stage === "fatherRevealed" && s.day >= (dc.raceDay! - 20)) {
    return {
      ...s,
      story: { ...story, diamondCup: { ...dc, stage: "confronted" } },
      queue: [...s.queue, BEAT_FATHER_CONFRONTED],
    };
  }
  if (dc.stage === "confronted" && !s.entered && s.day >= (dc.raceDay! - 12)) {
    const eligible = s.horses.filter(h => h.injuryDays === 0);
    if (eligible.length) {
      return { ...s, queue: [...s.queue, makeDiamondCupHorseChoice(eligible, dc.raceDay!)] };
    }
  }
  if (dc.stage === "horseChosen" && s.day >= (dc.raceDay! - 5)) {
    const horse = s.horses.find(h => h.id === dc.horseId);
    return {
      ...s,
      story: { ...story, diamondCup: { ...dc, stage: "scarePending" } },
      flash: diamondCupScareFlash(horse?.name ?? "your horse"),
    };
  }
  if (dc.stage === "scarePending" && s.day >= (dc.raceDay! - 3)) {
    const horse = s.horses.find(h => h.id === dc.horseId);
    return {
      ...s,
      story: { ...story, diamondCup: { ...dc, stage: "cleared" } },
      flash: diamondCupClearFlash(horse?.name ?? "your horse"),
    };
  }

  return null;
}

// Guarantees the nemesis mount is in the drawn field, always trainerName
// "Martin McLean" — used instead of trusting the normal weighted roster draw
// for the two flagged story races.
export function ensureNemesisInField(rivals: FieldEntry[], nemesisHorse: Horse): FieldEntry[] {
  const nemesisEntry: FieldEntry = {
    horse: nemesisHorse, jkSkill: ri(70, 90), trainerName: NEMESIS_TRAINER, silk: NEMESIS_SILK, player: false,
  };
  const idx = rivals.findIndex(e => e.horse.id === nemesisHorse.id);
  if (idx >= 0) {
    const copy = [...rivals];
    copy[idx] = nemesisEntry;
    return copy;
  }
  if (!rivals.length) return [nemesisEntry];
  const copy = [...rivals];
  copy[Math.floor(Math.random() * copy.length)] = nemesisEntry;
  return copy;
}

// Forces `horseId` into `pos` by swapping scores with whoever currently holds
// it, then re-sorting and recomputing pos/gap with the exact same formula
// runRace() uses — so a scripted result still looks like a real one, not an
// obviously fake one. Only ever used for the beat-5 race.
export function forcePosition(res: ScoredEntry[], horseId: number, pos: number): ScoredEntry[] {
  const targetIdx = res.findIndex(r => r.horse.id === horseId);
  const currentIdx = res.findIndex(r => r.pos === pos);
  if (targetIdx < 0 || currentIdx < 0 || targetIdx === currentIdx) return res;
  const swapped = res.map((r, i) => {
    if (i === targetIdx) return { ...r, score: res[currentIdx].score };
    if (i === currentIdx) return { ...r, score: res[targetIdx].score };
    return r;
  });
  swapped.sort((a, b) => b.score - a.score);
  return swapped.map((r, i) => ({
    ...r,
    pos: i + 1,
    gap: i === 0 ? 0 : Math.max(0.05, (swapped[i - 1].score - r.score) * 0.5),
  }));
}
