// Game state shape, extracted from the useState/reducer logic in
// reference/rags-to-riches-v6.jsx and given real types.
import type { CourseName, Horse, RaceCard, ScoredEntry } from "@/lib/sim";

export type { FormLine } from "@/lib/sim";

export interface FieldPreviewEntry {
  name: string;
  trainerName: string;
  mark: number;
}

export interface EnteredRace extends RaceCard {
  horseId: number;
  // A snapshot of likely opposition, drawn once at declare time (see
  // engine.ts's enterRace) — indicative, not a guarantee of the actual field
  // resolveRaceDay draws later, so the player has some visibility into the
  // competition before committing without needing to lock in and thread an
  // exact field all the way through to resolution.
  fieldPreview: FieldPreviewEntry[];
}

export interface Message {
  day: number;
  text: string;
}

export interface Milestones {
  firstWin: boolean;
  secondHorse: boolean;
  thirdHorse: boolean;
  listedWin: boolean;
  groupWin: boolean;
  g1Win: boolean;
  tier2Unlocked: boolean;
}

export type ClassicOutcome = "win" | "place" | "okay" | "tank" | "scratched";

export interface ClassicArcState {
  stage: "pending" | "horseChosen";
  horseId: number | null;
  horseChoiceDay: number | null;
  doubtsDay: number | null;
}

export interface DiamondCupState {
  stage: "pending" | "announced" | "fatherRevealed" | "confronted" | "horseChosen" | "scarePending" | "cleared" | "done";
  horseId: number | null;
  raceDay: number | null; // the Diamond Cup's own fixed day, set once announced
  nextBeatDay: number | null; // when the next beat in this sequence fires
}

export interface Choice {
  label: string;
  hint?: string;
  apply: (st: GameState) => GameState;
}

// `tag` is optional, cosmetic-only — a short category label (PRESS/BOSS/
// RIVAL/TRAINING/FAMILY) the UI uses to give decisions a bit of visual
// variety instead of every overlay looking identical.
export type DecisionTag = "PRESS" | "BOSS" | "RIVAL" | "TRAINING" | "FAMILY" | "YARD";

export interface DecisionEvent {
  title: string;
  text: string;
  choices: Choice[];
  tag?: DecisionTag;
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
    | "preSecondRace" | "secondRacePending" | "ongoing" | "ended";
  nemesisHorseId: number | null;
  nemesisIntroDay: number | null;
  bridgesAdviceDay: number | null;
  allyTrainerDay: number | null;
  secondRaceDay: number | null;
  forceNemesisNextRace: boolean;
  scriptedFirstRaceLoss: boolean;
  headToHead: { wins: number; losses: number };

  // Act 2/3 — the Classics, the Diamond Cup, the ending.
  classicIndex: number; // how many Classics resolved (0-5); CALENDAR[classicIndex] is "the current one"
  classicResults: { name: string; outcome: ClassicOutcome }[];
  classicArc: ClassicArcState;
  diamondCup: DiamondCupState;
  fatherIntroduced: boolean;
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
  entered: EnteredRace[];
  results: RaceResultEntry[];
  queue: DecisionEvent[];
  flash: string[] | null;
  liveRace: LiveRace | null;
  study: CourseName | null;
  messages: Message[];
  news: string | null;
  milestones: Milestones;
  ending: { verdict: "contract" | "poached" | "released"; text: string } | null;
}
