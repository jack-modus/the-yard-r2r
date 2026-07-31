"use client";
import { useEffect, useState } from "react";
import { YARDS } from "@/lib/sim";
import type { CourseName, GearId, RaceCard, YardId } from "@/lib/sim";
import {
  advanceDay, chooseDecision as engineChooseDecision, enterRace as engineEnterRace, newGame,
} from "@/lib/game/engine";
import { loadGame, saveGame } from "@/lib/game/storage";
import type { GameState, TrainingPlan } from "@/lib/game/types";
import { IntroScreen } from "@/components/intro/IntroScreen";
import { Header } from "@/components/game/Header";
import { EpilogueBanner } from "@/components/game/EpilogueBanner";
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

export default function Home() {
  const [g, setG] = useState<GameState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<TabId>("stable");
  const [plan, setPlan] = useState<Record<number, TrainingPlan>>({});
  const [walkPlan, setWalkPlan] = useState<CourseName | null>(null);
  const [raceSub, setRaceSub] = useState<RaceSub>("upcoming");
  const [resultsFilter, setResultsFilter] = useState<ResultsFilter>("all");
  const [helpOpen, setHelpOpen] = useState(false);

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
    return (
      <IntroScreen
        onStart={(name, yardId: YardId) => {
          setG(newGame(name, yardId, new Set<string>()));
        }}
      />
    );
  }

  const yard = YARDS[g.yardId];
  const decision = g.queue[0] || null;
  const raceToday = g.entered && g.entered.raceDay <= g.day + 1;
  const advanceLocked = !!decision || !!g.flash || !!g.liveRace;

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
    <div className="min-h-screen font-diary bg-ink-950 text-[#eee6f2] pb-24">
      <Header g={g} yard={yard} onHelp={() => setHelpOpen(true)} />

      {g.epilogue && <EpilogueBanner yard={yard} />}

      {g.flash && !g.liveRace && (
        <DailyFlashOverlay day={g.day} lines={g.flash} onContinue={() => setG(s => s && ({ ...s, flash: null }))} />
      )}

      {decision && !g.liveRace && (
        <DecisionOverlay decision={decision} onChoose={i => setG(s => (s ? engineChooseDecision(s, i) : s))} />
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
  );
}
