import { money } from "@/lib/sim";
import type { Yard } from "@/lib/sim";
import type { GameState } from "@/lib/game/types";

export function Header({ g, yard, onHelp }: { g: GameState; yard: Yard; onHelp: () => void }) {
  return (
    <div className="px-3.5 pt-4 pb-2 border-b-[3px] border-double border-gold-500">
      <h1 className="text-[22px] tracking-wide m-0 text-gold-300 [font-variant:small-caps]">The Yard: Rags to Riches</h1>
      <div className="font-mono text-xs text-muted mt-0.5">
        {g.playerName} · {yard.yardName}
      </div>
      <div className="flex gap-3 mt-1.5 font-mono text-xs flex-wrap items-center">
        <span>YR {g.year} · DAY {g.day}</span>
        <span>{money(g.cash)}</span>
        <span>TRUST {g.trust}</span>
        <span
          onClick={onHelp}
          className="ml-auto cursor-pointer text-gold-500 border border-gold-500 rounded-full w-[18px] h-[18px] inline-flex items-center justify-center font-bold"
        >
          ?
        </span>
      </div>
    </div>
  );
}
