"use client";
import { useLayoutEffect, useRef, useState } from "react";
import type { CourseName, RaceTrack } from "@/lib/sim";
import { trackShapeFor } from "@/lib/game/trackShapes";

// Lane fan-out is sized against the CURRENT ribbon width (not a fixed
// constant), so at the stalls — thin "map" ribbon, everyone literally at
// the same path length — the field reads as a tight group in the gate, and
// the moment the race goes live and the ribbon widens, the same transition
// that widens the ribbon also fans the lanes out to fill it. Capped by
// MAX_LANE_GAP so a small field (as few as 6 run) doesn't spread absurdly
// wide just because the ribbon has room.
const MAX_LANE_GAP = 7;
const RIBBON_WIDTH_MAP = 12; // establishing-shot ribbon — a clean, thin course outline
const RIBBON_WIDTH_RACE = 34; // racing ribbon — wide enough to hold a full field's lanes
const CAMERA_ZOOM = 1.7; // how far the camera pushes in once the race is under way
const TRANSITION = "550ms ease-out";

// Direction of travel at length L, via a central difference — sampling one
// point behind and one ahead. A one-sided (behind-only) sample degenerates
// to a zero vector exactly at the finish, because both "current" and
// "ahead" clamp to the same endpoint: the tangent collapses to (0,0), the
// perpendicular lane offset vanishes, and the winner's dot snaps onto the
// centerline instead of crossing the line in its own lane.
function tangentAt(path: SVGPathElement, L: number, length: number) {
  const back = path.getPointAtLength(Math.max(0, L - 1));
  const ahead = path.getPointAtLength(Math.min(length, L + 1));
  const dx = ahead.x - back.x, dy = ahead.y - back.y;
  const dlen = Math.hypot(dx, dy) || 1;
  return { nx: -dy / dlen, ny: dx / dlen };
}

export function TrackVisual({ track, idx, course, dist }: { track: RaceTrack; idx: number; course: CourseName; dist: number }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [length, setLength] = useState(0);
  const [center, setCenter] = useState<{ x: number; y: number } | null>(null);
  const shape = trackShapeFor(course, dist);

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    setLength(path.getTotalLength());
    const box = path.getBBox();
    setCenter({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
  }, [shape.rail]);

  // Beat 0 is the establishing shot — the whole course, before the stalls
  // open. From beat 1 on, the race is live: ribbon widens, camera follows.
  const racing = idx > 0;
  const ribbonWidth = racing ? RIBBON_WIDTH_RACE : RIBBON_WIDTH_MAP;
  const zoom = racing ? CAMERA_ZOOM : 1;

  const n = track.runners.length;
  const laneGap = Math.min(MAX_LANE_GAP, (ribbonWidth * 0.8) / Math.max(1, n - 1));

  const pointFor = (progress: number, laneIndex: number) => {
    const path = pathRef.current;
    if (!path || length === 0) return { x: 0, y: 0 };
    const L = Math.min(Math.max(progress, 0), 1) * length;
    const p = path.getPointAtLength(L);
    const { nx, ny } = tangentAt(path, L, length);
    const offset = (laneIndex - (n - 1) / 2) * laneGap;
    return { x: p.x + nx * offset, y: p.y + ny * offset };
  };

  // A line across the full ribbon width, perpendicular to the direction of
  // travel at that point — a real start/finish line, not a single dot in
  // the middle of the track.
  const crossLine = (L: number, lineWidth: number) => {
    const path = pathRef.current;
    if (!path) return null;
    const p = path.getPointAtLength(L);
    const { nx, ny } = tangentAt(path, L, length);
    const half = lineWidth / 2;
    return { x1: p.x - nx * half, y1: p.y - ny * half, x2: p.x + nx * half, y2: p.y + ny * half };
  };

  const playerIndex = track.runners.findIndex(r => r.player);
  const focusPoint = racing && playerIndex >= 0 && length > 0
    ? pointFor(track.runners[playerIndex].positions[idx], playerIndex)
    : center;

  const [, , vbW, vbH] = shape.viewBox.split(" ").map(Number);
  const camX = focusPoint ? vbW / 2 - focusPoint.x * zoom : 0;
  const camY = focusPoint ? vbH / 2 - focusPoint.y * zoom : 0;

  const stallsLine = length > 0 ? crossLine(0, ribbonWidth) : null;
  const finishLine = length > 0 ? crossLine(length, ribbonWidth) : null;

  return (
    <div className="relative bg-ink-900 rounded-sm border border-line mb-2.5 p-2 overflow-hidden">
      <svg viewBox={shape.viewBox} className="w-full h-auto block">
        <defs>
          <linearGradient id="turf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a2138" />
            <stop offset="100%" stopColor="#191320" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#turf)" rx={4} />

        <g style={{ transition: `transform ${TRANSITION}`, transform: `translate(${camX}px, ${camY}px) scale(${zoom})` }}>
          <path
            d={shape.rail} fill="none" stroke="#3d3454" strokeLinecap="round" opacity={0.6}
            style={{ transition: `stroke-width ${TRANSITION}`, strokeWidth: ribbonWidth }}
          />
          <path ref={pathRef} d={shape.rail} fill="none" stroke="#c9a227" strokeWidth={1} strokeDasharray="2 4" opacity={0.55} />

          {stallsLine && (
            <>
              <line
                x1={stallsLine.x1} y1={stallsLine.y1} x2={stallsLine.x2} y2={stallsLine.y2}
                stroke="#8d82a3" strokeWidth={1.5} style={{ transition: `all ${TRANSITION}` }}
              />
              <text x={(stallsLine.x1 + stallsLine.x2) / 2} y={Math.min(stallsLine.y1, stallsLine.y2) - 6} textAnchor="middle" fontSize={7.5} fontFamily="var(--font-mono)" letterSpacing={0.5} fill="#6e6480">STALLS</text>
            </>
          )}
          {finishLine && (
            <>
              <line
                x1={finishLine.x1} y1={finishLine.y1} x2={finishLine.x2} y2={finishLine.y2}
                stroke="#c9a227" strokeWidth={2.5} style={{ transition: `all ${TRANSITION}` }}
              />
              <text x={(finishLine.x1 + finishLine.x2) / 2} y={Math.min(finishLine.y1, finishLine.y2) - 6} textAnchor="middle" fontSize={7.5} fontFamily="var(--font-mono)" letterSpacing={0.5} fill="#c9a227">FINISH</text>
            </>
          )}

          {shape.labels?.map((l, i) => (
            <text
              key={i} x={l.x} y={l.y} fontSize={l.muted ? 7 : 8} fontFamily="var(--font-mono)"
              letterSpacing={0.4} fill={l.muted ? "#6e6480" : "#f0d97a"} opacity={l.muted ? 0.8 : 0.9}
            >
              {l.text}
            </text>
          ))}

          {length > 0 && track.runners.map((r, i) => {
            const { x, y } = pointFor(r.positions[idx], i);
            return (
              <g key={r.number} style={{ transition: `transform ${TRANSITION}`, transform: `translate(${x}px, ${y}px)` }}>
                <circle
                  r={r.player ? 7 : 6} fill={r.silk}
                  stroke={r.player ? "#f0d97a" : "#00000055"} strokeWidth={r.player ? 2 : 1}
                />
                <text textAnchor="middle" dy={2.5} fontSize={r.player ? 7 : 6} fontFamily="var(--font-mono)" fill="#f6f1e7">
                  {r.number}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
