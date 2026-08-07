// Game state machine: new game, day advance, race resolution, decisions.
// Extracted and typed from reference/rags-to-riches-v6.jsx — the logic itself
// (formulas, probabilities, ordering of checks) is unchanged from the prototype,
// aside from the Act 1 scripted-narrative hooks added in story.ts.
import {
  CMT_ALSO, CMT_PLACE, CMT_WIN,
  COURSES, GEAR, GOINGS, OR, PRIZE, YARD,
  clamp, computeRaceTrack, drawField, effRating, makeBeats, makeCandidateHorses, makeHorse, makeRoster, makeSlate,
  pick, ri, runRace,
} from "@/lib/sim";
import type { CourseName, Grade, Horse, RaceCard } from "@/lib/sim";
import type { Tactic } from "@/lib/sim/commentary";
import { NEWS_LINES, QUIET_DAYS, trainingMoment } from "./content";
import { quizMoment } from "./quiz";
import { applyPerceptionOverflow, checkThresholds } from "./metrics";
import { makePostRacePress, makePreRacePress } from "./pressContent";
import { makeRivalClapback } from "./pressRoom";
import {
  BEAT2_BRIDGES_OFFICE, BEAT5_REPORTER_PRE_RACE, BEAT6_MCLEAN_TAUNT, classicScratchedMessage, makeNewHorseAnnouncement,
} from "./storyContent";
import {
  checkStoryTriggers, computeEnding, ensureNemesisInField, forcePosition, newStoryState, rescheduleDiamondCup,
  resolveClassicOutcome, resolveDiamondCupOutcome, scheduleNemesisIntro, skipClassic,
} from "./story";
import { note } from "./stateUtils";
import { unlockedCourses } from "./tracks";
import type { GameState, TrainingPlan } from "./types";

export { REPUTATION_TIER2_UNLOCK, unlockedCourses } from "./tracks";

// How much a result at each grade moves Reputation — a G1 counts vastly
// more than a Class 6, unlike Trust which doesn't care about grade at all.
const GRADE_WEIGHT: Record<string, number> = { G1: 18, G2: 13, G3: 9, L: 6, "3": 4, "4": 3, "5": 2, "6": 1 };
const gradeWeight = (grade: Grade) => GRADE_WEIGHT[String(grade)] ?? 1;

const PLAYER_NAME = "Tony Vincenzo";
// "Bigger than the Breeders' Cup" — real Breeders' Cup Classic purses run
// ~$6-7M; this is a fictional one-off headline number for the finale.
const DIAMOND_CUP_PRIZE = [15_000_000, 5_000_000, 2_000_000, 1_000_000];

export function newGame(used: Set<string>): GameState {
  const yard = YARD;
  const mastery = {} as Record<CourseName, number>;
  (Object.keys(COURSES) as CourseName[]).forEach(c => { mastery[c] = yard.tracks.includes(c) ? 10 : 0; });
  return {
    playerName: PLAYER_NAME,
    day: 1, year: 1, cash: 500, trust: 20, reputation: 10, celebrity: 0, skill: 0,
    story: newStoryState(), awaitingHorsePick: false, horseCandidates: makeCandidateHorses(used, 6),
    horses: [], usedNames: used, mastery, roster: makeRoster(used),
    slate: [], entered: [], results: [], queue: [BEAT2_BRIDGES_OFFICE], flash: null, liveRace: null, study: null,
    messages: [
      { day: 1, text: `Tony Vincenzo arrives at ${yard.yardName}. Not a penny to his name — but a chance, and a big one.` },
    ],
    news: null, milestones: { firstWin: false, secondHorse: false, thirdHorse: false, listedWin: false, groupWin: false, g1Win: false, tier2Unlocked: false },
    ending: null,
    quizCount: 0, quizMissed: [],
    pressRoomUsed: {}, pressRoomFollowupDay: null,
  };
}

export function resolveHorsePick(s: GameState, chosenIds: number[]): GameState {
  const chosen = (s.horseCandidates || []).filter(h => chosenIds.includes(h.id));
  return {
    ...s,
    horses: chosen,
    horseCandidates: null,
    awaitingHorsePick: false,
    story: scheduleNemesisIntro(s.story, s.day),
    messages: [
      { day: s.day, text: `${chosen[0]?.name ?? "Your horse"} walks into the yard as your one and only. The other five go elsewhere. No going back now.` },
      ...s.messages,
    ].slice(0, 60),
  };
}

// ---------- race resolution (called from the tactics decision) ----------
export function resolveRaceDay(st: GameState, tactic: Tactic, raceId: number): GameState {
  const yard = YARD;
  const race = st.entered.find(r => r.id === raceId)!;
  const horses = st.horses.map(h => ({ ...h }));
  const me = horses.find(h => h.id === race.horseId)!;
  const msgs: { day: number; text: string }[] = [];
  const trustBefore = st.trust, reputationBefore = st.reputation, celebrityBefore = st.celebrity;
  let trust = st.trust, cash = st.cash;
  let reputation = st.reputation, celebrity = st.celebrity;
  let skill = clamp(st.skill + 3, 0, 100); // racing teaches you something regardless of result
  const mastery = { ...st.mastery };
  const milestones = { ...st.milestones };
  let results = st.results;
  let story = st.story;
  let ending = st.ending;
  let queueExtra: GameState["queue"] = [];

  // tactics modifier: plays to different stats, with hold-up carrying traffic risk
  let expMod = 1;
  if (tactic === "front") expMod = 1 + (me.brk - 60) / 100 * 0.05;
  else if (tactic === "stalk") expMod = 1 + (me.temperament - 60) / 100 * 0.03;
  else {
    expMod = 1 + (me.accel - 60) / 100 * 0.05;
    if (Math.random() < 0.1) {
      expMod *= 0.94;
      msgs.push({ day: st.day, text: `Traffic problems in the straight — ${me.name} was stopped in its run at a crucial moment.` });
    }
  }

  const { entries: rivalsDrawn } = drawField(st.roster, race, new Set(), st.usedNames);
  const nemesisHorse = story.nemesisHorseId != null ? st.roster.find(h => h.id === story.nemesisHorseId) : undefined;
  const forcingNemesis = !!(story.forceNemesisNextRace && nemesisHorse);
  const rivals = forcingNemesis ? ensureNemesisInField(rivalsDrawn, nemesisHorse!) : rivalsDrawn;
  // A Classic gets a genuinely top jockey booked, regardless of doubts —
  // "eventually the top jockey takes the horse" is treated as inevitable,
  // not a tracked choice (see storyContent.ts's media-doubts beat).
  const jkSkill = race.isClassic ? ri(93, 98) : yard.jockey.skill;
  const field = [...rivals, { horse: me, jkSkill, trainerName: yard.yardName, silk: "#14100a", player: true, expMod }];
  let res = runRace(race, field, mastery);
  if (forcingNemesis && story.scriptedFirstRaceLoss) res = forcePosition(res, nemesisHorse!.id, 1);
  const mine = res.find(r => r.player)!;

  const rivalIdSet = new Set(rivals.map(r => r.horse.id));
  const roster = st.roster.map(h => {
    if (!rivalIdSet.has(h.id)) return h;
    const r = res.find(x => x.horse.id === h.id);
    if (!r) return h;
    return { ...h, runs: h.runs + 1, wins: h.wins + (r.pos === 1 ? 1 : 0), form: [r.pos > 9 ? 0 : r.pos, ...h.form].slice(0, 6) };
  });

  if (forcingNemesis) {
    const nemesisResult = res.find(r => r.horse.id === nemesisHorse!.id)!;
    const nemesisWon = nemesisResult.pos < mine.pos;
    const headToHead = {
      wins: story.headToHead.wins + (nemesisWon ? 0 : 1),
      losses: story.headToHead.losses + (nemesisWon ? 1 : 0),
    };
    if (story.stage === "nemesisPending") {
      msgs.push({ day: st.day, text: `McLean's ${nemesisHorse!.name} gets the better of you today — exactly as he promised in the papers.` });
      queueExtra = [BEAT6_MCLEAN_TAUNT];
      story = {
        ...story, headToHead, stage: "preSecondRace", forceNemesisNextRace: false, scriptedFirstRaceLoss: false,
        bridgesAdviceDay: st.day + ri(12, 18), allyTrainerDay: st.day + ri(30, 40), secondRaceDay: st.day + ri(110, 130),
      };
    } else if (story.stage === "secondRacePending") {
      msgs.push({
        day: st.day,
        text: nemesisWon
          ? `McLean's ${nemesisHorse!.name} just gets up again. No press stunt this time, no excuses either — he was simply the better horse today.`
          : `${me.name} gets past McLean's ${nemesisHorse!.name} fair and square this time. No forced headline needed — you earned that one.`,
      });
      story = { ...story, headToHead, stage: "ongoing", forceNemesisNextRace: false };
    }
  }

  me.runs++; me.fatigue = clamp(me.fatigue + 26, 0, 100); me.fitness = clamp(me.fitness + 3, 0, 100);
  mastery[race.course] = clamp(mastery[race.course] + 6, 0, 100);
  // "Biggest prize money in the world, more than the Breeders' Cup" — a
  // one-off purse well outside the ordinary PRIZE table, not tied to grade.
  const prize = race.isDiamondCup ? (DIAMOND_CUP_PRIZE[mine.pos - 1] || 0) : (PRIZE[race.grade][mine.pos - 1] || 0);
  me.earnings += prize; cash += Math.round(prize * 0.08);
  const cmt = mine.pos === 1 ? pick(CMT_WIN) : mine.pos <= 3 ? pick(CMT_PLACE) : pick(CMT_ALSO);
  me.formLines = [{ day: st.day, year: st.year, race: race.name, course: race.course, dist: race.dist, going: GOINGS[race.going], pos: mine.pos, of: res.length, sp: mine.sp, cmt }, ...me.formLines].slice(0, 12);
  me.form = [mine.pos > 9 ? 0 : mine.pos, ...me.form].slice(0, 6);

  // first-time gear, noted the way a racecard would
  const debutGear = (me.gear || []).filter(g => !(me.gearRun || []).includes(g));
  me.gearRun = [...new Set([...(me.gearRun || []), ...(me.gear || [])])];
  if (debutGear.length) msgs.push({ day: st.day, text: `First-time ${debutGear.map(g => GEAR[g].label.toLowerCase()).join(" and ")} for ${me.name} today.` });
  if (!me.distKnown && Math.random() < 0.4) { me.distKnown = true; msgs.push({ day: st.day, text: `The way ${me.name} finished tells you something: its best trip is around ${me.prefDist}f. Noted.` }); }
  if (!me.goingKnown && Math.random() < 0.3) { me.goingKnown = true; msgs.push({ day: st.day, text: `${me.name} moved through that ground like it owned it. ${GOINGS[me.prefGoing]} — that's what it wants.` }); }
  if (me.quirk && !me.quirk.revealed && mine.pos <= 3) {
    me.quirk.revealed = true;
    const names: Record<string, string> = { balance: "beautifully balanced — turns and cambers barely touch it", brk: "electric from the gates", temperament: "utterly unflappable — it runs its race every time", accel: "capable of a genuinely smart turn of foot" };
    msgs.push({ day: st.day, text: `Now everyone can see what you saw in the bottom box: ${me.name} is ${names[me.quirk.stat]}.` });
  }
  // Trust/Reputation/Celebrity are left unclamped through all three branches
  // below — perception-metric overflow is resolved once, right after this
  // block, via applyPerceptionOverflow (lib/game/metrics.ts). Skill keeps
  // its own ordinary clamp; overflow is a perception-metric-only concept.
  if (race.isDiamondCup) {
    // The finale — biggest deltas in the game, no diminishing returns
    // (it only ever happens once). Ending is computed after the overflow
    // step below, not here — it needs the final, post-overflow values, or
    // a borderline verdict could be decided on since-corrected numbers.
    const outcome = resolveDiamondCupOutcome(story, me.name, mine.pos, res.length);
    trust = trust + outcome.trust;
    reputation = reputation + outcome.reputation;
    celebrity = celebrity + outcome.celebrity;
    skill = clamp(skill + outcome.skill, 0, 100);
    story = { ...outcome.story, stage: "ended" };
    msgs.push({ day: st.day, text: outcome.message });
    if (mine.pos === 1) {
      me.wins++; me.morale = clamp(me.morale + 10, 0, 100);
      milestones.g1Win = true; milestones.groupWin = true;
    } else if (mine.pos > res.length - 2) {
      me.morale = clamp(me.morale - 4, 0, 100);
    }
  } else if (race.isClassic) {
    // The Classics use their own diminishing-returns outcome system instead
    // of the ordinary grade-weighted trust/reputation logic below — applying
    // both would double-count.
    const cleanRaceName = race.name.replace(/\s*\([^)]*\)$/, "");
    const outcome = resolveClassicOutcome(story, st.day, cleanRaceName, me.name, mine.pos, res.length);
    trust = trust + outcome.trust;
    reputation = reputation + outcome.reputation;
    celebrity = celebrity + outcome.celebrity;
    skill = clamp(skill + outcome.skill, 0, 100);
    story = outcome.story;
    msgs.push({ day: st.day, text: outcome.message });
    if (mine.pos === 1) {
      me.wins++; me.morale = clamp(me.morale + 10, 0, 100);
      if (!milestones.firstWin) { milestones.firstWin = true; msgs.push({ day: st.day, text: `Your first winner as an assistant. The head lad shakes your hand. It starts here.` }); }
      milestones.g1Win = true; milestones.groupWin = true;
    } else if (mine.pos > res.length - 2) {
      me.morale = clamp(me.morale - 4, 0, 100);
    }
  } else {
    const gw = gradeWeight(race.grade);
    if (mine.pos === 1) {
      me.wins++; me.morale = clamp(me.morale + 10, 0, 100); trust = trust + (typeof race.grade === "number" ? 5 : 10);
      reputation = reputation + gw;
      if (race.grade === "G1") { celebrity = celebrity + 10; msgs.push({ day: st.day, text: `The racing press is all over this one — a Group 1 winner from the bottom box makes a story too good to ignore.` }); }
      else if (race.grade === "G2") celebrity = celebrity + 5;
      msgs.push({ day: st.day, text: `${me.name} WINS the ${race.name}! ${pick(yard.praise)}` });
      if (!milestones.firstWin) { milestones.firstWin = true; msgs.push({ day: st.day, text: `Your first winner as an assistant. The head lad shakes your hand. It starts here.` }); }
      if (race.grade === "L" && !milestones.listedWin) milestones.listedWin = true;
      if ((race.grade === "G3" || race.grade === "G2") && !milestones.groupWin) milestones.groupWin = true;
      if (race.grade === "G1" && !milestones.g1Win) milestones.g1Win = true;
    } else if (mine.pos <= 3) {
      reputation = reputation + Math.max(1, Math.round(gw / 3));
      msgs.push({ day: st.day, text: `${me.name} finishes ${mine.pos} of ${res.length}. Plenty to build on.` });
    } else {
      if (mine.pos > res.length - 2) {
        trust = trust - 2;
        reputation = reputation - Math.max(1, Math.round(gw / 4));
        msgs.push({ day: st.day, text: `Well beaten. ${pick(yard.scold)}` });
      } else msgs.push({ day: st.day, text: `${me.name} finishes ${mine.pos} of ${res.length}. Back to the drawing board.` });
      me.morale = clamp(me.morale - (mine.pos > 5 ? 4 : 0), 0, 100);
    }
  }

  // --- perception-metric overflow, resolved once for whichever branch ran ---
  const overflowed = applyPerceptionOverflow(
    { trust: trustBefore, reputation: reputationBefore, celebrity: celebrityBefore },
    { trust: trust - trustBefore, reputation: reputation - reputationBefore, celebrity: celebrity - celebrityBefore },
  );
  trust = overflowed.trust; reputation = overflowed.reputation; celebrity = overflowed.celebrity;

  if (race.isDiamondCup) {
    ending = computeEnding(trust, reputation, celebrity);
    msgs.push({ day: st.day, text: ending.text });
  }

  // --- string grows on results, not trust: a place earns a second horse,
  // a third career win earns a third. Applies to any race, not just Classics. ---
  if (!milestones.secondHorse && mine.pos <= 3) {
    milestones.secondHorse = true;
    const h2 = makeHorse(58, st.usedNames, { age: 2, fitness: 30 });
    horses.push(h2);
    msgs.push({ day: st.day, text: `A second box is yours: ${h2.name} joins the yard.` });
    queueExtra = [...queueExtra, makeNewHorseAnnouncement(h2.name, "second")];
  }
  const totalWins = horses.reduce((sum, h) => sum + h.wins, 0);
  if (milestones.secondHorse && !milestones.thirdHorse && totalWins >= 3) {
    milestones.thirdHorse = true;
    const h3 = makeHorse(62, st.usedNames, { age: 2, fitness: 30 });
    horses.push(h3);
    msgs.push({ day: st.day, text: `A third box is yours: ${h3.name} joins the yard.` });
    queueExtra = [...queueExtra, makeNewHorseAnnouncement(h3.name, "third")];
  }

  // --- the handicapper's letter: the official mark only moves when the form is reviewed ---
  if (me.mark == null) {
    me.mark = OR(me);
    msgs.push({ day: st.day, text: `The handicapper has seen enough: ${me.name} is given an official rating of ${me.mark} for the first time. Entries from here are judged on that number, not on what you privately know about the horse.` });
  } else {
    const winMargin = mine.pos === 1 ? (res[1] ? res[1].gap : 1) : null;
    let delta = 0, why = "";
    if (mine.pos === 1) {
      if (winMargin! >= 2.5) { delta = ri(6, 9); why = "a dominant, taking-the-eye success"; }
      else { delta = ri(3, 6); why = "a clear-cut win"; }
    } else if (mine.pos <= 3) {
      if (mine.gap < 1) { delta = ri(1, 3); why = "another good effort, close up in defeat"; }
    } else if (mine.gap > 4) { delta = -ri(3, 6); why = "a well-below-form run"; }
    else if (mine.gap > 2) { delta = -ri(1, 3); why = "a moderate effort"; }
    if (delta !== 0) {
      me.mark = clamp(me.mark + delta, 20, 130);
      msgs.push({ day: st.day, text: `Letter from the handicapper: ${me.name} is ${delta > 0 ? "raised" : "eased"} ${Math.abs(delta)}lb to a new mark of ${me.mark}, after ${why}.` });
    }
  }
  // Race-day is the one place Trust/Reputation/Celebrity change outside a
  // decision's own reveal-after text — state the actual deltas here rather
  // than leaving them to change silently, same convention as note()'s
  // "(Metric ±N.)" suffix on decisions.
  const dTrust = trust - trustBefore, dRep = reputation - reputationBefore, dCel = celebrity - celebrityBefore;
  if (dTrust !== 0 || dRep !== 0 || dCel !== 0) {
    const fmt = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
    msgs.push({
      day: st.day,
      text: `Trust ${fmt(dTrust)}, Reputation ${fmt(dRep)}, Celebrity ${fmt(dCel)}.`,
    });
  }
  // Threshold-crossing detection is NOT done here — resolveRaceDay is only
  // ever invoked through a "Riding instructions" decision's apply(), so
  // chooseDecision's own wrapper (which runs after any apply() returns)
  // already catches every race-day threshold crossing too. Checking it a
  // second time here would double both the message and the cash reward —
  // caught via a long scripted playthrough showing a duplicated "Trust
  // crosses 80... Trust crosses 80" message.
  // Post-race press for ordinary races only — the Classics/Diamond Cup/
  // nemesis arc already have their own dedicated reaction content.
  if (!race.isClassic && !race.isDiamondCup && Math.random() < 0.35) {
    queueExtra = [...queueExtra, makePostRacePress(me.name, race.name, mine.pos === 1)];
  }
  results = [{ race, res, mine, cmt }, ...results].slice(0, 30);
  return {
    ...st, horses, roster, trust, cash, reputation, celebrity, skill, mastery, milestones, results,
    entered: st.entered.filter(r => r.id !== raceId), story, ending,
    queue: [...st.queue, ...queueExtra],
    liveRace: {
      raceName: race.name, beats: makeBeats(race, res, mine, tactic), idx: 0, track: computeRaceTrack(res, mine, tactic),
      course: race.course, dist: race.dist,
    },
    messages: [...msgs, ...st.messages].slice(0, 60),
  };
}

// ---------- day advance ----------
export function advanceDay(s: GameState, plan: Record<number, TrainingPlan>, walkPlan: CourseName | null): GameState {
  const yard = YARD;
  const horses = s.horses.map(h => ({ ...h }));
  const msgs: { day: number; text: string }[] = [];
  let newsLine: string | null = null;
  const trust = s.trust, cash = s.cash, reputation = s.reputation, celebrity = s.celebrity;
  let skill = s.skill;
  const mastery = { ...s.mastery };
  const milestones = { ...s.milestones };
  const results = s.results;
  let slate = s.slate;
  let queue: GameState["queue"] = [];
  let entered = s.entered;
  let story = s.story;

  // --- going update, a few days out: weather can turn a declared race against
  // you. Per-entry now (not a whole-day early return) so one race's going
  // changing doesn't stop the rest of the string training that day. ---
  entered = entered.map(e => {
    if (e.raceDay - s.day !== 3 || Math.random() >= 0.4) return e;
    const me = horses.find(h => h.id === e.horseId);
    const newGoing = clamp(e.going + pick([-1, 1, 1]), 1, 4); // rain more likely than a dry-out, as in Britain
    if (!me || newGoing === e.going) return e;
    const clash = me.goingKnown && Math.abs(me.prefGoing - newGoing) >= 2;
    queue = [...queue, {
      title: "The going has changed",
      text: `Overnight rain at ${e.course} — the official going for the ${e.name} is now ${GOINGS[newGoing]}, not ${GOINGS[e.going]} as declared. ${
        me.goingKnown ? `You know ${me.name} wants ${GOINGS[me.prefGoing]}.` : `You don't yet know for certain what ground ${me.name} prefers.`
      } ${clash ? "This looks like a poor fit." : ""}`,
      choices: [
        { label: "Run anyway", hint: clash ? "risks a well-below-form run on unsuitable ground" : "probably fine", apply: st => note(st, `${me.name} takes its chance regardless. The decision is made.`) },
        { label: "Withdraw the horse", hint: "no run, no risk — but the boss loses the entry", apply: st => note({ ...st, entered: st.entered.filter(x => x.id !== e.id), trust: clamp(st.trust - 3, 0, 100) },
          `${me.name} is withdrawn. ${yard.boss}: "${pick(["Fair enough — no sense chancing it.", "Your call. I trust your reasons.", "Costs us the entry fee, mind."])}"`) },
      ],
    }];
    return { ...e, going: newGoing };
  });

  // --- race day(s)? route each one due today through its own parade-ring
  // tactics decision. Per-entry (not a whole-day early return) so a race for
  // one horse doesn't block training/reporting for the rest of the string. ---
  const raceDueToday = new Set<number>(); // horseIds racing today — skip their training below
  entered = entered.filter(e => {
    if (e.raceDay > s.day) return true;
    const me = horses.find(h => h.id === e.horseId);
    if (!me || me.injuryDays > 0) {
      // A scratched Classic/Diamond Cup can't just vanish — nothing else
      // ever re-triggers that arc otherwise, permanently stalling Act 2/3.
      // See skipClassic/rescheduleDiamondCup in story.ts.
      if (e.isClassic) {
        story = skipClassic(story, s.day);
        msgs.push({ day: s.day, text: classicScratchedMessage(e.name.replace(/\s*\([^)]*\)$/, ""), me?.name ?? "Your runner") });
      } else if (e.isDiamondCup) {
        story = rescheduleDiamondCup(story, s.day);
        msgs.push({ day: s.day, text: `${me ? me.name : "Your runner"} is scratched from the Diamond Cup — not fit to take its chance. Bridges is already talking about another entry.` });
      } else {
        msgs.push({ day: s.day, text: `${me ? me.name : "Your runner"} is scratched — not fit to take its chance.` });
      }
      return false;
    }
    raceDueToday.add(me.id);
    const nemesisPreRaceLine = (s.story.forceNemesisNextRace && s.story.stage === "secondRacePending")
      ? ` McLean's already at it in the press: "Should be a good renewal this year — might even be competitive."`
      : "";
    const tacticsEvent: GameState["queue"][number] = {
      title: "Riding instructions",
      text: `${yard.jockey.name} legs up in the parade ring before the ${e.name}. "How do you want ${me.name} ridden?"${nemesisPreRaceLine}`,
      choices: [
        { label: `Break sharp and make the running (plays to break: ${Math.round(me.brk)})`, apply: st => resolveRaceDay(st, "front", e.id) },
        { label: `Settle just off the pace (plays to temperament: ${Math.round(me.temperament)})`, apply: st => resolveRaceDay(st, "stalk", e.id) },
        { label: `Hold up for one late run (plays to accel: ${Math.round(me.accel)}, traffic risk)`, apply: st => resolveRaceDay(st, "hold", e.id) },
      ],
    };
    if (s.story.forceNemesisNextRace && s.story.stage === "nemesisPending") {
      queue = [...queue, BEAT5_REPORTER_PRE_RACE, tacticsEvent];
    } else if (!e.isClassic && !e.isDiamondCup && Math.random() < 0.4) {
      // Pre-race press for ordinary races — the scripted nemesis race and
      // the Classics/Diamond Cup already get their own dedicated press beats.
      queue = [...queue, makePreRacePress(me.name, e.name), tacticsEvent];
    } else {
      queue = [...queue, tacticsEvent];
    }
    return true; // stays in `entered` until resolveRaceDay actually resolves it
  });

  // --- course walk: takes your whole day, so the string just ticks over ---
  const walking = walkPlan && COURSES[walkPlan];

  // --- daily training (non-race days, per horse plan; easy day if you're away walking) ---
  // Skill (an XP bar, never falls — see CLAUDE.md "The four metrics") scales
  // active-training gains up to +30% at 100, surfacing what was previously a
  // hidden, hardcoded training-effectiveness constant.
  const skillMult = 1 + (s.skill / 100) * 0.3;
  // "sharp" is deliberately gentler than the five focused types — a bit of
  // everything instead of one stat hard, lower fatigue, no injury risk. The
  // natural choice once a horse is nearing its ceiling (see statCeilings)
  // or just for upkeep between hard sessions.
  const ACTIVE_TRAINING: TrainingPlan[] = ["gallop", "canter", "sprints", "stalls", "school", "sharp"];
  const TRAINING_LABEL: Record<string, string> = {
    gallop: "gallop work", canter: "canter work", sprints: "sprint work", stalls: "stalls schooling",
    school: "schooling", sharp: "a sharpening spin", easy: "an easy day", rest: "a full rest day",
  };
  const PRIMARY_STAT: Partial<Record<string, { key: "speed" | "stamina" | "accel" | "brk" | "balance"; label: string }>> = {
    gallop: { key: "speed", label: "speed" }, canter: { key: "stamina", label: "stamina" },
    sprints: { key: "accel", label: "accel" }, stalls: { key: "brk", label: "break" }, school: { key: "balance", label: "balance" },
  };
  const skillBefore = skill;
  let trainedActively = false;
  // Morning report: what changed since yesterday — per user feedback, day-to-day
  // progress was invisible unless something dramatic happened.
  const reportLines: string[] = [];
  horses.forEach(h => {
    if (h.injuryDays > 0) {
      h.injuryDays--; h.fatigue = Math.max(0, h.fatigue - 12);
      reportLines.push(`${h.name}: on the easy list, ${h.injuryDays} day${h.injuryDays === 1 ? "" : "s"} left.`);
      return;
    }
    if (raceDueToday.has(h.id)) {
      reportLines.push(`${h.name}: race day — resting up for it, no training.`);
      return;
    }
    const p = walking ? "easy" : (plan[h.id] || "easy");
    if (!walking && ACTIVE_TRAINING.includes(p)) trainedActively = true;
    const gains: Record<string, Record<string, number>> = {
      gallop: { speed: 0.9, fitness: 2.5, fat: 6 },
      canter: { stamina: 0.9, fitness: 2, fat: 4 },
      sprints: { accel: 0.9, fitness: 1.5, fat: 6 },
      stalls: { brk: 1.0, fitness: 0.5, fat: 3 },
      school: { balance: 1.0, fitness: 0.5, fat: 3 },
      sharp: { speed: 0.25, stamina: 0.25, accel: 0.25, brk: 0.25, balance: 0.25, fitness: 1.2, fat: 2 },
      easy: { fitness: 0.5, fat: -10 },
      rest: { fat: -18 },
    };
    const g = gains[p] || { fitness: 0.5, fat: -10 };
    const mult = ACTIVE_TRAINING.includes(p) ? skillMult : 1;
    const nearCeiling = new Set<string>();
    Object.entries(g).forEach(([k, v]) => {
      if (k === "fat") { h.fatigue = clamp(h.fatigue + v, 0, 100); return; }
      if (k === "fitness") { h.fitness = clamp(h.fitness + v, 0, 100); return; }
      const stat = h as unknown as Record<string, number>;
      const ceiling = h.statCeilings[k as keyof Horse["statCeilings"]];
      const before = stat[k];
      stat[k] = clamp(Math.round((before + v * mult * (1 - before / ceiling) * 2) * 10) / 10, 0, ceiling);
      if (ceiling - stat[k] < 2) nearCeiling.add(k);
    });
    if (p === "rest") h.morale = clamp(h.morale + 2, 0, 100);
    if (!walking) {
      const primary = PRIMARY_STAT[p];
      reportLines.push(
        primary && nearCeiling.has(primary.key)
          ? `${h.name} trained well today, but seems to be reaching full potential — there might not be much more ${primary.label} to find.`
          : primary
            ? `${h.name}: ${TRAINING_LABEL[p]} — ${primary.label} now ${Math.round(h[primary.key])}.`
            : `${h.name}: ${TRAINING_LABEL[p]}.`,
      );
    }
    if (["gallop", "sprints"].includes(p) && Math.random() < 0.02 + (h.fatigue / 100) * 0.05) {
      h.injuryDays = ri(3, 9);
      msgs.push({ day: s.day, text: `${h.name} pulled up short on the gallops — ${h.injuryDays} days on the easy list.` });
    }
  });
  // Skill is an XP bar with a diminishing approach curve, same shape as horse
  // stats' ceiling-targeting formula — was a flat +1/day with a hard stop at
  // 100 before, which just abruptly froze rather than visibly slowing down.
  if (trainedActively) skill = clamp(Math.round((skill + 1 * (1 - skill / 100)) * 10) / 10, 0, 100);

  if (walking) {
    mastery[walkPlan!] = clamp(mastery[walkPlan!] + 8, 0, 100);
    skill = clamp(Math.round((skill + 4 * (1 - skill / 100)) * 10) / 10, 0, 100);
    reportLines.push(`Spent the day at ${walkPlan}, walking every yard from stalls to winning post — course knowledge now ${Math.round(mastery[walkPlan!])}/100. The string had an easy day back home.`);
  }
  if (skill > skillBefore) reportLines.push(`Skill: +${(Math.round((skill - skillBefore) * 10) / 10).toFixed(1)} (now ${Math.round(skill)}/100).`);

  // --- passive study: +1/day, with occasional windfalls from racing people ---
  const study = s.study;
  if (study && COURSES[study]) {
    mastery[study] = clamp(mastery[study] + 1, 0, 100);
    if (Math.random() < 0.05) {
      const boost = ri(6, 12);
      mastery[study] = clamp(mastery[study] + boost, 0, 100);
      msgs.push({ day: s.day, text: pick([
        `A retired jockey in the pub turns out to have ridden ${study} a hundred times — an hour of stories and your notebook fills up. +${boost} ${study} knowledge.`,
        `An old head lad walks you through his ${study} theories over tea. Gold dust. +${boost} ${study} knowledge.`,
        `You spend the evening on race replays from ${study}, and something clicks about how it rides. +${boost} ${study} knowledge.`,
      ]) });
    }
  }

  // --- scripted Act 1 story beats take priority over the normal random roll ---
  // Threads through this tick's already-accumulated entered/story/queue/msgs
  // (e.g. a same-day scratch) so a trigger firing here doesn't silently
  // discard them — before the going-change/race-day branches stopped
  // early-returning, this call always ran with nothing yet accumulated, so
  // this merge wasn't needed; now it is.
  const storyTriggered = checkStoryTriggers({
    ...s, horses, mastery, skill, entered, story, slate, queue,
    messages: [...msgs, ...s.messages].slice(0, 60),
  });
  if (storyTriggered) return storyTriggered;

  // --- day content: quiet / news / decision — decision odds raised (18%->30%)
  // and "nothing at all" cut (22%->15%) per feedback that early game felt thin ---
  const roll = Math.random();
  if (roll < 0.35) newsLine = pick(QUIET_DAYS);
  else if (roll < 0.5) {
    newsLine = pick(NEWS_LINES(yard, Object.keys(COURSES)));
  } else if (roll < 0.8) {
    // ~30% of decision-days are a quiz instead of an ordinary training
    // moment — keeps total decision frequency unchanged.
    const tm = Math.random() < 0.3 ? quizMoment({ ...s, horses }) : trainingMoment({ ...s, horses });
    if (tm) queue = [tm]; else newsLine = pick(QUIET_DAYS);
  } else newsLine = null;

  // --- new race slate every few days ---
  const myBest = horses.filter(h => h.injuryDays === 0).sort((a, b) => OR(b) - OR(a))[0];
  if (myBest && (slate.length === 0 || Math.random() < 0.35)) {
    slate = makeSlate(s.day + 1, unlockedCourses(reputation), effRating(myBest));
    if (slate.length) reportLines.push(`New entries up: ${slate.map(r => r.name).join(", ")}.`);
  }

  // --- milestone: tier-2 tracks unlock once Reputation clears the bar ---
  if (!milestones.tier2Unlocked && reputation >= 35) {
    milestones.tier2Unlocked = true;
    msgs.push({ day: s.day, text: `Word is getting around about you. ${yard.boss}: "You've earned a look at the bigger tracks — Ascot, York, Chester, Doncaster. Don't waste it." Entries are open at the tier-2 courses from today.` });
  }

  // --- Press Room: a "pick a fight" action can schedule a rival comeback a
  // few days out — plain day-number data, not a stored closure, since state
  // has to survive JSON.stringify for localStorage. Checked the same way as
  // the trade-offer milestone just below. ---
  let pressRoomFollowupDay = s.pressRoomFollowupDay;
  if (pressRoomFollowupDay !== null && s.day >= pressRoomFollowupDay) {
    pressRoomFollowupDay = null;
    queue = [...queue, makeRivalClapback()];
  }

  // --- milestone: swap offers (second/third horse are earned via race results now — see resolveRaceDay) ---
  if (trust >= 75 && horses.length >= 2 && Math.random() < 0.03) {
    const worst = [...horses].sort((a, b) => OR(a) - OR(b))[0];
    const better = makeHorse(clamp(OR(worst) + ri(10, 18), 40, 96) / 1.18, s.usedNames, { fitness: 40 });
    queue = [...queue, {
      title: `${yard.boss} offers a trade`,
      text: `"An owner wants ${worst.name} for their daughter to hunter-trial, and I've a better one needing a patient hand: ${better.name}, rated around ${OR(better)}. Straight swap. Your call."`,
      choices: [
        { label: `Swap ${worst.name} for ${better.name}`, apply: st => note({ ...st, horses: [...st.horses.filter(x => x.id !== worst.id), better] }, `${worst.name} leaves for a good home. ${better.name} walks into the yard — a clear step up.`) },
        { label: "Keep the string as it is", apply: st => note(st, `Loyalty has its own value. ${worst.name} stays.`) },
      ],
    }];
  }

  // --- year rollover: 365 days ---
  let day = s.day + 1, year = s.year;
  if (day > 365) {
    day = 1; year++;
    horses.forEach(h => { h.age++; h.fitness = clamp(h.fitness - 15, 0, 100); });
    msgs.push({ day: 1, text: `Year ${year} begins. The horses have wintered well. Bigger targets this season?` });
  }

  // Morning report first (mechanical: training/skill/slate), then notable
  // events (injuries, milestones), then ambient flavour — always shown, even
  // on a day that also queues a decision: DecisionOverlay (z-31) renders over
  // DailyFlashOverlay (z-30), so the report surfaces right after the decision
  // is dismissed instead of being silently dropped. Per feedback that
  // day-to-day change was otherwise invisible.
  const flashLines = [...reportLines, ...msgs.map(m => m.text), ...(newsLine ? [newsLine] : [])];
  return {
    ...s, day, year, horses, trust, cash, reputation, celebrity, skill, mastery, slate, entered, story, results, milestones,
    messages: [...msgs, ...s.messages].slice(0, 60), news: newsLine, queue,
    flash: flashLines.length ? flashLines : null,
    pressRoomUsed: {}, pressRoomFollowupDay,
  };
}

export function chooseDecision(s: GameState, i: number): GameState {
  const d = s.queue[0];
  if (!d) return s;
  const next = d.choices[i].apply(s);
  // chooseDecision is the one place every decision-driven metric change
  // already flows through, so threshold-crossing detection lives here
  // rather than in every individual apply() — see lib/game/metrics.ts.
  const events = checkThresholds(s, next, YARD.boss.split(" ")[0]);
  const withThresholds = events.length
    ? {
      ...next,
      cash: next.cash + events.reduce((sum, e) => sum + e.cash, 0),
      messages: next.messages.length
        ? [{ ...next.messages[0], text: `${next.messages[0].text} ${events.map(e => e.text).join(" ")}` }, ...next.messages.slice(1)]
        : [{ day: next.day, text: events.map(e => e.text).join(" ") }, ...next.messages],
    }
    : next;
  return { ...withThresholds, queue: withThresholds.queue.slice(1) };
}

export function enterRace(s: GameState, raceOpt: RaceCard, horseId: number): GameState {
  if (s.entered.some(e => e.horseId === horseId)) return s; // defensive: UI shouldn't offer this, but don't double-book
  // A one-off indicative preview of likely opposition, drawn the same way a
  // real field is drawn — not locked in or reused at resolution, so it's
  // "who you're probably up against," not a guarantee. See CLAUDE.md.
  const { entries } = drawField(s.roster, raceOpt, new Set(), s.usedNames);
  const fieldPreview = entries.map(e => ({ name: e.horse.name, trainerName: e.trainerName ?? "unattached", mark: e.horse.mark ?? Math.round(OR(e.horse)) }));
  return {
    ...s,
    entered: [...s.entered, { ...raceOpt, horseId, fieldPreview }],
    slate: s.slate.filter(r => r.id !== raceOpt.id),
    messages: [{ day: s.day, text: `Declared: ${s.horses.find(h => h.id === horseId)!.name} in the ${raceOpt.name}, ${raceOpt.dist}f, day ${raceOpt.raceDay}.` }, ...s.messages].slice(0, 60),
  };
}
