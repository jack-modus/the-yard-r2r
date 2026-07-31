import type { ReactNode } from "react";

export function PlanButton({
  on, disabled, onClick, children, flex,
}: { on: boolean; disabled?: boolean; onClick: () => void; children: ReactNode; flex?: boolean }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`font-mono text-[10px] px-1.5 py-1 rounded-[2px] border cursor-pointer disabled:cursor-default disabled:opacity-50 ${
        flex ? "flex-1" : ""
      } ${on ? "bg-ink-700 text-gold-300 border-ink-700" : "bg-transparent text-[#5d5443] border-parchment-border"}`}
    >
      {children}
    </button>
  );
}
