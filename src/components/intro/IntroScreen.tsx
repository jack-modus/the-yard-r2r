"use client";
import { useState } from "react";
import { YARD } from "@/lib/sim";
import { COLUMN } from "@/components/ui/layout";

export function IntroScreen({ onStart }: { onStart: (name: string) => void }) {
  const [name, setName] = useState("");

  return (
    <div className="min-h-screen bg-ink-950">
    <div className={`${COLUMN} font-diary text-[#eee6f2] px-4 pt-5 pb-15`}>
      <h1 className="text-[26px] text-gold-300 [font-variant:small-caps] mb-1">The Yard</h1>
      <div className="text-[13px] text-muted italic mb-4">Rags to Riches</div>

      <div className="text-sm text-[#a99fc0] mb-4.5 leading-normal">
        You are twenty-three, broke, and certain of exactly one thing: you can train a racehorse.
        {" "}{YARD.yardName} is hiring an assistant — and about to take a chance on you.
      </div>

      <div className="bg-parchment text-parchment-ink rounded-md p-3.5 mb-4.5">
        <div className="font-bold text-[15.5px]">
          {YARD.boss} <span className="font-normal opacity-75">— {YARD.yardName}</span>
        </div>
        <div className="text-[13px] leading-snug my-1">{YARD.persona}</div>
        <div className="font-mono text-[11.5px] opacity-80">
          Starting tracks: {YARD.tracks.join(", ")} · Stable jockey: {YARD.jockey.name} (skill {YARD.jockey.skill})
        </div>
      </div>

      <div className="font-mono text-xs tracking-wider text-gold-500 mb-1.5">YOUR NAME</div>
      <input
        className="w-full p-2.5 font-diary text-[15px] rounded-sm border border-gold-500 bg-parchment text-parchment-ink mb-4.5"
        placeholder="e.g. Jack Nettleford"
        value={name}
        maxLength={28}
        onChange={e => setName(e.target.value)}
      />
      <button
        disabled={!name.trim()}
        onClick={() => onStart(name)}
        className={`w-full mt-1.5 border-none px-3.5 py-3.5 text-[15px] font-bold tracking-wide rounded-sm font-mono ${
          name.trim() ? "bg-gold-500 text-ink-900 cursor-pointer" : "bg-[#4b415f] text-muted cursor-default"
        }`}
      >
        BEGIN →
      </button>
    </div>
    </div>
  );
}
