import { COURSES, INSIGHTS, MASTERY_STEPS } from "@/lib/sim";
import type { CourseName, Yard } from "@/lib/sim";
import { REPUTATION_TIER2_UNLOCK, unlockedCourses } from "@/lib/game/engine";
import type { GameState } from "@/lib/game/types";
import { Card } from "@/components/ui/Card";
import { PlanButton } from "@/components/ui/PlanButton";

export function NotebookTab({
  g, yard, walkPlan, onWalkPlan, onToggleStudy,
}: {
  g: GameState;
  yard: Yard;
  walkPlan: CourseName | null;
  onWalkPlan: (c: CourseName | null) => void;
  onToggleStudy: (c: CourseName) => void;
}) {
  return (
    <div>
      <div className="font-mono px-3.5 pt-2.5 text-muted text-xs">
        Course knowledge builds through racing there and walking the track. It&apos;s worth real lengths — and it unlocks what you&apos;ve learned.
        {walkPlan && <b className="text-gold-300"> Queued: walking {walkPlan} tomorrow — the string gets an easy day.</b>}
        {g.study && <b className="text-gold-300"> Studying {g.study} (+1/day).</b>}
      </div>
      {(() => {
        const unlockedTracks = unlockedCourses(g.reputation);
        return (Object.keys(COURSES) as CourseName[]).map(course => {
          const trackLocked = !unlockedTracks.includes(course);
          if (trackLocked) {
            return (
              <Card key={course} className="opacity-60">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-base">🔒 {course}</span>
                </div>
                <div className="font-mono text-[11.5px] text-muted-dim">
                  Unlocks once your reputation reaches {REPUTATION_TIER2_UNLOCK} (currently {Math.round(g.reputation)}).
                </div>
              </Card>
            );
          }
          const m = Math.round(g.mastery[course]);
          const home = yard.tracks.includes(course);
          const unlocked = MASTERY_STEPS.filter(t => m >= t).length;
          return (
            <Card key={course} className={home ? "border border-gold-500" : ""}>
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-base">{course}{home ? " ★" : ""}</span>
              <span className="font-mono font-bold text-sm">{m}/100</span>
            </div>
            <div className="font-mono text-[11.5px] text-muted-dim mb-1">{COURSES[course].line}</div>
            <div className="h-1.5 rounded-sm bg-[#ddd3c2] overflow-hidden">
              <div className="h-full bg-gold-500" style={{ width: `${m}%` }} />
            </div>
            <div className="mt-1.5">
              {INSIGHTS[course].map((ins, i) => (
                <div
                  key={i}
                  className={`font-diary text-[13px] leading-snug py-1 ${i ? "border-t border-dotted border-parchment-line" : ""} ${
                    i < unlocked ? "text-parchment-ink" : "text-parchment-border"
                  }`}
                >
                  {i < unlocked ? ins : `🔒 Unlocks at course knowledge ${MASTERY_STEPS[i]}`}
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <PlanButton on={walkPlan === course} onClick={() => onWalkPlan(walkPlan === course ? null : course)}>
                {walkPlan === course ? "✓ WALKING TOMORROW — TAP TO CANCEL" : "WALK TOMORROW (+8 · replaces training)"}
              </PlanButton>
              <PlanButton on={g.study === course} onClick={() => onToggleStudy(course)}>
                {g.study === course ? "✓ STUDYING (+1/DAY) — TAP TO STOP" : "STUDY THIS COURSE (+1/day, passive)"}
              </PlanButton>
            </div>
          </Card>
        );
        });
      })()}
    </div>
  );
}
