// Stylised bird's-eye track shapes for the live-race visual. These are
// evocative sketches of each course's real layout (turns, hill, straight),
// not survey drawings — same spirit as courses.ts's prose notes, written
// from general racing knowledge and course-guide research, not traced from
// any copyrighted map. Every shape shares one viewBox so they drop into
// the same <svg> unchanged.
// Shapes are authored as waypoints and turned into a smooth curve by
// smoothPath() (see svgPath.ts) rather than hand-tuned bezier control
// points — hand-tuned curves are easy to get subtly wrong at the joins (a
// tangent that reverses direction reads as an implausible hairpin turn).
import { smoothPath, type Point } from "./svgPath";
import type { CourseName } from "@/lib/sim";

export interface TrackLabel {
  x: number;
  y: number;
  text: string;
  muted?: boolean;
}

export interface TrackShape {
  viewBox: string;
  rail: string; // the 'd' path runners travel along, also drawn as the guide rail
  labels?: TrackLabel[];
}

interface Layout {
  points: Point[];
  labels?: TrackLabel[];
}

interface CourseTrackData {
  viewBox: string;
  layouts: Record<string, Layout>;
  // Which layout key a given race distance (furlongs) resolves to.
  layoutForDist: (dist: number) => string;
}

const VB = "0 0 520 220";
const PLAIN_STRAIGHT: Point[] = [[40, 150], [480, 150]];

const COURSE_TRACKS: Record<CourseName, CourseTrackData> = {
  // Wide, level, sweeping turns — one of the fairest (least sharp) tracks
  // in Britain. Straight 5f/6f course; 7f+ uses the round (horseshoe)
  // course out on the Knavesmire.
  York: {
    viewBox: VB,
    layoutForDist: d => (d <= 6 ? "straight" : "round"),
    layouts: {
      straight: { points: PLAIN_STRAIGHT },
      round: {
        points: [[50, 185], [45, 120], [110, 60], [260, 28], [400, 45], [470, 95], [495, 140], [500, 175]],
        labels: [{ x: 210, y: 44, text: "THE KNAVESMIRE" }],
      },
    },
  },

  // Barely a mile round, no separate straight course anywhere — sprints
  // run the same tight, constantly-turning circuit as everything else.
  // The tightest track in the country, with a home straight of only
  // about a furlong and a half.
  Chester: {
    viewBox: VB,
    layoutForDist: () => "round",
    layouts: {
      round: {
        points: [[444, 93], [441, 141], [380, 181], [280, 200], [174, 191], [95, 158], [70, 111], [106, 65], [192, 36], [300, 32], [394, 55]],
        labels: [
          { x: 220, y: 213, text: "THE ROODEE" },
          { x: 100, y: 130, text: "constant left turn", muted: true },
        ],
      },
    },
  },

  // Mostly a straight course (up to 1m2f) with the famous Dip mid-straight;
  // longer races start out on a loop and turn right-handed onto the same
  // straight — an "L-shape" rather than a full horseshoe.
  Newmarket: {
    viewBox: VB,
    layoutForDist: d => (d <= 10 ? "straight" : "round"),
    layouts: {
      straight: {
        points: PLAIN_STRAIGHT,
        labels: [
          { x: 260, y: 130, text: "THE DIP", muted: true },
          { x: 60, y: 100, text: "ROWLEY MILE", muted: true },
        ],
      },
      round: {
        points: [[70, 50], [110, 95], [165, 135], [250, 150], [360, 152], [480, 150]],
        labels: [{ x: 260, y: 132, text: "THE DIP", muted: true }],
      },
    },
  },

  // Straight mile for shorter races; the round course is a right-handed
  // triangular circuit joining it at Swinley Bottom, with the stiffest
  // uphill finish in the game (a 73-foot climb over the last two furlongs).
  Ascot: {
    viewBox: VB,
    layoutForDist: d => (d <= 7 ? "straight" : "round"),
    layouts: {
      straight: {
        points: PLAIN_STRAIGHT,
        labels: [{ x: 340, y: 130, text: "STIFF CLIMB ↗", muted: true }],
      },
      round: {
        points: [[60, 175], [55, 100], [130, 45], [260, 30], [390, 50], [465, 110], [490, 160], [500, 185]],
        labels: [
          { x: 150, y: 42, text: "SWINLEY BOTTOM" },
          { x: 430, y: 155, text: "STIFF CLIMB ↘", muted: true },
        ],
      },
    },
  },

  // The Derby course: uphill out of the stalls, over the top, then
  // plunging downhill through cambered Tattenham Corner into the straight.
  // 5f and 6f run on the separate straight sprint courses instead.
  Epsom: {
    viewBox: VB,
    layoutForDist: d => (d <= 5 ? "straight5" : d === 6 ? "straight6" : "round"),
    layouts: {
      straight5: {
        points: PLAIN_STRAIGHT,
        labels: [{ x: 60, y: 100, text: "DOWNHILL ↘", muted: true }],
      },
      straight6: {
        points: [[40, 128], [220, 138], [340, 162], [420, 178], [480, 184]],
        labels: [
          { x: 60, y: 90, text: "DOWNHILL ↘", muted: true },
          { x: 300, y: 205, text: "drifts left", muted: true },
        ],
      },
      round: {
        points: [[60, 195], [35, 140], [100, 55], [230, 25], [360, 35], [455, 95], [470, 112], [485, 128], [500, 145]],
        labels: [
          { x: 55, y: 165, text: "UPHILL ↖", muted: true },
          { x: 345, y: 48, text: "Tattenham Corner" },
          { x: 465, y: 95, text: "steep descent", muted: true },
        ],
      },
    },
  },

  // A separate straight five; everything else on the oval round course,
  // finishing with a half-mile uphill run from the two-furlong pole.
  Sandown: {
    viewBox: VB,
    layoutForDist: d => (d <= 5 ? "straight" : "round"),
    layouts: {
      straight: {
        points: PLAIN_STRAIGHT,
        labels: [{ x: 340, y: 130, text: "UPHILL FINISH ↗", muted: true }],
      },
      round: {
        points: [[55, 150], [40, 95], [95, 50], [210, 28], [340, 35], [440, 70], [485, 120], [495, 160], [500, 180]],
        labels: [{ x: 420, y: 145, text: "UPHILL RUN-IN ↘", muted: true }],
      },
    },
  },

  // Flat, wide and galloping on Town Moor — a long straight covers sprints
  // and milers without a turn at all; the pear-shaped round course handles
  // everything longer, with gentle bends throughout.
  Doncaster: {
    viewBox: VB,
    layoutForDist: d => (d <= 8 ? "straight" : "round"),
    layouts: {
      straight: {
        points: PLAIN_STRAIGHT,
        labels: [{ x: 60, y: 100, text: "TOWN MOOR", muted: true }],
      },
      round: {
        points: [[55, 175], [42, 110], [95, 55], [220, 28], [360, 35], [455, 80], [490, 130], [500, 170]],
        labels: [{ x: 200, y: 44, text: "TOWN MOOR", muted: true }],
      },
    },
  },

  // A sharp, undulating switchback cut into the Sussex Downs — the only
  // course in the game where the bend genuinely reverses direction rather
  // than sweeping one way throughout, matching its reputation as a
  // traffic-heavy, tactical track once races run beyond six furlongs.
  Goodwood: {
    viewBox: VB,
    layoutForDist: d => (d <= 6 ? "straight" : "round"),
    layouts: {
      straight: { points: PLAIN_STRAIGHT },
      round: {
        points: [[55, 180], [40, 120], [80, 60], [175, 35], [270, 55], [330, 100], [400, 90], [460, 110], [495, 150], [500, 178]],
        labels: [
          { x: 150, y: 33, text: "climb to the summit", muted: true },
          { x: 400, y: 78, text: "sharp descent", muted: true },
          { x: 250, y: 205, text: "SUSSEX DOWNS", muted: true },
        ],
      },
    },
  },
};

export function trackShapeFor(course: CourseName, dist: number): TrackShape {
  const data = COURSE_TRACKS[course];
  const key = data.layoutForDist(dist);
  const layout = data.layouts[key];
  return { viewBox: data.viewBox, rail: smoothPath(layout.points), labels: layout.labels };
}
