"use client";
import { useState } from "react";
import { YARD, money } from "@/lib/sim";
import type { GameState } from "@/lib/game/types";
import { COLUMN } from "@/components/ui/layout";
import { StatBar } from "@/components/ui/StatBar";

const VERDICT_HEADLINE: Record<NonNullable<GameState["ending"]>["verdict"], string> = {
  contract: "CONTRACT EXTENDED",
  poached: "A NEW OFFER",
  released: "RELEASED",
};

const OUTCOME_LABEL: Record<string, string> = { win: "WON", place: "PLACED", okay: "RAN ON", tank: "BEATEN", scratched: "SCRATCHED" };
const OUTCOME_COLOR: Record<string, string> = { win: "text-good", place: "text-gold-700", okay: "text-muted-dim", tank: "text-bad", scratched: "text-muted-dim" };

function buildShareText(g: GameState): string {
  const ending = g.ending!;
  const diamondResult = g.results.find(r => r.race.name === "The Diamond Cup");
  const lines = [
    `THE YARD: RAGS TO RICHES — career summary`,
    `Tony Vincenzo, ${YARD.yardName}`,
    ``,
    `VERDICT: ${VERDICT_HEADLINE[ending.verdict]}`,
    ``,
    `Trust ${g.trust} · Reputation ${g.reputation} · Celebrity ${g.celebrity} · Skill ${g.skill}`,
    `vs Martin McLean: ${g.story.headToHead.wins}-${g.story.headToHead.losses}`,
    ``,
    `The Classics:`,
    ...g.story.classicResults.map(r => `  ${r.name}: ${OUTCOME_LABEL[r.outcome]}`),
    diamondResult ? `  The Diamond Cup: ${diamondResult.mine.pos === 1 ? "WON" : `${diamondResult.mine.pos} of ${diamondResult.res.length}`}` : "",
    ``,
    `Horses: ${g.horses.map(h => `${h.name} (${h.wins}W/${h.runs}R, ${money(h.earnings)})`).join(", ")}`,
  ];
  return lines.filter(l => l !== "").join("\n");
}

export function EndingScreen({ g }: { g: GameState }) {
  const [copied, setCopied] = useState(false);
  if (!g.ending) return null;
  const diamondResult = g.results.find(r => r.race.name === "The Diamond Cup");
  const shareText = buildShareText(g);

  const share = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: "The Yard: Rags to Riches", text: shareText });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950">
      <div className={`${COLUMN} font-diary text-[#eee6f2] px-4 pt-8 pb-16`}>
        <div className="font-mono text-xs tracking-widest text-gold-500 mb-1">END OF YEAR ONE</div>
        <h1 className="text-2xl text-gold-300 [font-variant:small-caps] mb-4">{VERDICT_HEADLINE[g.ending.verdict]}</h1>

        <div className="bg-parchment text-parchment-ink rounded-md p-3.5 mb-4">
          <div className="text-[14px] leading-relaxed">{g.ending.text}</div>
        </div>

        <div className="bg-parchment text-parchment-ink rounded-md p-3.5 mb-4">
          <div className="font-mono font-bold tracking-wide mb-2">STANDING</div>
          <StatBar label="trust" value={g.trust} color="#c9a227" />
          <StatBar label="reputation" value={g.reputation} color="#0b3d91" />
          <StatBar label="celebrity" value={g.celebrity} color="#7a1f5c" />
          <StatBar label="skill" value={g.skill} color="#1b7a43" />
          <div className="font-mono text-[11.5px] text-muted-dim mt-2">
            vs Martin McLean: {g.story.headToHead.wins}-{g.story.headToHead.losses}
          </div>
        </div>

        <div className="bg-parchment text-parchment-ink rounded-md p-3.5 mb-4">
          <div className="font-mono font-bold tracking-wide mb-2">THE CLASSICS</div>
          {g.story.classicResults.map((r, i) => (
            <div key={i} className="flex justify-between py-1 border-t border-dotted border-parchment-line first:border-t-0">
              <span className="text-sm">{r.name}</span>
              <span className={`font-mono text-xs font-bold ${OUTCOME_COLOR[r.outcome]}`}>{OUTCOME_LABEL[r.outcome]}</span>
            </div>
          ))}
          {diamondResult && (
            <div className="flex justify-between py-1 border-t border-dotted border-parchment-line">
              <span className="text-sm font-bold">The Diamond Cup</span>
              <span className={`font-mono text-xs font-bold ${diamondResult.mine.pos === 1 ? "text-good" : "text-muted-dim"}`}>
                {diamondResult.mine.pos === 1 ? "WON" : `${diamondResult.mine.pos} of ${diamondResult.res.length}`}
              </span>
            </div>
          )}
        </div>

        <div className="bg-parchment text-parchment-ink rounded-md p-3.5 mb-4">
          <div className="font-mono font-bold tracking-wide mb-2">THE STRING</div>
          {g.horses.map(h => (
            <div key={h.id} className="flex justify-between py-1 border-t border-dotted border-parchment-line first:border-t-0">
              <span className="text-sm">{h.name}</span>
              <span className="font-mono text-xs text-muted-dim">{h.wins}W / {h.runs}R · {money(h.earnings)}</span>
            </div>
          ))}
        </div>

        <button
          onClick={share}
          className="w-full border-none px-3.5 py-3.5 text-[15px] font-bold tracking-wide rounded-sm font-mono bg-gold-500 text-ink-900 cursor-pointer"
        >
          {copied ? "COPIED — PASTE ANYWHERE" : "SHARE THIS CAREER"}
        </button>
      </div>
    </div>
  );
}
