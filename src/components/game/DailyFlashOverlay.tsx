import { Button } from "@/components/ui/Button";
import { COLUMN_PLAIN } from "@/components/ui/layout";

export function DailyFlashOverlay({ day, lines, onContinue }: { day: number; lines: string[]; onContinue: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-30 flex items-center p-4">
      <div className={`${COLUMN_PLAIN} bg-ink-800 border border-gold-500 rounded p-4 max-h-[70vh] overflow-y-auto`}>
        <div className="font-mono text-gold-500 tracking-wide mb-2">DAY {day} — THE YARD DIARY</div>
        {lines.map((line, i) => (
          <div key={i} className={`text-sm leading-relaxed py-1.5 ${i ? "border-t border-dotted border-line" : ""}`}>
            {line}
          </div>
        ))}
        <Button className="block w-full mt-2.5 text-center" onClick={onContinue}>
          CONTINUE
        </Button>
      </div>
    </div>
  );
}
