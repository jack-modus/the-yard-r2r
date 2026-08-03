// Track-tier gating. Split out from engine.ts so both engine.ts and
// story.ts can depend on it without a circular import between them.
import { TIER1_COURSES, TIER2_COURSES } from "@/lib/sim";
import type { CourseName } from "@/lib/sim";

// Reputation threshold that unlocks tier-2 courses (Ascot, Doncaster, York,
// Chester). See CLAUDE.md "The four metrics" for the full reputation design.
export const REPUTATION_TIER2_UNLOCK = 35;

export function unlockedCourses(reputation: number): CourseName[] {
  return reputation >= REPUTATION_TIER2_UNLOCK ? [...TIER1_COURSES, ...TIER2_COURSES] : TIER1_COURSES;
}
