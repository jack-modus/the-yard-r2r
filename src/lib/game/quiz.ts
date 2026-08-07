// Quiz decision generator — draws from quizBank.ts. Correct answers reward
// track mastery (for "track" questions) or a small stat boost on a random
// fit horse (for "general" questions, mirroring content.ts's trainingMoment
// pattern of picking a horse once at generation time). Wrong answers are
// low-stakes — no penalty, just requeued for "3 questions' time" (3 quiz
// occurrences, not calendar days, tracked via GameState.quizCount).
import { clamp, pick, ri } from "@/lib/sim";
import { note, withHorse } from "./stateUtils";
import { QUIZ_BANK } from "./quizBank";
import type { QuizDifficulty, QuizQuestion } from "./quizBank";
import type { DecisionEvent, GameState } from "./types";

const STAT_KEYS = ["speed", "stamina", "accel", "brk", "balance"] as const;

// Skews toward easy early, mixing in medium/hard as the player's seen more
// questions — a simple threshold-band approach rather than a smooth curve,
// deliberately: this only needs to feel like it's getting harder, not model
// anything precisely.
function difficultyPool(quizCount: number): QuizDifficulty[] {
  if (quizCount < 10) return ["easy", "easy", "easy", "medium"];
  if (quizCount < 30) return ["easy", "medium", "medium", "hard"];
  return ["medium", "hard", "hard", "easy"];
}

function pickQuestion(s: GameState): QuizQuestion | null {
  const due = s.quizMissed.filter(m => m.dueAfter <= s.quizCount);
  if (due.length) {
    const target = pick(due);
    const q = QUIZ_BANK.find(x => x.id === target.id);
    if (q) return q;
  }
  const difficulty = pick(difficultyPool(s.quizCount));
  const candidates = QUIZ_BANK.filter(x => x.difficulty === difficulty);
  return candidates.length ? pick(candidates) : pick(QUIZ_BANK);
}

function applyQuizResult(s: GameState, q: QuizQuestion, correct: boolean, rewardHorseId: number | null): GameState {
  const quizCount = s.quizCount + 1;
  const quizMissed = s.quizMissed.filter(m => m.id !== q.id);
  if (!correct) {
    return note(
      { ...s, quizCount, quizMissed: [...quizMissed, { id: q.id, dueAfter: quizCount + 3 }] },
      `Not quite — the answer was "${q.options[q.correctIndex]}". Worth another look in a few questions' time.`,
    );
  }
  if (q.category === "track" && q.course) {
    const boost = ri(8, 15);
    return note(
      { ...s, quizCount, quizMissed, mastery: { ...s.mastery, [q.course]: clamp(s.mastery[q.course] + boost, 0, 100) } },
      `Correct! That's ${q.course} knowledge sinking in — course mastery +${boost}.`,
    );
  }
  if (rewardHorseId != null) {
    const key = pick(STAT_KEYS);
    let horseName = "";
    let after = 0;
    const next = withHorse({ ...s, quizCount, quizMissed }, rewardHorseId, h => {
      horseName = h.name;
      after = clamp(Math.round((h[key] + ri(2, 4)) * 10) / 10, 0, h.statCeilings[key]);
      return { ...h, [key]: after };
    });
    return note(next, `Correct! You put it into practice on the gallops — ${horseName}'s ${key === "brk" ? "break" : key} is up a touch.`);
  }
  return note({ ...s, quizCount, quizMissed }, `Correct! Filed away for next time.`);
}

export function quizMoment(s: GameState): DecisionEvent | null {
  const q = pickQuestion(s);
  if (!q) return null;
  const fit = s.horses.filter(h => h.injuryDays === 0);
  const rewardHorseId = q.category === "general" && fit.length ? pick(fit).id : null;
  return {
    title: q.category === "track" ? `A question about ${q.course}` : "A question about racing",
    tag: "QUIZ",
    text: q.question,
    choices: q.options.map((label, i) => ({
      label,
      apply: (st: GameState) => applyQuizResult(st, q, i === q.correctIndex, rewardHorseId),
    })),
  };
}
