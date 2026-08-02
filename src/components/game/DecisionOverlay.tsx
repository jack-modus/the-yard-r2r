import type { DecisionEvent } from "@/lib/game/types";
import { COLUMN_PLAIN } from "@/components/ui/layout";

export function DecisionOverlay({ decision, onChoose }: { decision: DecisionEvent; onChoose: (i: number) => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-[31] flex items-center p-4">
      <div className={`${COLUMN_PLAIN} bg-ink-800 border border-gold-500 rounded p-4`}>
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
