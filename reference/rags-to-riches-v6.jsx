import React, { useState } from "react";

// ================================================================
// THE YARD: RAGS TO RICHES
// You are a young assistant trainer. Pick a yard, take on the horse
// nobody wants, learn your tracks deeply, and build toward a Group 1.
// ================================================================

// ---------- utils ----------
let uid = 1;
const nid = () => uid++;
const rnd = (a, b) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rnd(a, b + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const gauss = () => (Math.random()+Math.random()+Math.random()+Math.random()-2)/2;
const money = n => "£" + Math.round(n).toLocaleString();

// ---------- courses: rich, factual profiles ----------
// sharpness: how tight the turns are (0 flat/galloping – 3 very tight)
// undulation: gradients and camber (0 flat – 3 severe)
// finishClimb: uphill finish testing stamina (0 none – 2 stiff)
// All notes written originally from general racing knowledge.
const COURSES = {
  York: { going: 2, sharpness: 0, undulation: 0, finishClimb: 0, hand: "left",
    line: "Left-handed, wide and flat on the Knavesmire — one of the fairest tracks in Britain." },
  Chester: { going: 2, sharpness: 3, undulation: 0, finishClimb: 0, hand: "left",
    line: "The Roodee: barely a mile round, constantly turning left, the tightest track in the country." },
  Newmarket: { going: 1, sharpness: 0, undulation: 2, finishClimb: 1, hand: "right",
    line: "Wide, open and undulating — the Rowley Mile's famous Dip catches horses out late." },
  Ascot: { going: 2, sharpness: 1, undulation: 1, finishClimb: 2, hand: "right",
    line: "A galloping right-handed track with a stiff climb through the final two furlongs." },
  Epsom: { going: 2, sharpness: 2, undulation: 3, finishClimb: 1, hand: "left",
    line: "The Derby course: uphill, then plunging downhill through cambered Tattenham Corner." },
  Sandown: { going: 3, sharpness: 1, undulation: 1, finishClimb: 2, hand: "right",
    line: "Right-handed with a famous uphill finish from the two-furlong pole." },
  Doncaster: { going: 2, sharpness: 0, undulation: 0, finishClimb: 0, hand: "left",
    line: "Flat, wide and galloping on Town Moor — form tends to work out honestly here." },
  Goodwood: { going: 1, sharpness: 2, undulation: 2, finishClimb: 0, hand: "right",
    line: "A sharp, undulating switchback cut into the Sussex Downs — front-runners do well." },
};
const GOINGS = ["", "Good to Firm", "Good", "Good to Soft", "Soft"];

// Track insights unlocked by mastery (20/40/60/80/95). Realistic, original wording.
const INSIGHTS = {
  York: [
    "The Knavesmire is broad and level, so wide draws are rarely the death sentence they can be elsewhere.",
    "With long, easy bends and a wide straight, hold-up horses get every chance to deliver a late run.",
    "Because the track is so fair, beaten favourites here usually have a genuine fitness or ability excuse — not a track one.",
    "In big-field sprints on the round course a low-to-middle draw can carry a mild edge, but it's far weaker than at sharp tracks.",
    "The five-furlong course is stiff for the trip — pure speedballs can get worn down late by stronger stayers-at-the-trip.",
  ],
  Chester: [
    "Low draws are gold at Chester: with the field always turning left, ground lost on the first bend is almost never recovered in sprints.",
    "The home straight is barely a furlong and a half — a horse still off the pace at the turn has already lost.",
    "Long-striding gallopers struggle on the constant turn; neat, well-balanced horses with quick acceleration excel.",
    "Early pace matters more here than almost anywhere: breaking sharply and taking a position saves lengths every lap.",
    "Course specialists are a real phenomenon at Chester — a proven track record here is worth more than raw ratings.",
  ],
  Newmarket: [
    "The Rowley Mile's Dip — a downhill run into a rising finish — unbalances horses just when the race is being decided.",
    "The July Course and Rowley Mile ride differently; on both, the wide open spaces suit long-striding gallopers.",
    "After rain, one strip of this very wide track can ride noticeably quicker — watch where the winners are coming from early on the card.",
    "Races here often develop in two groups across the wide course, and jockeys' choice of side can decide the finish.",
    "A horse must truly stay the trip: the stiff finish exposes anything getting home on fumes.",
  ],
  Ascot: [
    "The last two furlongs climb all the way to the line — speed without stamina gets found out in the final hundred yards.",
    "On the straight course in soft ground, the stands' side rail often rides quicker in big fields.",
    "The round mile starts on a separate chute and the field arrives at Swinley Bottom quickly — position through there matters.",
    "Course-and-distance winners repay respect here: handling the climb is a repeatable skill.",
    "Ascot's straight is one of the stiffest tests at every trip: horses effective here often prove better than their bare form.",
  ],
  Epsom: [
    "Balance is everything: the camber through Tattenham Corner throws unbalanced horses toward the far rail at racing speed.",
    "The first half-mile of the Derby course climbs steeply — a keen horse that fights the rider early pays for it on the hill.",
    "The descent into the straight is the fastest ground on the course: horses that let themselves run downhill gain lengths.",
    "In the straight the ground falls away toward the far rail, so horses under pressure tend to drift left off a true line.",
    "The five-furlong course is the fastest in the world — almost all downhill — and fast starters are devastating there.",
  ],
  Sandown: [
    "The uphill finish from the two-pole is the defining feature: true stayers at the trip surge past one-paced rivals late.",
    "Sprints run on the separate straight five can favour the far-side group when the ground eases.",
    "The long run from Esher bend to the line gives patient jockeys time — no need to panic early in the straight.",
    "Horses stepping up in distance often improve past their ratings here, flattered by that stamina-rewarding climb.",
    "Heavy ground at Sandown is among the most gruelling in the country — proven mudlarks only.",
  ],
  Doncaster: [
    "Town Moor is flat and fair — the best horse on the day usually wins, with few hard-luck stories.",
    "The long straight suits hold-up horses; there is time to weave through a field.",
    "The St Leger trip of one mile six here is a true stamina test despite the flat profile.",
    "Draw bias is minimal in most conditions; concentrate on form and fitness rather than stall numbers.",
    "The round course's easy turns let big, long-striding horses keep their rhythm all the way.",
  ],
  Goodwood: [
    "Front-runners and prominent racers thrive: the turns come quickly and lost ground is hard to recover.",
    "The switchback profile — uphill, downhill, turning — demands a nimble, well-balanced horse.",
    "Summer ground here is often genuinely quick; confirmed fast-ground horses improve for the surface.",
    "In shorter races the home turn arrives fast, and hold-up rides need luck as gaps close quickly.",
    "The undulations make it hard for jockeys to judge pace — even fractions are rare, and races get tactical.",
  ],
};
const MASTERY_STEPS = [20, 40, 60, 80, 95];

// ---------- help: racing terms for non-racing people + how the game works ----------
const HELP = [
  { section: "THE HORSE'S NUMBERS", items: [
    ["Speed", "Raw pace — how fast the horse can go flat out. The engine."],
    ["Stamina", "How long it can sustain its effort. Vital in longer races and at tracks with uphill finishes (Ascot, Sandown)."],
    ["Accel", "Acceleration — the 'turn of foot'. How quickly it can quicken from cruising to sprinting when the race gets serious."],
    ["Break", "How sharply it leaves the starting stalls. Real racing term — commentators say a horse 'broke well' or was 'slowly away'. Crucial in sprints (5-6f), where a slow start can't be recovered; less important over longer trips. Improved by stalls schooling."],
    ["Balance", "How well it handles turns, cambers and undulating ground. A beautifully balanced horse loses nothing at tight or switchback tracks like Chester and Epsom; an unbalanced one gets thrown around."],
    ["Temper't", "Temperament — consistency. A calm, professional horse runs close to its ability every time; a quirky one throws in stinkers and surprises. In game terms: high temperament = less randomness in results."],
    ["Fitness", "Race-readiness, built through work. An unfit horse can't show its true ability — this is why horses 'need the run' after a layoff."],
    ["Fatigue", "Tiredness from work and racing. High fatigue hurts performance and raises injury risk. Rest and easy days bring it down."],
  ]},
  { section: "READING THE RACING", items: [
    ["OR", "Official Rating — a single number summarising ability, like a chess rating. Real British racing uses the same scale: ~50-70 is modest, 80+ is useful, 95+ is Group class, 110+ is elite."],
    ["Form (e.g. 3241)", "The horse's recent finishing positions, oldest to newest. A '0' means it finished out of the first nine. Real racecards use exactly this notation."],
    ["Trip", "The race distance. 'Best trip: 8f' means the horse is most effective over a mile. A furlong (f) is 220 yards — 8f = 1 mile."],
    ["Going", "Ground condition, from Good to Firm (fast) through Good to Soft, to Soft (slow and testing). Most horses have a clear preference — finding it is half the trainer's art."],
    ["SP", "Starting Price — the horse's final betting odds, e.g. 7/2. 'F' marks the favourite. Shorter odds = the market expects it to win."],
    ["Class / Listed / Group", "The quality ladder: Class 6 (modest handicaps) up through Listed races to Group 3, 2, and 1 — the elite. Winning a Group 1 is the summit of the sport."],
  ]},
  { section: "HOW THE GAME WORKS", items: [
    ["Daily training", "Each day, set one work type per horse. Gallop builds speed, canter stamina, sprints acceleration, stalls the break, schooling balance. Easy days and rest recover fatigue. Hard work risks injury — especially on a tired horse."],
    ["Decisions", "Choices that pop up show what they play to. Rough guide: bold options carry upside plus risk (injury, fatigue, morale); cautious options bank a small safe gain. Consequence hints appear under each choice."],
    ["Hidden traits", "Your horse's going and trip preferences start unknown ('?'). Races and training hunches reveal them. The rags horse also hides one genuine gift — results will bring it out."],
    ["Course knowledge", "Three ways to build it (Notebook tab): racing at a track (+6), walking the course (+8 — but it takes your whole day, so the horses just have an easy day), and studying a course (+1 every day, passive — with occasional windfalls when you pick the brains of racing people). It's worth up to 5% performance at that track, echoing how course specialists work in real racing, and unlocks genuine insights about how each track rides."],
    ["Race day", "You choose riding instructions in the parade ring — each plays to a different stat, shown on the button. Then the race unfolds in commentary beats."],
    ["Trust", "Your standing with the boss. Wins build it; embarrassments dent it. Higher trust brings a second horse, trade-up offers, and entry to bigger races."],
    ["The calendar", "Five big races each year, Listed up to Group 1. Locked until you have a horse near the required OR — the boss won't waste entries. The Group 1 is the rags-to-riches finish line."],
    ["Gear", "Real racecard equipment (Stable tab): blinkers sharpen focus but can backfire on a horse that didn't need it; cheekpieces are a gentler version; a tongue tie is a safe, modest aid; a hood calms a nervy traveller without adding speed. First-time gear use is flagged, just as it is on a real racecard."],
    ["Official mark vs. true ability (OR)", "OR is your private read of the horse's real ability. The mark is what the handicapper has actually assigned — it only updates after a run, based on how you performed, and is what decides which races you're eligible for. A horse can be 'well handicapped' (better than its mark suggests) or slightly flattered by it — real racing works exactly this way."],
    ["Going changes", "Weather can shift the official going in the days before a declared race. If it turns against a horse's known preference, you'll get a chance to withdraw rather than risk a poor run — at a small cost to trust and the entry fee."],
  ]},
];

// ---------- yards & bosses ----------
const YARDS = {
  berrow: {
    boss: "Frank Berrow", yardName: "Berrow Racing, Malton",
    persona: "A blunt, old-school Yorkshireman who has forgotten more about sprinters than most trainers learn. Suffers no fools, rewards graft.",
    tracks: ["York", "Chester"], jockey: { name: "Kaiya Dods", skill: 82 },
    style: "sprint-leaning", greeting: n => `"Right, ${n}. You'll get no speeches from me. There's a horse in the bottom box nobody else will touch. Make something of it and we'll talk."`,
    praise: ["\"Aye. That'll do.\"", "\"Not bad. Don't let it go to your head.\"", "\"I've seen worse. Keep on.\""],
    scold: ["\"That were a mess. Sort it.\"", "\"My name's on that yard sign, remember.\"", "\"Do that again and you're mucking out till Christmas.\""],
  },
  delacroix: {
    boss: "Marina Delacroix-Hale", yardName: "Delacroix-Hale Racing, Newmarket",
    persona: "Elegant, exacting, quietly terrifying. Plans campaigns like chess games and expects her assistants to see three moves ahead.",
    tracks: ["Newmarket", "Ascot"], jockey: { name: "Rossa Bellini", skill: 88 },
    style: "miler-leaning", greeting: n => `"${n}. I hire for judgement, not enthusiasm. There is a horse here whose entries I cannot justify to its owner. It is yours to prove me wrong about."`,
    praise: ["\"Competent. Continue.\"", "\"I noticed. Others will too.\"", "\"That was... correct.\""],
    scold: ["\"Explain your thinking. Slowly.\"", "\"We do not guess in this yard.\"", "\"Disappointing. Twice would be a pattern.\""],
  },
  okafor: {
    boss: "Sonny Okafor", yardName: "Okafor Racing, Lambourn",
    persona: "A young insurgent renting twenty boxes on a shoestring, all energy and ambition. Treats his assistants like partners — and expects them to hustle like it.",
    tracks: ["Epsom", "Sandown"], jockey: { name: "Saffie Quill", skill: 79 },
    style: "middle-distance-leaning", greeting: n => `"${n}! Brilliant. Look — I can't pay much and half our tack is borrowed, but I promise you this: win with the horse in box four and I'll put your name on everything we do."`,
    praise: ["\"YES! That's what I'm talking about!\"", "\"Knew it. KNEW it. More of that.\"", "\"Owners are calling ME now. That's you, that is.\""],
    scold: ["\"Ah mate. That one hurt.\"", "\"We can't afford days like that. Literally.\"", "\"Chin up — but fix it, yeah?\""],
  },
};

// ---------- horse names: proper racehorse idiom ----------
const NAMES = [
  "Midnight In Malton","Brandy For Breakfast","Kestrel Republic","The Butcher's Waltz","Ninety Nine Reasons",
  "Quiet Rebellion","Salt Marsh Serenade","Do It For Doris","Gunmetal Sky","Tin Soldier's Lament",
  "Sister Solstice","Latecomer's Luck","Percy's Parade","Ombersley Rocket","Night Train North",
  "Whistle Past Midnight","The Vicar's Dilemma","Copper Kettle Jack","Marmalade Morning","Fenland Drummer",
  "Last Orders Louie","Harbour Lights Hattie","Sixpence For Sorrow","The Quiet Cartographer","Bailey's Bargain",
  "Frost On The Wire","Dancing With Dukes", "A Pocketful Of Rye","Thunder Over Thirsk","Mrs Miggins' Pride",
  "Borrowed Tuxedo","The Ploughman's Boast","Candlelight Convoy","Rascal's Reprieve","Ghost Of Gallowgate",
  "Two Left Feet","Winter's Apprentice","The Poacher's Moon","Spilt Milk Sally","Hackney Empire",
  "Duchess Of Dust","Runaway Curate","Bootlace Bill","The Long Goodbye","Seldom Sober",
  "Paper Lantern Parade","Ashes And Embers","Cathedral Thinking","The Understudy","Field Marshal Fred",
  "Barnacle Bright","Songs For Swinley","Threadneedle Rose","Half Past Trouble","Dry Stone Waller",
  "Lantern Jaw Larry","Pennine Postman","The Optimist's Umbrella","Velvet Thunderclap","Second Breakfast",
  "Wagons East","Molly's Last Word","Ironbridge Echo","The Reluctant Baronet","Skylark Sunday",
  "Chalk Stream Charlie","Bring Me Sunshine","The Gallops Ghost","Damson Gin Dreams","Northern Powerhouse",
  "Tattersalls Tearaway","One More Furlong","The Bishop's Move","Wet Weekend In Wigan","Silver Birch Belle",
  "Hedgerow Highwayman","Not My Circus","Foghorn Fanfare","The Milliner's Son","Race You To Ripon",
  "Barley Twist","Golden Hour Gerty","The Contrary Farrier","Puddle Jumper Pete","Empress Of Etal",
  "Shilling For The Meter","Downhill From Here","The Patient Assassin","Cobbles And Chrome","Firecracker Freda",
  "Overheard In Oakham","The Unlikely Lad","Sea Fret Sonata","Ballad Of Bempton","Knavesmire Nocturne",
  "Roodee Runaround","Tattenham Tearaway","Esher Express","Rowley Mile Rebel","Dip Your Colours",
];
function takeName(used) {
  const avail = NAMES.filter(n => !used.has(n));
  const n = avail.length ? pick(avail) : "Bay " + pick(["Colt","Filly"]) + " " + nid();
  used.add(n);
  return n;
}

// ---------- deep horse model ----------
// Visible stats: speed, stamina, accel, break (gate speed), balance (turns/camber/undulation),
// temperament (consistency — higher = less erratic). Hidden until discovered: going pref, distance sweet spot.
function makeHorse(q, used, opts = {}) {
  return {
    id: nid(), name: takeName(used),
    sire: takeName(used), dam: takeName(used),
    colour: pick(["b","b","ch","ch","gr","br"]), sex: pick(["c","f","g","f","c"]), age: opts.age ?? ri(2, 4),
    speed: clamp(Math.round(q + rnd(-6, 6)), 25, 99),
    stamina: clamp(Math.round(q + rnd(-6, 6)), 25, 99),
    accel: clamp(Math.round(q + rnd(-6, 6)), 25, 99),
    brk: clamp(Math.round(q + rnd(-10, 8)), 20, 99),
    balance: clamp(Math.round(q + rnd(-10, 8)), 20, 99),
    temperament: clamp(Math.round(q + rnd(-12, 10)), 20, 99),
    prefGoing: ri(1, 4), prefDist: pick([5, 6, 7, 8, 10, 12, 14]),
    goingKnown: false, distKnown: false,
    fitness: opts.fitness ?? 35, fatigue: 0, morale: ri(50, 70), injuryDays: 0,
    form: [], formLines: [], wins: 0, runs: 0, earnings: 0,
    quirk: opts.quirk || null,
    gear: [], gearRun: [], mark: null, // mark = official handicap mark; null until the horse has run
  };
}
const OR = h => Math.round((h.speed*0.32 + h.stamina*0.28 + h.accel*0.2 + h.brk*0.1 + h.balance*0.1) * 1.18);
// The rating used for race entries — the official mark once assigned, otherwise an assessed estimate.
// A horse can be "well handicapped" (true ability above its mark) or "found out" (below it) —
// the mark only moves when the handicapper reviews the form, not the instant a horse improves.
const effRating = h => h.mark ?? OR(h);

// Real racecard gear, with real effects and real trade-offs.
const GEAR = {
  blinkers: { label: "Blinkers", letter: "b",
    help: "Restricts a horse's vision to encourage focus. Sharpens a keen or unfocused horse's finishing effort — but can backfire on one that was already racing sensibly.",
    apply: (exp, h) => exp * 1.05, noiseAdj: h => (h.temperament >= 60 ? 0.015 : -0.01) },
  cheekpieces: { label: "Cheekpieces", letter: "p",
    help: "A gentler version of blinkers — a subtler focus aid with less risk of overdoing it.",
    apply: (exp) => exp * 1.02, noiseAdj: () => -0.005 },
  tonguetie: { label: "Tongue Tie", letter: "t",
    help: "Stops the tongue interfering with breathing at speed. Low risk, modest and reliable benefit for a horse that empties the tank late.",
    apply: (exp) => exp * 1.015, noiseAdj: () => 0 },
  hood: { label: "Hood", letter: "h",
    help: "Cuts down noise and peripheral distraction for a nervy traveller. Calms rather than sharpens — makes a horse more consistent, not faster.",
    apply: (exp) => exp, noiseAdj: () => -0.02 },
};
function gearExp(h, exp) { return (h.gear || []).reduce((e, g) => GEAR[g] ? GEAR[g].apply(e, h) : e, exp); }
function gearNoise(h) { return (h.gear || []).reduce((n, g) => GEAR[g] ? n + GEAR[g].noiseAdj(h) : n, 0); }

// The rags horse: modest numbers, one hidden redeeming quality.
function makeRagsHorse(used) {
  const h = makeHorse(46, used, { age: 3, fitness: 25 });
  const gift = pick(["balance", "brk", "temperament", "accel"]);
  h[gift] = clamp(h[gift] + ri(18, 26), 20, 92);
  h.quirk = { stat: gift, revealed: false };
  return h;
}

// ---------- race sim (deep version) ----------
function expected(h, race, jkSkill, mastery) {
  const c = COURSES[race.course];
  const base = h.speed*0.34 + h.stamina*0.3 + h.accel*0.22 + h.brk*0.07 + h.balance*0.07;
  const goingFit = 1 - Math.abs(h.prefGoing - race.going) * 0.06;
  const distFit = 1 - (Math.abs(h.prefDist - race.dist) / race.dist) * 0.35;
  // course shape interactions — this is where the deep stats earn their keep
  const sharpPen = 1 - c.sharpness * (1 - h.balance/100) * 0.035;   // tight tracks punish poor balance
  const undulPen = 1 - c.undulation * (1 - h.balance/100) * 0.03;    // so do cambers and gradients
  const breakBonus = race.dist <= 6 ? 1 + (h.brk - 60)/100 * 0.06 : 1 + (h.brk - 60)/100 * 0.02; // gate speed matters most in sprints
  const climbPen = 1 - c.finishClimb * (1 - h.stamina/100) * 0.04;   // uphill finishes find out weak stayers
  const jkm = 0.88 + (jkSkill/100) * 0.22;
  const fit = 0.8 + (h.fitness/100) * 0.25;
  const fat = 1 - (h.fatigue/100) * 0.22;
  const mor = 0.95 + (h.morale/100) * 0.1;
  const mast = 1 + (mastery || 0)/100 * 0.05; // knowing the track is worth up to 5%
  return gearExp(h, base * goingFit * distFit * sharpPen * undulPen * breakBonus * climbPen * jkm * fit * fat * mor * mast);
}
function noiseSd(h) { return clamp(0.14 - (h.temperament/100) * 0.06 + gearNoise(h), 0.05, 0.22); } // consistent horses run their race

const FRACTIONS = [[1.5,"1/2"],[1.62,"8/13"],[1.73,"8/11"],[1.83,"5/6"],[2,"Evens"],[2.25,"5/4"],[2.5,"6/4"],[2.75,"7/4"],[3,"2/1"],[3.5,"5/2"],[4,"3/1"],[4.5,"7/2"],[5,"4/1"],[5.5,"9/2"],[6,"5/1"],[7,"6/1"],[8,"7/1"],[9,"8/1"],[10,"9/1"],[11,"10/1"],[13,"12/1"],[15,"14/1"],[17,"16/1"],[21,"20/1"],[26,"25/1"],[34,"33/1"],[51,"50/1"],[67,"66/1"]];
const decToFrac = d => { let b = FRACTIONS[0]; for (const f of FRACTIONS) if (Math.abs(f[0]-d) < Math.abs(b[0]-d)) b = f; return b[1]; };
const marginStr = l => {
  if (l < 0.08) return "shd"; if (l < 0.2) return "hd"; if (l < 0.4) return "nk";
  if (l < 0.65) return "½L"; if (l < 0.9) return "¾L";
  const w = Math.round(l*4)/4, wh = Math.floor(w), q = w - wh;
  return wh + (q===0.25?"¼":q===0.5?"½":q===0.75?"¾":"") + "L";
};

function runRace(race, entries, masteryMap) {
  const withExp = entries.map(e => ({ ...e, exp: expected(e.horse, race, e.jkSkill, e.player ? masteryMap[race.course] : 0) * (e.expMod || 1) }));
  const mx = Math.max(...withExp.map(e => e.exp));
  const w = withExp.map(e => Math.exp((e.exp - mx)/3.2));
  const tot = w.reduce((a,b)=>a+b,0);
  withExp.forEach((e,i) => { const p = clamp(w[i]/tot, 0.012, 0.9) * 1.08; e.sp = decToFrac(1/p); e.spVal = 1/p; });
  const fav = Math.min(...withExp.map(e => e.spVal));
  withExp.forEach(e => e.fav = e.spVal === fav);
  const scored = withExp.map(e => ({ ...e, score: e.exp + gauss() * e.exp * noiseSd(e.horse) }));
  scored.sort((a,b) => b.score - a.score);
  return scored.map((s,i) => ({ ...s, pos: i+1, gap: i===0 ? 0 : Math.max(0.05, (scored[i-1].score - s.score)*0.5) }));
}

const PRIZE = { G1:[300000,113000,57000,28000], G2:[120000,45000,23000,11000], G3:[45000,17000,8500,4200], L:[22000,8300,4200,2100], 3:[9000,3400,1700,850], 4:[5200,2000,1000,500], 5:[3400,1300,650,325], 6:[2500,950,475,240] };

// The big-race calendar: fixed days each year, gated by OR (the boss won't waste entries).
const CALENDAR = [
  { day: 55,  name: "Feilden Stakes", grade: "L",  course: "Newmarket", dist: 9,  minOR: 78 },
  { day: 95,  name: "Classic Trial", grade: "G3", course: "Sandown",  dist: 10, minOR: 84 },
  { day: 150, name: "Summer Mile", grade: "G2", course: "Ascot",     dist: 8,  minOR: 89 },
  { day: 210, name: "International Stakes", grade: "G1", course: "York", dist: 10, minOR: 94 },
  { day: 300, name: "Champion Stakes", grade: "G1", course: "Ascot", dist: 10, minOR: 94 },
];

// ---------- live race commentary: 12 beats ----------
// Structure per spec: alternating race/player early on, beats 9–10 player,
// beat 11 the winner (and who chased), beat 12 the player's horse regardless.
function makeBeats(race, res, mine, tactic) {
  const field = res.length;
  const winner = res[0], second = res[1] || res[0];
  const startPos = tactic === "front" ? 1 : tactic === "stalk" ? Math.min(3, field) : Math.max(2, field - 2);
  const posAt = f => clamp(Math.round(startPos + (mine.pos - startPos) * f), 1, field);
  const H = mine.horse.name;
  const posLine = p => p === 1 ? `${H} leads` : p === 2 ? `${H} sits second` : p <= 4 ? `${H} tracks the leaders in ${p}th` : p <= Math.ceil(field/2) ? `${H} is settled mid-division` : `${H} is held up toward the rear`;
  const early = posAt(0.15), mid = posAt(0.45), threeOut = posAt(0.65), twoOut = posAt(0.8), oneOut = posAt(0.92);
  const otherEarly = res.find(r => !r.player && r.pos <= 3) || second;
  const looming = res.find(r => !r.player && r.pos <= 2) || winner;
  const brkLine = (mine.horse.brk >= 68 || tactic === "front")
    ? `${H} pings the gates and breaks smartly.` : mine.horse.brk <= 45 ? `${H} is slowly into stride — a length given away at the start.` : `${H} breaks on terms with the field.`;
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
const gradeLabel = gr => typeof gr === "number" ? `Class ${gr}` : gr === "L" ? "Listed" : gr;

const CMT_WIN = ["led inside final furlong, ridden out","made all, kept on strongly","tracked leaders, quickened to lead 1f out","held up, delivered late, readily","stayed on gamely under pressure"];
const CMT_PLACE = ["kept on, not pace of winner","every chance 1f out, one-paced late","chased winner, no impression","led until headed inside final furlong"];
const CMT_ALSO = ["mid-division, never landed a blow","ran on late past beaten horses","prominent, weakened 2f out","slowly away, always behind","never travelling on the ground"];

// ---------- race slate ----------
function makeSlate(day, homeTracks, horseOR, used) {
  const away = Object.keys(COURSES).filter(c => !homeTracks.includes(c));
  const options = [];
  const mk = (course, gradeBias) => {
    const c = COURSES[course];
    let grade;
    if (horseOR >= 96 && Math.random() < 0.4) grade = pick(["G3","G2","G1"]);
    else if (horseOR >= 88 && Math.random() < 0.5) grade = pick(["L","G3"]);
    else if (horseOR >= 76) grade = pick([3, 4, "L"]);
    else if (horseOR >= 62) grade = pick([4, 5]);
    else grade = pick([5, 6]);
    if (gradeBias) grade = gradeBias;
    return { id: nid(), course, dist: pick([5,6,7,8,10,12,14]),
      going: clamp(c.going + ri(-1,1), 1, 4), grade,
      raceDay: day + ri(2, 4),
      name: `${course} ${pick(["Handicap","Stakes","Conditions Stakes","Maiden Stakes"])} (${gradeLabel(grade)})` };
  };
  options.push(mk(pick(homeTracks)));
  options.push(mk(pick(homeTracks)));
  if (Math.random() < 0.6) options.push(mk(pick(away)));
  return options;
}

function makeField(race, horseOR, used) {
  const q = typeof race.grade === "number" ? clamp(horseOR + ri(-8, 8), 30, 90)
    : race.grade === "L" ? ri(78, 88) : race.grade === "G3" ? ri(82, 92) : race.grade === "G2" ? ri(86, 95) : ri(90, 98);
  const size = ri(6, 11);
  return Array.from({ length: size }, () => ({
    horse: makeHorse(clamp(q + ri(-5, 5), 25, 98), used), jkSkill: ri(60, 92),
    trainerName: pick(["W. Haggerty","A. Balding-Rowe","J. Gosforth","C. Appleford","R. Varley","K. Burke-Staunton","E. Walkden","H. Palmer-Reed"]),
    silk: pick(["#a4161a","#0b3d91","#e8b117","#1b7a43","#5e2b97","#d2601a","#0e7c86","#7a1f5c"]), player: false,
  }));
}

// ---------- day content ----------
const QUIET_DAYS = [
  "A quiet one. The string walks out, canters, comes back. Tea in the tack room.",
  "Drizzle all morning. Heads down, routine done, nothing to report.",
  "The farrier's van is in the yard half the day. Everything else ticks over.",
  "Muck out, ride out, feed, sweep. Some days the job is just the job.",
  "A schooling morning for the yearlings. Your horse does steady work and eats up well.",
  "The gallops are busy with other yards' strings. You keep to the inside and get the work done quietly.",
  "Nothing doing. Even the yard cat looks bored.",
  "A visiting owner tours the yard. Lots of nodding. Your horse behaves, mostly.",
];

const withHorse = (s, hid, fn) => ({ ...s, horses: s.horses.map(h => h.id === hid ? fn({ ...h }) : h) });
const note = (s, text) => ({ ...s, messages: [{ day: s.day, text }, ...s.messages].slice(0, 60) });

function trainingMoment(s) {
  const fit = s.horses.filter(h => h.injuryDays === 0);
  if (!fit.length) return null;
  const h = pick(fit);
  const yard = YARDS[s.yardId];
  const templates = [
    {
      title: `${h.name} is fresh this morning`,
      text: `Bucking and squealing on the walk out — the horse is jumping out of its skin. Let it have a proper blow-out, or keep the lid on?`,
      choices: [
        { label: "Let it stretch out", hint: "+speed · +fatigue · small strain risk", apply: st => { let n = withHorse(st, h.id, x => ({ ...x, speed: clamp(x.speed+1.5,0,99), fatigue: clamp(x.fatigue+8,0,100) }));
          if (Math.random() < 0.12) { n = withHorse(n, h.id, x => ({ ...x, injuryDays: ri(4, 10) })); n = note(n, `${h.name} came back with heat in a joint. A spell on the easy list.`); }
          else n = note(n, `${h.name} worked with real zest. Sharper for it.`); return n; } },
        { label: "Keep it settled", hint: "+morale, nothing risked", apply: st => note(withHorse(st, h.id, x => ({ ...x, morale: clamp(x.morale+3,0,100) })), `${h.name} settles into steady work. A good, calm morning.`) },
      ],
    },
    {
      title: "Stalls practice?",
      text: `${h.name} has been slow into stride. A morning at the practice stalls could fix the break — with the usual small risk of a knock in there.`,
      choices: [
        { label: "School in the stalls", hint: "+break · small knock risk (days off)", apply: st => Math.random() < 0.1
          ? note(withHorse(st, h.id, x => ({ ...x, injuryDays: 3 })), `${h.name} banged a knee in the gates. A few days off.`)
          : note(withHorse(st, h.id, x => ({ ...x, brk: clamp(x.brk+2.5,0,99) })), `${h.name} pings the gates all morning. The break is sharper.`) },
        { label: "Not today", hint: "no change", apply: st => st },
      ],
    },
    {
      title: `${yard.boss} stops by your box`,
      text: `${yard.boss} leans on the door and watches you work for a long minute. "Tell me your plan for this one." Do you talk targets or talk process?`,
      choices: [
        { label: "Talk targets — name a race", hint: "+trust (more)", apply: st => note({ ...st, trust: clamp(st.trust + 4, 0, 100) }, `${pick(yard.praise)} — the ambition lands well. Trust grows.`) },
        { label: "Talk process — the daily work", hint: "+trust (less)", apply: st => note({ ...st, trust: clamp(st.trust + 2, 0, 100) }, `A thoughtful answer. ${yard.boss} nods slowly and moves on.`) },
      ],
    },
    {
      title: "Work upsides the stable star",
      text: `The head lad offers you a lead horse for a serious piece of work. It'll build ${h.name} up — and take something out of the horse today.`,
      choices: [
        { label: "Take the work", hint: "+stamina · +fitness · +fatigue", apply: st => note(withHorse(st, h.id, x => ({ ...x, stamina: clamp(x.stamina+2,0,99), fitness: clamp(x.fitness+4,0,100), fatigue: clamp(x.fatigue+10,0,100) })), `${h.name} is made to graft — and thrives on it.`) },
        { label: "Steady canter instead", hint: "recovers fatigue", apply: st => note(withHorse(st, h.id, x => ({ ...x, fatigue: Math.max(0, x.fatigue-8) })), `An easy day banked.`) },
      ],
    },
    {
      title: `A theory about ${h.name}`,
      text: `Watching the horse move on ${h.prefGoing >= 3 ? "rain-softened" : "quick"} ground this morning, you have a hunch about its going preference. Test it with a searching piece of work?`,
      choices: [
        { label: "Test the theory", hint: "reveals going preference · +fatigue", apply: st => note(withHorse(st, h.id, x => ({ ...x, goingKnown: true, fatigue: clamp(x.fatigue+8,0,100) })), `Confirmed: ${h.name} clearly wants ${GOINGS[h.prefGoing]} ground. Written in the notebook.`) },
        { label: "Let it reveal itself in races", hint: "no change — races may reveal it anyway", apply: st => st },
      ],
    },
  ];
  return pick(templates);
}

// ---------- initial state ----------
function newGame(playerName, yardId, used) {
  const yard = YARDS[yardId];
  const rags = makeRagsHorse(used);
  const mastery = {}; Object.keys(COURSES).forEach(c => mastery[c] = yard.tracks.includes(c) ? 10 : 0);
  return {
    playerName: (playerName || "").trim() || "The Apprentice",
    yardId, day: 1, year: 1, cash: 500, trust: 20,
    horses: [rags], usedNames: used, mastery,
    slate: [], entered: null, results: [], queue: [], flash: null, liveRace: null, study: null,
    messages: [
      { day: 1, text: yard.greeting((playerName || "").trim() || "kid") },
      { day: 1, text: `The horse in question: ${rags.name}. ${rags.colour} ${rags.sex}, ${rags.age}yo, by ${rags.sire} out of ${rags.dam}. The stats sheet is grim reading — but something about the way it moves makes you look twice.` },
      { day: 1, text: `Your specialist tracks as ${yard.yardName}'s assistant: ${yard.tracks.join(" and ")}. Walk them, race them, learn them — course knowledge is a real edge in this game, as in racing.` },
    ],
    news: null, milestones: { firstWin: false, secondHorse: false, listedWin: false, groupWin: false, g1Win: false },
    epilogue: false,
  };
}

// ================================================================
export default function RagsToRiches() {
  const [phase, setPhase] = useState("intro");
  const [introStep, setIntroStep] = useState("name");
  const [nameInput, setNameInput] = useState("");
  const [g, setG] = useState(null);
  const [tab, setTab] = useState("stable");
  const [plan, setPlan] = useState({});
  const [walkPlan, setWalkPlan] = useState(null); // course name to walk tomorrow, or null
  const [raceSub, setRaceSub] = useState("upcoming"); // upcoming | results
  const [resultsFilter, setResultsFilter] = useState("all"); // all | mine
  const [helpOpen, setHelpOpen] = useState(false);
  const [openInsight, setOpenInsight] = useState(null);

  const usedRef = React.useRef(null);

  // ---------- race resolution (called from the tactics decision) ----------
  function resolveRaceDay(st, tactic) {
    const yard = YARDS[st.yardId];
    const race = st.entered;
    let horses = st.horses.map(h => ({ ...h }));
    const me = horses.find(h => h.id === race.horseId);
    let msgs = [], trust = st.trust, cash = st.cash, mastery = { ...st.mastery };
    let milestones = { ...st.milestones }, epilogue = st.epilogue, results = st.results;

    // tactics modifier: plays to different stats, with hold-up carrying traffic risk
    let expMod = 1;
    if (tactic === "front") expMod = 1 + (me.brk - 60) / 100 * 0.05;
    else if (tactic === "stalk") expMod = 1 + (me.temperament - 60) / 100 * 0.03;
    else { expMod = 1 + (me.accel - 60) / 100 * 0.05; if (Math.random() < 0.1) { expMod *= 0.94; msgs.push({ day: st.day, text: `Traffic problems in the straight — ${me.name} was stopped in its run at a crucial moment.` }); } }

    const field = makeField(race, effRating(me), st.usedNames);
    field.push({ horse: me, jkSkill: yard.jockey.skill, trainerName: yard.yardName, silk: "#14100a", player: true, expMod });
    const res = runRace(race, field, mastery);
    const mine = res.find(r => r.player);
    me.runs++; me.fatigue = clamp(me.fatigue + 26, 0, 100); me.fitness = clamp(me.fitness + 3, 0, 100);
    mastery[race.course] = clamp(mastery[race.course] + 6, 0, 100);
    const prize = PRIZE[race.grade][mine.pos - 1] || 0;
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
      const names = { balance: "beautifully balanced — turns and cambers barely touch it", brk: "electric from the gates", temperament: "utterly unflappable — it runs its race every time", accel: "capable of a genuinely smart turn of foot" };
      msgs.push({ day: st.day, text: `Now everyone can see what you saw in the bottom box: ${me.name} is ${names[me.quirk.stat]}.` });
    }
    if (mine.pos === 1) {
      me.wins++; me.morale = clamp(me.morale + 10, 0, 100); trust = clamp(trust + (typeof race.grade === "number" ? 5 : 10), 0, 100);
      msgs.push({ day: st.day, text: `${me.name} WINS the ${race.name}! ${pick(yard.praise)}` });
      if (!milestones.firstWin) { milestones.firstWin = true; msgs.push({ day: st.day, text: `Your first winner as an assistant. The head lad shakes your hand. It starts here.` }); }
      if (race.grade === "L" && !milestones.listedWin) milestones.listedWin = true;
      if ((race.grade === "G3" || race.grade === "G2") && !milestones.groupWin) milestones.groupWin = true;
      if (race.grade === "G1" && !milestones.g1Win) { milestones.g1Win = true; epilogue = true; }
    } else {
      if (mine.pos > res.length - 2) { trust = clamp(trust - 2, 0, 100); msgs.push({ day: st.day, text: `Well beaten. ${pick(yard.scold)}` }); }
      else msgs.push({ day: st.day, text: `${me.name} finishes ${mine.pos} of ${res.length}. ${mine.pos <= 3 ? "Plenty to build on." : "Back to the drawing board."}` });
      me.morale = clamp(me.morale - (mine.pos > 5 ? 4 : 0), 0, 100);
    }

    // --- the handicapper's letter: the official mark only moves when the form is reviewed ---
    if (me.mark == null) {
      me.mark = OR(me);
      msgs.push({ day: st.day, text: `The handicapper has seen enough: ${me.name} is given an official rating of ${me.mark} for the first time. Entries from here are judged on that number, not on what you privately know about the horse.` });
    } else {
      const winMargin = mine.pos === 1 ? (res[1] ? res[1].gap : 1) : null;
      let delta = 0, why = "";
      if (mine.pos === 1) {
        if (winMargin >= 2.5) { delta = ri(6, 9); why = "a dominant, taking-the-eye success"; }
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
    results = [{ race, res: res.slice(0, 6), mine, cmt }, ...results].slice(0, 30);
    return { ...st, horses, trust, cash, mastery, milestones, epilogue, results, entered: null,
      liveRace: { raceName: race.name, beats: makeBeats(race, res, mine, tactic), idx: 0 },
      messages: [...msgs, ...st.messages].slice(0, 60) };
  }

  // ---------- day advance ----------
  function advanceDay() {
    if (g.queue.length || g.flash || g.liveRace) return;
    setG(s => {
      const yard = YARDS[s.yardId];
      let horses = s.horses.map(h => ({ ...h }));
      let msgs = [], newsLine = null, trust = s.trust, cash = s.cash, mastery = { ...s.mastery };
      let milestones = { ...s.milestones }, epilogue = s.epilogue;
      let results = s.results, entered = s.entered, slate = s.slate, queue = [];

      // --- going update, a few days out: weather can turn a declared race against you ---
      if (entered && entered.raceDay - s.day === 3 && Math.random() < 0.4) {
        const me = horses.find(h => h.id === entered.horseId);
        const newGoing = clamp(entered.going + pick([-1, 1, 1]), 1, 4); // rain more likely than a dry-out, as in Britain
        if (me && newGoing !== entered.going) {
          const clash = me.goingKnown && Math.abs(me.prefGoing - newGoing) >= 2;
          return { ...s, entered: { ...entered, going: newGoing }, queue: [{
            title: "The going has changed",
            text: `Overnight rain at ${entered.course} — the official going for the ${entered.name} is now ${GOINGS[newGoing]}, not ${GOINGS[entered.going]} as declared. ${
              me.goingKnown ? `You know ${me.name} wants ${GOINGS[me.prefGoing]}.` : `You don't yet know for certain what ground ${me.name} prefers.`
            } ${clash ? "This looks like a poor fit." : ""}`,
            choices: [
              { label: "Run anyway", hint: clash ? "risks a well-below-form run on unsuitable ground" : "probably fine", apply: st => note(st, `${me.name} takes its chance regardless. The decision is made.`) },
              { label: "Withdraw the horse", hint: "no run, no risk — but the boss loses the entry", apply: st => note({ ...st, entered: null, trust: clamp(st.trust - 3, 0, 100) },
                `${me.name} is withdrawn. ${yard.boss}: "${pick(["Fair enough — no sense chancing it.", "Your call. I trust your reasons.", "Costs us the entry fee, mind."])}"`) },
            ],
          }] };
        }
      }

      // --- race day? route through the parade-ring tactics decision ---
      if (entered && entered.raceDay <= s.day) {
        const me = horses.find(h => h.id === entered.horseId);
        if (!me || me.injuryDays > 0) {
          return { ...s, entered: null, messages: [{ day: s.day, text: `${me ? me.name : "Your runner"} is scratched — not fit to take its chance.` }, ...s.messages].slice(0, 60) };
        }
        return { ...s, queue: [{
          title: "Riding instructions",
          text: `${yard.jockey.name} legs up in the parade ring before the ${entered.name}. "How do you want ${me.name} ridden?"`,
          choices: [
            { label: `Break sharp and make the running (plays to break: ${Math.round(me.brk)})`, apply: st => resolveRaceDay(st, "front") },
            { label: `Settle just off the pace (plays to temperament: ${Math.round(me.temperament)})`, apply: st => resolveRaceDay(st, "stalk") },
            { label: `Hold up for one late run (plays to accel: ${Math.round(me.accel)}, traffic risk)`, apply: st => resolveRaceDay(st, "hold") },
          ],
        }] };
      }

      // --- course walk: takes your whole day, so the string just ticks over ---
      const walking = walkPlan && COURSES[walkPlan];

      // --- daily training (non-race days, per horse plan; easy day if you're away walking) ---
      horses.forEach(h => {
        if (h.injuryDays > 0) { h.injuryDays--; h.fatigue = Math.max(0, h.fatigue - 12); return; }
        const p = walking ? "easy" : (plan[h.id] || "easy");
        const gains = {
          gallop: { speed: 0.9, fitness: 2.5, fat: 6 },
          canter: { stamina: 0.9, fitness: 2, fat: 4 },
          sprints: { accel: 0.9, fitness: 1.5, fat: 6 },
          stalls: { brk: 1.0, fitness: 0.5, fat: 3 },
          school: { balance: 1.0, fitness: 0.5, fat: 3 },
          easy: { fitness: 0.5, fat: -10 },
          rest: { fat: -18 },
        }[p] || { fitness: 0.5, fat: -10 };
        Object.entries(gains).forEach(([k, v]) => {
          if (k === "fat") h.fatigue = clamp(h.fatigue + v, 0, 100);
          else if (k === "fitness") h.fitness = clamp(h.fitness + v, 0, 100);
          else h[k] = clamp(Math.round((h[k] + v * (1 - h[k]/100) * 2) * 10) / 10, 0, 99);
        });
        if (p === "rest") h.morale = clamp(h.morale + 2, 0, 100);
        if (["gallop","sprints"].includes(p) && Math.random() < 0.02 + (h.fatigue/100) * 0.05) {
          h.injuryDays = ri(3, 9);
          msgs.push({ day: s.day, text: `${h.name} pulled up short on the gallops — ${h.injuryDays} days on the easy list.` });
        }
      });

      if (walking) {
        mastery[walkPlan] = clamp(mastery[walkPlan] + 8, 0, 100);
        msgs.push({ day: s.day, text: `You spend the day at ${walkPlan}, walking every yard from stalls to winning post. The string has an easy day back home. Course knowledge: ${Math.round(mastery[walkPlan])}/100.` });
      }

      // --- passive study: +1/day, with occasional windfalls from racing people ---
      let study = s.study;
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

      // --- day content: quiet / news / decision ---
      const roll = Math.random();
      if (roll < 0.42) newsLine = pick(QUIET_DAYS);
      else if (roll < 0.6) {
        const lines = [
          `${yard.boss} is in the racing pages today — ${pick(["a winner at the weekend meeting","quotes about the yard's spring targets","a bullish word for the stable's big hope"])}.`,
          `Word from the racecourse: the going at ${pick(Object.keys(COURSES))} is officially ${pick(["quickening","easing after rain","riding dead"])}.`,
          `An owner sends a crate of beer to the tack room. Morale up across the yard.`,
          `The head lad reckons your horse "is starting to look like a racehorse". High praise from that quarter.`,
        ];
        newsLine = pick(lines);
      } else if (roll < 0.78) {
        const tm = trainingMoment({ ...s, horses });
        if (tm) queue = [tm]; else newsLine = pick(QUIET_DAYS);
      } else newsLine = null;

      // --- new race slate every few days ---
      const myBest = horses.filter(h => h.injuryDays === 0).sort((a,b) => OR(b)-OR(a))[0];
      if (!entered && myBest && (slate.length === 0 || Math.random() < 0.35)) {
        slate = makeSlate(s.day + 1, yard.tracks, effRating(myBest), s.usedNames);
      }

      // --- milestone: second horse, swap offers ---
      if (milestones.firstWin && !milestones.secondHorse && trust >= 45) {
        milestones.secondHorse = true;
        const h2 = makeHorse(58, s.usedNames, { age: 2, fitness: 30 });
        horses = [...horses, h2];
        msgs.push({ day: s.day, text: `${yard.boss}: "You've earned a second string. ${h2.name} — unraced two-year-old, decent family. Don't ruin it." A second box is yours.` });
      }
      if (trust >= 75 && horses.length >= 2 && Math.random() < 0.03) {
        const worst = [...horses].sort((a,b) => OR(a)-OR(b))[0];
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

      const flashLines = [...msgs.map(m => m.text), ...(newsLine ? [newsLine] : [])];
      return { ...s, day, year, horses, trust, cash, mastery, slate, entered, results, milestones, epilogue,
        messages: [...msgs, ...s.messages].slice(0, 60), news: newsLine, queue,
        flash: (queue.length === 0 && flashLines.length) ? flashLines : null };
    });
    setWalkPlan(null);
  }

  const chooseDecision = i => setG(s => {
    const d = s.queue[0]; if (!d) return s;
    const next = d.choices[i].apply(s);
    return { ...next, queue: next.queue.slice(1) };
  });

  const enterRace = (raceOpt, horseId) => setG(s => ({ ...s, entered: { ...raceOpt, horseId }, slate: [],
    messages: [{ day: s.day, text: `Declared: ${s.horses.find(h=>h.id===horseId).name} in the ${raceOpt.name}, ${raceOpt.dist}f, day ${raceOpt.raceDay}.` }, ...s.messages].slice(0,60) }));

  // ---------- styles ----------
  const S = {
    app: { fontFamily: "Georgia, serif", background: "#171123", minHeight: "100vh", color: "#eee6f2", paddingBottom: 96 },
    head: { padding: "16px 14px 8px", borderBottom: "3px double #c9a227" },
    title: { fontSize: 22, letterSpacing: 1, margin: 0, color: "#f0d97a", fontVariant: "small-caps" },
    mono: { fontFamily: "'Courier New', monospace", fontSize: 12 },
    small: { fontFamily: "'Courier New', monospace", fontSize: 11.5, color: "#6e6480" },
    tabs: { display: "flex", borderBottom: "1px solid #3d3454", position: "sticky", top: 0, background: "#171123", zIndex: 5 },
    tab: on => ({ flex: 1, padding: "10px 2px", textAlign: "center", fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer", color: on ? "#f0d97a" : "#8d82a3", borderBottom: on ? "3px solid #c9a227" : "3px solid transparent", fontFamily: "'Courier New', monospace" }),
    card: { background: "#f6f1e7", color: "#241c2e", margin: "12px 12px 0", borderRadius: 3, padding: 12, boxShadow: "0 2px 0 rgba(0,0,0,.4)" },
    hName: { fontWeight: 700, fontSize: 16 },
    bar: { height: 6, background: "#ddd3c2", borderRadius: 2, overflow: "hidden", flex: 1 },
    fill: (v, c) => ({ width: `${v}%`, height: "100%", background: c }),
    btn: { background: "#2c2140", color: "#f0d97a", border: "1px solid #c9a227", padding: "8px 13px", borderRadius: 3, fontFamily: "'Courier New', monospace", fontSize: 12.5, cursor: "pointer" },
    planBtn: on => ({ padding: "5px 7px", fontSize: 10, fontFamily: "'Courier New', monospace", border: "1px solid " + (on ? "#2c2140" : "#b5a98f"), background: on ? "#2c2140" : "transparent", color: on ? "#f0d97a" : "#5d5443", borderRadius: 2, cursor: "pointer" }),
    advance: { position: "fixed", bottom: 0, left: 0, right: 0, padding: 12, background: "linear-gradient(transparent, #171123 30%)", display: "flex", justifyContent: "center", zIndex: 10 },
    advanceBtn: dis => ({ background: dis ? "#6b5e3a" : "#c9a227", color: "#1d1508", border: "none", padding: "13px 32px", fontSize: 14, fontWeight: 700, borderRadius: 3, letterSpacing: 1, cursor: dis ? "default" : "pointer", fontFamily: "'Courier New', monospace" }),
    newsBox: { background: "#100b1a", border: "1px solid #3d3454", margin: 12, borderRadius: 3, padding: "10px 12px", fontSize: 13.5, lineHeight: 1.5 },
    eventCard: { background: "#241c2e", color: "#eee6f2", margin: 12, borderRadius: 3, padding: 14, border: "1px solid #c9a227" },
    select: { width: "100%", padding: 8, marginTop: 6, fontFamily: "'Courier New', monospace", fontSize: 12.5, background: "#fffcf3", border: "1px solid #b5a98f", borderRadius: 2 },
  };

  // ---------- intro ----------
  if (phase === "intro" || !g) {
    const I = {
      wrap: { fontFamily: "Georgia, serif", background: "#171123", minHeight: "100vh", color: "#eee6f2", padding: "20px 16px 60px" },
      title: { fontSize: 26, color: "#f0d97a", fontVariant: "small-caps", margin: "0 0 4px" },
      subT: { fontSize: 13, color: "#8d82a3", fontStyle: "italic", marginBottom: 16 },
      sub: { fontSize: 14, color: "#a99fc0", marginBottom: 18, lineHeight: 1.55 },
      label: { fontFamily: "'Courier New', monospace", fontSize: 12, letterSpacing: 1, color: "#c9a227", marginBottom: 6 },
      input: { width: "100%", padding: 10, fontFamily: "Georgia, serif", fontSize: 15, borderRadius: 3, border: "1px solid #c9a227", background: "#f6f1e7", color: "#241c2e", marginBottom: 18 },
      yardCard: on => ({ background: on ? "#2c2140" : "#f6f1e7", color: on ? "#eee6f2" : "#241c2e", border: "2px solid " + (on ? "#c9a227" : "transparent"), borderRadius: 4, padding: 13, marginBottom: 10, cursor: "pointer" }),
      begin: en => ({ width: "100%", marginTop: 6, background: en ? "#c9a227" : "#4b415f", color: en ? "#1d1508" : "#8d82a3", border: "none", padding: 14, fontSize: 15, fontWeight: 700, letterSpacing: 1, borderRadius: 3, fontFamily: "'Courier New', monospace", cursor: en ? "pointer" : "default" }),
    };
    if (introStep === "name") {
      return (
        <div style={I.wrap}>
          <h1 style={I.title}>The Yard</h1>
          <div style={I.subT}>Rags to Riches</div>
          <div style={I.sub}>
            You are twenty-three, broke, and certain of exactly one thing: you can train a racehorse.
            Three yards are hiring an assistant. One of them is about to take a chance on you.
          </div>
          <div style={I.label}>YOUR NAME</div>
          <input style={I.input} placeholder="e.g. Jack Nettleford" value={nameInput} onChange={e => setNameInput(e.target.value)} maxLength={28} />
          <button style={I.begin(nameInput.trim().length > 0)} disabled={!nameInput.trim()} onClick={() => setIntroStep("yard")}>APPLY TO THE YARDS →</button>
        </div>
      );
    }
    // yard selection
    return (
      <div style={I.wrap}>
        <h1 style={I.title}>The Yard</h1>
        <div style={I.subT}>Rags to Riches</div>
        <div style={I.sub}>Three replies. Three very different bosses. Whoever you choose, their two home tracks become <i>your</i> tracks — the ones you'll come to know stride by stride.</div>
        {Object.entries(YARDS).map(([id, y]) => (
          <div key={id} style={I.yardCard(false)} onClick={() => {
            usedRef.current = new Set();
            setG(newGame(nameInput, id, usedRef.current));
            setPhase("playing");
          }}>
            <div style={{ fontWeight: 700, fontSize: 15.5 }}>{y.boss} <span style={{ fontWeight: 400, opacity: 0.75 }}>— {y.yardName}</span></div>
            <div style={{ fontSize: 13, lineHeight: 1.45, margin: "4px 0" }}>{y.persona}</div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11.5, opacity: 0.8 }}>
              Home tracks: {y.tracks.join(" & ")} · Stable jockey: {y.jockey.name} (skill {y.jockey.skill}) · {y.style}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ---------- playing ----------
  const yard = YARDS[g.yardId];
  const decision = g.queue[0] || null;
  const raceToday = g.entered && g.entered.raceDay <= g.day + 1;

  return (
    <div style={S.app}>
      <div style={S.head}>
        <h1 style={S.title}>The Yard: Rags to Riches</h1>
        <div style={{ ...S.mono, color: "#8d82a3", marginTop: 2 }}>
          {g.playerName} · {yard.yardName}
        </div>
        <div style={{ display: "flex", gap: 13, marginTop: 6, ...S.mono, flexWrap: "wrap" }}>
          <span>YR {g.year} · DAY {g.day}</span>
          <span>{money(g.cash)}</span>
          <span>TRUST {g.trust}</span>
          <span style={{ marginLeft: "auto", cursor: "pointer", color: "#c9a227", border: "1px solid #c9a227", borderRadius: "50%", width: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}
            onClick={() => setHelpOpen(true)}>?</span>
        </div>
      </div>

      {g.epilogue && (
        <div style={{ ...S.eventCard, border: "2px solid #f0d97a" }}>
          <div style={{ fontVariant: "small-caps", fontSize: 18, color: "#f0d97a", marginBottom: 6 }}>Rags to Riches</div>
          <div style={{ fontSize: 14, lineHeight: 1.55 }}>
            A Group 1. From the horse nobody wanted, in the bottom box, to the winner's enclosure on the biggest stage.
            {" "}{yard.boss} says nothing for a long moment — then, quietly: "Best day this yard's ever had." The story you set out to write is written. The yard, of course, opens again tomorrow.
          </div>
        </div>
      )}

      {/* ===== DAILY FLASH OVERLAY ===== */}
      {g.flash && !g.liveRace && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,7,18,.78)", zIndex: 30, display: "flex", alignItems: "center", padding: 16 }}>
          <div style={{ background: "#241c2e", border: "1px solid #c9a227", borderRadius: 4, padding: 16, width: "100%", maxHeight: "70vh", overflowY: "auto" }}>
            <div style={{ ...S.mono, color: "#c9a227", letterSpacing: 1, marginBottom: 8 }}>DAY {g.day} — THE YARD DIARY</div>
            {g.flash.map((line, i) => (
              <div key={i} style={{ fontSize: 14, lineHeight: 1.5, padding: "6px 0", borderTop: i ? "1px dotted #3d3454" : "none" }}>{line}</div>
            ))}
            <button style={{ ...S.btn, display: "block", width: "100%", marginTop: 10 }} onClick={() => setG(s => ({ ...s, flash: null }))}>CONTINUE</button>
          </div>
        </div>
      )}

      {/* ===== DECISION OVERLAY ===== */}
      {decision && !g.liveRace && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,7,18,.78)", zIndex: 31, display: "flex", alignItems: "center", padding: 16 }}>
          <div style={{ background: "#241c2e", border: "1px solid #c9a227", borderRadius: 4, padding: 16, width: "100%" }}>
            <div style={{ fontVariant: "small-caps", color: "#f0d97a", fontSize: 17, marginBottom: 6 }}>{decision.title}</div>
            <div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 10 }}>{decision.text}</div>
            {decision.choices.map((c, i) => (
              <button key={i} style={{ ...S.btn, display: "block", width: "100%", marginBottom: 6, textAlign: "left" }} onClick={() => chooseDecision(i)}>
                {c.label}
                {c.hint && <div style={{ fontSize: 10.5, opacity: 0.75, marginTop: 2, fontStyle: "italic" }}>{c.hint}</div>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===== HELP OVERLAY ===== */}
      {helpOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,7,18,.82)", zIndex: 40, display: "flex", alignItems: "flex-end" }} onClick={() => setHelpOpen(false)}>
          <div style={{ background: "#f6f1e7", color: "#241c2e", width: "100%", maxHeight: "82vh", overflowY: "auto", borderRadius: "10px 10px 0 0", padding: "16px 16px 24px" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <span style={{ fontSize: 19, fontWeight: 700, fontVariant: "small-caps" }}>New to racing? Start here</span>
              <span style={{ ...S.mono, cursor: "pointer", color: "#8a7f56" }} onClick={() => setHelpOpen(false)}>CLOSE ✕</span>
            </div>
            {HELP.map(sec => (
              <div key={sec.section} style={{ marginBottom: 14 }}>
                <div style={{ ...S.mono, fontWeight: 700, letterSpacing: 1, color: "#8a7f56", marginBottom: 4 }}>{sec.section}</div>
                {sec.items.map(([term, def]) => (
                  <div key={term} style={{ padding: "5px 0", borderTop: "1px dotted #d8cfbc" }}>
                    <b style={{ fontSize: 13.5 }}>{term}</b>
                    <div style={{ fontSize: 13, lineHeight: 1.45 }}>{def}</div>
                  </div>
                ))}
              </div>
            ))}
            <div style={{ ...S.small, fontStyle: "italic" }}>
              The racing terms here are the real thing — everything you learn in this game reads straight across to actual racecards and form guides.
            </div>
          </div>
        </div>
      )}

      {/* ===== LIVE RACE OVERLAY ===== */}
      {g.liveRace && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,7,18,.88)", zIndex: 32, display: "flex", alignItems: "center", padding: 16 }}>
          <div style={{ background: "#241c2e", border: "2px solid #c9a227", borderRadius: 4, padding: 16, width: "100%" }}>
            <div style={{ ...S.mono, color: "#c9a227", letterSpacing: 1, marginBottom: 4 }}>
              {g.liveRace.raceName.toUpperCase()} · {g.liveRace.idx + 1}/{g.liveRace.beats.length}
            </div>
            <div style={{ fontSize: 15.5, lineHeight: 1.55, minHeight: 90, fontFamily: "Georgia, serif" }}>
              {g.liveRace.beats[g.liveRace.idx]}
            </div>
            <button style={{ ...S.btn, display: "block", width: "100%", marginTop: 10, fontSize: 14 }}
              onClick={() => setG(s => s.liveRace.idx + 1 >= s.liveRace.beats.length
                ? { ...s, liveRace: null }
                : { ...s, liveRace: { ...s.liveRace, idx: s.liveRace.idx + 1 } })}>
              {g.liveRace.idx + 1 >= g.liveRace.beats.length ? "BACK TO THE YARD" : g.liveRace.idx >= 9 ? "THE FINISH →" : "▶"}
            </button>
          </div>
        </div>
      )}

      <div style={S.tabs}>
        {["stable", "racing", "notebook", "yard"].map(t => (
          <div key={t} style={S.tab(tab === t)} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>

      {/* ===== STABLE ===== */}
      {tab === "stable" && (
        <div>
          <div style={{ ...S.mono, padding: "10px 14px 0", color: "#8d82a3" }}>
            Set each horse's work for tomorrow, then advance the day.
          </div>
          {g.horses.map(h => {
            const p = plan[h.id] || "easy";
            return (
              <div key={h.id} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={S.hName}>{h.name}</span>
                  <span style={{ ...S.mono, fontWeight: 700 }}>OR {OR(h)} · mark {h.mark ?? "unrated"}</span>
                </div>
                <div style={S.small}>{h.colour} {h.sex} {h.age} ({h.sire} × {h.dam})</div>
                <div style={{ ...S.small, marginBottom: 6 }}>
                  Form: <b style={{ letterSpacing: 2 }}>{h.form.length ? h.form.slice().reverse().join("") : "—"}</b>
                  {" · "}Trip: <b>{h.distKnown ? h.prefDist + "f" : "?"}</b>
                  {" · "}Going: <b>{h.goingKnown ? GOINGS[h.prefGoing] : "?"}</b>
                  {h.quirk && h.quirk.revealed && <b style={{ color: "#7a5c10" }}> · the gift is out</b>}
                  {h.injuryDays > 0 && <b style={{ color: "#a4161a" }}> · EASY LIST {h.injuryDays}d</b>}
                </div>
                {h.mark != null && h.mark !== OR(h) && (
                  <div style={{ ...S.small, marginBottom: 6, fontStyle: "italic" }}>
                    {h.mark < OR(h) ? `You suspect this horse is better than its mark — well handicapped.` : `The mark may be flattering it slightly — a touch exposed.`}
                  </div>
                )}
                {[["speed", h.speed, "#a4161a"], ["stamina", h.stamina, "#0b3d91"], ["accel", h.accel, "#1b7a43"],
                  ["break", h.brk, "#7a1f5c"], ["balance", h.balance, "#d2601a"], ["temper't", h.temperament, "#0e7c86"],
                  ["fitness", h.fitness, "#5e2b97"], ["fatigue", h.fatigue, "#8d6a1f"]].map(([k, v, c]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2.5 }}>
                    <span style={{ ...S.mono, width: 58 }}>{k}</span>
                    <div style={S.bar}><div style={S.fill(v, c)} /></div>
                    <span style={{ ...S.mono, width: 28, textAlign: "right" }}>{Math.round(v)}</span>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                  {[["gallop","GALLOP"],["canter","CANTER"],["sprints","SPRINTS"],["stalls","STALLS"],["school","SCHOOL"],["easy","EASY"],["rest","REST"]].map(([id, label]) => (
                    <button key={id} style={S.planBtn(p === id)} disabled={h.injuryDays > 0} onClick={() => setPlan(pl => ({ ...pl, [h.id]: id }))}>{label}</button>
                  ))}
                </div>
                <div style={{ ...S.small, marginTop: 4 }}>
                  gallop→speed · canter→stamina · sprints→accel · stalls→break · school→balance · easy/rest→recover
                </div>
                <div style={{ ...S.small, marginTop: 8, marginBottom: 3 }}>GEAR (equip before you declare):</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {Object.entries(GEAR).map(([id, def]) => {
                    const on = (h.gear || []).includes(id);
                    const firstTime = on && !(h.gearRun || []).includes(id);
                    return (
                      <button key={id} style={S.planBtn(on)} onClick={() => setG(s => ({ ...s, horses: s.horses.map(x => x.id === h.id
                        ? { ...x, gear: on ? x.gear.filter(g => g !== id) : [...(x.gear || []), id] } : x) }))}>
                        {def.label}{on ? ` (${def.letter})` : ""}{firstTime ? " •1st" : ""}
                      </button>
                    );
                  })}
                </div>
                {h.formLines.length > 0 && (
                  <div style={{ marginTop: 8, borderTop: "1px solid #d8cfbc", paddingTop: 5 }}>
                    {h.formLines.slice(0, 4).map((f, i) => (
                      <div key={i} style={{ ...S.small, padding: "3px 0" }}>
                        <b>{f.pos}/{f.of}</b> · {f.race}, {f.dist}f, {f.going} · SP {f.sp} — <i>{f.cmt}</i>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ===== RACING ===== */}
      {tab === "racing" && (
        <div>
          {/* sub-tab bar */}
          <div style={{ display: "flex", gap: 8, padding: "10px 12px 0" }}>
            {[["upcoming", "UPCOMING"], ["results", "RESULTS"]].map(([id, label]) => (
              <button key={id} style={{ ...S.planBtn(raceSub === id), flex: 1, padding: "8px 0", fontSize: 11.5,
                color: raceSub === id ? "#f0d97a" : "#8d82a3", borderColor: raceSub === id ? "#c9a227" : "#3d3454", background: raceSub === id ? "#2c2140" : "transparent" }}
                onClick={() => setRaceSub(id)}>{label}</button>
            ))}
          </div>

          {raceSub === "upcoming" && (
            <>
              {g.entered ? (
                <div style={{ ...S.card, border: "2px solid #c9a227" }}>
                  <div style={S.hName}>Declared: {g.entered.name}</div>
                  <div style={S.small}>
                    {g.entered.course} · {g.entered.dist}f · {GOINGS[g.entered.going]} · race day {g.entered.raceDay} ({g.entered.raceDay - g.day} day{g.entered.raceDay - g.day === 1 ? "" : "s"} away)
                  </div>
                  <div style={S.small}>{COURSES[g.entered.course].line}</div>
                  <div style={{ ...S.small, marginTop: 4 }}>
                    Runner: {g.horses.find(h => h.id === g.entered.horseId)?.name} · ridden by {yard.jockey.name}
                    {" · "}your course knowledge: {Math.round(g.mastery[g.entered.course])}/100
                  </div>
                </div>
              ) : g.slate.length ? (
                <>
                  <div style={{ ...S.mono, padding: "10px 14px 0", color: "#8d82a3" }}>Entries close soon — pick a race, or wait for a better slate.</div>
                  {g.slate.map(r => (
                    <div key={r.id} style={{ ...S.card, border: yard.tracks.includes(r.course) ? "1px solid #c9a227" : "none" }}>
                      <div style={S.hName}>{r.name}</div>
                      <div style={S.small}>
                        {r.course} · {r.dist}f · {GOINGS[r.going]} · runs day {r.raceDay} · 1st {money(PRIZE[r.grade][0])}
                        {yard.tracks.includes(r.course) && <b style={{ color: "#7a5c10" }}> · home track</b>}
                      </div>
                      <div style={S.small}>{COURSES[r.course].line}</div>
                      {g.horses.filter(h => h.injuryDays === 0).map(h => (
                        <button key={h.id} style={{ ...S.btn, marginTop: 6, marginRight: 6 }} onClick={() => enterRace(r, h.id)}>
                          ENTER {h.name.toUpperCase()} (mark {effRating(h)}{h.mark == null ? ", unrated" : ""})
                        </button>
                      ))}
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ ...S.mono, padding: 20, color: "#8d82a3" }}>No entries open today. The next slate comes up within a few days.</div>
              )}

              {/* big-race calendar */}
              <div style={S.card}>
                <div style={{ ...S.mono, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>THE BIG-RACE CALENDAR — YEAR {g.year}</div>
                <div style={{ ...S.small, marginBottom: 6 }}>The races careers are measured by. {yard.boss} controls the entries — bring a good enough horse and they'll let you take your shot.</div>
                {CALENDAR.map(cr => {
                  const best = g.horses.filter(h => h.injuryDays === 0).sort((a, b) => OR(b) - OR(a))[0];
                  const unlocked = best && effRating(best) >= cr.minOR - 2;
                  const past = cr.day <= g.day;
                  const inWindow = !past && cr.day - g.day <= 14 && cr.day - g.day >= 2;
                  return (
                    <div key={cr.name} style={{ padding: "8px 0", borderTop: "1px dotted #d8cfbc", opacity: past ? 0.45 : 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontWeight: 700, fontSize: 14.5 }}>{unlocked || past ? "" : "🔒 "}{cr.name} ({cr.grade})</span>
                        <span style={S.small}>day {cr.day}</span>
                      </div>
                      <div style={S.small}>{cr.course} · {cr.dist}f · 1st {money(PRIZE[cr.grade][0])}</div>
                      {past ? <div style={S.small}>Run for this year — it comes around again next season.</div>
                        : !unlocked ? <div style={S.small}>{yard.boss} won't waste the entry: needs a horse around mark {cr.minOR}. Your best mark: {best ? effRating(best) : "—"}.</div>
                        : inWindow && !g.entered ? (
                          g.horses.filter(h => h.injuryDays === 0 && effRating(h) >= cr.minOR - 2).map(h => (
                            <button key={h.id} style={{ ...S.btn, marginTop: 5, marginRight: 6 }} onClick={() => enterRace({
                              id: nid(), course: cr.course, dist: cr.dist, going: clamp(COURSES[cr.course].going + ri(-1, 1), 1, 4),
                              grade: cr.grade, raceDay: cr.day, name: `${cr.name} (${cr.grade})`,
                            }, h.id)}>DECLARE {h.name.toUpperCase()}</button>
                          ))
                        ) : <div style={{ ...S.small, color: "#1b7a43" }}>✓ Unlocked — entries open in the two weeks before race day.</div>}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {raceSub === "results" && (
            <>
              <div style={{ display: "flex", gap: 8, padding: "10px 12px 0" }}>
                {[["all", "FULL RESULTS"], ["mine", "MY HORSES"]].map(([id, label]) => (
                  <button key={id} style={{ ...S.planBtn(resultsFilter === id), flex: 1, padding: "6px 0",
                    color: resultsFilter === id ? "#f0d97a" : "#8d82a3", borderColor: resultsFilter === id ? "#c9a227" : "#3d3454", background: resultsFilter === id ? "#2c2140" : "transparent" }}
                    onClick={() => setResultsFilter(id)}>{label}</button>
                ))}
              </div>

              {resultsFilter === "all" && (
                <>
                  {!g.results.length && <div style={{ ...S.mono, padding: 20, color: "#8d82a3" }}>No races run yet.</div>}
                  {g.results.map((w, i) => (
                    <div key={i} style={S.card}>
                      <div style={S.hName}>{w.race.name}</div>
                      <div style={{ ...S.small, marginBottom: 5 }}>{w.race.course} · {w.race.dist}f · {GOINGS[w.race.going]} · {w.res.length}+ ran</div>
                      {w.res.map(r => (
                        <div key={r.horse.id} style={{ display: "flex", gap: 6, padding: "3px 0", borderTop: "1px dotted #d8cfbc", alignItems: "baseline", background: r.player ? "#efe0b8" : "transparent" }}>
                          <span style={{ ...S.mono, width: 16, fontWeight: 700 }}>{r.pos}</span>
                          <span style={{ fontSize: 13.5, fontWeight: r.player ? 700 : 400, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.horse.name}</span>
                          <span style={{ ...S.mono, color: "#6e6480" }}>{r.sp}{r.fav ? "F" : ""}</span>
                          <span style={{ ...S.mono, width: 34, textAlign: "right" }}>{r.pos === 1 ? "won" : marginStr(r.gap)}</span>
                        </div>
                      ))}
                      <div style={{ ...S.small, marginTop: 5, fontStyle: "italic" }}>{w.mine.horse.name}: {w.cmt}</div>
                    </div>
                  ))}
                </>
              )}

              {resultsFilter === "mine" && (
                <>
                  {g.horses.map(h => (
                    <div key={h.id} style={S.card}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={S.hName}>{h.name}</span>
                        <span style={{ ...S.mono, fontWeight: 700 }}>{h.wins}W / {h.runs} runs · {money(h.earnings)}</span>
                      </div>
                      {!h.formLines.length && <div style={S.small}>Unraced so far.</div>}
                      {h.formLines.map((f, i) => (
                        <div key={i} style={{ ...S.small, padding: "4px 0", borderTop: "1px dotted #d8cfbc" }}>
                          <b>{f.pos}/{f.of}</b> · Y{f.year} d{f.day} · {f.race}, {f.dist}f, {f.going} · SP {f.sp}
                          <div style={{ fontStyle: "italic" }}>{f.cmt}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ===== NOTEBOOK: track mastery + insights ===== */}
      {tab === "notebook" && (
        <div>
          <div style={{ ...S.mono, padding: "10px 14px 0", color: "#8d82a3" }}>
            Course knowledge builds through racing there and walking the track. It's worth real lengths — and it unlocks what you've learned.
            {walkPlan && <b style={{ color: "#f0d97a" }}> Queued: walking {walkPlan} tomorrow — the string gets an easy day.</b>}
            {g.study && <b style={{ color: "#f0d97a" }}> Studying {g.study} (+1/day).</b>}
          </div>
          {Object.keys(COURSES).map(course => {
            const m = Math.round(g.mastery[course]);
            const home = yard.tracks.includes(course);
            const unlocked = MASTERY_STEPS.filter(t => m >= t).length;
            return (
              <div key={course} style={{ ...S.card, border: home ? "1px solid #c9a227" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={S.hName}>{course}{home ? " ★" : ""}</span>
                  <span style={{ ...S.mono, fontWeight: 700 }}>{m}/100</span>
                </div>
                <div style={{ ...S.small, marginBottom: 4 }}>{COURSES[course].line}</div>
                <div style={S.bar}><div style={S.fill(m, "#c9a227")} /></div>
                <div style={{ marginTop: 6 }}>
                  {INSIGHTS[course].map((ins, i) => (
                    <div key={i} style={{ ...S.small, padding: "4px 0", borderTop: i ? "1px dotted #d8cfbc" : "none",
                      color: i < unlocked ? "#241c2e" : "#b5a98f", fontFamily: "Georgia, serif", fontSize: 13, lineHeight: 1.45 }}>
                      {i < unlocked ? ins : `🔒 Unlocks at course knowledge ${MASTERY_STEPS[i]}`}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button style={{ ...S.planBtn(walkPlan === course), marginTop: 8 }} onClick={() => setWalkPlan(w => w === course ? null : course)}>
                    {walkPlan === course ? "✓ WALKING TOMORROW — TAP TO CANCEL" : "WALK TOMORROW (+8 · replaces training)"}
                  </button>
                  <button style={{ ...S.planBtn(g.study === course), marginTop: 8 }} onClick={() => setG(s => ({ ...s, study: s.study === course ? null : course }))}>
                    {g.study === course ? "✓ STUDYING (+1/DAY) — TAP TO STOP" : "STUDY THIS COURSE (+1/day, passive)"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== YARD: boss, milestones, messages ===== */}
      {tab === "yard" && (
        <div>
          <div style={S.card}>
            <div style={S.hName}>{yard.boss}</div>
            <div style={{ ...S.small, marginBottom: 4 }}>{yard.yardName}</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.45, fontStyle: "italic" }}>{yard.persona}</div>
            <div style={{ ...S.small, marginTop: 6 }}>Trust: {g.trust}/100 — {g.trust >= 75 ? "they'd back you in public now" : g.trust >= 45 ? "you've earned real responsibility" : "still proving yourself"}</div>
          </div>
          <div style={S.card}>
            <div style={{ ...S.mono, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>THE ROAD</div>
            {[["firstWin","Train your first winner"],["secondHorse","Earn a second horse"],["listedWin","Win at Listed level"],["groupWin","Win a Group race"],["g1Win","Win a Group 1 — rags to riches"]].map(([k, label]) => (
              <div key={k} style={{ display: "flex", gap: 8, padding: "5px 0", borderTop: "1px dotted #d8cfbc" }}>
                <span style={{ ...S.mono, fontWeight: 700, color: g.milestones[k] ? "#1b7a43" : "#b5a98f" }}>{g.milestones[k] ? "✓" : "○"}</span>
                <span style={{ fontSize: 14, color: g.milestones[k] ? "#8a7f56" : "#241c2e", textDecoration: g.milestones[k] ? "line-through" : "none" }}>{label}</span>
              </div>
            ))}
          </div>
          {g.messages.map((m, i) => (
            <div key={i} style={{ ...S.card, background: "#ece5d6" }}>
              <span style={{ ...S.small, color: "#8a7f56" }}>DAY {m.day}</span>
              <div style={{ fontSize: 13.5, marginTop: 2, lineHeight: 1.45 }}>{m.text}</div>
            </div>
          ))}
        </div>
      )}

      <div style={S.advance}>
        <button style={S.advanceBtn(!!decision || !!g.flash || !!g.liveRace)} onClick={advanceDay} disabled={!!decision || !!g.flash || !!g.liveRace}>
          {g.liveRace ? "RACE IN PROGRESS" : decision ? "DECISION REQUIRED" : g.flash ? "READ THE DIARY" : raceToday ? "RACE DAY →" : "NEXT DAY →"}
        </button>
      </div>
    </div>
  );
}
