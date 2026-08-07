// Real racecard gear, with real effects and real trade-offs.
// Extracted verbatim from reference/rags-to-riches-v6.jsx.
import type { GearId, GearItem, Horse } from "./types";

// noiseAdj values are scaled ~5.25x from the original prototype to track
// lib/sim/race.ts's recalibrated noiseSd range (0.26-1.16 vs the original
// 0.05-0.22) — otherwise gear's effect on consistency would round to
// nothing against the new, realistically-larger race-day noise.
export const GEAR: Record<GearId, GearItem> = {
  blinkers: { label: "Blinkers", cost: 90,
    help: "Restricts a horse's vision to encourage focus. Sharpens a keen or unfocused horse's finishing effort — but can backfire on one that was already racing sensibly.",
    apply: (exp) => exp * 1.05, noiseAdj: h => (h.temperament >= 60 ? 0.08 : -0.05) },
  cheekpieces: { label: "Cheekpieces", cost: 55,
    help: "A gentler version of blinkers — a subtler focus aid with less risk of overdoing it.",
    apply: (exp) => exp * 1.02, noiseAdj: () => -0.026 },
  tonguetie: { label: "Tongue Tie", cost: 40,
    help: "Stops the tongue interfering with breathing at speed. Low risk, modest and reliable benefit for a horse that empties the tank late.",
    apply: (exp) => exp * 1.015, noiseAdj: () => 0 },
  hood: { label: "Hood", cost: 45,
    help: "Cuts down noise and peripheral distraction for a nervy traveller. Calms rather than sharpens — makes a horse more consistent, not faster.",
    apply: (exp) => exp, noiseAdj: () => -0.105 },
};

// Real racecard letters, shown next to a horse's name (e.g. "b" for first-time blinkers).
export const GEAR_LETTER: Record<GearId, string> = {
  blinkers: "b", cheekpieces: "p", tonguetie: "t", hood: "h",
};

export function gearExp(h: Horse, exp: number): number {
  return (h.gear || []).reduce((e, g) => (GEAR[g] ? GEAR[g].apply(e, h) : e), exp);
}

export function gearNoise(h: Horse): number {
  return (h.gear || []).reduce((n, g) => (GEAR[g] ? n + GEAR[g].noiseAdj(h) : n), 0);
}
