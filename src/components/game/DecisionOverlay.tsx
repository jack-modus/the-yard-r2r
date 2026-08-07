import type { DecisionEvent, DecisionTag } from "@/lib/game/types";
import { COLUMN_PLAIN } from "@/components/ui/layout";

// Cosmetic-only per-category colour so decisions don't all look identical —
// per feedback that the UI felt "very samey".
const TAG_COLOR: Record<DecisionTag, string> = {
  PRESS: "#7a1f5c",
  BOSS: "#c9a227",
  RIVAL: "#a4161a",
  TRAINING: "#0b3d91",
  FAMILY: "#0e7c86",
  YARD: "#1b7a43",
  QUIZ: "#1f8a8c",
};

export function DecisionOverlay({ decision, onChoose }: { decision: DecisionEvent; onChoose: (i: number) => void }) {
  const accent = decision.tag ? TAG_COLOR[decision.tag] : "#c9a227";
  return (
    <div className="fixed inset-0 bg-black/70 z-[31] flex items-center p-4">
      <div className={`${COLUMN_PLAIN} bg-ink-800 border rounded p-4`} style={{ borderColor: accent, borderLeftWidth: 4 }}>
        {decision.tag && (
          <span className="inline-block font-mono text-[10px] tracking-widest px-1.5 py-0.5 rounded-sm mb-1.5" style={{ backgroundColor: accent, color: "#f6f1e7" }}>
            {decision.tag}
          </span>
        )}
        <div className="[font-variant:small-caps] text-gold-300 text-[17px] mb-1.5">{decision.title}</div>
        <div className="text-sm leading-snug mb-2.5">{decision.text}</div>
        {decision.choices.map((c, i) => (
          <button
            key={i}
            onClick={() => onChoose(i)}
            className="block w-full mb-1.5 text-left bg-ink-700 text-gold-300 border border-gold-500 px-3.5 py-2 rounded-sm font-mono text-[12.5px] cursor-pointer"
          >
            {c.label}
            {c.hint && <div className="text-[10.5px] opacity-75 mt-0.5 italic">{c.hint}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}
