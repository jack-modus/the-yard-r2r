"use client";
import { useEffect, useState } from "react";
import { YARD } from "@/lib/sim";
import type { CourseName, GearId, RaceCard } from "@/lib/sim";
import {
  advanceDay, chooseDecision as engineChooseDecision, enterRace as engineEnterRace, newGame, resolveHorsePick,
} from "@/lib/game/engine";
import { loadGame, saveGame } from "@/lib/game/storage";
import type { GameState, TrainingPlan } from "@/lib/game/types";
import { IntroScreen } from "@/components/intro/IntroScreen";
import { HorsePickScreen } from "@/components/intro/HorsePickScreen";
import { EndingScreen } from "@/components/game/EndingScreen";
import { Header } from "@/components/game/Header";
import { DailyFlashOverlay } from "@/components/game/DailyFlashOverlay";
import { DecisionOverlay } from "@/components/game/DecisionOverlay";
import { HelpOverlay } from "@/components/game/HelpOverlay";
import { LiveRaceOverlay } from "@/components/game/LiveRaceOverlay";
import { TabBar, type TabId } from "@/components/game/TabBar";
import { AdvanceBar } from "@/components/game/AdvanceBar";
import { StableTab } from "@/components/game/StableTab";
import { RacingTab, type RaceSub, type ResultsFilter } from "@/components/game/RacingTab";
import { NotebookTab } from "@/components/game/NotebookTab";
import { YardTab } from "@/components/game/YardTab";
import { COLUMN, COLUMN_PLAIN } from "@/components/ui/layout";
import { Button } from "@/components/ui/Button";

export default function Home() {
  const [g, setG] = useState<GameState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<TabId>("stable");
  const [plan, setPlan] = useState<Record<number, TrainingPlan>>({});
  const [walkPlan, setWalkPlan] = useState<CourseName | null>(null);
  const [raceSub, setRaceSub] = useState<RaceSub>("upcoming");
  const [resultsFilter, setResultsFilter] = useState<ResultsFilter>("all");
  const [helpOpen, setHelpOpen] = useState(false);
  // Transient UI-only state (not GameState — doesn't need persisting): the
  // just-resolved decision's outcome text, so the reveal-after metric deltas
  // are visible immediately instead of only in the Yard tab's message log.
  const [outcomeText, setOutcomeText] = useState<string | null>(null);

  useEffect(() => {
    // localStorage is a browser-only external system — reading it on mount and
    // syncing into state is exactly what an effect is for, despite the lint rule.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setG(loadGame());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || !g) return;
    if (g.queue.length > 0) return; // decision choices carry closures — don't persist mid-decision
    saveGame(g);
  }, [g, loaded]);

  if (!loaded) return null;

  if (!g) {
    return <IntroScreen onStart={() => setG(newGame(new Set<string>()))} />;
  }

  if (g.awaitingHorsePick) {
    return (
      <HorsePickScreen
        candidates={g.horseCandidates ?? []}
        onConfirm={chosenIds => setG(s => (s ? resolveHorsePick(s, chosenIds) : s))}
      />
    );
  }

  if (g.story.stage === "yard") {
    const introDecision = g.queue[0] || null;
    return (
      <div className="min-h-screen bg-ink-950">
        <div className={`${COLUMN} font-diary text-[#eee6f2] px-4 pt-16`}>
          <h1 className="text-[22px] text-gold-300 [font-variant:small-caps] mb-1">The Yard</h1>
          <div className="text-[13px] text-muted italic">Rags to Riches</div>
        </div>
        {introDecision && (
          <DecisionOverlay decision={introDecision} onChoose={i => setG(s => (s ? engineChooseDecision(s, i) : s))} />
        )}
      </div>
    );
  }

  if (g.ending && !g.liveRace) {
    return <EndingScreen g={g} />;
  }

  const yard = YARD;
  const decision = g.queue[0] || null;
  const raceToday = g.entered.some(r => r.raceDay <= g.day + 1);
  const advanceLocked = !!decision || !!g.flash || !!g.liveRace || !!outcomeText;

  const advance = () => {
    if (advanceLocked) return;
    setG(s => (s ? advanceDay(s, plan, walkPlan) : s));
    setWalkPlan(null);
  };

  const enterRace = (race: RaceCard, horseId: number) => setG(s => (s ? engineEnterRace(s, race, horseId) : s));

  const toggleGear = (horseId: number, gearId: GearId) =>
    setG(s => s && ({
      ...s,
      horses: s.horses.map(h => h.id === horseId
        ? { ...h, gear: h.gear.includes(gearId) ? h.gear.filter(x => x !== gearId) : [...h.gear, gearId] }
        : h),
    }));

  const toggleStudy = (course: CourseName) => setG(s => s && ({ ...s, study: s.study === course ? null : course }));

  return (
    <div className="min-h-screen bg-ink-950">
    <div className={`${COLUMN} font-diary text-[#eee6f2] pb-24`}>
      <Header g={g} yard={yard} onHelp={() => setHelpOpen(true)} />

      {g.flash && !g.liveRace && (
        <DailyFlashOverlay day={g.day} lines={g.flash} onContinue={() => setG(s => s && ({ ...s, flash: null }))} />
      )}

      {decision && !g.liveRace && (
        <DecisionOverlay decision={decision} onChoose={i => setG(s => {
          if (!s) return s;
          const next = engineChooseDecision(s, i);
          setOutcomeText(next.messages[0]?.text ?? null);
          return next;
        })} />
      )}

      {outcomeText && !g.liveRace && (
        <div className="fixed inset-0 bg-black/70 z-[35] flex items-center p-4">
          <div className={`${COLUMN_PLAIN} bg-ink-800 border border-gold-500 rounded p-4`}>
            <div className="text-sm leading-relaxed py-1.5">{outcomeText}</div>
            <Button className="block w-full mt-2.5 text-center" onClick={() => setOutcomeText(null)}>
              CONTINUE
            </Button>
          </div>
        </div>
      )}

      {helpOpen && <HelpOverlay onClose={() => setHelpOpen(false)} />}

      {g.liveRace && (
        <LiveRaceOverlay
          liveRace={g.liveRace}
          onNext={() => setG(s => {
            if (!s || !s.liveRace) return s;
            const done = s.liveRace.idx + 1 >= s.liveRace.beats.length;
            return done ? { ...s, liveRace: null } : { ...s, liveRace: { ...s.liveRace, idx: s.liveRace.idx + 1 } };
          })}
        />
      )}

      <TabBar tab={tab} onChange={setTab} />

      {tab === "stable" && (
        <StableTab
          horses={g.horses}
          plan={plan}
          onPlanChange={(horseId, p) => setPlan(pl => ({ ...pl, [horseId]: p }))}
          onToggleGear={toggleGear}
        />
      )}

      {tab === "racing" && (
        <RacingTab
          g={g}
          yard={yard}
          raceSub={raceSub}
          onRaceSub={setRaceSub}
          resultsFilter={resultsFilter}
          onResultsFilter={setResultsFilter}
          onEnterRace={enterRace}
        />
      )}

      {tab === "notebook" && (
        <NotebookTab g={g} yard={yard} walkPlan={walkPlan} onWalkPlan={setWalkPlan} onToggleStudy={toggleStudy} />
      )}

      {tab === "yard" && <YardTab g={g} yard={yard} />}

      <AdvanceBar
        disabled={advanceLocked}
        onClick={advance}
        label={g.liveRace ? "RACE IN PROGRESS" : decision ? "DECISION REQUIRED" : g.flash ? "READ THE DIARY" : raceToday ? "RACE DAY →" : "NEXT DAY →"}
      />
    </div>
    </div>
  );
}
