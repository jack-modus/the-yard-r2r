import { GEAR, GOINGS, OR } from "@/lib/sim";
import type { GearId, Horse } from "@/lib/sim";
import type { TrainingPlan } from "@/lib/game/types";
import { Card } from "@/components/ui/Card";
import { StatBar } from "@/components/ui/StatBar";
import { PlanButton } from "@/components/ui/PlanButton";

const WORK_TYPES: [TrainingPlan, string][] = [
  ["gallop", "GALLOP"], ["canter", "CANTER"], ["sprints", "SPRINTS"], ["stalls", "STALLS"],
  ["school", "SCHOOL"], ["sharp", "SHARP"], ["easy", "EASY"], ["rest", "REST"],
];

const STAT_ROWS: [string, keyof Horse, string][] = [
  ["speed", "speed", "#a4161a"], ["stamina", "stamina", "#0b3d91"], ["accel", "accel", "#1b7a43"],
  ["break", "brk", "#7a1f5c"], ["balance", "balance", "#d2601a"], ["temper't", "temperament", "#0e7c86"],
  ["fitness", "fitness", "#5e2b97"], ["fatigue", "fatigue", "#8d6a1f"],
];

export function StableTab({
  horses, plan, onPlanChange, onToggleGear,
}: {
  horses: Horse[];
  plan: Record<number, TrainingPlan>;
  onPlanChange: (horseId: number, p: TrainingPlan) => void;
  onToggleGear: (horseId: number, gearId: GearId) => void;
}) {
  return (
    <div>
      <div className="font-mono px-3.5 pt-2.5 text-muted text-xs">
        Set each horse&apos;s work for tomorrow, then advance the day.
      </div>
      {horses.map(h => {
        const p = plan[h.id] || "easy";
        return (
          <Card key={h.id}>
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-base">{h.name}</span>
              <span className="font-mono font-bold text-sm">OR {OR(h)} · mark {h.mark ?? "unrated"}</span>
            </div>
            <div className="font-mono text-[11.5px] text-muted-dim">
              {h.colour} {h.sex} {h.age} ({h.sire} × {h.dam})
            </div>
            <div className="font-mono text-[11.5px] text-muted-dim mb-1.5">
              Form: <b className="tracking-widest">{h.form.length ? [...h.form].reverse().join("") : "—"}</b>
              {" · "}Trip: <b>{h.distKnown ? h.prefDist + "f" : "?"}</b>
              {" · "}Going: <b>{h.goingKnown ? GOINGS[h.prefGoing] : "?"}</b>
              {h.quirk && h.quirk.revealed && <b className="text-gold-800"> · the gift is out</b>}
              {h.injuryDays > 0 && <b className="text-bad"> · EASY LIST {h.injuryDays}d</b>}
            </div>
            {h.mark != null && h.mark !== OR(h) && (
              <div className="font-mono text-[11.5px] text-muted-dim mb-1.5 italic">
                {h.mark < OR(h) ? "You suspect this horse is better than its mark — well handicapped." : "The mark may be flattering it slightly — a touch exposed."}
              </div>
            )}
            {STAT_ROWS.map(([label, key, color]) => (
              <StatBar key={label} label={label} value={h[key] as number} color={color} />
            ))}
            <div className="flex gap-1 mt-2 flex-wrap">
              {WORK_TYPES.map(([id, label]) => (
                <PlanButton key={id} on={p === id} disabled={h.injuryDays > 0} onClick={() => onPlanChange(h.id, id)}>
                  {label}
                </PlanButton>
              ))}
            </div>
            <div className="font-mono text-[11.5px] text-muted-dim mt-1">
              gallop→speed · canter→stamina · sprints→accel · stalls→break · school→balance · sharp→a little of everything, gently · easy/rest→recover
            </div>
            <div className="font-mono text-[11.5px] text-muted-dim mt-2 mb-0.5">GEAR (equip before you declare):</div>
            <div className="flex gap-1 flex-wrap">
              {(Object.entries(GEAR) as [GearId, (typeof GEAR)[GearId]][]).map(([id, def]) => {
                const on = (h.gear || []).includes(id);
                const firstTime = on && !(h.gearRun || []).includes(id);
                return (
                  <PlanButton key={id} on={on} onClick={() => onToggleGear(h.id, id)}>
                    {def.label}
                    {firstTime ? " •1st" : ""}
                  </PlanButton>
                );
              })}
            </div>
            {h.formLines.length > 0 && (
              <div className="mt-2 border-t border-parchment-line pt-1.5">
                {h.formLines.slice(0, 4).map((f, i) => (
                  <div key={i} className="font-mono text-[11.5px] text-muted-dim py-0.5">
                    <b>{f.pos}/{f.of}</b> · {f.race}, {f.dist}f, {f.going} · SP {f.sp} — <i>{f.cmt}</i>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
