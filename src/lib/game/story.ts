// Act 1 scripted-narrative state machine and nemesis (Martin McLean)
// mechanics. Orchestration only — the actual beat dialogue lives in
// storyContent.ts. See CLAUDE.md / the approved plan for the full design.
import { OR, makeHorse, ri } from "@/lib/sim";
import type { FieldEntry, Horse, ScoredEntry } from "@/lib/sim";
import { BEAT7_BRIDGES_ADVICE, makeBeat8AllyTrainer } from "./storyContent";
import { unlockedCourses } from "./tracks";
import type { GameState, StoryState } from "./types";

export const NEMESIS_TRAINER = "Martin McLean";
export const NEMESIS_YARD = "McLean Racing, Middleham";
const NEMESIS_SILK = "#1a1a2e";

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
  };
}

// Called once the horse pick resolves — schedules beat 4 (nemesis arrival).
export function scheduleNemesisIntro(story: StoryState, day: number): StoryState {
  return { ...story, stage: "preNemesis", nemesisIntroDay: day + ri(7, 10) };
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
