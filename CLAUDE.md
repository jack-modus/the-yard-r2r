@AGENTS.md

# The Yard: Rags to Riches

A horse-racing trainer sim (Next.js App Router + TypeScript + Tailwind v4, PWA target). Player is a broke 23-year-old apprentice trainer working toward a Group 1 win, starting with a horse nobody else wanted. Originally prototyped as a single-file Claude.ai JSX artifact (`reference/rags-to-riches-v6.jsx`) — that file is kept for reference during extraction, is not linted as app code, and should not be imported from.

## Hard rules — do not violate these

1. **No real named people.** Rivals, jockeys, trainers, bosses, owners — all fictional, real-sounding names only. Never use a real person's name, even a retired or minor one. This avoids IP/publicity-rights risk.
2. **Course/track facts must be factual but never copied.** Course descriptions (`src/lib/sim/courses.ts`: `COURSES[...].line`, `INSIGHTS`) and draw-bias notes must be written fresh from general racing knowledge. Never lift wording from Racing Post, Timeform, or any other source verbatim or near-verbatim. Facts (e.g. "Chester is left-handed and tight") aren't copyrightable — expression is, so always re-derive the description in original words.
3. **No live scraping of commercial racing data.** Never scrape or ingest Racing Post/Timeform/etc. results data — ToS/licensing risk. The only real-world dataset permitted is the user's own historical race data in `C:\Users\jackr\ggs` (their existing Betfair ML pipeline), used to calibrate the sim's invented stat curves against real favourite strike-rates and SP distributions — never to source real horse/human names or copy real race commentary.
4. **No monetisation linked to the simulated betting.** Do not add a paid "Hall of Fame," loot boxes, or any real-money purchase connected to in-game wagering or chance outcomes — regulatory risk, worse given minors could plausibly access it. If monetisation is revisited later, the only acceptable pattern is flat-price cosmetic/commemorative items that are never linked to chance or convertible into in-game stakeable currency.
5. **Deployment target is a PWA** (installable website via Next.js/Vercel), not a native app store submission. Don't introduce native-only APIs or a native wrapper without an explicit decision to revisit this.

## Architecture

- `src/lib/sim/` — the race simulation core. Pure, React-free, fully typed. `expected()`/`runRace()` (race.ts), `makeHorse()`/`makeRagsHorse()` (horse.ts), gear effects (gear.ts), course/yard/calendar data tables, plus `classStats.ts` (real-data OR/field-size distributions per class) and `roster.ts` (the persistent NPC horse pool — see "Historical data" below).
- `src/lib/game/` — the game state machine sitting on top of `lib/sim`. `engine.ts` holds `newGame`/`advanceDay`/`resolveRaceDay`/`chooseDecision`/`enterRace` as pure functions over a typed `GameState`; `content.ts` holds day-content generators (`trainingMoment`, quiet-day/news lines); `storage.ts` is the localStorage save/load layer.
- `src/components/` — the UI. `intro/` (name + yard picker), `game/` (header, four overlays — daily flash, decision, live race, help — tab bar, four tabs, advance bar), `ui/` (small primitives: Card, StatBar, PlanButton, Button).
- `src/app/page.tsx` — top-level orchestration: owns `GameState`, wires engine calls to UI callbacks, handles localStorage load/save.
- Styling: Tailwind v4 with custom `@theme` tokens in `src/app/globals.css` matching the original prototype's dark-purple-and-gold racing-diary palette (`ink-*`, `gold-*`, `parchment-*`). `font-diary` = Georgia serif (narrative text), `font-mono` = Courier New (UI chrome/numbers) — this mirrors real racecard typography conventions the prototype was built around.

## Tuned sim constants — validate before changing

The noise/spread constants below are calibrated against real outcomes from `ggs/races_master_v4.csv` (see "Historical data"), not hand-tuned by feel. If retuning, regenerate the grid-search rather than eyeballing it — the first attempt at this (the prototype's original 0.05-0.22 noise range) produced a 75% simulated favourite strike rate against a real 34.1%, which is exactly the kind of error that "feels roughly right" until you check it against data.

- **Race-day noise**: `noiseSd(h) = clamp(0.735 - (temperament/100)*0.315 + gearNoise, 0.26, 1.16)` (`lib/sim/race.ts`). This is the prototype's original formula scaled ×5.25 — that scale factor was grid-searched to match the real 34.1% favourite strike rate (n=2142 favourite-marked runners, tier-1 courses). Gear `noiseAdj` values in `lib/sim/gear.ts` are scaled by the same ×5.25 so gear's relative effect on consistency doesn't round to nothing.
- **Roster field-composition band width**: exact match on `Horse.rosterBand`, not OR-value proximity. An OR-window filter (even ±0.5 std) was tested and let neighbouring class bands' Gaussian tails bleed into each other, inflating a single race's effective rating spread — the calibration above assumes single-band fields, so the filter has to actually produce them.
- **Softmax temperature**: `3.2` in `runRace()`'s odds calculation — controls the displayed SP *spread* across the field, not who wins (win/lose is decided by the noisy `score`, and softmax is order-preserving, so the SP favourite and the noisy-score favourite are always the same horse). Not yet validated against the real odds-bucket calibration table pulled during analysis; lower priority than the win-rate fix since it's cosmetic.
- **Course-interaction weights** (`expected()` in `lib/sim/race.ts`): sharpness penalty ×0.035, undulation penalty ×0.03, finish-climb penalty ×0.04, break bonus ×0.06 (sprints ≤6f) / ×0.02 (longer), course mastery worth up to 5% (`×0.05`). Not recalibrated against real data yet.
- **Injury base rates**: gallop/sprints training = `0.02 + (fatigue/100)*0.05` per day (`engine.ts`); stalls-practice decision = 10%; "let it stretch out" decision = 12%.
- **Handicapper mark deltas** (`resolveRaceDay` in `engine.ts`): win by ≥2.5L → +6 to +9lb; any win → +3 to +6lb; close-up place (gap <1L) → +1 to +3lb; well-beaten (gap >4L) → -3 to -6lb; moderate effort (gap >2L) → -1 to -3lb.
- **Day-content roll** (`advanceDay`): 42% quiet flavour line, 18% news line, 18% decision event (`trainingMoment`), 22% nothing.

## Historical data

`C:\Users\jackr\ggs` holds the user's own Betfair ML pipeline. The dataset actually used so far is `races_master_v4.csv` (real flat-racing results, 2022-2026, ~530k rows) — the dated `*racecard.csv` files and `betfair_2026_results.csv` are 2026-only and weren't needed for this pass. This is the *only* permitted source of real racing data (see hard rule 3); only aggregate numbers (mean/std of OR and field size per class) were pulled out, never real horse/trainer/jockey names or comment text.

**What's wired in**: `lib/sim/classStats.ts` holds real per-class OR mean/std and field-size mean/std (tier-1 courses: Newmarket, Goodwood, Sandown, Epsom Downs — "Class" in British racing is a national ability band, not course-specific, so this generalizes to races at any course). `lib/sim/roster.ts` uses it to seed a ~120-horse persistent NPC pool (`GameState.roster`, created once per new game in `newGame()`) instead of inventing a throwaway field from scratch every race — this is what makes rival horses recur across a season with an evolving win/run record, and it's what the noise calibration above was validated against. `G3`/`G1` bands in `classStats.ts` are informed extrapolation (the dataset lumps all Group/Listed races into one "Class 1"), flagged inline for future recalibration if a Pattern-race-only sample becomes available.

**Not yet done**: applying this same real-data approach to non-flat/other calendar specifics, and recalibrating the softmax temperature and course-interaction weights the same rigorous way (both currently just carried over from the prototype).

## Open product decisions

- **Confirmed direction, not yet implemented**: replacing the 3-boss/yard picker with a single trainer, plus a track-tier unlock system — tier 1 (Epsom, Sandown, Newmarket, Goodwood) open from game start, tier 2 (Ascot, Doncaster, York, Chester — Doncaster specifically for the St Leger) gated behind an early milestone. The two unused boss personas (Berrow, Okafor) should be repurposed as rival trainer characters rather than deleted. This directly replaces the "which yard's tracks are yours" mechanic — track *mastery* (already built) becomes the sole differentiator. Not yet started; the roster/calibration work above is course-agnostic (keyed by class, not course) so it doesn't need to wait on this.
- Whether this game ("Rags to Riches," the apprentice sim) and the earlier prototype "The Yard" (established-trainer, owner-facing sim, 35-week season, nemesis rival) ship as one product or two. Not yet decided — don't assume either direction when making structural changes.
- **Biggest known design gap**: no real branching narrative. Only one true fork exists (boss choice at game start), and it's flavour/mechanics-only — all three bosses feed an identical milestone ladder with one possible ending. The single-trainer/track-tier change above may substantially address this (progression becomes the spine instead of a cosmetic boss choice), but a deliberate pass is still owed before more surface content is added.
