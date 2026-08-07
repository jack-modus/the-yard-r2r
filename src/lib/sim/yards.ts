// The single trainer's yard. Hard rule: no real named people — fictional,
// real-sounding names only.
//
// Marina Delacroix-Hale (the previous pass's placeholder single trainer) and
// the original Berrow/Okafor personas aren't deleted — they're repurposed as
// rival trainers (see race.ts RIVAL_TRAINERS) so their writing isn't wasted.
import { TIER1_COURSES } from "./courses";
import type { Yard } from "./types";

export const YARD: Yard = {
  boss: "Simon Bridges", yardName: "Bridges Racing, Newmarket",
  persona: "A trainer at the top of the game, and the only one willing to take a chance on you. Watched your grandfather ride out fifty years ago and hasn't forgotten it — or forgotten what your father did with the name.",
  tracks: TIER1_COURSES, jockey: { name: "Charlie Redfern", skill: 88 },
  style: "all-round campaigner", greeting: n => `"${n}. A fresh start — for both of us, if I'm honest. I'm taking a bit of a risk here."`,
  praise: ["\"Aye, that's more like it.\"", "\"Your grandfather would've liked that.\"", "\"Good. Now do it again.\""],
  scold: ["\"Explain that to me. Slowly.\"", "\"Your father talked a good game too, remember.\"", "\"I didn't take a risk on you for that.\""],
};
