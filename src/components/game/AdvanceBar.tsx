export function AdvanceBar({
  disabled, label, onClick,
}: { disabled: boolean; label: string; onClick: () => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-3 flex justify-center z-10 bg-gradient-to-t from-ink-950 from-30% to-transparent">
      <button
        disabled={disabled}
        onClick={onClick}
        className={`border-none px-8 py-3.5 text-sm font-bold rounded-sm tracking-wide font-mono ${
          disabled ? "bg-[#6b5e3a] text-ink-900 cursor-default" : "bg-gold-500 text-ink-900 cursor-pointer"
        }`}
      >
        {label}
      </button>
    </div>
  );
}
