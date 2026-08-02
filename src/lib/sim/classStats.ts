// Real-world calibration data, derived from aggregate statistics over
// C:\Users\jackr\ggs\races_master_v4.csv (the user's own historical race
// dataset — flat racing at Newmarket, Goodwood, Sandown, Epsom Downs,
// 2022-2026). No real horse/trainer/jockey names or comment text are used
// anywhere in this file — only aggregate numbers (mean/std of Official
// Rating and field size per class), which is what "Class" means in real
// British racing: a national ability band, not tied to any one course.
// See CLAUDE.md "Historical data" for the source and hard rules.
//
// Sample sizes (tier-1 courses only, flat racing): class 1 n=2977,
// class 2 n=3747, class 3 n=2601, class 4 n=3914, class 5 n=2493,
// class 6 n=225. Real favourite strike rate over the same sample: 34.1%
// (n=2142 favourite-marked runners) — this is what lib/sim/race.ts's
// noiseSd is calibrated against.
export interface ClassStat {
  orMean: number;
  orStd: number;
  fieldMean: number;
  fieldStd: number;
}

// Bands 3-6 and "L" are direct measurements (real "Class" 4,3,2 respectively
// — the dataset's numeric Class 2 band, OR mean 90.3, stands in for Listed).
// Real "Class 1" (OR mean 102.4, std 9.6, n=2977) lumps Group races and
// Listed together with no further split available in this dataset, so G3/G2/G1
// below are informed extrapolation from that single band using standard BHA
// rating conventions (G3 ≈ 95-105, G2 ≈ 100-110, G1 ≈ 108+), not direct
// measurements — flagged here so a future recalibration knows to redo these
// three if a Pattern-race-only sample becomes available.
export const CLASS_STATS: Record<3 | 4 | 5 | 6 | "L" | "G3" | "G2" | "G1", ClassStat> = {
  6: { orMean: 57.7, orStd: 6.3, fieldMean: 9.2, fieldStd: 2.2 },
  5: { orMean: 67.6, orStd: 5.7, fieldMean: 9.2, fieldStd: 2.6 },
  4: { orMean: 77.1, orStd: 5.7, fieldMean: 9.1, fieldStd: 2.8 },
  3: { orMean: 84.6, orStd: 6.0, fieldMean: 9.7, fieldStd: 3.4 },
  L: { orMean: 90.3, orStd: 8.0, fieldMean: 12.7, fieldStd: 5.7 },
  G3: { orMean: 97.0, orStd: 8.5, fieldMean: 10.5, fieldStd: 4.0 }, // extrapolated, see above
  G2: { orMean: 102.4, orStd: 9.6, fieldMean: 9.0, fieldStd: 3.2 }, // = measured real Class 1
  G1: { orMean: 108.0, orStd: 9.0, fieldMean: 7.5, fieldStd: 2.5 }, // extrapolated, see above
};
