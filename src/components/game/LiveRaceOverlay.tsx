import { Button } from "@/components/ui/Button";
import type { LiveRace } from "@/lib/game/types";
import { COLUMN_PLAIN } from "@/components/ui/layout";
import { TrackVisual } from "@/components/game/TrackVisual";

export function LiveRaceOverlay({ liveRace, onNext }: { liveRace: LiveRace; onNext: () => void }) {
  const done = liveRace.idx + 1 >= liveRace.beats.length;
  const { track } = liveRace;
  return (
    <div className="fixed inset-0 bg-black/80 z-[32] flex items-center p-4">
      <div className={`${COLUMN_PLAIN} bg-ink-800 border-2 border-gold-500 rounded p-4 max-h-[85vh] overflow-y-auto`}>
        <div className="font-mono text-gold-500 tracking-wide mb-1.5">
          {liveRace.raceName.toUpperCase()} · {liveRace.idx + 1}/{liveRace.beats.length}
        </div>

        <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 mb-2 font-mono text-[9.5px] text-muted-dim">
          {track.runners.map(r => (
            <span key={r.number} className={`inline-flex items-center gap-1 ${r.player ? "text-gold-300 font-bold" : ""}`}>
              <span className="inline-block w-2.5 h-2.5 rounded-full border border-black/30 shrink-0" style={{ background: r.silk }} />
              {r.number} {r.player ? "YOU" : r.name}
            </span>
          ))}
        </div>

        <TrackVisual track={track} idx={liveRace.idx} course={liveRace.course} dist={liveRace.dist} />

        <div className="text-[15.5px] leading-relaxed min-h-[90px] font-diary">{liveRace.beats[liveRace.idx]}</div>
        <Button className="block w-full mt-2.5 text-center text-sm" onClick={onNext}>
          {done ? "BACK TO THE YARD" : liveRace.idx >= 9 ? "THE FINISH →" : "▶"}
        </Button>
      </div>
    </div>
  );
}
