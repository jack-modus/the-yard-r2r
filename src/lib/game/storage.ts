// localStorage persistence for GameState. Set<string> (usedNames) doesn't
// survive JSON.stringify/parse directly, so it's serialized as an array.
import type { GameState } from "./types";

const KEY = "the-yard:rags-to-riches:v1";

type SerializedState = Omit<GameState, "usedNames"> & { usedNames: string[] };

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
    const parsed = JSON.parse(raw) as SerializedState;
    return { ...parsed, usedNames: new Set(parsed.usedNames) };
  } catch {
    return null;
  }
}

export function clearGame() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
