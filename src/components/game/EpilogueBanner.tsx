import type { Yard } from "@/lib/sim";

export function EpilogueBanner({ yard }: { yard: Yard }) {
  return (
    <div className="bg-ink-800 text-[#eee6f2] mx-3 mt-3 rounded-sm p-3.5 border-2 border-gold-300">
      <div className="[font-variant:small-caps] text-lg text-gold-300 mb-1.5">Rags to Riches</div>
      <div className="text-sm leading-relaxed">
        A Group 1. From the horse nobody wanted, in the bottom box, to the winner&apos;s enclosure on the biggest stage.{" "}
        {yard.boss} says nothing for a long moment — then, quietly: &quot;Best day this yard&apos;s ever had.&quot; The story you set out to write is written. The yard, of course, opens again tomorrow.
      </div>
    </div>
  );
}
