// Fixed big-race calendar and prize money, extracted verbatim from
// reference/rags-to-riches-v6.jsx. The boss won't waste entries — races are
// gated by minOR against the player's horse's effRating().
import type { CalendarRace, Grade } from "./types";

export const CALENDAR: CalendarRace[] = [
  { day: 55, name: "Feilden Stakes", grade: "L", course: "Newmarket", dist: 9, minOR: 78 },
  { day: 95, name: "Classic Trial", grade: "G3", course: "Sandown", dist: 10, minOR: 84 },
  { day: 150, name: "Summer Mile", grade: "G2", course: "Ascot", dist: 8, minOR: 89 },
  { day: 210, name: "International Stakes", grade: "G1", course: "York", dist: 10, minOR: 94 },
  { day: 300, name: "Champion Stakes", grade: "G1", course: "Ascot", dist: 10, minOR: 94 },
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
