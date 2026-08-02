// Game state shape, extracted from the useState/reducer logic in
// reference/rags-to-riches-v6.jsx and given real types.
import type { CourseName, Horse, RaceCard, ScoredEntry, YardId } from "@/lib/sim";

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

export interface GameState {
  playerName: string;
  yardId: YardId;
  day: number;
  year: number;
  cash: number;
  trust: number;
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
