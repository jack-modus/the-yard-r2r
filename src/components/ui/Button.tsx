import type { ButtonHTMLAttributes } from "react";

export function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`bg-ink-700 text-gold-300 border border-gold-500 px-3.5 py-2 rounded-sm font-mono text-[12.5px] cursor-pointer disabled:cursor-default disabled:opacity-40 disabled:text-muted-dim ${className}`}
      {...props}
    />
  );
}
