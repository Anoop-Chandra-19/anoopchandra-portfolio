// Pure geometry/timing for the ink-bleed / corner-peel route transition.
// Ported from Portfolio/design_handoff_ink_bleed_transition/transition-demo-v6.jsx,
// parameterized over the real viewport (the demo hardcoded 1000×680).

export const FWD_MS = 1500;
export const BACK_MS = 1100;
export const JITTER = 0.22;
export const INK = "#0e0c08";

/** Reference viewport the spatter offsets were designed on */
const DESIGN_MIN_DIM = 680;

export const SPATTERS = [
  { dx: -110, dy: -70, r: 38, seed: 11 },
  { dx: 130, dy: -90, r: 32, seed: 23 },
  { dx: 160, dy: 60, r: 28, seed: 41 },
  { dx: -90, dy: 100, r: 34, seed: 53 },
] as const;

export const SPATTER_BIRTHS = [0.06, 0.1, 0.14, 0.18] as const;

/** Keeps spatters on-screen on small viewports (design deviation, noted in plan) */
export const spatterScale = (vw: number, vh: number) =>
  Math.min(1, Math.min(vw, vh) / DESIGN_MIN_DIM);

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

/** mulberry32 PRNG — deterministic edge noise, no shimmer between frames */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let r = Math.imul(a ^ (a >>> 15), 1 | a);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** 64-spoke two-octave noise: 8 broad lobes ×0.7 + fine wobble ×0.3 */
export function makeBleedSeeds(seed = 0xdeadbeef, n = 64): number[] {
  const rand = mulberry32(seed);
  const broad = Array.from({ length: 8 }, () => rand() * 2 - 1);
  return Array.from({ length: n }, (_, i) => {
    const broadVal = broad[((i / n) * broad.length) | 0];
    const fine = rand() * 2 - 1;
    return broadVal * 0.7 + fine * 0.3;
  });
}

export const BLEED_SEEDS = makeBleedSeeds();

/** Main-bleed blob. Jitter scales with radius — a fresh drop is round,
    irregularity grows as the ink soaks into more paper. */
export function blobClip(cx: number, cy: number, r: number, jitter = JITTER): string {
  const n = BLEED_SEEDS.length;
  const eff = jitter * Math.min(1, Math.max(0, (r - 20) / 180));
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = Math.max(0, r * (1 + BLEED_SEEDS[i] * eff));
    parts.push(`${(cx + Math.cos(a) * rr).toFixed(1)}px ${(cy + Math.sin(a) * rr).toFixed(1)}px`);
  }
  return `polygon(${parts.join(", ")})`;
}

/** Spatter blob — same noise, rotated per-spatter, tighter jitter window */
export function spatterClip(
  cx: number,
  cy: number,
  r: number,
  seedOffset: number,
  jitter = JITTER
): string {
  const n = BLEED_SEEDS.length;
  const eff = jitter * Math.min(1, Math.max(0, (r - 6) / 28));
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = Math.max(0, r * (1 + BLEED_SEEDS[(i + seedOffset) % n] * eff));
    parts.push(`${(cx + Math.cos(a) * rr).toFixed(1)}px ${(cy + Math.sin(a) * rr).toFixed(1)}px`);
  }
  return `polygon(${parts.join(", ")})`;
}

/** Bleed radius needed to cover the whole viewport from (cx, cy) */
export const maxRadius = (cx: number, cy: number, vw: number, vh: number) =>
  Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy)) + 80;

const EMPTY = "polygon(0px 0px, 0px 0px, 0px 0px)";

/** Clip a viewport rect against a half-plane along the diagonal x + y = k.
    keep = "gte" keeps x+y ≥ k (the un-peeled region, bottom-right);
    keep = "lte" keeps x+y ≤ k (the revealed region growing from top-left). */
function halfPlaneClip(k: number, vw: number, vh: number, keep: "gte" | "lte"): string {
  const corners: Array<[number, number]> = [
    [0, 0],
    [vw, 0],
    [vw, vh],
    [0, vh],
  ];
  const inside = (p: [number, number]) => (keep === "gte" ? p[0] + p[1] >= k : p[0] + p[1] <= k);
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < 4; i++) {
    const A = corners[i];
    const B = corners[(i + 1) % 4];
    const aIn = inside(A);
    const bIn = inside(B);
    if (aIn) pts.push(A);
    if (aIn !== bIn) {
      const t = (k - A[0] - A[1]) / (B[0] + B[1] - A[0] - A[1]);
      pts.push([A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])]);
    }
  }
  if (pts.length < 3) return EMPTY;
  return `polygon(${pts.map((p) => `${p[0].toFixed(1)}px ${p[1].toFixed(1)}px`).join(", ")})`;
}

/** The journal's remaining (un-peeled) region: x + y ≥ k */
export const peelClip = (k: number, vw: number, vh: number) => halfPlaneClip(k, vw, vh, "gte");

/** The destination's revealed region growing from the top-left: x + y ≤ k */
export const peelClipComplement = (k: number, vw: number, vh: number) =>
  halfPlaneClip(k, vw, vh, "lte");

/** Peel travel: k sweeps 0 → vw + vh + 20 */
export const peelMaxK = (vw: number, vh: number) => vw + vh + 20;

/** Geometry of the soft shadow band running along the diagonal cut x + y = k */
export function peelShadowGeom(
  k: number,
  vw: number,
  vh: number
): { left: number; top: number; width: number; height: number } | null {
  const lo = Math.max(0, k - vw);
  const hi = Math.min(vh, k);
  const len = (hi - lo) * Math.SQRT2;
  if (len < 4) return null;
  const midY = (lo + hi) / 2;
  return { left: k - midY - len / 2, top: midY - 12, width: len, height: 24 };
}

/** hex + alpha 0..1 → rgba() */
export function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
