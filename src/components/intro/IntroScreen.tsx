import { COLUMN } from "@/components/ui/layout";

export function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-ink-950">
    <div className={`${COLUMN} font-diary text-[#eee6f2] px-4 pt-5 pb-15`}>
      <h1 className="text-[26px] text-gold-300 [font-variant:small-caps] mb-1">The Yard</h1>
      <div className="text-[13px] text-muted italic mb-4">Rags to Riches</div>

      <div className="text-sm text-[#a99fc0] mb-4.5 leading-normal">
        Tony Vincenzo stands at the yard gates without a penny to his name — and without much of a
        name at all, not one he&apos;d want. His father saw to that. But Simon Bridges, one of the
        best trainers in the game, is about to take a chance on him anyway.
      </div>

      <button
        onClick={onStart}
        className="w-full mt-1.5 border-none px-3.5 py-3.5 text-[15px] font-bold tracking-wide rounded-sm font-mono bg-gold-500 text-ink-900 cursor-pointer"
      >
        BEGIN →
      </button>
    </div>
    </div>
  );
}
