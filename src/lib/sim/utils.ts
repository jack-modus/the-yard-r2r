// Small shared helpers, extracted verbatim from reference/rags-to-riches-v6.jsx.

let uid = 1;
export const nid = () => uid++;

export const rnd = (a: number, b: number) => a + Math.random() * (b - a);
export const ri = (a: number, b: number) => Math.floor(rnd(a, b + 1));
export const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
// Irwin-Hall(4)-based approximate standard normal — cheap, bounded, good enough for race noise.
export const gauss = () => (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 2;
export const money = (n: number) => "£" + Math.round(n).toLocaleString();
