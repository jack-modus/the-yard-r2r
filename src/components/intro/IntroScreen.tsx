"use client";
import { useState } from "react";
import { YARDS } from "@/lib/sim";
import type { YardId } from "@/lib/sim";
import { COLUMN } from "@/components/ui/layout";

export function IntroScreen({ onStart }: { onStart: (name: string, yardId: YardId) => void }) {
  const [step, setStep] = useState<"name" | "yard">("name");
  const [name, setName] = useState("");

  return (
    <div className="min-h-screen bg-ink-950">
    <div className={`${COLUMN} font-diary text-[#eee6f2] px-4 pt-5 pb-15`}>
      <h1 className="text-[26px] text-gold-300 [font-variant:small-caps] mb-1">The Yard</h1>
      <div className="text-[13px] text-muted italic mb-4">Rags to Riches</div>

      {step === "name" ? (
        <>
          <div className="text-sm text-[#a99fc0] mb-4.5 leading-normal">
            You are twenty-three, broke, and certain of exactly one thing: you can train a racehorse.
            Three yards are hiring an assistant. One of them is about to take a chance on you.
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
            onClick={() => setStep("yard")}
            className={`w-full mt-1.5 border-none px-3.5 py-3.5 text-[15px] font-bold tracking-wide rounded-sm font-mono ${
              name.trim() ? "bg-gold-500 text-ink-900 cursor-pointer" : "bg-[#4b415f] text-muted cursor-default"
            }`}
          >
            APPLY TO THE YARDS →
          </button>
        </>
      ) : (
        <>
          <div className="text-sm text-[#a99fc0] mb-4.5 leading-normal">
            Three replies. Three very different bosses. Whoever you choose, their two home tracks become <i>your</i> tracks — the ones you&apos;ll come to know stride by stride.
          </div>
          {(Object.entries(YARDS) as [YardId, (typeof YARDS)[YardId]][]).map(([id, y]) => (
            <div
              key={id}
              onClick={() => onStart(name, id)}
              className="bg-parchment text-parchment-ink border-2 border-transparent rounded-md p-3.5 mb-2.5 cursor-pointer hover:border-gold-500"
            >
              <div className="font-bold text-[15.5px]">
                {y.boss} <span className="font-normal opacity-75">— {y.yardName}</span>
              </div>
              <div className="text-[13px] leading-snug my-1">{y.persona}</div>
              <div className="font-mono text-[11.5px] opacity-80">
                Home tracks: {y.tracks.join(" & ")} · Stable jockey: {y.jockey.name} (skill {y.jockey.skill}) · {y.style}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
    </div>
  );
}
