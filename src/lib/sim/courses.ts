// Course data, extracted verbatim from reference/rags-to-riches-v6.jsx.
// sharpness: how tight the turns are (0 flat/galloping – 3 very tight)
// undulation: gradients and camber (0 flat – 3 severe)
// finishClimb: uphill finish testing stamina (0 none – 2 stiff)
// All notes written originally from general racing knowledge — never copied
// from Racing Post/Timeform/etc. Facts aren't copyrightable, expression is.
import type { Course, CourseName } from "./types";

export const COURSES: Record<CourseName, Course> = {
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

export const GOINGS = ["", "Good to Firm", "Good", "Good to Soft", "Soft"];

// Track insights unlocked by mastery (20/40/60/80/95). Realistic, original wording.
export const INSIGHTS: Record<CourseName, string[]> = {
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

export const MASTERY_STEPS = [20, 40, 60, 80, 95];
