import type { CSSProperties } from "react";
import {
  INK,
  JITTER,
  SPATTERS,
  SPATTER_BIRTHS,
  blobPath,
  easeOutCubic,
  easeOutQuart,
  hexA,
  maxRadius,
  peelMaxK,
  spatterPath,
  spatterScale,
} from "@/lib/ink-bleed";

export type InkEffect = "bleed" | "peel";

export type InkOrigin = { cx: number; cy: number; vw: number; vh: number };

/** Halo texture radius at scale 1; the snapshot is scaled to the bleed radius. */
const HALO_R = 128;
/** The rim's soft band, as a share of the halo radius. */
const HALO_BAND = 54 / 512;
const SHADOW_H = 24;
/** Keyframes sampled along the bleed. Every path keeps the same structure, so
    the browser interpolates between samples. */
const BLEED_SAMPLES = 40;
/** Share of the bleed, at the end, over which the ragged edge settles into a
    circle. The eased radius is nearly full by then, and a dent in the edge
    pointing at a far corner would otherwise leave a sliver of the old page
    showing there until the transition ends. */
const SETTLE = 0.3;
/** easeInOutCubic as a CSS curve: the peel's geometry is linear in its
    progress, so two keyframes and this easing replace per-frame sampling. */
export const PEEL_EASING = "cubic-bezier(0.65, 0, 0.35, 1)";

/** The page itself is the `root` snapshot, which has no ViewTransition
    instance of its own, so it is animated through the document element. */
export function animateRoot(
  pseudo: "old" | "new",
  keyframes: Keyframe[],
  duration: number,
  easing = "linear"
): Animation {
  return document.documentElement.animate(keyframes, {
    duration,
    easing,
    fill: "both",
    pseudoElement: `::view-transition-${pseudo}(root)`,
  });
}

/** Share of the transition the reveal (and the marks that track its edge) runs
    for. The rest keeps the transition open after the reveal clip has dropped. */
export const REVEAL_END = 0.97;

/** The destination page's reveal clip. It ends on a shape that covers the
    whole screen and then drops away rather than holding: Chrome on Android
    takes a frame to redraw a held clip-path after the animation ends, and in
    that frame the new page isn't drawn, flashing the page being left. */
export function revealRoot(keyframes: Keyframe[], duration: number, easing = "linear"): Animation {
  return document.documentElement.animate(keyframes, {
    duration,
    easing,
    fill: "backwards",
    pseudoElement: "::view-transition-new(root)",
  });
}

export function haloStyle({ cx, cy }: InkOrigin): CSSProperties {
  return {
    left: cx - HALO_R,
    top: cy - HALO_R,
    width: HALO_R * 2,
    height: HALO_R * 2,
    background: `radial-gradient(circle, ${hexA(INK, 0.5)} ${HALO_R * (1 - HALO_BAND)}px, ${hexA(INK, 0)} ${HALO_R}px)`,
  };
}

export function dropStyle({ cx, cy }: InkOrigin): CSSProperties {
  return {
    left: cx - 14,
    top: cy - 14,
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: INK,
    boxShadow: `0 6px 14px ${hexA(INK, 0.4)}`,
  };
}

export function shadowStyle({ vw, vh }: InkOrigin): CSSProperties {
  return {
    left: 0,
    top: 0,
    width: vw + vh,
    height: SHADOW_H,
    background:
      "linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.32) 50%, rgba(0, 0, 0, 0) 100%)",
  };
}

export function bleedKeyframes({ cx, cy, vw, vh }: InkOrigin) {
  const maxR = maxRadius(cx, cy, vw, vh);
  const scale = spatterScale(vw, vh);
  const holes: Keyframe[] = [];
  const halo: Keyframe[] = [];
  const haloHole: Keyframe[] = [];

  for (let i = 0; i <= BLEED_SAMPLES; i++) {
    const local = i / BLEED_SAMPLES;
    const mainLocal = Math.max(0, (local - 0.04) / 0.96);
    const grown = maxR * easeOutQuart(mainLocal);
    const mainR = grown > 4 ? grown : 0;
    const jitter = JITTER * Math.min(1, (1 - local) / SETTLE);

    // A spatter not yet born is a zero-radius blob, so the path keeps its shape.
    const spatters = SPATTERS.map((s, k) => {
      const born = local >= SPATTER_BIRTHS[k];
      const r = born ? s.r * scale * easeOutCubic(Math.min(1, (local - SPATTER_BIRTHS[k]) / 0.22)) : 0;
      return spatterPath(cx + s.dx * scale, cy + s.dy * scale, r, s.seed);
    });
    holes.push({ offset: local, clipPath: `path("${blobPath(cx, cy, mainR, 1, jitter)}${spatters.join("")}")` });

    // The rim is the halo texture scaled to just past the hole's edge, with the
    // hole itself cut out in the texture's own (unscaled) coordinates.
    const s = (mainR + 24) / HALO_R;
    const isRimVisible = mainR > 0 && local < 1;
    halo.push({
      offset: local,
      transform: `translate(${cx}px, ${cy}px) scale(${s}) translate(${-HALO_R}px, ${-HALO_R}px)`,
      opacity: isRimVisible ? (mainLocal < 0.9 ? 1 : 1 - (mainLocal - 0.9) / 0.1) : 0,
    });
    const box = HALO_R * 2;
    haloHole.push({
      offset: local,
      clipPath: `path(evenodd, "M0 0H${box}V${box}H0Z${blobPath(HALO_R, HALO_R, mainR, 1 / s, jitter)}")`,
    });
  }

  // The drop lands in the first 5% and is gone once the bleed opens under it.
  const drop: Keyframe[] = [
    { offset: 0, transform: "scale(0.3)", opacity: 1 },
    { offset: 0.05, transform: "scale(1.3)", opacity: 1 },
    { offset: 0.05, transform: "scale(1.3)", opacity: 0 },
    { offset: 1, transform: "scale(1.3)", opacity: 0 },
  ];
  return { holes, halo, haloHole, drop };
}

export function peelKeyframes({ vw, vh }: InkOrigin) {
  const maxK = peelMaxK(vw, vh);
  const far = vw + vh;
  const length = vw + vh;
  // Home is revealed in the half-plane x + y ≤ k. A triangle whose long edge
  // is that line has corners linear in k, so it interpolates exactly.
  const reveal = (k: number) => `polygon(${-far}px ${-far}px, ${k + far}px ${-far}px, ${-far}px ${k + far}px)`;
  // The shadow band is centred on the cut, along it; its lower half (after the
  // rotation) lies on the home side, and only that half is shown.
  const band = (k: number) =>
    `translate(${k / 2}px, ${k / 2}px) rotate(135deg) translate(${-length / 2}px, ${-SHADOW_H / 2}px)`;

  return {
    reveal: [{ clipPath: reveal(0) }, { clipPath: reveal(maxK) }],
    // The journal dims slightly as it leaves, past the halfway point.
    dim: [
      { offset: 0, filter: "brightness(1)" },
      { offset: 0.5, filter: "brightness(1)" },
      { offset: 1, filter: "brightness(0.91)" },
    ],
    band: [{ transform: band(0) }, { transform: band(maxK) }],
    bandOpacity: [
      { offset: 0, opacity: 0 },
      { offset: 0.03, opacity: 0 },
      { offset: 0.03, opacity: 1 },
      { offset: 0.97, opacity: 1 },
      { offset: 0.97, opacity: 0 },
      { offset: 1, opacity: 0 },
    ],
  } satisfies Record<string, Keyframe[]>;
}
