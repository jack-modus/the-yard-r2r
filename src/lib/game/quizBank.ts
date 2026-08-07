// The quiz question bank — both the track-knowledge quiz (originally
// deferred) and general horse-racing trivia, per playtesting feedback that
// this should double as a way to actually learn something about the sport.
// Track questions draw on the original course facts already written in
// lib/sim/courses.ts (never copied from Racing Post/Timeform/etc — same
// hard rule that file follows). General questions stick to terminology,
// rules, distances, and real *race* names (an established exception, see
// CLAUDE.md hard rule 1) — deliberately avoiding real jockeys'/trainers'
// names, since the "no real named people" rule's spirit plausibly extends
// to trivia content even though it isn't roleplay.
import type { CourseName } from "@/lib/sim";

export type QuizDifficulty = "easy" | "medium" | "hard";

export interface QuizQuestion {
  id: string;
  category: "track" | "general";
  difficulty: QuizDifficulty;
  course?: CourseName; // set when category === "track"
  question: string;
  options: string[];
  correctIndex: number;
}

export const QUIZ_BANK: QuizQuestion[] = [
  // ---------- track knowledge ----------
  { id: "t-york-1", category: "track", difficulty: "easy", course: "York", question: "York's Knavesmire is famous for being one of the fairest tracks in Britain because it's...", options: ["Wide and flat", "Tight and twisting", "Uphill the whole way", "Only used at night"], correctIndex: 0 },
  { id: "t-york-2", category: "track", difficulty: "medium", course: "York", question: "On York's broad, easy bends, which type of horse gets the fairest deal?", options: ["A hold-up horse saving its run", "A horse that hates traffic", "A horse that can't settle", "None — the draw decides everything"], correctIndex: 0 },
  { id: "t-chester-1", category: "track", difficulty: "easy", course: "Chester", question: "What's distinctive about Chester's Roodee?", options: ["It's barely a mile round and constantly turning left", "It's dead straight for six furlongs", "It has the longest home straight in Britain", "It only stages jump racing"], correctIndex: 0 },
  { id: "t-chester-2", category: "track", difficulty: "medium", course: "Chester", question: "Why is a low draw prized at Chester?", options: ["The field is always turning left, so ground lost early is rarely recovered", "Low numbers get better going", "It's tradition, nothing more", "High stalls face away from the crowd"], correctIndex: 0 },
  { id: "t-newmarket-1", category: "track", difficulty: "easy", course: "Newmarket", question: "The Rowley Mile's most notorious feature is called...", options: ["The Dip", "The Chair", "The Cauldron", "The Elbow"], correctIndex: 0 },
  { id: "t-newmarket-2", category: "track", difficulty: "hard", course: "Newmarket", question: "Why does the Dip at Newmarket catch horses out?", options: ["It's a downhill run into a rising finish, unbalancing them late", "It floods after rain", "It's the tightest turn on the course", "It's where the stalls are loaded"], correctIndex: 0 },
  { id: "t-ascot-1", category: "track", difficulty: "easy", course: "Ascot", question: "What makes the finish at Ascot so demanding?", options: ["A stiff climb through the final two furlongs", "A sharp downhill sprint", "A ninety-degree turn", "Nothing — it's flat as a pancake"], correctIndex: 0 },
  { id: "t-ascot-2", category: "track", difficulty: "medium", course: "Ascot", question: "At Ascot, course-and-distance winners are worth extra respect because...", options: ["Handling that climb is a repeatable skill", "The prize money is doubled", "They get a weight allowance", "The going is always different"], correctIndex: 0 },
  { id: "t-epsom-1", category: "track", difficulty: "easy", course: "Epsom", question: "Epsom's Tattenham Corner is notorious for its...", options: ["Severe camber", "Total darkness under floodlights", "Water jump", "Split-level finish"], correctIndex: 0 },
  { id: "t-epsom-2", category: "track", difficulty: "hard", course: "Epsom", question: "What happens to horses that fight their rider early on Epsom's Derby course?", options: ["They pay for it later on the steep opening climb", "Nothing — the course is flat throughout", "They're automatically disqualified", "They gain an advantage downhill"], correctIndex: 0 },
  { id: "t-sandown-1", category: "track", difficulty: "easy", course: "Sandown", question: "Sandown's defining feature is a stiff uphill finish starting from...", options: ["The two-furlong pole", "The final fifty yards", "The three-quarter-mile marker", "The stalls themselves"], correctIndex: 0 },
  { id: "t-doncaster-1", category: "track", difficulty: "easy", course: "Doncaster", question: "Doncaster's Town Moor is generally considered...", options: ["Flat, wide and galloping — form usually works out honestly", "Britain's tightest track", "A notorious draw-bias nightmare", "Only suitable for two-year-olds"], correctIndex: 0 },
  { id: "t-doncaster-2", category: "track", difficulty: "medium", course: "Doncaster", question: "The St Leger, run at Doncaster, is raced over roughly what trip?", options: ["One mile six furlongs", "Five furlongs", "One mile", "Two and a half miles"], correctIndex: 0 },
  { id: "t-goodwood-1", category: "track", difficulty: "easy", course: "Goodwood", question: "Goodwood's switchback profile — uphill, downhill, turning — rewards...", options: ["A nimble, well-balanced horse", "Only the biggest, heaviest horses", "Horses that hate quick ground", "Nothing in particular"], correctIndex: 0 },
  { id: "t-goodwood-2", category: "track", difficulty: "medium", course: "Goodwood", question: "At Goodwood, which running style tends to do well?", options: ["Front-runners and prominent racers", "Deep hold-up horses", "It makes no difference at all", "Only horses ridden by an apprentice"], correctIndex: 0 },
  { id: "t-general-tier2", category: "track", difficulty: "medium", question: "Which of these is generally regarded as a stiffer test of stamina: an uphill finish or a downhill one?", options: ["Uphill", "Downhill", "They're identical", "Depends entirely on the weather"], correctIndex: 0 },

  // ---------- general trivia: easy ----------
  { id: "g-e1", category: "general", difficulty: "easy", question: "How many yards are in a furlong?", options: ["220", "110", "440", "1,000"], correctIndex: 0 },
  { id: "g-e2", category: "general", difficulty: "easy", question: "How many furlongs make up a mile?", options: ["8", "4", "10", "6"], correctIndex: 0 },
  { id: "g-e3", category: "general", difficulty: "easy", question: "A horse's coloured racing jacket is called its...", options: ["Silks", "Blinkers", "Colours book", "Saddlecloth"], correctIndex: 0 },
  { id: "g-e4", category: "general", difficulty: "easy", question: "What's the term for a race that only unraced or never-won horses can enter?", options: ["A maiden race", "An open race", "A novice hurdle", "A trial"], correctIndex: 0 },
  { id: "g-e5", category: "general", difficulty: "easy", question: "What piece of headgear is used to stop a horse seeing sideways and losing focus?", options: ["Blinkers", "A hood", "A tongue tie", "Cheekpieces"], correctIndex: 0 },
  { id: "g-e6", category: "general", difficulty: "easy", question: "A one-year-old racehorse is generally referred to as a...", options: ["Yearling", "Foal", "Juvenile", "Colt only"], correctIndex: 0 },
  { id: "g-e7", category: "general", difficulty: "easy", question: "The area where horses are walked and inspected before a race is the...", options: ["Parade ring", "Winner's enclosure", "Weighing room", "Paddock stand"], correctIndex: 0 },
  { id: "g-e8", category: "general", difficulty: "easy", question: "What does 'going' describe?", options: ["The condition of the racing surface underfoot", "How fast the pace was", "The number of runners", "A horse's temperament"], correctIndex: 0 },
  { id: "g-e9", category: "general", difficulty: "easy", question: "A young female racehorse (before she's had a foal) is called a...", options: ["Filly", "Mare", "Dam", "Vixen"], correctIndex: 0 },
  { id: "g-e10", category: "general", difficulty: "easy", question: "What's the term for a male horse that hasn't been gelded?", options: ["Colt or stallion", "Gelding", "Dam", "Yearling"], correctIndex: 0 },
  { id: "g-e11", category: "general", difficulty: "easy", question: "'Good to Firm' describes what?", options: ["The going — on the firmer, faster end", "A horse's mood before a race", "A jockey's riding style", "The quality of a horse's stabling"], correctIndex: 0 },
  { id: "g-e12", category: "general", difficulty: "easy", question: "Which of these is the softest going listed?", options: ["Heavy", "Good to Firm", "Firm", "Good"], correctIndex: 0 },

  // ---------- general trivia: medium ----------
  { id: "g-m1", category: "general", difficulty: "medium", question: "What does a horse's 'official rating' (OR) represent?", options: ["A handicapper's assessment of its ability, in pounds", "Its finishing position last time out", "Its starting price at the last race", "The number of races it has won"], correctIndex: 0 },
  { id: "g-m2", category: "general", difficulty: "medium", question: "A horse said to be 'well handicapped' is one whose true ability is...", options: ["Above its official mark", "Exactly matched to its mark", "Unknown until it races again", "Below its official mark"], correctIndex: 0 },
  { id: "g-m3", category: "general", difficulty: "medium", question: "What's a 'Listed' race, in the grading hierarchy?", options: ["A step below Group races, but above ordinary handicaps", "The very top tier, above Group 1", "A race exclusively for two-year-olds", "Another name for a maiden race"], correctIndex: 0 },
  { id: "g-m4", category: "general", difficulty: "medium", question: "Which of Britain's five Classic races is run over the shortest distance?", options: ["The 2000 Guineas", "The Derby", "The St Leger", "The Oaks"], correctIndex: 0 },
  { id: "g-m5", category: "general", difficulty: "medium", question: "The Oaks is restricted to which horses?", options: ["Three-year-old fillies", "Three-year-old colts only", "Any horse aged four or over", "Geldings only"], correctIndex: 0 },
  { id: "g-m6", category: "general", difficulty: "medium", question: "What does 'each-way' betting actually cover?", options: ["A bet split between the horse winning and it placing", "A bet on two different horses in the same race", "A bet that pays out only on a photo finish", "A bet placed after the race has started"], correctIndex: 0 },
  { id: "g-m7", category: "general", difficulty: "medium", question: "A 'course specialist' is a horse that...", options: ["Consistently performs well at one particular track", "Has only ever run at one distance", "Was bred at the track's own stud", "Is trained by the track's resident trainer"], correctIndex: 0 },
  { id: "g-m8", category: "general", difficulty: "medium", question: "What is a 'tongue tie' used for?", options: ["To stop a horse's tongue getting over the bit and restricting its breathing", "To keep a horse calm in the stalls", "To improve its balance around bends", "It's purely decorative"], correctIndex: 0 },
  { id: "g-m9", category: "general", difficulty: "medium", question: "In racing, what's a 'bumper'?", options: ["A flat race for horses being aimed at jump racing", "A race with no betting allowed", "Another name for a photo finish", "A race run entirely downhill"], correctIndex: 0 },
  { id: "g-m10", category: "general", difficulty: "medium", question: "What does it mean if a horse is described as 'up in trip'?", options: ["It's racing over a longer distance than before", "It's been promoted a grade", "It's carrying more weight", "It's travelling further to the racecourse"], correctIndex: 0 },
  { id: "g-m11", category: "general", difficulty: "medium", question: "The Grand National is run over what kind of course?", options: ["A jumps (National Hunt) course with distinctive fences", "A flat, all-weather track", "A five-furlong sprint course", "An indoor arena"], correctIndex: 0 },
  { id: "g-m12", category: "general", difficulty: "medium", question: "What's the purpose of a starting stall?", options: ["To give every horse a fair, simultaneous start", "To weigh the horse before the race", "To cool a horse down after running", "To separate colts from fillies"], correctIndex: 0 },

  // ---------- general trivia: hard ----------
  { id: "g-h1", category: "general", difficulty: "hard", question: "What is 'All-Weather' racing?", options: ["Racing on a synthetic surface, run regardless of weather affecting turf", "Racing that only happens in bad weather", "A type of jump racing", "Racing with no going description at all"], correctIndex: 0 },
  { id: "g-h2", category: "general", difficulty: "hard", question: "A 'conditions race' sets its entry terms based mainly on...", options: ["Factors like age, sex and past winnings, not a handicap mark", "The horse's coat colour", "Whether the trainer has won there before", "The size of the field only"], correctIndex: 0 },
  { id: "g-h3", category: "general", difficulty: "hard", question: "What does it mean for a horse to be 'entire'?", options: ["It has not been gelded (castrated)", "It has raced in every category available", "It has never been beaten", "It is racing for the very first time"], correctIndex: 0 },
  { id: "g-h4", category: "general", difficulty: "hard", question: "In breeding terms, a horse's 'dam' is its...", options: ["Mother", "Father", "Full sibling", "Trainer's own horse"], correctIndex: 0 },
  { id: "g-h5", category: "general", difficulty: "hard", question: "And a horse's 'sire'?", options: ["Its father", "Its mother", "Its groom", "Its racing manager"], correctIndex: 0 },
  { id: "g-h6", category: "general", difficulty: "hard", question: "What's a 'dead heat'?", options: ["Two or more horses judged to have finished in an exact tie", "A race abandoned due to extreme heat", "A race with only one runner", "A photo finish that's later overturned"], correctIndex: 0 },
  { id: "g-h7", category: "general", difficulty: "hard", question: "Roughly how much does a furlong pole mark, and why does it matter to jockeys?", options: ["It marks each remaining furlong so a jockey can judge pace precisely", "It marks the exact halfway point of every race regardless of distance", "It's purely decorative, with no functional use", "It marks where photographers are allowed to stand"], correctIndex: 0 },
  { id: "g-h8", category: "general", difficulty: "hard", question: "What does 'in-form' typically describe?", options: ["A horse running well based on its recent results", "A horse that has just been bought", "A horse wearing first-time gear", "A jockey who has recently changed stables"], correctIndex: 0 },
  { id: "g-h9", category: "general", difficulty: "hard", question: "The term 'going stick' refers to a device used to...", options: ["Measure the firmness of the racing surface", "Discipline a badly-behaved horse", "Mark out the stalls before a race", "Test a jockey's whip technique"], correctIndex: 0 },
  { id: "g-h10", category: "general", difficulty: "hard", question: "What is a 'nursery' handicap?", options: ["A handicap race restricted to two-year-olds", "A race for retired broodmares", "A race held at a training facility, not a track", "Another name for a maiden race"], correctIndex: 0 },
];
