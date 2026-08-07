// localStorage persistence for GameState. Set<string> (usedNames) doesn't
// survive JSON.stringify/parse directly, so it's serialized as an array.
//
// GameState's shape has changed incompatibly several times during
// development (fields added/removed/renamed) — bump this key whenever that
// happens again, so an old save is simply never read rather than crashing
// the app on load. loadGame() also runs a light shape check as a second
// line of defence in case a bump gets forgotten.
import type { GameState } from "./types";

const KEY = "the-yard:rags-to-riches:v5"; // v5: quizCount/quizMissed, pressRoomUsed/pressRoomFollowupDay, Horse.statCeilings all added

type SerializedState = Omit<GameState, "usedNames"> & { usedNames: string[] };

function looksLikeCurrentShape(parsed: unknown): parsed is SerializedState {
  if (!parsed || typeof parsed !== "object") return false;
  const p = parsed as Record<string, unknown>;
  return (
    typeof p.day === "number" &&
    Array.isArray(p.horses) &&
    Array.isArray(p.entered) &&
    Array.isArray(p.quizMissed) &&
    typeof p.pressRoomUsed === "object" && p.pressRoomUsed !== null &&
    typeof p.story === "object" && p.story !== null &&
    typeof (p.story as Record<string, unknown>).stage === "string"
  );
}

export function saveGame(state: GameState) {
  if (typeof window === "undefined") return;
  const serialized: SerializedState = { ...state, usedNames: Array.from(state.usedNames) };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(serialized));
  } catch {
    // storage full or unavailable — silently skip, the game just won't persist this tick
  }
}

export function loadGame(): GameState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!looksLikeCurrentShape(parsed)) {
      window.localStorage.removeItem(KEY); // stale/incompatible save — drop it, start fresh
      return null;
    }
    return { ...parsed, usedNames: new Set(parsed.usedNames) };
  } catch {
    return null;
  }
}

export function clearGame() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
