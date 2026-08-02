// Persistent NPC horse pool ("the circuit"), sampled from real-data-shaped
// class distributions (see classStats.ts) instead of being invented fresh
// per race. This is what makes rival horses recur across a season with a
// stable identity — the fix for races feeling like nobody ever comes back.
import { CLASS_STATS } from "./classStats";
import type { ClassStat } from "./classStats";
import { OR, makeHorse } from "./horse";
import { RIVAL_TRAINERS, SILKS, makeField } from "./race";
import { clamp, gauss, pick, ri } from "./utils";
import type { FieldEntry, Grade, Horse, RaceCard } from "./types";

// How many circuit horses to seed per grade band. Roughly tracks the real
// relative frequency of each class at tier-1 courses, compressed so rare
// top-end bands (G1) still have enough runners to fill a small field.
const BAND_SIZE: Record<keyof typeof CLASS_STATS, number> = {
  6: 10, 5: 20, 4: 24, 3: 18, L: 20, G3: 12, G2: 10, G1: 6,
};

const BAND_ORDER: Grade[] = [6, 5, 4, 3, "L", "G3", "G2", "G1"];

function sampleFromBand(band: Grade, stat: ClassStat, used: Set<string>): Horse {
  const target = clamp(stat.orMean + gauss() * stat.orStd, 35, 130);
  const h = makeHorse(target / 1.18, used, { age: ri(3, 8), fitness: ri(60, 80) });
  h.mark = OR(h); // established circuit horses already carry a handicap mark
  h.rosterBand = band;
  return h;
}

export function makeRoster(used: Set<string>): Horse[] {
  const roster: Horse[] = [];
  (Object.keys(CLASS_STATS) as (keyof typeof CLASS_STATS)[]).forEach(band => {
    const stat = CLASS_STATS[band];
    for (let i = 0; i < BAND_SIZE[band]; i++) roster.push(sampleFromBand(band, stat, used));
  });
  return roster;
}

// Roster horses eligible for a race of this grade — matched by the band they
// were actually generated for (rosterBand), not re-derived from OR(): OR
// windows let neighbouring bands' Gaussian tails bleed into each other and
// inflate a single field's effective spread past what real data supports
// (validated by grid-search against the real ~34% favourite strike rate).
export function eligibleForGrade(roster: Horse[], grade: Grade, excludeIds: Set<number>): Horse[] {
  return roster.filter(h => !excludeIds.has(h.id) && h.injuryDays === 0 && h.rosterBand === grade);
}

// Draw a rival field for `race` from the persistent roster. Falls back to
// adjacent bands, then to on-the-fly generation (matching the race's
// real-data-shaped OR mean) only if the roster still can't fill the field —
// e.g. a thin band early in a game before enough horses have been "met".
export function drawField(
  roster: Horse[], race: RaceCard, excludeIds: Set<number>, used: Set<string>,
): { entries: FieldEntry[]; usedIds: number[] } {
  const grade = race.grade;
  const stat = CLASS_STATS[grade as keyof typeof CLASS_STATS];
  const totalSize = clamp(Math.round(stat.fieldMean + gauss() * stat.fieldStd), 4, 20);
  const rivalsWanted = totalSize - 1; // one seat reserved for the player's horse

  const shuffle = <T,>(arr: T[]): T[] => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const chosen: Horse[] = shuffle(eligibleForGrade(roster, grade, excludeIds)).slice(0, rivalsWanted);

  // Thin band? Widen one step at a time to neighbouring bands before
  // resorting to freshly-invented horses, so rivals still recur when possible.
  const idx = BAND_ORDER.indexOf(grade);
  let radius = 1;
  while (chosen.length < rivalsWanted && radius <= BAND_ORDER.length) {
    const neighborBands = [BAND_ORDER[idx - radius], BAND_ORDER[idx + radius]].filter((b): b is Grade => b !== undefined);
    if (!neighborBands.length) break;
    const already = new Set([...excludeIds, ...chosen.map(h => h.id)]);
    const extra = neighborBands.flatMap(b => eligibleForGrade(roster, b, already));
    chosen.push(...shuffle(extra).slice(0, rivalsWanted - chosen.length));
    radius++;
  }

  const entries: FieldEntry[] = chosen.map(h => ({
    horse: h, jkSkill: ri(60, 92), trainerName: pick(RIVAL_TRAINERS), silk: pick(SILKS), player: false,
  }));

  const shortfall = rivalsWanted - chosen.length;
  if (shortfall > 0) entries.push(...makeField(race, stat.orMean, used).slice(0, shortfall));

  return { entries, usedIds: chosen.map(h => h.id) };
}
