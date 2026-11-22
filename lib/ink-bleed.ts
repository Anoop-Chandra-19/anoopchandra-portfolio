// Ink-bleed and corner-peel geometry parameterized over the live viewport.

export const FWD_MS = 1500;
export const BACK_MS = 1100;
/** Phone-sized viewports run the ceremony shorter — the durations the design's
    mobile prototype uses (ink-bleed-mobile.js). There's less screen for the ink
    to cross, so the desktop timing reads as a stall on a phone. */
export const FWD_MS_SM = 1050;
export const BACK_MS_SM = 820;
/** Matches the CSS mobile breakpoint in globals.css */
const SM_MAX_W = 720;
export const JITTER = 0.22;
export const INK = "#0e0c08";

/** Phone-sized viewports drop the bleed's dark rim. Its ragged cut-out is a
    second full-screen clip mask on top of the page reveal, and redrawing both
    every frame at phone pixel densities (3x and up) drops frames in the first
    half of the bleed. Either mask alone holds 60fps. */
export const hasBleedRim = (vw: number): boolean => vw > SM_MAX_W;

/** Chosen once at navigate time from the captured viewport — no resize tracking
    mid-flight (the animation is ~1s and the viewport is locked anyway). */
export const transitionMs = (effect: "bleed" | "peel", vw: number): number => {
  const small = vw <= SM_MAX_W;
  if (effect === "bleed") return small ? FWD_MS_SM : FWD_MS;
  return small ? BACK_MS_SM : BACK_MS;
};

const DESIGN_MIN_DIM = 680;

export const SPATTERS = [
  { dx: -110, dy: -70, r: 38, seed: 11 },
  { dx: 130, dy: -90, r: 32, seed: 23 },
  { dx: 160, dy: 60, r: 28, seed: 41 },
  { dx: -90, dy: 100, r: 34, seed: 53 },
] as const;

export const SPATTER_BIRTHS = [0.06, 0.1, 0.14, 0.18] as const;

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

/** Shared blob outline as path data. Every blob has the same 64-point
    structure whatever its radius, so path() keyframes can interpolate between
    them, and overlapping blobs in one path union under the nonzero fill rule. */
function noisyBlobPath(cx: number, cy: number, r: number, eff: number, seedOffset: number): string {
  const n = BLEED_SEEDS.length;
  const cmds: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = Math.max(0, r * (1 + BLEED_SEEDS[(i + seedOffset) % n] * eff));
    cmds.push(
      `${i === 0 ? "M" : "L"}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`
    );
  }
  return cmds.join("") + "Z";
}

/** Main-bleed blob. Jitter scales with radius — a fresh drop is round,
    irregularity grows as the ink soaks into more paper. drawScale redraws the
    same shape smaller or larger, for a layer that is itself scaled. */
export function blobPath(cx: number, cy: number, r: number, drawScale = 1, jitter = JITTER): string {
  const eff = jitter * Math.min(1, Math.max(0, (r - 20) / 180));
  return noisyBlobPath(cx, cy, r * drawScale, eff, 0);
}

export function spatterPath(
  cx: number,
  cy: number,
  r: number,
  seedOffset: number,
  jitter = JITTER
): string {
  const eff = jitter * Math.min(1, Math.max(0, (r - 6) / 28));
  return noisyBlobPath(cx, cy, r, eff, seedOffset);
}

export const maxRadius = (cx: number, cy: number, vw: number, vh: number) =>
  Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy)) + 80;

export const peelMaxK = (vw: number, vh: number) => vw + vh + 20;

export function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
