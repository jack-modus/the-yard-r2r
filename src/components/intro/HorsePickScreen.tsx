"use client";
import { useState } from "react";
import type { Horse } from "@/lib/sim";
import { COLUMN } from "@/components/ui/layout";
import { StatBar } from "@/components/ui/StatBar";

const REQUIRED = 3;

const STAT_ROWS: [string, keyof Horse, string][] = [
  ["speed", "speed", "#a4161a"], ["stamina", "stamina", "#0b3d91"], ["accel", "accel", "#1b7a43"],
  ["break", "brk", "#7a1f5c"], ["balance", "balance", "#d2601a"], ["temper't", "temperament", "#0e7c86"],
];

export function HorsePickScreen({ candidates, onConfirm }: { candidates: Horse[]; onConfirm: (chosenIds: number[]) => void }) {
  const [chosen, setChosen] = useState<number[]>([]);

  const toggle = (id: number) => {
    setChosen(c => {
      if (c.includes(id)) return c.filter(x => x !== id);
      if (c.length >= REQUIRED) return c;
      return [...c, id];
    });
  };

  return (
    <div className="min-h-screen bg-ink-950">
    <div className={`${COLUMN} font-diary text-[#eee6f2] px-4 pt-5 pb-24`}>
      <h1 className="text-[22px] text-gold-300 [font-variant:small-caps] mb-1">Pick three of them tomorrow</h1>
      <div className="text-sm text-[#a99fc0] mb-4 leading-normal">
        Bridges has six horses spare. Pick three to build your string — the rest go elsewhere. Choose on what you
        can see; whatever&apos;s hidden reveals itself in time, same as it always does.
      </div>

      {candidates.map(h => {
        const on = chosen.includes(h.id);
        return (
          <div
            key={h.id}
            onClick={() => toggle(h.id)}
            className={`bg-parchment text-parchment-ink rounded-md p-3.5 mb-2.5 cursor-pointer border-2 ${on ? "border-gold-500" : "border-transparent"}`}
          >
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-[15.5px]">{h.name}</span>
              <span className="font-mono text-xs">{on ? "✓ SELECTED" : ""}</span>
            </div>
            <div className="font-mono text-[11.5px] text-muted-dim mb-1.5">
              {h.colour} {h.sex} {h.age} ({h.sire} × {h.dam})
            </div>
            {STAT_ROWS.map(([label, key, color]) => (
              <StatBar key={label} label={label} value={h[key] as number} color={color} />
            ))}
          </div>
        );
      })}

      <button
        disabled={chosen.length !== REQUIRED}
        onClick={() => onConfirm(chosen)}
        className={`w-full mt-2 border-none px-3.5 py-3.5 text-[15px] font-bold tracking-wide rounded-sm font-mono ${
          chosen.length === REQUIRED ? "bg-gold-500 text-ink-900 cursor-pointer" : "bg-[#4b415f] text-muted cursor-default"
        }`}
      >
        {chosen.length}/{REQUIRED} SELECTED — {chosen.length === REQUIRED ? "CONFIRM →" : "PICK MORE"}
      </button>
    </div>
    </div>
  );
}
