// Fixed big-race calendar and prize money. These are the real British
// Classics — historic race names/traditions, not real people, so the
// project's "no real named people" hard rule doesn't apply the same way;
// user's explicit call to use them rather than invented equivalents. Days
// are compressed from the real May-September spread just enough to give
// each one's scripted lead-time (see story.ts) room without back-to-back
// collisions, while keeping the real seasonal order (Guineas meeting in
// spring, Oaks/Derby early summer, St Leger in autumn).
//
// `grade` deliberately does NOT match real life here (all five Classics are
// actually Group 1) — it's the dial that selects the opponent field's
// real-data-calibrated rating band (see roster.ts/classStats.ts), and a true
// G1 band averages ~108 rating. Tagging all five "G1" left the player facing
// a ~108-rated field on Classic #1 with a horse barely past 76 — every
// single test run came back "tank", which breaks the four-way outcome
// branch this arc is built around. Grade escalates L→G3→G2→G1→G1 instead,
// same shape as the original (pre-rename) prototype calendar, so field
// strength actually tracks the player's likely progress at each point.
import type { CalendarRace, Grade } from "./types";

export const CALENDAR: CalendarRace[] = [
  { day: 50, name: "1000 Guineas", grade: "L", course: "Newmarket", dist: 8, minOR: 78, isClassic: true },
  { day: 58, name: "2000 Guineas", grade: "G3", course: "Newmarket", dist: 8, minOR: 82, isClassic: true },
  { day: 100, name: "The Oaks", grade: "G2", course: "Epsom", dist: 12, minOR: 84, isClassic: true },
  { day: 108, name: "The Derby", grade: "G1", course: "Epsom", dist: 12, minOR: 89, isClassic: true },
  { day: 175, name: "St Leger", grade: "G1", course: "Doncaster", dist: 14, minOR: 94, isClassic: true },
];

export const PRIZE: Record<Exclude<Grade, number> | 3 | 4 | 5 | 6, number[]> = {
  G1: [300000, 113000, 57000, 28000],
  G2: [120000, 45000, 23000, 11000],
  G3: [45000, 17000, 8500, 4200],
  L: [22000, 8300, 4200, 2100],
  3: [9000, 3400, 1700, 850],
  4: [5200, 2000, 1000, 500],
  5: [3400, 1300, 650, 325],
  6: [2500, 950, 475, 240],
};
