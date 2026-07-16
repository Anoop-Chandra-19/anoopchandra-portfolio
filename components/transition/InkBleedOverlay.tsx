"use client";
import { useEffect, useRef } from "react";
import type { JournalEntryMeta } from "@/lib/journal-meta";
import JournalIndex from "@/components/journal/JournalIndex";
import HomeContent from "@/components/HomeContent";
import type { InkEffect } from "@/components/transition/InkTransitionProvider";
import {
  BACK_MS,
  FWD_MS,
  INK,
  SPATTERS,
  SPATTER_BIRTHS,
  blobClip,
  easeInOutCubic,
  easeOutCubic,
  easeOutQuart,
  hexA,
  maxRadius,
  peelClip,
  peelClipComplement,
  peelMaxK,
  peelShadowGeom,
  spatterClip,
  spatterScale,
} from "@/lib/ink-bleed";

const EMPTY_CLIP = "polygon(0px 0px, 0px 0px, 0px 0px)";

/** Non-interactive copy of the journal index, on its own paper background */
function JournalLayer({ entries }: { entries: JournalEntryMeta[] }) {
  return (
    <div className="ink-layer-paper" aria-hidden="true">
      <JournalIndex entries={entries} inert />
    </div>
  );
}

export default function InkBleedOverlay({
  effect,
  cx,
  cy,
  vw,
  vh,
  entries,
  onComplete,
}: {
  effect: InkEffect;
  cx: number;
  cy: number;
  vw: number;
  vh: number;
  entries: JournalEntryMeta[];
  onComplete: () => void;
}) {
  const dropRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const spatterRefs = useRef<Array<HTMLDivElement | null>>([]);
  const homeRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Block scrolling underneath the overlay for the duration (Lenis is stopped
  // separately, but native wheel/touch would still move the origin page).
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    window.addEventListener("wheel", prevent, { passive: false });
    window.addEventListener("touchmove", prevent, { passive: false });
    return () => {
      window.removeEventListener("wheel", prevent);
      window.removeEventListener("touchmove", prevent);
    };
  }, []);

  // Single rAF loop writing clip-paths/gradients via refs — no per-frame setState.
  useEffect(() => {
    const start = performance.now();
    const duration = effect === "bleed" ? FWD_MS : BACK_MS;
    const maxR = maxRadius(cx, cy, vw, vh);
    const scale = spatterScale(vw, vh);
    const maxK = peelMaxK(vw, vh);
    let raf = 0;

    const frame = (now: number) => {
      const local = Math.min(1, (now - start) / duration);

      if (effect === "bleed") {
        // Phase 1 — the falling drop (first ~5%)
        const dropProgress = Math.min(1, local / 0.05);
        if (dropRef.current) {
          dropRef.current.style.visibility = dropProgress < 1 ? "visible" : "hidden";
          dropRef.current.style.transform = `scale(${0.3 + dropProgress})`;
        }
        // Phase 2 — spatter satellites
        SPATTERS.forEach((s, i) => {
          const el = spatterRefs.current[i];
          if (!el || local < SPATTER_BIRTHS[i]) return;
          const localS = Math.min(1, (local - SPATTER_BIRTHS[i]) / 0.22);
          const r = s.r * scale * easeOutCubic(localS);
          el.style.visibility = "visible";
          el.style.clipPath = spatterClip(cx + s.dx * scale, cy + s.dy * scale, r, s.seed);
        });
        // Phase 3 — main bleed + halo rim
        const mainLocal = Math.max(0, (local - 0.04) / 0.96);
        const mainR = maxR * easeOutQuart(mainLocal);
        if (mainRef.current && mainR > 4) {
          mainRef.current.style.visibility = "visible";
          mainRef.current.style.clipPath = blobClip(cx, cy, mainR);
        }
        if (haloRef.current) {
          if (mainR > 4 && local < 1) {
            haloRef.current.style.visibility = "visible";
            haloRef.current.style.background = `radial-gradient(circle at ${cx}px ${cy}px, ${hexA(
              INK,
              0.5
            )} ${Math.max(0, mainR - 30)}px, ${hexA(INK, 0)} ${mainR + 24}px)`;
            haloRef.current.style.opacity =
              mainLocal < 0.9 ? "1" : String(1 - (mainLocal - 0.9) / 0.1);
          } else {
            haloRef.current.style.visibility = "hidden";
          }
        }
        if (local >= 1 && mainRef.current) {
          mainRef.current.style.clipPath = "none";
        }
      } else {
        // Corner peel — destination revealed in the half-plane x + y ≤ k
        const eased = easeInOutCubic(local);
        const k = maxK * eased;
        if (homeRef.current) {
          homeRef.current.style.visibility = "visible";
          homeRef.current.style.clipPath = local >= 1 ? "none" : peelClipComplement(k, vw, vh);
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
        onCompleteRef.current();
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [effect, cx, cy, vw, vh]);

  const notes = entries.filter((e) => e.kind === "note");

  return (
    <div className="ink-overlay">
      {effect === "bleed" ? (
        <>
          {SPATTERS.map((s, i) => (
            <div
              key={i}
              ref={(el) => {
                spatterRefs.current[i] = el;
              }}
              className="ink-layer"
              style={{ clipPath: EMPTY_CLIP }}
            >
              <JournalLayer entries={entries} />
            </div>
          ))}
          <div ref={haloRef} className="ink-halo" />
          <div ref={mainRef} className="ink-layer" style={{ clipPath: EMPTY_CLIP }}>
            <JournalLayer entries={entries} />
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
          <div ref={homeRef} className="ink-layer" style={{ clipPath: EMPTY_CLIP }}>
            <div className="ink-layer-paper ink-layer-home" aria-hidden="true">
              <div className="page" inert>
                <HomeContent journalEntries={notes} />
              </div>
            </div>
            {/* inherits the layer's clip → the band only shows on the revealed side of the cut */}
            <div ref={shadowRef} className="ink-peel-shadow" />
          </div>
          <div ref={dimRef} className="ink-dim" />
        </>
      )}
    </div>
  );
}
