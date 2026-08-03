import {
  CALENDAR, COURSES, GOINGS, PRIZE,
  clamp, effRating, marginStr, money, nid, ri,
} from "@/lib/sim";
import type { Horse, RaceCard, Yard } from "@/lib/sim";
import type { GameState } from "@/lib/game/types";
import { Card } from "@/components/ui/Card";
import { PlanButton } from "@/components/ui/PlanButton";
import { Button } from "@/components/ui/Button";

export type RaceSub = "upcoming" | "results";
export type ResultsFilter = "all" | "mine";

export function RacingTab({
  g, yard, raceSub, onRaceSub, resultsFilter, onResultsFilter, onEnterRace,
}: {
  g: GameState;
  yard: Yard;
  raceSub: RaceSub;
  onRaceSub: (s: RaceSub) => void;
  resultsFilter: ResultsFilter;
  onResultsFilter: (f: ResultsFilter) => void;
  onEnterRace: (race: RaceCard, horseId: number) => void;
}) {
  return (
    <div>
      <div className="flex gap-2 px-3 pt-2.5">
        {(["upcoming", "results"] as const).map(id => (
          <button
            key={id}
            onClick={() => onRaceSub(id)}
            className={`flex-1 py-2 text-[11.5px] font-mono rounded-[2px] border ${
              raceSub === id ? "bg-ink-700 text-gold-300 border-gold-500" : "bg-transparent text-muted border-line"
            }`}
          >
            {id === "upcoming" ? "UPCOMING" : "RESULTS"}
          </button>
        ))}
      </div>

      {raceSub === "upcoming" && (
        <Upcoming g={g} yard={yard} onEnterRace={onEnterRace} />
      )}

      {raceSub === "results" && (
        <Results g={g} resultsFilter={resultsFilter} onResultsFilter={onResultsFilter} />
      )}
    </div>
  );
}

function Upcoming({ g, yard, onEnterRace }: { g: GameState; yard: Yard; onEnterRace: (race: RaceCard, horseId: number) => void }) {
  return (
    <>
      {g.entered ? (
        <Card highlight>
          <div className="font-bold text-base">Declared: {g.entered.name}</div>
          <div className="font-mono text-[11.5px] text-muted-dim">
            {g.entered.course} · {g.entered.dist}f · {GOINGS[g.entered.going]} · race day {g.entered.raceDay} ({g.entered.raceDay - g.day} day{g.entered.raceDay - g.day === 1 ? "" : "s"} away)
          </div>
          <div className="font-mono text-[11.5px] text-muted-dim">{COURSES[g.entered.course].line}</div>
          <div className="font-mono text-[11.5px] text-muted-dim mt-1">
            Runner: {g.horses.find(h => h.id === g.entered!.horseId)?.name} · ridden by {yard.jockey.name}
            {" · "}your course knowledge: {Math.round(g.mastery[g.entered.course])}/100
          </div>
        </Card>
      ) : g.slate.length ? (
        <>
          <div className="font-mono px-3.5 pt-2.5 text-muted text-xs">Entries close soon — pick a race, or wait for a better slate.</div>
          {g.slate.map(r => (
            <Card key={r.id} className={yard.tracks.includes(r.course) ? "border border-gold-500" : ""}>
              <div className="font-bold text-base">{r.name}</div>
              <div className="font-mono text-[11.5px] text-muted-dim">
                {r.course} · {r.dist}f · {GOINGS[r.going]} · runs day {r.raceDay} · 1st {money(PRIZE[r.grade][0])}
                {yard.tracks.includes(r.course) && <b className="text-gold-800"> · home track</b>}
              </div>
              <div className="font-mono text-[11.5px] text-muted-dim">{COURSES[r.course].line}</div>
              {g.horses.filter(h => h.injuryDays === 0).map(h => (
                <Button key={h.id} className="mt-1.5 mr-1.5" onClick={() => onEnterRace(r, h.id)}>
                  ENTER {h.name.toUpperCase()} (mark {effRating(h)}{h.mark == null ? ", unrated" : ""})
                </Button>
              ))}
            </Card>
          ))}
        </>
      ) : (
        <div className="font-mono p-5 text-muted text-xs">No entries open today. The next slate comes up within a few days.</div>
      )}

      <Card>
        <div className="font-mono font-bold tracking-wide mb-1.5">THE BIG-RACE CALENDAR — YEAR {g.year}</div>
        <div className="font-mono text-[11.5px] text-muted-dim mb-1.5">
          The races careers are measured by. {yard.boss} controls the entries — bring a good enough horse and they&apos;ll let you take your shot.
        </div>
        {CALENDAR.map(cr => {
          const best = g.horses.filter((h: Horse) => h.injuryDays === 0).sort((a, b) => effRating(b) - effRating(a))[0];
          const unlocked = best && effRating(best) >= cr.minOR - 2;
          const past = cr.day <= g.day;
          const inWindow = !past && cr.day - g.day <= 14 && cr.day - g.day >= 2;
          return (
            <div key={cr.name} className={`py-2 border-t border-dotted border-parchment-line ${past ? "opacity-45" : ""}`}>
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-[14.5px]">{unlocked || past ? "" : "🔒 "}{cr.name} ({cr.grade})</span>
                <span className="font-mono text-[11.5px] text-muted-dim">day {cr.day}</span>
              </div>
              <div className="font-mono text-[11.5px] text-muted-dim">{cr.course} · {cr.dist}f · 1st {money(PRIZE[cr.grade][0])}</div>
              {past ? (
                <div className="font-mono text-[11.5px] text-muted-dim">Run for this year — it comes around again next season.</div>
              ) : !unlocked ? (
                <div className="font-mono text-[11.5px] text-muted-dim">
                  {yard.boss} won&apos;t waste the entry: needs a horse around mark {cr.minOR}. Your best mark: {best ? effRating(best) : "—"}.
                </div>
              ) : inWindow && !g.entered ? (
                g.horses.filter(h => h.injuryDays === 0 && effRating(h) >= cr.minOR - 2).map(h => (
                  <PlanButton
                    key={h.id}
                    on={false}
                    onClick={() => onEnterRace({
                      id: nid(), course: cr.course, dist: cr.dist, going: clamp(COURSES[cr.course].going + ri(-1, 1), 1, 4),
                      grade: cr.grade, raceDay: cr.day, name: `${cr.name} (${cr.grade})`, isClassic: cr.isClassic,
                    }, h.id)}
                  >
                    DECLARE {h.name.toUpperCase()}
                  </PlanButton>
                ))
              ) : (
                <div className="font-mono text-[11.5px] text-good">✓ Unlocked — entries open in the two weeks before race day.</div>
              )}
            </div>
          );
        })}
      </Card>
    </>
  );
}

function Results({ g, resultsFilter, onResultsFilter }: { g: GameState; resultsFilter: ResultsFilter; onResultsFilter: (f: ResultsFilter) => void }) {
  return (
    <>
      <div className="flex gap-2 px-3 pt-2.5">
        {(["all", "mine"] as const).map(id => (
          <button
            key={id}
            onClick={() => onResultsFilter(id)}
            className={`flex-1 py-1.5 text-xs font-mono rounded-[2px] border ${
              resultsFilter === id ? "bg-ink-700 text-gold-300 border-gold-500" : "bg-transparent text-muted border-line"
            }`}
          >
            {id === "all" ? "FULL RESULTS" : "MY HORSES"}
          </button>
        ))}
      </div>

      {resultsFilter === "all" && (
        <>
          {!g.results.length && <div className="font-mono p-5 text-muted text-xs">No races run yet.</div>}
          {g.results.map((w, i) => (
            <Card key={i}>
              <div className="font-bold text-base">{w.race.name}</div>
              <div className="font-mono text-[11.5px] text-muted-dim mb-1">
                {w.race.course} · {w.race.dist}f · {GOINGS[w.race.going]} · {w.res.length}+ ran
              </div>
              {w.res.map(r => (
                <div
                  key={r.horse.id}
                  className={`flex gap-1.5 py-1 border-t border-dotted border-parchment-line items-baseline ${r.player ? "bg-[#efe0b8]" : ""}`}
                >
                  <span className="font-mono w-4 font-bold">{r.pos}</span>
                  <span className={`text-[13.5px] flex-1 overflow-hidden text-ellipsis whitespace-nowrap ${r.player ? "font-bold" : ""}`}>{r.horse.name}</span>
                  <span className="font-mono text-muted-dim">{r.sp}{r.fav ? "F" : ""}</span>
                  <span className="font-mono w-9 text-right">{r.pos === 1 ? "won" : marginStr(r.gap)}</span>
                </div>
              ))}
              <div className="font-mono text-[11.5px] text-muted-dim mt-1 italic">{w.mine.horse.name}: {w.cmt}</div>
            </Card>
          ))}
        </>
      )}

      {resultsFilter === "mine" && (
        <>
          {g.horses.map(h => (
            <Card key={h.id}>
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-base">{h.name}</span>
                <span className="font-mono font-bold text-sm">{h.wins}W / {h.runs} runs · {money(h.earnings)}</span>
              </div>
              {!h.formLines.length && <div className="font-mono text-[11.5px] text-muted-dim">Unraced so far.</div>}
              {h.formLines.map((f, i) => (
                <div key={i} className="font-mono text-[11.5px] text-muted-dim py-1 border-t border-dotted border-parchment-line">
                  <b>{f.pos}/{f.of}</b> · Y{f.year} d{f.day} · {f.race}, {f.dist}f, {f.going} · SP {f.sp}
                  <div className="italic">{f.cmt}</div>
                </div>
              ))}
            </Card>
          ))}
        </>
      )}
    </>
  );
}
