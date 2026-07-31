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
  tracks: [CourseName, CourseName];
  jockey: { name: string; skill: number };
  style: string;
  greeting: (playerName: string) => string;
  praise: string[];
  scold: string[];
}

export type YardId = "berrow" | "delacroix" | "okafor";

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
  formLines: string[];
  wins: number;
  runs: number;
  earnings: number;

  quirk: Quirk | null;

  gear: GearId[];
  gearRun: GearId[];
  mark: number | null; // official handicap mark; null until the horse has run
}

export interface RaceCard {
  id: number;
  course: CourseName;
  dist: number; // furlongs
  going: number; // 1-4
  grade: Grade;
  raceDay: number;
  name: string;
}

export interface CalendarRace {
  day: number;
  name: string;
  grade: Grade;
  course: CourseName;
  dist: number;
  minOR: number;
}

export interface FieldEntry {
  horse: Horse;
  jkSkill: number;
  trainerName?: string;
  silk?: string;
  player: boolean;
  expMod?: number;
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
