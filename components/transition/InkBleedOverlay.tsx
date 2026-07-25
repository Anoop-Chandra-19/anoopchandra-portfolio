"use client";
import { useEffect, useRef, type ReactNode } from "react";
import type { InkEffect } from "@/components/transition/InkTransitionProvider";
import {
  INK,
  SPATTERS,
  SPATTER_BIRTHS,
  blobPath,
  easeInOutCubic,
  easeOutCubic,
  easeOutQuart,
  hexA,
  maxRadius,
  peelClip,
  peelClipComplement,
  peelMaxK,
  peelShadowGeom,
  spatterPath,
  spatterScale,
  transitionMs,
} from "@/lib/ink-bleed";

const EMPTY_CLIP = "polygon(0px 0px, 0px 0px, 0px 0px)";

/** Halo texture radius at scale 1 — the div is 2·HALO_R square and gets
    transform-scaled to the current bleed radius (no per-frame repaint). */
const HALO_R = 512;

/**
 * Both effects reveal the REAL destination route — no partial page copies.
 *
 * bleed: the destination is already committed and rendering underneath; this
 * overlay holds an inert copy of the origin (home) on top and cuts the ink
 * blobs through it as growing holes (SVG mask — union of blobs), so the whole
 * destination page is under the animation from the first frame.
 *
 * peel: the live origin page stays underneath; the home copy is revealed on
 * top along the diagonal cut, and the route commits when it covers.
 */
export default function InkBleedOverlay({
  effect,
  cx,
  cy,
  vw,
  vh,
  pageCopy,
  start,
  onCompleteAction,
}: {
  effect: InkEffect;
  cx: number;
  cy: number;
  vw: number;
  vh: number;
  /** inert full-document home copy (see layers.tsx) */
  pageCopy: ReactNode;
  /** bleed holds (origin copy covering, no holes) until the destination has
      rendered underneath; peel starts immediately */
  start: boolean;
  onCompleteAction: () => void;
}) {
  const dropRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const mainHoleRef = useRef<SVGPathElement>(null);
  const spatterRefs = useRef<Array<SVGPathElement | null>>([]);
  const peelRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const onCompleteActionRef = useRef(onCompleteAction);

  useEffect(() => {
    onCompleteActionRef.current = onCompleteAction;
  }, [onCompleteAction]);

  // Block scrolling underneath the overlay for the duration (Lenis is stopped
  // separately, but native wheel/touch would still move the page beneath).
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    window.addEventListener("wheel", prevent, { passive: false });
    window.addEventListener("touchmove", prevent, { passive: false });
    return () => {
      window.removeEventListener("wheel", prevent);
      window.removeEventListener("touchmove", prevent);
    };
  }, []);

  // Single rAF loop writing mask paths/clip-paths/transforms via refs — no
  // per-frame setState.
  useEffect(() => {
    if (!start) return;
    const duration = transitionMs(effect, vw);
    const maxR = maxRadius(cx, cy, vw, vh);
    const scale = spatterScale(vw, vh);
    const maxK = peelMaxK(vw, vh);
    let startTs = 0;
    let raf = 0;

    const frame = (now: number) => {
      const local = Math.min(1, (now - startTs) / duration);

      if (effect === "bleed") {
        // Phase 1 — the falling drop (first ~5%)
        const dropProgress = Math.min(1, local / 0.05);
        if (dropRef.current) {
          dropRef.current.style.visibility = dropProgress < 1 ? "visible" : "hidden";
          dropRef.current.style.transform = `scale(${0.3 + dropProgress})`;
        }
        // Phase 2 — spatter satellites, holes eaten around the drop point
        SPATTERS.forEach((s, i) => {
          const el = spatterRefs.current[i];
          if (!el || local < SPATTER_BIRTHS[i]) return;
          const localS = Math.min(1, (local - SPATTER_BIRTHS[i]) / 0.22);
          const r = s.r * scale * easeOutCubic(localS);
          el.setAttribute("d", spatterPath(cx + s.dx * scale, cy + s.dy * scale, r, s.seed));
        });
        // Phase 3 — main bleed hole + halo rim
        const mainLocal = Math.max(0, (local - 0.04) / 0.96);
        const mainR = maxR * easeOutQuart(mainLocal);
        if (mainHoleRef.current && mainR > 4) {
          mainHoleRef.current.setAttribute("d", blobPath(cx, cy, mainR));
        }
        if (haloRef.current) {
          if (mainR > 4 && local < 1) {
            haloRef.current.style.visibility = "visible";
            haloRef.current.style.transform = `scale(${(mainR + 24) / HALO_R})`;
            haloRef.current.style.opacity =
              mainLocal < 0.9 ? "1" : String(1 - (mainLocal - 0.9) / 0.1);
          } else {
            haloRef.current.style.visibility = "hidden";
          }
        }
      } else {
        // Corner peel — destination revealed in the half-plane x + y ≤ k
        const eased = easeInOutCubic(local);
        const k = maxK * eased;
        if (peelRef.current) {
          peelRef.current.style.visibility = "visible";
          peelRef.current.style.clipPath = local >= 1 ? "none" : peelClipComplement(k, vw, vh);
        }
        const geom = eased > 0.03 && eased < 0.97 ? peelShadowGeom(k, vw, vh) : null;
        if (shadowRef.current) {
          if (geom) {
            shadowRef.current.style.visibility = "visible";
            shadowRef.current.style.left = `${geom.left}px`;
            shadowRef.current.style.top = `${geom.top}px`;
            shadowRef.current.style.width = `${geom.width}px`;
            shadowRef.current.style.height = `${geom.height}px`;
          } else {
            shadowRef.current.style.visibility = "hidden";
          }
        }
        // The journal's brightness dim past 50%, approximated by a multiply veil
        if (dimRef.current) {
          if (eased > 0.5 && local < 1) {
            dimRef.current.style.visibility = "visible";
            dimRef.current.style.clipPath = peelClip(k, vw, vh);
            dimRef.current.style.opacity = String((eased - 0.5) * 0.18);
          } else {
            dimRef.current.style.visibility = "hidden";
          }
        }
      }

      if (local >= 1) {
        onCompleteActionRef.current();
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    // Give the browser two frames to style/layout/rasterize the freshly
    // rendered page (destination beneath for bleed, home copy for peel) before
    // the clock starts — otherwise that paint eats the drop/spatter phase.
    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame((now) => {
        startTs = now;
        frame(now);
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [start, effect, cx, cy, vw, vh]);

  return (
    <div className="ink-overlay">
      {effect === "bleed" ? (
        <>
          <svg width="0" height="0" aria-hidden="true">
            <defs>
              <mask id="ink-hole-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={vw} height={vh}>
                {/* white keeps the origin copy; black paths are the ink holes */}
                <rect x="0" y="0" width={vw} height={vh} fill="#fff" />
                <path ref={mainHoleRef} fill="#000" />
                {SPATTERS.map((_, i) => (
                  <path
                    key={i}
                    ref={(el) => {
                      spatterRefs.current[i] = el;
                    }}
                    fill="#000"
                  />
                ))}
              </mask>
            </defs>
          </svg>
          <div className="ink-layer ink-origin">
            {pageCopy}
            {/* inside the masked layer → the rim only shows on the un-inked paper */}
            <div
              ref={haloRef}
              className="ink-halo"
              style={{
                left: cx - HALO_R,
                top: cy - HALO_R,
                width: HALO_R * 2,
                height: HALO_R * 2,
                background: `radial-gradient(circle, ${hexA(INK, 0.5)} ${HALO_R - 54}px, ${hexA(
                  INK,
                  0
                )} ${HALO_R}px)`,
              }}
            />
          </div>
          <div
            ref={dropRef}
            className="ink-drop"
            style={{
              left: cx - 14,
              top: cy - 14,
              background: INK,
              boxShadow: `0 6px 14px ${hexA(INK, 0.4)}`,
            }}
          />
        </>
      ) : (
        <>
          <div ref={peelRef} className="ink-layer" style={{ clipPath: EMPTY_CLIP }}>
            {pageCopy}
            {/* inherits the layer's clip → the band only shows on the revealed side of the cut */}
            <div ref={shadowRef} className="ink-peel-shadow" />
          </div>
          <div ref={dimRef} className="ink-dim" />
        </>
      )}
    </div>
  );
}
