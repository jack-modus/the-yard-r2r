// Small state-update helpers, extracted verbatim from reference/rags-to-riches-v6.jsx.
import type { Horse } from "@/lib/sim";
import type { GameState } from "./types";

export const withHorse = (s: GameState, hid: number, fn: (h: Horse) => Horse): GameState => ({
  ...s,
  horses: s.horses.map(h => (h.id === hid ? fn({ ...h }) : h)),
});

export const note = (s: GameState, text: string): GameState => ({
  ...s,
  messages: [{ day: s.day, text }, ...s.messages].slice(0, 60),
});
