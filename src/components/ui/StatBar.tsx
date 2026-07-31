export function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-[2.5px]">
      <span className="font-mono text-xs w-[58px]">{label}</span>
      <div className="flex-1 h-1.5 rounded-sm bg-[#ddd3c2] overflow-hidden">
        <div className="h-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="font-mono text-xs w-7 text-right">{Math.round(value)}</span>
    </div>
  );
}
