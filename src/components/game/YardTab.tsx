import type { Yard } from "@/lib/sim";
import type { GameState, Milestones } from "@/lib/game/types";
import { Card } from "@/components/ui/Card";

const ROAD: [keyof Milestones, string][] = [
  ["firstWin", "Train your first winner"],
  ["secondHorse", "Earn a second horse"],
  ["listedWin", "Win at Listed level"],
  ["groupWin", "Win a Group race"],
  ["g1Win", "Win a Group 1 — rags to riches"],
];

export function YardTab({ g, yard }: { g: GameState; yard: Yard }) {
  return (
    <div>
      <Card>
        <div className="font-bold text-base">{yard.boss}</div>
        <div className="font-mono text-[11.5px] text-muted-dim mb-1">{yard.yardName}</div>
        <div className="text-[13.5px] leading-snug italic">{yard.persona}</div>
        <div className="font-mono text-[11.5px] text-muted-dim mt-1.5">
          Trust: {g.trust}/100 — {g.trust >= 75 ? "they'd back you in public now" : g.trust >= 45 ? "you've earned real responsibility" : "still proving yourself"}
        </div>
      </Card>
      <Card>
        <div className="font-mono font-bold tracking-wide mb-1.5">THE ROAD</div>
        {ROAD.map(([k, label]) => (
          <div key={k} className="flex gap-2 py-1 border-t border-dotted border-parchment-line">
            <span className={`font-mono font-bold ${g.milestones[k] ? "text-good" : "text-parchment-border"}`}>{g.milestones[k] ? "✓" : "○"}</span>
            <span className={`text-sm ${g.milestones[k] ? "text-gold-700 line-through" : "text-parchment-ink"}`}>{label}</span>
          </div>
        ))}
      </Card>
      {g.messages.map((m, i) => (
        <Card key={i} className="bg-parchment-dim!">
          <span className="font-mono text-[11.5px] text-gold-700">DAY {m.day}</span>
          <div className="text-[13.5px] mt-0.5 leading-snug">{m.text}</div>
        </Card>
      ))}
    </div>
  );
}
