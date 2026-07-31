// Display formatting helpers, extracted verbatim from reference/rags-to-riches-v6.jsx.
import type { Grade } from "./types";

export function marginStr(l: number): string {
  if (l < 0.08) return "shd";
  if (l < 0.2) return "hd";
  if (l < 0.4) return "nk";
  if (l < 0.65) return "½L";
  if (l < 0.9) return "¾L";
  const w = Math.round(l * 4) / 4, wh = Math.floor(w), q = w - wh;
  return wh + (q === 0.25 ? "¼" : q === 0.5 ? "½" : q === 0.75 ? "¾" : "") + "L";
}

export const gradeLabel = (gr: Grade): string =>
  typeof gr === "number" ? `Class ${gr}` : gr === "L" ? "Listed" : gr;
