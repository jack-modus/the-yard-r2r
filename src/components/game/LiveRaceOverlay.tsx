import { Button } from "@/components/ui/Button";
import type { LiveRace } from "@/lib/game/types";

export function LiveRaceOverlay({ liveRace, onNext }: { liveRace: LiveRace; onNext: () => void }) {
  const done = liveRace.idx + 1 >= liveRace.beats.length;
  return (
    <div className="fixed inset-0 bg-black/80 z-[32] flex items-center p-4">
      <div className="bg-ink-800 border-2 border-gold-500 rounded p-4 w-full">
        <div className="font-mono text-gold-500 tracking-wide mb-1">
          {liveRace.raceName.toUpperCase()} · {liveRace.idx + 1}/{liveRace.beats.length}
        </div>
        <div className="text-[15.5px] leading-relaxed min-h-[90px] font-diary">{liveRace.beats[liveRace.idx]}</div>
        <Button className="block w-full mt-2.5 text-center text-sm" onClick={onNext}>
          {done ? "BACK TO THE YARD" : liveRace.idx >= 9 ? "THE FINISH →" : "▶"}
        </Button>
      </div>
    </div>
  );
}
