// Racing-literacy glossary, extracted verbatim from reference/rags-to-riches-v6.jsx.
// Explicitly framed (in-game) as transferable to real racecards.
export interface HelpSection {
  section: string;
  items: [string, string][];
}

export const HELP: HelpSection[] = [
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
