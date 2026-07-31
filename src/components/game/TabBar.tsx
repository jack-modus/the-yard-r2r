export type TabId = "stable" | "racing" | "notebook" | "yard";

const TABS: TabId[] = ["stable", "racing", "notebook", "yard"];

export function TabBar({ tab, onChange }: { tab: TabId; onChange: (t: TabId) => void }) {
  return (
    <div className="flex border-b border-line sticky top-0 bg-ink-950 z-[5]">
      {TABS.map(t => (
        <div
          key={t}
          onClick={() => onChange(t)}
          className={`flex-1 py-2.5 px-0.5 text-center text-[11px] tracking-wide uppercase cursor-pointer font-mono border-b-[3px] ${
            tab === t ? "text-gold-300 border-gold-500" : "text-muted border-transparent"
          }`}
        >
          {t}
        </div>
      ))}
    </div>
  );
}
