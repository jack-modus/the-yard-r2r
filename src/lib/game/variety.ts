// Shared "seen pool" cooldown for flavour-content pick() pools (training
// moments, pre/post-race press variants, quiet/news lines) — per playtesting
// feedback that the same event (e.g. the "left boot" superstition line, one
// of only 3 pre-race press variants) could reselect on the very next
// occurrence. Deliberately generic and pool-size-agnostic rather than a
// fixed per-category cooldown: excludes anything in `recent`, and once that
// would leave nothing to pick from, the pool has been exhausted and starts
// fresh — so small pools (2-3 items) still get real variety, not an
// artificial multi-day lockout waiting on a fixed cooldown that dwarfs the
// pool itself.
import { pick } from "@/lib/sim";

// Items with no `id` (one-off/scripted content mixed into an otherwise
// trackable pool) are always treated as fresh — there's nothing to compare.
export function pickFresh<T extends { id?: string }>(pool: T[], recent: string[]): T {
  const fresh = pool.filter(x => x.id == null || !recent.includes(x.id));
  return pick(fresh.length ? fresh : pool);
}

// Keeps just enough history to cover one full lap of the pool (poolSize - 1
// other ids) — exactly enough to guarantee no immediate repeat without
// needlessly suppressing an item once everything else has already reappeared.
export function recordSeen(recent: string[], id: string, poolSize: number): string[] {
  return [id, ...recent].slice(0, Math.max(0, poolSize - 1));
}
