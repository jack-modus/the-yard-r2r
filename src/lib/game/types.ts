// Game state shape, extracted from the useState/reducer logic in
// reference/rags-to-riches-v6.jsx and given real types.
import type { CourseName, Horse, RaceCard, ScoredEntry } from "@/lib/sim";

export type { FormLine } from "@/lib/sim";

export interface EnteredRace extends RaceCard {
  horseId: number;
}

export interface Message {
  day: number;
  text: string;
}

export interface Milestones {
  firstWin: boolean;
  secondHorse: boolean;
  listedWin: boolean;
  groupWin: boolean;
  g1Win: boolean;
  tier2Unlocked: boolean;
}

export interface Choice {
  label: string;
  hint?: string;
  apply: (st: GameState) => GameState;
}

export interface DecisionEvent {
  title: string;
  text: string;
  choices: Choice[];
}

export interface LiveRace {
  raceName: string;
  beats: string[];
  idx: number;
}

export interface RaceResultEntry {
  race: RaceCard | EnteredRace;
  res: ScoredEntry[];
  mine: ScoredEntry;
  cmt: string;
}

export type TrainingPlan = "gallop" | "canter" | "sprints" | "stalls" | "school" | "easy" | "rest";

// Act 1 scripted-narrative state — see lib/game/story.ts. `stage` values
// "yard" and "horsePick" are the only ones needing special full-screen
// treatment (no tabs yet, no horses to manage); everything from
// "preNemesis" onward fires through the normal tabbed shell using the
// existing DecisionOverlay/DailyFlashOverlay, same as ordinary content.
export interface StoryState {
  stage: "yard" | "horsePick" | "preNemesis" | "nemesisPending"
    | "preSecondRace" | "secondRacePending" | "ongoing";
  nemesisHorseId: number | null;
  nemesisIntroDay: number | null;
  bridgesAdviceDay: number | null;
  allyTrainerDay: number | null;
  secondRaceDay: number | null;
  forceNemesisNextRace: boolean;
  scriptedFirstRaceLoss: boolean;
  headToHead: { wins: number; losses: number };
}

export interface GameState {
  playerName: string;
  day: number;
  year: number;
  cash: number;

  story: StoryState;
  awaitingHorsePick: boolean;
  horseCandidates: Horse[] | null;

  // The four metrics — see CLAUDE.md "The four metrics" for the full design.
  trust: number; // the boss's private opinion of you — movable by things other than results
  reputation: number; // insiders' read on your ability — lagging, results-driven, grade-weighted
  celebrity: number; // public/media profile — can pull against reputation
  skill: number; // your actual capability — never falls, an XP bar not a score

  horses: Horse[];
  usedNames: Set<string>;
  mastery: Record<CourseName, number>;
  roster: Horse[]; // persistent circuit rivals — see lib/sim/roster.ts
  slate: RaceCard[];
  entered: EnteredRace | null;
  results: RaceResultEntry[];
  queue: DecisionEvent[];
  flash: string[] | null;
  liveRace: LiveRace | null;
  study: CourseName | null;
  messages: Message[];
  news: string | null;
  milestones: Milestones;
  epilogue: boolean;
}
