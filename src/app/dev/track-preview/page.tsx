"use client";
// Scratch page for prototyping track visuals in isolation, against
// hand-rolled mock data, without touching the real game flow. Not linked
// from anywhere in the app.
import { useMemo, useState } from "react";
import type { CourseName, RaceTrack, RaceTrackRunner } from "@/lib/sim";
import { TrackVisual } from "@/components/game/TrackVisual";
import { COLUMN_PLAIN } from "@/components/ui/layout";
import { Button } from "@/components/ui/Button";

const SILKS = ["#a4161a", "#0b3d91", "#e8b117", "#1b7a43", "#5e2b97", "#d2601a", "#0e7c86", "#7a1f5c"];
const BEAT_PROGRESS = [0, 0.08, 0.15, 0.3, 0.45, 0.55, 0.65, 0.8, 0.88, 0.96, 1, 1];

// Mirrors commentary.ts's computeRaceTrack() shape logic closely enough for
// a visual prototype — a finishing order plus a wobble curve per runner.
function mockTrack(finishOrder: number[], playerIdx: number, seed: number): RaceTrack {
  const n = finishOrder.length;
  const spreadStep = Math.min(0.035, 0.35 / (n - 1));
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const runners: RaceTrackRunner[] = finishOrder.map((finishPos, i) => {
    const finalX = finishPos === 1 ? 1 : Math.max(0.65, 1 - (finishPos - 1) * spreadStep);
    const amplitude = i === playerIdx ? 0.07 : (rnd() - 0.5) * 0.16;
    const positions = BEAT_PROGRESS.map(p =>
      p <= 0 ? 0 : p >= 1 ? finalX : Math.min(1, Math.max(0, p * finalX + amplitude * Math.sin(p * Math.PI))),
    );
    return { name: `Horse ${i + 1}`, silk: SILKS[i % SILKS.length], number: i + 1, player: i === playerIdx, pos: finishPos, positions };
  });
  return { runners };
}

const DIST_OPTIONS = [5, 6, 7, 8, 10, 12, 14];
const COURSE_OPTIONS: CourseName[] = ["Epsom", "York", "Chester", "Newmarket", "Ascot", "Sandown", "Doncaster", "Goodwood"];

export default function TrackPreviewPage() {
  const [idx, setIdx] = useState(0);
  const [dist, setDist] = useState(14);
  const [course, setCourse] = useState<CourseName>("Epsom");
  const track = useMemo(() => mockTrack([3, 1, 5, 2, 4, 7, 6, 8], 1, 42), []);
  const done = idx + 1 >= BEAT_PROGRESS.length;

  return (
    <div className={`${COLUMN_PLAIN} p-4`}>
      <div className="font-mono text-gold-500 tracking-wide mb-3 text-sm">TRACK VISUAL — PROTOTYPE</div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {COURSE_OPTIONS.map(c => (
          <button
            key={c}
            onClick={() => { setCourse(c); setIdx(0); }}
            className={`font-mono text-xs px-2 py-1 rounded border ${course === c ? "border-gold-500 text-gold-300 bg-ink-700" : "border-line text-muted"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {DIST_OPTIONS.map(d => (
          <button
            key={d}
            onClick={() => { setDist(d); setIdx(0); }}
            className={`font-mono text-xs px-2 py-1 rounded border ${dist === d ? "border-gold-500 text-gold-300 bg-ink-700" : "border-line text-muted"}`}
          >
            {d}f
          </button>
        ))}
      </div>

      <TrackVisual track={track} idx={idx} course={course} dist={dist} />

      <div className="font-mono text-xs text-muted mb-2">beat {idx + 1} / {BEAT_PROGRESS.length}</div>

      <div className="flex gap-2">
        <Button className="flex-1 text-center text-sm" onClick={() => setIdx(i => (done ? 0 : Math.min(BEAT_PROGRESS.length - 1, i + 1)))}>
          {done ? "RESET" : "▶ NEXT BEAT"}
        </Button>
      </div>
    </div>
  );
}
