import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useLenisInstance } from "@/components/LenisProvider";

/** Pinch ceiling. The plates are ~1700px wide against a ~360px phone stage, so
 *  6× is roughly where the source pixels run out. */
const MAX_SCALE = 6;
const DOUBLE_TAP_SCALE = 2.6;
const DOUBLE_TAP_MS = 300;
/** Movement under this reads as a tap, not a drag. */
const TAP_SLOP = 6;

type Zoom = { s: number; x: number; y: number };
const RESET: Zoom = { s: 1, x: 0, y: 0 };

type Gesture =
  | { mode: "pan"; px: number; py: number; x0: number; y0: number }
  | { mode: "pinch"; d0: number; s0: number; x0: number; y0: number };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export default function Lightbox({
  src,
  alt,
  caption,
  width,
  height,
  onClose,
}: {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const lenis = useLenisInstance();

  const [z, setZ] = useState<Zoom>(RESET);
  // Live pointers, keyed by id — two of them means a pinch.
  const pts = useRef(new Map<number, { x: number; y: number }>());
  const gest = useRef<Gesture | null>(null);
  const [gesturing, setGesturing] = useState(false);
  const lastTap = useRef(0);
  const moved = useRef(false);
  const downOnPlate = useRef(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // Lenis drives the scroll, so `overflow: hidden` on the body would not hold it
    lenis?.stop();
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [onClose, lenis]);

  /** Keep the plate's translation inside the scaled image's own bounds, so it
   *  can never be dragged off the stage and stranded. */
  const settle = (n: Zoom): Zoom => {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r) return n;
    const mx = Math.max(0, (r.width * n.s - r.width) / 2);
    const my = Math.max(0, (r.height * n.s - r.height) / 2);
    return { s: n.s, x: clamp(n.x, -mx, mx), y: clamp(n.y, -my, my) };
  };

  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    // Throws if the pointer is already gone by the time the handler runs — the
    // gesture still works off the id map, so losing capture is not fatal.
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const arr = [...pts.current.values()];
    if (arr.length === 2) {
      const d = Math.hypot(arr[0].x - arr[1].x, arr[0].y - arr[1].y);
      gest.current = { mode: "pinch", d0: d, s0: z.s, x0: z.x, y0: z.y };
    } else if (arr.length === 1) {
      // Resolved here, before pointer capture retargets everything at the stage.
      downOnPlate.current = Boolean((e.target as Element).closest("img"));
      moved.current = false;
      gest.current = { mode: "pan", px: e.clientX, py: e.clientY, x0: z.x, y0: z.y };
    }
    setGesturing(true);
  };

  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pts.current.has(e.pointerId)) return;
    pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gest.current;
    if (!g) return;
    const arr = [...pts.current.values()];
    if (g.mode === "pinch" && arr.length >= 2) {
      moved.current = true;
      const d = Math.hypot(arr[0].x - arr[1].x, arr[0].y - arr[1].y);
      const s = clamp((g.s0 * d) / Math.max(1, g.d0), 1, MAX_SCALE);
      setZ(settle({ s, x: (g.x0 * s) / g.s0, y: (g.y0 * s) / g.s0 }));
    } else if (g.mode === "pan") {
      const dx = e.clientX - g.px;
      const dy = e.clientY - g.py;
      if (Math.hypot(dx, dy) > TAP_SLOP) moved.current = true;
      if (z.s > 1) setZ(settle({ s: z.s, x: g.x0 + dx, y: g.y0 + dy }));
    }
  };

  const up = (e: ReactPointerEvent<HTMLDivElement>) => {
    pts.current.delete(e.pointerId);
    if (pts.current.size > 0) {
      // Lifting one finger out of a pinch hands the rest of the gesture to a pan.
      const p = [...pts.current.values()][0];
      gest.current = { mode: "pan", px: p.x, py: p.y, x0: z.x, y0: z.y };
      return;
    }
    gest.current = null;
    setGesturing(false);
    if (moved.current) return;

    // A tap beside the plate dismisses, which is what the scrim did before the
    // stage existed.
    if (!downOnPlate.current) {
      onClose();
      return;
    }
    // Double-tap zoom is touch-only: on a mouse there is no pinch to undo it
    // with, and a stray double-click on the plate should do nothing.
    if (e.pointerType !== "touch") return;
    const now = performance.now();
    const isDouble = now - lastTap.current < DOUBLE_TAP_MS;
    lastTap.current = now;
    if (isDouble) setZ(z.s > 1.05 ? RESET : { s: DOUBLE_TAP_SCALE, x: 0, y: 0 });
  };

  const zoomed = z.s > 1.05;

  // Portalled so the band's `overflow: hidden` can never clip the overlay
  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={caption}>
      <div
        ref={stageRef}
        className={`lightbox-stage${gesturing ? " is-gesturing" : ""}`}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="100vw"
          draggable={false}
          style={{ transform: `translate(${z.x}px, ${z.y}px) scale(${z.s})` }}
        />
      </div>
      <div className="lightbox-bar mono">
        <span>{caption}</span>
        <span className="lightbox-hint">
          {zoomed ? `${z.s.toFixed(1)}× · drag to pan` : "pinch or double-tap to zoom"}
        </span>
        <div className="lightbox-btns">
          {zoomed && (
            <button type="button" onClick={() => setZ(RESET)}>
              reset
            </button>
          )}
          <button type="button" ref={closeRef} onClick={onClose}>
            close · esc
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
