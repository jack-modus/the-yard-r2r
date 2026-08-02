// The single trainer's yard, extracted/consolidated from
// reference/rags-to-riches-v6.jsx's original three-boss choice.
// Hard rule: no real named people — fictional, real-sounding names only.
//
// Berrow and Okafor (the other two original personas) aren't deleted —
// they're repurposed as rival trainers (see race.ts RIVAL_TRAINERS) so
// their writing isn't wasted, just reassigned.
import { TIER1_COURSES } from "./courses";
import type { Yard } from "./types";

export const YARD: Yard = {
  boss: "Marina Delacroix-Hale", yardName: "Delacroix-Hale Racing, Newmarket",
  persona: "Elegant, exacting, quietly terrifying. Plans campaigns like chess games and expects her assistants to see three moves ahead.",
  tracks: TIER1_COURSES, jockey: { name: "Rossa Bellini", skill: 88 },
  style: "all-round campaigner", greeting: n => `"${n}. I hire for judgement, not enthusiasm. There is a horse here whose entries I cannot justify to its owner. It is yours to prove me wrong about."`,
  praise: ["\"Competent. Continue.\"", "\"I noticed. Others will too.\"", "\"That was... correct.\""],
  scold: ["\"Explain your thinking. Slowly.\"", "\"We do not guess in this yard.\"", "\"Disappointing. Twice would be a pattern.\""],
};
