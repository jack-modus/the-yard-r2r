// Horse factory and rating helpers, extracted verbatim from reference/rags-to-riches-v6.jsx.
// Visible stats: speed, stamina, accel, break (gate speed), balance (turns/camber/undulation),
// temperament (consistency — higher = less erratic). Hidden until discovered: going pref, distance sweet spot.
import { clamp, nid, pick, ri, rnd } from "./utils";
import { NAMES, takeName } from "./names";
import type { Horse } from "./types";

export function makeHorse(q: number, used: Set<string>, opts: { age?: number; fitness?: number } = {}): Horse {
  const speed = clamp(Math.round(q + rnd(-6, 6)), 25, 99);
  const stamina = clamp(Math.round(q + rnd(-6, 6)), 25, 99);
  const accel = clamp(Math.round(q + rnd(-6, 6)), 25, 99);
  const brk = clamp(Math.round(q + rnd(-10, 8)), 20, 99);
  const balance = clamp(Math.round(q + rnd(-10, 8)), 20, 99);
  // Genetic ceiling per stat — randomized headroom above the starting value,
  // not derivable from it alone. See the Horse.statCeilings doc comment.
  const ceiling = (current: number) => clamp(current + ri(10, 30), current, 99);
  return {
    // Sire/dam don't dedupe against `used` — real sires cover many foals,
    // and only the horse's own name needs to be unique/visible in the UI.
    id: nid(), name: takeName(used),
    sire: pick(NAMES), dam: pick(NAMES),
    colour: pick(["b", "b", "ch", "ch", "gr", "br"]), sex: pick(["c", "f", "g", "f", "c"]), age: opts.age ?? ri(2, 4),
    speed, stamina, accel, brk, balance,
    statCeilings: { speed: ceiling(speed), stamina: ceiling(stamina), accel: ceiling(accel), brk: ceiling(brk), balance: ceiling(balance) },
    temperament: clamp(Math.round(q + rnd(-12, 10)), 20, 99),
    prefGoing: ri(1, 4), prefDist: pick([5, 6, 7, 8, 10, 12, 14]),
    goingKnown: false, distKnown: false,
    fitness: opts.fitness ?? 35, fatigue: 0, morale: ri(50, 70), injuryDays: 0,
    form: [], formLines: [], wins: 0, runs: 0, earnings: 0,
    quirk: null,
    gear: [], gearRun: [], mark: null, // mark = official handicap mark; null until the horse has run
  };
}

// The six candidates Bridges offers at the start of the game — modest
// numbers across the board, each with an independent chance of one hidden
// redeeming quality. Stats are fully visible when picking; quirks stay
// hidden until revealed through racing, same as before — an honest blind
// choice, not a min-max puzzle.
export function makeCandidateHorses(used: Set<string>, n = 6): Horse[] {
  return Array.from({ length: n }, () => {
    const h = makeHorse(ri(40, 60), used, { age: ri(2, 4), fitness: ri(20, 35) });
    if (Math.random() < 0.4) {
      const gift = pick(["balance", "brk", "temperament", "accel"] as const);
      h[gift] = clamp(h[gift] + ri(18, 26), 20, 92);
      h.quirk = { stat: gift, revealed: false };
      // The quirk bump can push a stat past its already-rolled ceiling —
      // patch the ceiling up so the horse isn't already maxed out on day one.
      if (gift !== "temperament") {
        h.statCeilings[gift] = clamp(Math.max(h.statCeilings[gift], h[gift] + ri(3, 10)), h[gift], 99);
      }
    }
    return h;
  });
}

export const OR = (h: Horse) =>
  Math.round((h.speed * 0.32 + h.stamina * 0.28 + h.accel * 0.2 + h.brk * 0.1 + h.balance * 0.1) * 1.18);

// The rating used for race entries — the official mark once assigned, otherwise an assessed estimate.
// A horse can be "well handicapped" (true ability above its mark) or "found out" (below it) —
// the mark only moves when the handicapper reviews the form, not the instant a horse improves.
export const effRating = (h: Horse) => h.mark ?? OR(h);
