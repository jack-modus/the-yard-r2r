// One-time yard purchases — permanent effects once bought. Part of the
// "money has no purpose" fix (see CLAUDE.md "Money sinks"): entry fees and
// vet bills give cash somewhere to go day-to-day, upgrades give it a
// long-term destination. Deliberately kept away from the real-data-calibrated
// race-sim formulas (noiseSd, expected()'s weights, softmax temperature) —
// see CLAUDE.md "Tuned sim constants" on why those aren't safe to perturb via
// a purchasable effect; every upgrade here touches injury/cash bookkeeping
// instead, outside that calibration.
import { money } from "@/lib/sim";
import type { GameState } from "./types";

export type YardUpgradeId = "physio" | "recovery" | "travel";

export interface YardUpgrade {
  id: YardUpgradeId;
  label: string;
  cost: number;
  blurb: string;
  effect: string; // shown in the UI alongside blurb — what it actually does
}

export const YARD_UPGRADES: YardUpgrade[] = [
  {
    id: "physio", label: "On-call physio", cost: 700,
    blurb: "A physio on retainer instead of calling one in each time — cheaper care, on speed dial.",
    effect: "Vet bills cost 40% less, permanently.",
  },
  {
    id: "recovery", label: "Better recovery regime", cost: 1200,
    blurb: "Proper cold-water spas and a dedicated recovery routine, not just a stable and a hope.",
    effect: "New injuries run 25% shorter, permanently.",
  },
  {
    id: "travel", label: "Bigger travelling team", cost: 2000,
    blurb: "A proper horsebox and travelling staff instead of scraping one together per race.",
    effect: "+10% cash from every race's prize money, permanently.",
  },
];

export const VET_BILL_DISCOUNT = 0.4; // "physio" upgrade
export const RECOVERY_REDUCTION = 0.25; // "recovery" upgrade
export const TRAVEL_CASH_BONUS = 0.1; // "travel" upgrade, added to the base 0.08 conversion

export function buyUpgrade(s: GameState, id: YardUpgradeId): GameState {
  const upg = YARD_UPGRADES.find(u => u.id === id);
  if (!upg || s.yardUpgrades[id] || s.cash < upg.cost) return s;
  return {
    ...s,
    cash: s.cash - upg.cost,
    yardUpgrades: { ...s.yardUpgrades, [id]: true },
    messages: [{ day: s.day, text: `${upg.label} — bought for ${money(upg.cost)}. ${upg.effect}` }, ...s.messages].slice(0, 60),
  };
}
