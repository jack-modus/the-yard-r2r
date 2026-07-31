// Live race commentary and form-line snippets, extracted verbatim from
// reference/rags-to-riches-v6.jsx.
// makeBeats structure per spec: alternating race/player early on, beats 9–10 player,
// beat 11 the winner (and who chased), beat 12 the player's horse regardless of result.
import { COURSES, GOINGS } from "./courses";
import { marginStr } from "./format";
import { clamp } from "./utils";
import type { ScoredEntry } from "./types";

export type Tactic = "front" | "stalk" | "hold";

export function makeBeats(
  race: { course: keyof typeof COURSES; dist: number; going: number },
  res: ScoredEntry[],
  mine: ScoredEntry,
  tactic: Tactic,
): string[] {
  const field = res.length;
  const winner = res[0], second = res[1] || res[0];
  const startPos = tactic === "front" ? 1 : tactic === "stalk" ? Math.min(3, field) : Math.max(2, field - 2);
  const posAt = (f: number) => clamp(Math.round(startPos + (mine.pos - startPos) * f), 1, field);
  const H = mine.horse.name;
  const posLine = (p: number) =>
    p === 1 ? `${H} leads`
    : p === 2 ? `${H} sits second`
    : p <= 4 ? `${H} tracks the leaders in ${p}th`
    : p <= Math.ceil(field / 2) ? `${H} is settled mid-division`
    : `${H} is held up toward the rear`;
  const early = posAt(0.15), mid = posAt(0.45), threeOut = posAt(0.65), twoOut = posAt(0.8), oneOut = posAt(0.92);
  const otherEarly = res.find(r => !r.player && r.pos <= 3) || second;
  const looming = res.find(r => !r.player && r.pos <= 2) || winner;
  const brkLine = (mine.horse.brk >= 68 || tactic === "front")
    ? `${H} pings the gates and breaks smartly.`
    : mine.horse.brk <= 45 ? `${H} is slowly into stride — a length given away at the start.`
    : `${H} breaks on terms with the field.`;
  const closing = oneOut > mine.pos, fading = oneOut < mine.pos;
  return [
    `They're off at ${race.course} over ${race.dist} furlongs, going ${GOINGS[race.going].toLowerCase()}. ${brkLine}`,
    `${otherEarly.horse.name} cuts out the running and the field settles into its rhythm.`,
    `${posLine(early)}, ${tactic === "hold" ? "saving every yard for one late run" : tactic === "front" ? "dictating the fractions" : "travelling sweetly just off the pace"}.`,
    `The pace is ${race.dist <= 6 ? "furious — no hiding place over this trip" : "honest, a true test at the distance"}. ${COURSES[race.course].sharpness >= 2 ? "Position matters everywhere on this tight track." : "The gallop stretches them out across this galloping course."}`,
    `Halfway. ${posLine(mid)}${mine.horse.temperament >= 65 ? ", perfectly relaxed" : ", keen enough, taking a pull"}.`,
    `${second.horse.name} makes a move on the outside as the race begins in earnest.`,
    `Three furlongs out — ${posLine(threeOut)}${threeOut < mid ? " and making ground" : threeOut > mid ? " and coming under a ride" : ""}.`,
    `Two out, and ${looming.horse.name} looms up dangerously. ${COURSES[race.course].finishClimb ? "The climb to the line starts to bite." : "The straight opens up before them."}`,
    `${posLine(twoOut)} — ${race.dist <= 6 ? "the sprint is on in full" : "asked for everything now"}. The crowd starts to roar.`,
    `Inside the final furlong: ${posLine(oneOut)}${closing ? ", CLOSING with every stride!" : fading ? ", but the effort is flattening out" : ", giving all it has"}.`,
    `At the line it's ${winner.horse.name}${winner.player ? "" : ` (${winner.sp}${winner.fav ? " fav" : ""})`} who takes it, ${marginStr(res[1] ? res[1].gap : 0.5)} back to ${second.horse.name}.`,
    mine.pos === 1
      ? `${H} WINS IT! From the bottom box to the winner's enclosure — they'll be talking about this in the yard for weeks.`
      : mine.pos <= 3
        ? `${H} finishes a gallant ${mine.pos === 2 ? "second" : "third"} of ${field}. Beaten, but this horse is going the right way — and everyone watching knows it.`
        : `${H} comes home ${mine.pos} of ${field}. Not the day you wanted — but the notebook has a page of lessons, and there's always another race.`,
  ];
}

export const CMT_WIN = ["led inside final furlong, ridden out", "made all, kept on strongly", "tracked leaders, quickened to lead 1f out", "held up, delivered late, readily", "stayed on gamely under pressure"];
export const CMT_PLACE = ["kept on, not pace of winner", "every chance 1f out, one-paced late", "chased winner, no impression", "led until headed inside final furlong"];
export const CMT_ALSO = ["mid-division, never landed a blow", "ran on late past beaten horses", "prominent, weakened 2f out", "slowly away, always behind", "never travelling on the ground"];
