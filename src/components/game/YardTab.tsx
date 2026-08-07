import { money } from "@/lib/sim";
import type { Yard } from "@/lib/sim";
import { REPUTATION_TIER2_UNLOCK } from "@/lib/game/engine";
import { metricRank } from "@/lib/game/ranks";
import { YARD_UPGRADES } from "@/lib/game/upgrades";
import type { YardUpgradeId } from "@/lib/game/upgrades";
import type { GameState, Milestones } from "@/lib/game/types";
import { Card } from "@/components/ui/Card";
import { StatBar } from "@/components/ui/StatBar";
import { Button } from "@/components/ui/Button";

const ROAD: [keyof Milestones, string][] = [
  ["firstWin", "Train your first winner"],
  ["secondHorse", "Earn a second horse"],
  ["listedWin", "Win at Listed level"],
  ["groupWin", "Win a Group race"],
  ["g1Win", "Win a Group 1 — rags to riches"],
];

export function YardTab({ g, yard, onBuyUpgrade }: { g: GameState; yard: Yard; onBuyUpgrade: (id: YardUpgradeId) => void }) {
  return (
    <div>
      <Card>
        <div className="font-bold text-base">{yard.boss}</div>
        <div className="font-mono text-[11.5px] text-muted-dim mb-1">{yard.yardName}</div>
        <div className="text-[13.5px] leading-snug italic">{yard.persona}</div>
      </Card>
      <Card>
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="font-mono font-bold tracking-wide">THE YARD</span>
          <span className="font-mono font-bold text-sm">{money(g.cash)}</span>
        </div>
        <div className="font-mono text-[11.5px] text-muted-dim mb-2">One-time investments in the yard — permanent, and never refunded.</div>
        {YARD_UPGRADES.map(u => {
          const owned = g.yardUpgrades[u.id];
          return (
            <div key={u.id} className="py-2 border-t border-dotted border-parchment-line">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-[14.5px]">{u.label}</span>
                {!owned && <span className="font-mono text-[11.5px] text-muted-dim">{money(u.cost)}</span>}
              </div>
              <div className="text-[13px] leading-snug">{u.blurb}</div>
              <div className="font-mono text-[11.5px] text-gold-800 mt-0.5">{u.effect}</div>
              {owned ? (
                <div className="font-mono text-[11.5px] text-good mt-1">✓ Owned</div>
              ) : (
                <Button className="mt-1.5" disabled={g.cash < u.cost} onClick={() => onBuyUpgrade(u.id)}>
                  {g.cash < u.cost ? "CAN'T AFFORD IT" : `BUY (${money(u.cost)})`}
                </Button>
              )}
            </div>
          );
        })}
      </Card>
      <Card>
        <div className="font-mono font-bold tracking-wide mb-1.5">STANDING</div>
        <StatBar label="trust" value={g.trust} color="#c9a227" />
        <div className="font-mono text-[11.5px] text-muted-dim mb-2">
          <b>{metricRank(g.trust)}.</b> {yard.boss.split(" ")[0]}&apos;s private opinion of you — {g.trust >= 75 ? "they'd back you in public now" : g.trust >= 45 ? "you've earned real responsibility" : "still proving yourself"}. Moves on more than just results.
        </div>
        <StatBar label="reputation" value={g.reputation} color="#0b3d91" />
        <div className="font-mono text-[11.5px] text-muted-dim mb-2">
          <b>{metricRank(g.reputation)}.</b> What insiders — jockeys, other trainers, the handicapper — think of your ability. Lags results, weighted by grade.
          {g.reputation < REPUTATION_TIER2_UNLOCK && ` Reach ${REPUTATION_TIER2_UNLOCK} to unlock the bigger tracks.`}
        </div>
        <StatBar label="celebrity" value={g.celebrity} color="#7a1f5c" />
        <div className="font-mono text-[11.5px] text-muted-dim mb-2">
          <b>{metricRank(g.celebrity)}.</b> Public and media profile. Can pull against reputation — chasing headlines reads as showmanship to insiders.
        </div>
        <StatBar label="skill" value={g.skill} color="#1b7a43" />
        <div className="font-mono text-[11.5px] text-muted-dim">
          <b>{metricRank(g.skill)}.</b> Your own accumulated craft. Never falls — built from races run, course walks, and seasons survived, not just wins.
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
