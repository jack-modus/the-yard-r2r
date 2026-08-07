import { Button } from "@/components/ui/Button";
import type { LiveRace } from "@/lib/game/types";
import { COLUMN_PLAIN } from "@/components/ui/layout";

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

        <div className="relative bg-ink-900 rounded-sm border border-line mb-2.5 pt-4 pb-1.5 px-1">
          <div className="absolute left-1 top-0.5 font-mono text-[8px] text-muted-dim tracking-wide">STALLS</div>
          <div className="absolute right-1 top-0.5 font-mono text-[8px] text-gold-500 tracking-wide">FINISH</div>
          <div className="absolute left-1 top-4 bottom-1.5 w-px bg-line" />
          <div className="absolute right-1 top-4 bottom-1.5 w-px bg-gold-500/60" />
          {track.runners.map(r => (
            <div key={r.number} className="relative h-[17px]">
              <div
                className={`absolute top-0 flex items-center justify-center rounded-full font-mono transition-all duration-500 ease-out ${
                  r.player ? "w-4 h-4 text-[8.5px] ring-2 ring-gold-400 z-10" : "w-3.5 h-3.5 text-[7.5px]"
                }`}
                style={{
                  left: `calc(${r.positions[liveRace.idx] * 100}% - ${r.player ? 8 : 7}px)`,
                  background: r.silk,
                  color: "#f6f1e7",
                }}
              >
                {r.number}
              </div>
            </div>
          ))}
        </div>

        <div className="text-[15.5px] leading-relaxed min-h-[90px] font-diary">{liveRace.beats[liveRace.idx]}</div>
        <Button className="block w-full mt-2.5 text-center text-sm" onClick={onNext}>
          {done ? "BACK TO THE YARD" : liveRace.idx >= 9 ? "THE FINISH →" : "▶"}
        </Button>
      </div>
    </div>
  );
}
