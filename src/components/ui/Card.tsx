import type { ReactNode } from "react";

export function Card({ children, highlight, className = "" }: { children: ReactNode; highlight?: boolean; className?: string }) {
  return (
    <div
      className={`bg-parchment text-parchment-ink mx-3 mt-3 rounded-sm p-3 shadow-[0_2px_0_rgba(0,0,0,.4)] ${
        highlight ? "border-2 border-gold-500" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
