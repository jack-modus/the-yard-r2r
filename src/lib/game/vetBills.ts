// A real choice whenever a horse picks up an injury, instead of injuryDays
// just being silently assigned — part of the "money has no purpose" fix (see
// CLAUDE.md "Money sinks"). £35/day is a judgement call, not calibrated
// against anything; scaled down by the "physio" yard upgrade if bought.
import { money } from "@/lib/sim";
import { VET_BILL_DISCOUNT } from "./upgrades";
import { withHorse, note } from "./stateUtils";
import type { DecisionEvent, GameState } from "./types";

const COST_PER_DAY = 35;

export function makeVetBillDecision(s: GameState, horseId: number, horseName: string, days: number): DecisionEvent {
  const discount = s.yardUpgrades.physio ? 1 - VET_BILL_DISCOUNT : 1;
  const cost = Math.round(days * COST_PER_DAY * discount);
  const cutDays = Math.max(1, Math.round(days / 2));
  return {
    title: `${horseName} needs treatment`,
    tag: "YARD",
    text: `The vet's assessment: ${days} days on the easy list. Pay for proper treatment to speed the recovery, or let it heal on its own time?`,
    choices: [
      {
        label: `Call the vet (${money(cost)})`, hint: `cuts recovery to ${cutDays} day${cutDays === 1 ? "" : "s"}`,
        apply: st => note(
          { ...withHorse(st, horseId, h => ({ ...h, injuryDays: cutDays })), cash: st.cash - cost },
          `The vet's treatment does its job — ${horseName} should be back sooner for it.`,
        ),
      },
      {
        label: "Let it heal naturally", hint: "free, full duration",
        apply: st => note(st, `${horseName} is left to heal in its own time. No cost, but no shortcuts either.`),
      },
    ],
  };
}
