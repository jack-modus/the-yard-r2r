import { HELP } from "@/lib/game/help";

export function HelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 z-40 flex items-end" onClick={onClose}>
      <div
        className="bg-parchment text-parchment-ink w-full max-h-[82vh] overflow-y-auto rounded-t-xl px-4 pt-4 pb-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-[19px] font-bold [font-variant:small-caps]">New to racing? Start here</span>
          <span className="font-mono cursor-pointer text-gold-700" onClick={onClose}>
            CLOSE ✕
          </span>
        </div>
        {HELP.map(sec => (
          <div key={sec.section} className="mb-3.5">
            <div className="font-mono font-bold tracking-wide text-gold-700 mb-1">{sec.section}</div>
            {sec.items.map(([term, def]) => (
              <div key={term} className="py-1.5 border-t border-dotted border-parchment-line">
                <b className="text-[13.5px]">{term}</b>
                <div className="text-[13px] leading-snug">{def}</div>
              </div>
            ))}
          </div>
        ))}
        <div className="font-mono text-[11.5px] text-muted-dim italic">
          The racing terms here are the real thing — everything you learn in this game reads straight across to actual racecards and form guides.
        </div>
      </div>
    </div>
  );
}
