// Cosmetic rank labels for the four metrics (Trust/Reputation/Celebrity/
// Skill) — one shared 0-100 scale reused across all four rather than four
// bespoke label sets, per playtesting feedback asking what happens once a
// metric hits its cap. The metric still hard-caps at 100; the rank name is
// what communicates that reaching it means something. An overflow/trade
// mechanic between maxed-out metrics is a natural next step but requires
// migrating every inline delta call site across content.ts/storyContent.ts
// — deferred, see CLAUDE.md.
const RANK_LABELS = ["Unproven", "Rising", "Established", "Elite", "Legend"];

export function metricRank(value: number): string {
  return RANK_LABELS[Math.min(4, Math.max(0, Math.floor(value / 20)))];
}
