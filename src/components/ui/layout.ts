// Shared column width so the app reads as a phone-width diary even on a
// wide desktop viewport, instead of stretching edge-to-edge.
export const COLUMN = "w-full max-w-[480px] mx-auto md:border-x md:border-gold-500/20";

// Same width, no border — for overlay panels that already draw their own border.
export const COLUMN_PLAIN = "w-full max-w-[480px] mx-auto";
