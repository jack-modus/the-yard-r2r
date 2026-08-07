// Live race commentary and form-line snippets, extracted verbatim from
// reference/rags-to-riches-v6.jsx.
// makeBeats structure per spec: alternating race/player early on, beats 9–10 player,
// beat 11 the winner (and who chased), beat 12 the player's horse regardless of result.
import { COURSES, GOINGS } from "./courses";
import { marginStr } from "./format";
import { clamp, pick } from "./utils";
import type { ScoredEntry } from "./types";

export type Tactic = "front" | "stalk" | "hold";

// Mirrors the beat count/shape used by makeBeats(): beat 0 is the stalls,
// beats 10-11 (the finish and the immediate aftermath) both sit at the line.
// Shared by both the text commentary and the live-race visual (see
// computeFieldPositions below) — this is the "one clock" both read from.
const BEAT_PROGRESS = [0, 0.08, 0.15, 0.3, 0.45, 0.55, 0.65, 0.8, 0.88, 0.96, 1, 1];

// A single, shared per-runner per-beat ordinal rank (1 = leading) table —
// the ONE source of truth for "where is everyone right now," read by both
// makeBeats() (the prose) and computeRaceTrack() (the visual). Previously
// each computed its own, independent, differently-shaped interpolation —
// makeBeats() only ever tracked the player's own rank via a tactic-based
// startPos, while computeRaceTrack() didn't track rank at all, just a final
// X-position plus unrelated per-runner random wobble. The two could and did
// disagree (commentary saying "sat mid-division" while the visual showed
// last from the start) because nothing forced them to agree — this was
// caught via playtesting feedback, not by any type/build check, since both
// were individually well-formed code, just not driven by the same data.
//
// Every runner (not just the player) gets an interpolated rank from a
// plausible early-race position toward their real final classification.
// Rivals don't have a chosen tactic, so their "early position" is derived
// deterministically from their own break stat (a fast-breaking horse is
// more likely to race prominently early) rather than randomly — replay-safe
// and, unlike the old per-runner noise, at least loosely grounded in the
// same stat the text commentary's own break line already reads from.
function startRankFor(entry: ScoredEntry, field: number, tactic: Tactic): number {
  if (entry.player) return tactic === "front" ? 1 : tactic === "stalk" ? Math.min(3, field) : Math.max(2, field - 2);
  const frac = 1 - clamp(entry.horse.brk, 20, 99) / 100; // fast break (high brk) -> near the front early
  return clamp(Math.round(1 + frac * (field - 1)), 1, field);
}

export function computeFieldRanks(res: ScoredEntry[], tactic: Tactic): Record<number, number[]> {
  const field = res.length;
  const ranks: Record<number, number[]> = {};
  res.forEach(entry => {
    const start = startRankFor(entry, field, tactic);
    ranks[entry.horse.id] = BEAT_PROGRESS.map(f => clamp(Math.round(start + (entry.pos - start) * f), 1, field));
  });
  return ranks;
}

export function makeBeats(
  race: { course: keyof typeof COURSES; dist: number; going: number },
  res: ScoredEntry[],
  mine: ScoredEntry,
  tactic: Tactic,
  ranks: Record<number, number[]> = computeFieldRanks(res, tactic),
): string[] {
  const field = res.length;
  const winner = res[0], second = res[1] || res[0];
  const myRanks = ranks[mine.horse.id];
  const H = mine.horse.name;
  const posLine = (p: number) =>
    p === 1 ? `${H} leads`
    : p === 2 ? `${H} sits second`
    : p <= 4 ? `${H} tracks the leaders in ${p}th`
    : p <= Math.ceil(field / 2) ? `${H} is settled mid-division`
    : `${H} is held up toward the rear`;
  // Indices into BEAT_PROGRESS/myRanks matching this function's own beat
  // order below (early=1, mid=4, threeOut=6, twoOut=7, oneOut=8).
  const early = myRanks[1], mid = myRanks[4], threeOut = myRanks[6], twoOut = myRanks[7], oneOut = myRanks[8];
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
// makeBeats() uses (a plausible post-hoc interpolation toward the real final
// result). Deliberately NOT touching runRace()/noiseSd() — that math is
// calibrated against real data (see CLAUDE.md "Tuned sim constants") and has
// no notion of intermediate field positions to begin with. Called once at
// race resolution and the result stored on GameState, so there's no live
// randomness to worry about re-jittering on re-render.
export interface RaceTrackRunner {
  name: string;
  silk: string;
  number: number; // racecard number — from a randomized stall draw, not lane/id order
  player: boolean;
  pos: number; // final finishing position, for a guaranteed "you finished Nth" readout
  positions: number[]; // one per beat, 0-1
}

export interface RaceTrack {
  runners: RaceTrackRunner[];
}

export function computeRaceTrack(res: ScoredEntry[], mine: ScoredEntry, tactic: Tactic): RaceTrack {
  const field = res.length;
  const ranks = computeFieldRanks(res, tactic);

  // A genuine stall draw — randomized per race, not derived from horse.id
  // (which used to put the player's horse in lane/stall 1 almost every
  // single race, since its id is always low: it's created before the whole
  // roster). Caught via playtesting feedback ("stall draw is always the
  // same"). Lane order is otherwise cosmetic — the eye reads "who's ahead"
  // from X-position, not lane, so shuffling it never spoils the outcome.
  const laned = [...res];
  for (let i = laned.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [laned[i], laned[j]] = [laned[j], laned[i]];
  }

  const spreadStep = field > 1 ? Math.min(0.035, 0.35 / (field - 1)) : 0;
  const runners: RaceTrackRunner[] = laned.map((entry, i) => {
    // The winner finishes at the line; the rest spread out modestly by rank
    // so a big field's tail-ender still reads as "in the race," not
    // stranded back near the stalls.
    const finalX = entry.pos === 1 ? 1 : clamp(1 - (entry.pos - 1) * spreadStep, 0.65, 1);
    const myRanks = ranks[entry.horse.id];
    const positions = BEAT_PROGRESS.map((p, beatIdx) => {
      if (p <= 0) return 0;
      if (p >= 1) return finalX;
      // The SAME rank driving the text commentary offsets this runner
      // ahead of or behind the field's nominal race progress at this beat —
      // a runner currently well-placed reads as ahead of the pack, one
      // currently buried reads as behind it, and everyone still lands
      // exactly on their real final X by the finish (wobbleShape -> 0).
      // Previously this was uncorrelated random noise per non-player
      // runner, which is exactly how the commentary and the visual could
      // (and did) disagree about where a horse was mid-race.
      const rank = myRanks[beatIdx];
      const rankFrac = (rank - (field + 1) / 2) / field; // negative = ahead of mid-pack
      const wobbleShape = Math.sin(p * Math.PI); // 0 at start/finish, peak mid-race
      return clamp(p * finalX - rankFrac * 0.16 * wobbleShape, 0, 1);
    });
    return {
      name: entry.horse.name,
      silk: entry.silk ?? "#666666",
      number: i + 1,
      player: entry.player,
      pos: entry.pos,
      positions,
    };
  });

  return { runners };
}

export const CMT_WIN = ["led inside final furlong, ridden out", "made all, kept on strongly", "tracked leaders, quickened to lead 1f out", "held up, delivered late, readily", "stayed on gamely under pressure"];
export const CMT_PLACE = ["kept on, not pace of winner", "every chance 1f out, one-paced late", "chased winner, no impression", "led until headed inside final furlong"];
export const CMT_ALSO = ["mid-division, never landed a blow", "ran on late past beaten horses", "prominent, weakened 2f out", "slowly away, always behind", "never travelling on the ground"];
