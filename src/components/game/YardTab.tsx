import type { Yard } from "@/lib/sim";
import { REPUTATION_TIER2_UNLOCK } from "@/lib/game/engine";
import type { GameState, Milestones } from "@/lib/game/types";
import { Card } from "@/components/ui/Card";
import { StatBar } from "@/components/ui/StatBar";

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
      </Card>
      <Card>
        <div className="font-mono font-bold tracking-wide mb-1.5">STANDING</div>
        <StatBar label="trust" value={g.trust} color="#c9a227" />
        <div className="font-mono text-[11.5px] text-muted-dim mb-2">
          {yard.boss.split(" ")[0]}&apos;s private opinion of you — {g.trust >= 75 ? "they'd back you in public now" : g.trust >= 45 ? "you've earned real responsibility" : "still proving yourself"}. Moves on more than just results.
        </div>
        <StatBar label="reputation" value={g.reputation} color="#0b3d91" />
        <div className="font-mono text-[11.5px] text-muted-dim mb-2">
          What insiders — jockeys, other trainers, the handicapper — think of your ability. Lags results, weighted by grade.
          {g.reputation < REPUTATION_TIER2_UNLOCK && ` Reach ${REPUTATION_TIER2_UNLOCK} to unlock the bigger tracks.`}
        </div>
        <StatBar label="celebrity" value={g.celebrity} color="#7a1f5c" />
        <div className="font-mono text-[11.5px] text-muted-dim mb-2">
          Public and media profile. Can pull against reputation — chasing headlines reads as showmanship to insiders.
        </div>
        <StatBar label="skill" value={g.skill} color="#1b7a43" />
        <div className="font-mono text-[11.5px] text-muted-dim">
          Your own accumulated craft. Never falls — built from races run, course walks, and seasons survived, not just wins.
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
