// Core sim types, extracted from reference/rags-to-riches-v6.jsx.
// Keep in sync with the tuned constants documented in CLAUDE.md.

export type CourseName =
  | "York"
  | "Chester"
  | "Newmarket"
  | "Ascot"
  | "Epsom"
  | "Sandown"
  | "Doncaster"
  | "Goodwood";

export interface Course {
  going: number; // baseline going for the course, 1 (Good to Firm) – 4 (Soft)
  sharpness: number; // 0 flat/galloping – 3 very tight turns
  undulation: number; // 0 flat – 3 severe gradients/camber
  finishClimb: number; // 0 none – 2 stiff uphill finish
  hand: "left" | "right";
  line: string; // factual, originally-written course description
}

// Grade ladder: plain numbers are lower-class handicaps (6 = weakest),
// "L" = Listed, "G3"/"G2"/"G1" = Group races.
export type Grade = 3 | 4 | 5 | 6 | "L" | "G3" | "G2" | "G1";

export interface Yard {
  boss: string;
  yardName: string;
  persona: string;
  tracks: CourseName[]; // tier-1 (starting) courses — see courses.ts TIER1/TIER2
  jockey: { name: string; skill: number };
  style: string;
  greeting: (playerName: string) => string;
  praise: string[];
  scold: string[];
}

export type GearId = "blinkers" | "cheekpieces" | "tonguetie" | "hood";

export interface GearItem {
  label: string;
  help: string;
  apply: (exp: number, h: Horse) => number;
  noiseAdj: (h: Horse) => number;
}

export interface Quirk {
  stat: "balance" | "brk" | "temperament" | "accel";
  revealed: boolean;
}

export interface Horse {
  id: number;
  name: string;
  sire: string;
  dam: string;
  colour: "b" | "ch" | "gr" | "br";
  sex: "c" | "f" | "g";
  age: number;

  // Visible stats
  speed: number;
  stamina: number;
  accel: number;
  brk: number; // gate speed / break
  balance: number;
  temperament: number; // higher = more consistent, less erratic

  // Hidden until discovered
  prefGoing: number; // 1-4, matches Course.going scale
  prefDist: number; // furlongs
  goingKnown: boolean;
  distKnown: boolean;

  fitness: number;
  fatigue: number;
  morale: number;
  injuryDays: number;

  form: number[];
  formLines: FormLine[];
  wins: number;
  runs: number;
  earnings: number;

  quirk: Quirk | null;

  gear: GearId[];
  gearRun: GearId[];
  mark: number | null; // official handicap mark; null until the horse has run

  // Set only on persistent roster horses (lib/sim/roster.ts) — the class
  // band they were generated for. Field composition is drawn by matching
  // this tag exactly, not by re-deriving a band from OR() after the fact:
  // OR-proximity filtering lets neighbouring bands' Gaussian tails bleed
  // into each other and inflates effective field spread past what's real.
  rosterBand?: Grade;
}

export interface RaceCard {
  id: number;
  course: CourseName;
  dist: number; // furlongs
  going: number; // 1-4
  grade: Grade;
  raceDay: number;
  name: string;
  isClassic?: boolean;
}

export interface CalendarRace {
  day: number;
  name: string;
  grade: Grade;
  course: CourseName;
  dist: number;
  minOR: number;
  // A Classic — runs the scripted Act 2 mini-arc (horse choice, McLean
  // entering, media doubts, jockey booking, four-way outcome branch) and
  // bypasses the normal tier-2 course lock for its own declaration, since
  // it's a mandated story beat rather than organic content.
  isClassic?: boolean;
}

export interface FieldEntry {
  horse: Horse;
  jkSkill: number;
  trainerName?: string;
  silk?: string;
  player: boolean;
  expMod?: number;
}

export interface FormLine {
  day: number;
  year: number;
  race: string;
  course: CourseName;
  dist: number;
  going: string;
  pos: number;
  of: number;
  sp: string;
  cmt: string;
}

export interface ScoredEntry extends FieldEntry {
  exp: number;
  sp: string;
  spVal: number;
  fav: boolean;
  score: number;
  pos: number;
  gap: number;
}
