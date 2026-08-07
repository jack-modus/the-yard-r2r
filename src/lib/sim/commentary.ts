// Live race commentary and form-line snippets, extracted verbatim from
// reference/rags-to-riches-v6.jsx.
// makeBeats structure per spec: alternating race/player early on, beats 9–10 player,
// beat 11 the winner (and who chased), beat 12 the player's horse regardless of result.
import { COURSES, GOINGS } from "./courses";
import { marginStr } from "./format";
import { clamp, pick, rnd } from "./utils";
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
    ? `${H} ${pick(["pings the gates and breaks smartly", "is away like a shot from the stalls", "jumps out sharply, first to stride"])}.`
    : mine.horse.brk <= 45 ? `${H} ${pick(["is slowly into stride — a length given away at the start", "loses a length at the start, sluggish from the gates", "is caught flat-footed as the gates open"])}.`
    : `${H} ${pick(["breaks on terms with the field", "jumps off in the pack, nothing lost or gained", "away without incident, tucked in behind"])}.`;
  const closing = oneOut > mine.pos, fading = oneOut < mine.pos;
  return [
    `They're off at ${race.course} over ${race.dist} furlongs, going ${GOINGS[race.going].toLowerCase()}. ${brkLine}`,
    `${otherEarly.horse.name} ${pick(["cuts out the running and the field settles into its rhythm", "shows out in front early, setting a sensible gallop", "goes on, the rest content to track for now"])}.`,
    `${posLine(early)}, ${tactic === "hold" ? "saving every yard for one late run" : tactic === "front" ? "dictating the fractions" : "travelling sweetly just off the pace"}.`,
    `The pace is ${race.dist <= 6 ? pick(["furious — no hiding place over this trip", "frantic from the gun, jockeys niggling already"]) : pick(["honest, a true test at the distance", "steady enough, though it'll quicken from here"])}. ${COURSES[race.course].sharpness >= 2 ? pick(["Position matters everywhere on this tight track.", "No easy passage out wide here — ground has to be fought for."]) : pick(["The gallop stretches them out across this galloping course.", "Plenty of room to race honestly on this galloping track."])}`,
    `Halfway. ${posLine(mid)}${mine.horse.temperament >= 65 ? ", perfectly relaxed" : ", keen enough, taking a pull"}.`,
    `${second.horse.name} ${pick(["makes a move on the outside as the race begins in earnest", "is niggled along now, angling for a better position", "finds a gear, creeping into contention"])}.`,
    `${pick(["Three furlongs out", "Turning for home, three out", "Racing in earnest now, three furlongs to run"])} — ${posLine(threeOut)}${threeOut < mid ? " and making ground" : threeOut > mid ? " and coming under a ride" : ""}.`,
    `Two out, and ${looming.horse.name} ${pick(["looms up dangerously", "arrives on the scene full of running", "throws down a serious challenge"])}. ${COURSES[race.course].finishClimb ? "The climb to the line starts to bite." : "The straight opens up before them."}`,
    `${posLine(twoOut)} — ${race.dist <= 6 ? "the sprint is on in full" : "asked for everything now"}. ${pick(["The crowd starts to roar.", "You can hear the stands lifting.", "Every phone in the enclosure comes up."])}`,
    `Inside the final furlong: ${posLine(oneOut)}${
      closing ? `, ${pick(["CLOSING with every stride!", "and the gap is shrinking with every stride!"])}`
      : fading ? `, ${pick(["but the effort is flattening out", "but there's not much more to give"])}`
      : `, ${pick(["giving all it has", "staying on gamely"])}`
    }.`,
    `At the line it's ${winner.horse.name}${winner.player ? "" : ` (${winner.sp}${winner.fav ? " fav" : ""})`} who ${pick(["takes it", "gets the verdict", "prevails"])}, ${marginStr(res[1] ? res[1].gap : 0.5)} back to ${second.horse.name}.`,
    mine.pos === 1
      ? `${H} WINS IT! From the bottom box to the winner's enclosure — they'll be talking about this in the yard for weeks.`
      : mine.pos <= 3
        ? `${H} finishes a gallant ${mine.pos === 2 ? "second" : "third"} of ${field}. Beaten, but this horse is going the right way — and everyone watching knows it.`
        : `${H} comes home ${mine.pos} of ${field}. Not the day you wanted — but the notebook has a page of lessons, and there's always another race.`,
  ];
}

// ---------- live race track (visual) ----------
// A per-runner, per-beat X-progress curve (0 = stalls, 1 = finish line) for
// the whole field — purely a presentation-layer fabrication, same trick
// makeBeats()'s posAt() already uses for the player's own horse (a plausible
// post-hoc interpolation toward the real final result), just extended to
// every runner. Deliberately NOT touching runRace()/noiseSd() — that math is
// calibrated against real data (see CLAUDE.md "Tuned sim constants") and has
// no notion of intermediate field positions to begin with. Called once at
// race resolution and the result stored on GameState, so there's no live
// randomness to worry about re-jittering on re-render.
export interface RaceTrackRunner {
  name: string;
  silk: string;
  number: number;
  player: boolean;
  positions: number[]; // one per beat, 0-1
}

export interface RaceTrack {
  runners: RaceTrackRunner[];
}

// Mirrors the beat count/shape from makeBeats(): beat 0 is the stalls,
// beats 10-11 (the finish and the immediate aftermath) both sit at the line.
const BEAT_PROGRESS = [0, 0.08, 0.15, 0.3, 0.45, 0.55, 0.65, 0.8, 0.88, 0.96, 1, 1];

export function computeRaceTrack(res: ScoredEntry[], mine: ScoredEntry, tactic: Tactic): RaceTrack {
  const field = res.length;
  // Stable lane order, independent of finishing result — the eye reads
  // "who's ahead" purely from X-position, so lane order never spoils the
  // outcome before the finish plays out.
  const laned = [...res].sort((a, b) => a.horse.id - b.horse.id);

  // Reuse the same closing/fading signal makeBeats() derives for the
  // player's own horse, so this doesn't visually contradict a line like
  // "CLOSING with every stride!" sitting right next to it.
  const startPos = tactic === "front" ? 1 : tactic === "stalk" ? Math.min(3, field) : Math.max(2, field - 2);
  const posAt = (f: number) => clamp(Math.round(startPos + (mine.pos - startPos) * f), 1, field);
  const closing = posAt(0.92) > mine.pos;

  const spreadStep = field > 1 ? Math.min(0.035, 0.35 / (field - 1)) : 0;
  const runners: RaceTrackRunner[] = laned.map((entry, i) => {
    // The winner finishes at the line; the rest spread out modestly by rank
    // so a big field's tail-ender still reads as "in the race," not
    // stranded back near the stalls.
    const finalX = entry.pos === 1 ? 1 : clamp(1 - (entry.pos - 1) * spreadStep, 0.65, 1);
    // A little per-runner jockeying-for-position wobble, zero at the start
    // and finish (everyone's exactly in the stalls, everyone ends exactly
    // where they finished) and peaking mid-race.
    const amplitude = entry.player ? (closing ? 0.07 : -0.05) : rnd(-0.08, 0.08);
    const positions = BEAT_PROGRESS.map(p => {
      if (p <= 0) return 0;
      if (p >= 1) return finalX;
      return clamp(p * finalX + amplitude * Math.sin(p * Math.PI), 0, 1);
    });
    return {
      name: entry.horse.name,
      silk: entry.silk ?? "#666666",
      number: i + 1,
      player: entry.player,
      positions,
    };
  });

  return { runners };
}

export const CMT_WIN = ["led inside final furlong, ridden out", "made all, kept on strongly", "tracked leaders, quickened to lead 1f out", "held up, delivered late, readily", "stayed on gamely under pressure"];
export const CMT_PLACE = ["kept on, not pace of winner", "every chance 1f out, one-paced late", "chased winner, no impression", "led until headed inside final furlong"];
export const CMT_ALSO = ["mid-division, never landed a blow", "ran on late past beaten horses", "prominent, weakened 2f out", "slowly away, always behind", "never travelling on the ground"];
