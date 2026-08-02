// Race simulation core, extracted verbatim from reference/rags-to-riches-v6.jsx.
// Tuned constants here (noise sd, softmax temperature 3.2, course-interaction weights)
// are validated against real racing outcomes — see CLAUDE.md before changing them.
import { clamp, gauss, nid, pick, ri } from "./utils";
import { COURSES } from "./courses";
import { gearExp, gearNoise } from "./gear";
import { makeHorse } from "./horse";
import type { CourseName, FieldEntry, Grade, Horse, RaceCard, ScoredEntry } from "./types";
import { gradeLabel } from "./format";

export interface RaceInput {
  course: CourseName;
  dist: number;
  going: number;
}

export function expected(h: Horse, race: RaceInput, jkSkill: number, mastery: number): number {
  const c = COURSES[race.course];
  const base = h.speed * 0.34 + h.stamina * 0.3 + h.accel * 0.22 + h.brk * 0.07 + h.balance * 0.07;
  const goingFit = 1 - Math.abs(h.prefGoing - race.going) * 0.06;
  const distFit = 1 - (Math.abs(h.prefDist - race.dist) / race.dist) * 0.35;
  // course shape interactions — this is where the deep stats earn their keep
  const sharpPen = 1 - c.sharpness * (1 - h.balance / 100) * 0.035; // tight tracks punish poor balance
  const undulPen = 1 - c.undulation * (1 - h.balance / 100) * 0.03; // so do cambers and gradients
  const breakBonus = race.dist <= 6 ? 1 + (h.brk - 60) / 100 * 0.06 : 1 + (h.brk - 60) / 100 * 0.02; // gate speed matters most in sprints
  const climbPen = 1 - c.finishClimb * (1 - h.stamina / 100) * 0.04; // uphill finishes find out weak stayers
  const jkm = 0.88 + (jkSkill / 100) * 0.22;
  const fit = 0.8 + (h.fitness / 100) * 0.25;
  const fat = 1 - (h.fatigue / 100) * 0.22;
  const mor = 0.95 + (h.morale / 100) * 0.1;
  const mast = 1 + (mastery || 0) / 100 * 0.05; // knowing the track is worth up to 5%
  return gearExp(h, base * goingFit * distFit * sharpPen * undulPen * breakBonus * climbPen * jkm * fit * fat * mor * mast);
}

// Consistent horses run their race — noise sd is calibrated against the real
// 34.1% favourite strike rate measured over ggs/races_master_v4.csv (tier-1
// courses, n=2142 favourite-marked runners; see classStats.ts). The original
// prototype's 0.05-0.22 range produced a ~75% favourite strike rate in a
// grid-search simulation — noise this size barely dents the deterministic
// exp() gap between a realistically-rated field. Scaling by ~5.25x brought
// simulated favourite strike rate to 33.9%, matching real data.
export function noiseSd(h: Horse): number {
  return clamp(0.735 - (h.temperament / 100) * 0.315 + gearNoise(h), 0.26, 1.16);
}

export const FRACTIONS: [number, string][] = [
  [1.5, "1/2"], [1.62, "8/13"], [1.73, "8/11"], [1.83, "5/6"], [2, "Evens"], [2.25, "5/4"], [2.5, "6/4"],
  [2.75, "7/4"], [3, "2/1"], [3.5, "5/2"], [4, "3/1"], [4.5, "7/2"], [5, "4/1"], [5.5, "9/2"], [6, "5/1"],
  [7, "6/1"], [8, "7/1"], [9, "8/1"], [10, "9/1"], [11, "10/1"], [13, "12/1"], [15, "14/1"], [17, "16/1"],
  [21, "20/1"], [26, "25/1"], [34, "33/1"], [51, "50/1"], [67, "66/1"],
];
export function decToFrac(d: number): string {
  let b = FRACTIONS[0];
  for (const f of FRACTIONS) if (Math.abs(f[0] - d) < Math.abs(b[0] - d)) b = f;
  return b[1];
}

export function runRace(race: RaceInput, entries: FieldEntry[], masteryMap: Record<string, number>): ScoredEntry[] {
  const withExp = entries.map(e => ({
    ...e,
    exp: expected(e.horse, race, e.jkSkill, e.player ? masteryMap[race.course] : 0) * (e.expMod || 1),
  }));
  const mx = Math.max(...withExp.map(e => e.exp));
  const w = withExp.map(e => Math.exp((e.exp - mx) / 3.2));
  const tot = w.reduce((a, b) => a + b, 0);
  const withOdds = withExp.map((e, i) => {
    const p = clamp(w[i] / tot, 0.012, 0.9) * 1.08;
    return { ...e, sp: decToFrac(1 / p), spVal: 1 / p };
  });
  const fav = Math.min(...withOdds.map(e => e.spVal));
  const withFav = withOdds.map(e => ({ ...e, fav: e.spVal === fav }));
  const scored = withFav.map(e => ({ ...e, score: e.exp + gauss() * e.exp * noiseSd(e.horse) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s, i) => ({
    ...s,
    pos: i + 1,
    gap: i === 0 ? 0 : Math.max(0.05, (scored[i - 1].score - s.score) * 0.5),
  }));
}

// ---------- race slate ----------
export function makeSlate(day: number, homeTracks: CourseName[], horseOR: number): RaceCard[] {
  const away = (Object.keys(COURSES) as CourseName[]).filter(c => !homeTracks.includes(c));
  const options: RaceCard[] = [];
  const mk = (course: CourseName, gradeBias?: Grade): RaceCard => {
    const c = COURSES[course];
    let grade: Grade;
    if (horseOR >= 96 && Math.random() < 0.4) grade = pick(["G3", "G2", "G1"] as const);
    else if (horseOR >= 88 && Math.random() < 0.5) grade = pick(["L", "G3"] as const);
    else if (horseOR >= 76) grade = pick([3, 4, "L"] as const);
    else if (horseOR >= 62) grade = pick([4, 5] as const);
    else grade = pick([5, 6] as const);
    if (gradeBias) grade = gradeBias;
    return {
      id: nid(), course, dist: pick([5, 6, 7, 8, 10, 12, 14]),
      going: clamp(c.going + ri(-1, 1), 1, 4), grade,
      raceDay: day + ri(2, 4),
      name: `${course} ${pick(["Handicap", "Stakes", "Conditions Stakes", "Maiden Stakes"])} (${gradeLabel(grade)})`,
    };
  };
  options.push(mk(pick(homeTracks)));
  options.push(mk(pick(homeTracks)));
  if (Math.random() < 0.6) options.push(mk(pick(away)));
  return options;
}

// Frank Berrow and Sonny Okafor were two of the original three boss
// personas before the single-trainer redesign — repurposed here as rival
// trainers rather than discarded, so their writing still surfaces in results.
export const RIVAL_TRAINERS = ["W. Haggerty", "A. Balding-Rowe", "J. Gosforth", "C. Appleford", "R. Varley", "K. Burke-Staunton", "E. Walkden", "H. Palmer-Reed", "Frank Berrow", "Sonny Okafor"];
export const SILKS = ["#a4161a", "#0b3d91", "#e8b117", "#1b7a43", "#5e2b97", "#d2601a", "#0e7c86", "#7a1f5c"];

export function makeField(race: RaceCard, horseOR: number, used: Set<string>): FieldEntry[] {
  const q = typeof race.grade === "number" ? clamp(horseOR + ri(-8, 8), 30, 90)
    : race.grade === "L" ? ri(78, 88) : race.grade === "G3" ? ri(82, 92) : race.grade === "G2" ? ri(86, 95) : ri(90, 98);
  const size = ri(6, 11);
  return Array.from({ length: size }, () => ({
    horse: makeHorse(clamp(q + ri(-5, 5), 25, 98), used), jkSkill: ri(60, 92),
    trainerName: pick(RIVAL_TRAINERS),
    silk: pick(SILKS), player: false,
  }));
}
