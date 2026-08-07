// Shared helpers for the four metrics that don't belong to any one call
// site — threshold-crossing detection and perception-metric overflow.
// Deliberately centralized in chooseDecision()/resolveRaceDay() (engine.ts)
// rather than migrated into every individual choice's apply() — those two
// functions are the only places every metric change already flows through
// (or can cheaply be made to), so detecting/redistributing there covers
// effectively all of it without a much larger mechanical refactor across
// content.ts/storyContent.ts.
import { clamp } from "@/lib/sim";

export interface FourMetrics {
  trust: number;
  reputation: number;
  celebrity: number;
  skill: number;
}

type MetricKey = keyof FourMetrics;

// Generic on purpose — not bespoke content per threshold (4 metrics × ~20
// bands is too much to author), just enough to make crossing a band feel
// like something happened. Cash reward scales a little with how high the
// threshold is.
const THRESHOLD_TEXT: Record<MetricKey, (bossFirstName: string, threshold: number) => string> = {
  trust: (boss, t) => `${boss} is starting to lean on you for real advice — Trust crosses ${t}`,
  reputation: (_boss, t) => `Word is spreading among the right people — Reputation crosses ${t}`,
  celebrity: (_boss, t) => `Someone recognised you outside the yard gates today — Celebrity crosses ${t}`,
  skill: (_boss, t) => `Something clicked today — Skill crosses ${t}`,
};

export interface ThresholdEvent {
  text: string;
  cash: number;
}

// Fires at most once per metric per call, even if a big jump crossed
// several 5-point bands at once — reports the new highest band reached,
// not one message per band (which would be spammy on a big Classic win).
export function checkThresholds(before: FourMetrics, after: FourMetrics, bossFirstName: string): ThresholdEvent[] {
  const events: ThresholdEvent[] = [];
  (Object.keys(THRESHOLD_TEXT) as MetricKey[]).forEach(key => {
    const b = Math.floor(before[key] / 5);
    const a = Math.floor(after[key] / 5);
    if (a > b) {
      const threshold = a * 5;
      const cash = Math.round((threshold / 5) * 10);
      events.push({ text: `${THRESHOLD_TEXT[key](bossFirstName, threshold)}. (+£${cash}.)`, cash });
    }
  });
  return events;
}

export interface PerceptionMetrics {
  trust: number;
  reputation: number;
  celebrity: number;
}

// Applies raw (unclamped) deltas to Trust/Reputation/Celebrity; any excess
// past 100 spills 50% into the *other two* perception metrics (split
// evenly) instead of being lost outright — "you can't get more famous than
// famous, but the attention doesn't go nowhere." If those also overflow,
// the further excess is genuinely lost (no cascade-chasing). Deliberately
// scoped to resolveRaceDay's big race-day swings only, not every small
// decision delta — see CLAUDE.md.
export function applyPerceptionOverflow(before: PerceptionMetrics, rawDeltas: PerceptionMetrics): PerceptionMetrics {
  const raw: Record<keyof PerceptionMetrics, number> = {
    trust: before.trust + rawDeltas.trust,
    reputation: before.reputation + rawDeltas.reputation,
    celebrity: before.celebrity + rawDeltas.celebrity,
  };
  const keys: (keyof PerceptionMetrics)[] = ["trust", "reputation", "celebrity"];
  const result: Record<keyof PerceptionMetrics, number> = { trust: raw.trust, reputation: raw.reputation, celebrity: raw.celebrity };
  keys.forEach(key => {
    const excess = raw[key] - 100;
    if (excess <= 0) return;
    result[key] = 100;
    const others = keys.filter(k => k !== key);
    others.forEach(o => { result[o] += excess * 0.25; });
  });
  keys.forEach(key => { result[key] = clamp(Math.round(result[key]), 0, 100); });
  return result;
}
