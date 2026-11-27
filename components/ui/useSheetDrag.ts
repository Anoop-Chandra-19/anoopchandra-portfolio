import { startTransition, useCallback, useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";

/** Drag past CLOSE_PX, or flick faster than FLICK_V px/ms, and the sheet goes.
 *  The flick is measured over the last FLICK_WINDOW_MS, so a slow drag that
 *  ends in a throw still counts. */
const CLOSE_PX = 70;
const FLICK_V = 0.5;
const FLICK_WINDOW_MS = 100;
/** A pull on the body has to travel this far down before the sheet follows. */
const PULL_SLOP_PX = 4;
/** How far down the drag has to go for the scrim to reach transparent. */
const SCRIM_FADE_PX = 260;
/** Snap back when a drag falls short of dismissing. */
const SPRING_MS = 200;
/** Slide out on dismiss. */
export const EXIT_MS = 260;

// Shared with BottomSheet's render, which sets the same properties.
export const SHEET_OUT = "translateY(calc(100% + 32px))";
export const SHEET_EXIT = `transform ${EXIT_MS}ms cubic-bezier(.32,.72,0,1)`;
export const SHEET_SPRING = `transform ${SPRING_MS}ms cubic-bezier(.2,.8,.2,1)`;
export const SCRIM_EXIT = `opacity ${EXIT_MS}ms ease-out`;
const SCRIM_SPRING = `opacity ${SPRING_MS}ms ease-out`;

type Drag = { y0: number; samples: { y: number; t: number }[] };

type SheetDragOptions = {
  sheetRef: RefObject<HTMLDivElement | null>;
  scrimRef: RefObject<HTMLButtonElement | null>;
  /** The scrolling body, where a pull from the top drags the sheet. */
  bodyRef: RefObject<HTMLDivElement | null>;
  /** Presses on it never start a drag. */
  closeRef: RefObject<HTMLButtonElement | null>;
  isVisible: boolean;
  /** False until the entry animation settles, and while closing. */
  canDrag: boolean;
  shouldReduceMotion: boolean;
  /** Ask the caller to close. */
  requestClose: () => void;
};

/**
 * Dragging a bottom sheet down to dismiss it: from the header with any
 * pointer, or by pulling the body down from the top of its scroll.
 *
 * The drag and the start of the exit write the sheet's and scrim's styles
 * directly. Through React state, every finger movement was a re-render, and a
 * dismiss waited for the caller's re-render before the sheet moved; on a slow
 * phone that held the sheet still for ~100ms after the finger lifted. The
 * styles it leaves match what BottomSheet renders.
 */
export function useSheetDrag({
  sheetRef,
  scrimRef,
  bodyRef,
  closeRef,
  isVisible,
  canDrag,
  shouldReduceMotion,
  requestClose,
}: SheetDragOptions) {
  const drag = useRef<Drag | null>(null);
  /** Set when a dismiss started the exit itself, ahead of the caller closing. */
  const exitingRef = useRef(false);
  const canDragRef = useRef(canDrag);
  const reduceMotionRef = useRef(shouldReduceMotion);
  useEffect(() => {
    canDragRef.current = canDrag;
    reduceMotionRef.current = shouldReduceMotion;
  }, [canDrag, shouldReduceMotion]);
  // A new opening starts with no exit in flight.
  useEffect(() => {
    if (isVisible) exitingRef.current = false;
  }, [isVisible]);

  /** Close from inside the sheet (drag, ✕, scrim, Escape): start the exit
   *  now, from wherever the sheet is, and let the caller's re-render follow
   *  at low priority. Before the entry animation settles its fill owns the
   *  transform, so then the exit is left to the caller closing as usual. */
  const dismiss = useCallback(() => {
    const sheet = sheetRef.current;
    const scrim = scrimRef.current;
    if (!sheet || !scrim || !canDragRef.current || reduceMotionRef.current) {
      requestClose();
      return;
    }
    exitingRef.current = true;
    sheet.style.transition = SHEET_EXIT;
    sheet.style.transform = SHEET_OUT;
    scrim.style.transition = SCRIM_EXIT;
    scrim.style.opacity = "0";
    startTransition(requestClose);
  }, [sheetRef, scrimRef, requestClose]);

  const place = useCallback(
    (dy: number) => {
      const sheet = sheetRef.current;
      const scrim = scrimRef.current;
      if (!sheet || !scrim) return;
      sheet.style.transition = "none";
      sheet.style.transform = `translateY(${dy}px)`;
      scrim.style.transition = "none";
      scrim.style.opacity = String(Math.max(0, 1 - dy / SCRIM_FADE_PX));
    },
    [sheetRef, scrimRef]
  );
  const springBack = useCallback(() => {
    const sheet = sheetRef.current;
    const scrim = scrimRef.current;
    if (!sheet || !scrim) return;
    const isInstant = reduceMotionRef.current;
    sheet.style.transition = isInstant ? "none" : SHEET_SPRING;
    sheet.style.transform = "translateY(0px)";
    scrim.style.transition = isInstant ? "none" : SCRIM_SPRING;
    scrim.style.opacity = "1";
  }, [sheetRef, scrimRef]);

  const beginDrag = useCallback((y: number) => {
    drag.current = { y0: y, samples: [{ y, t: performance.now() }] };
  }, []);
  const moveDrag = useCallback(
    (y: number) => {
      const g = drag.current;
      if (!g) return;
      const t = performance.now();
      g.samples.push({ y, t });
      while (g.samples.length > 2 && t - g.samples[0].t > FLICK_WINDOW_MS) g.samples.shift();
      place(Math.max(0, y - g.y0));
    },
    [place]
  );
  const endDrag = useCallback(
    (y: number) => {
      const g = drag.current;
      if (!g) return;
      drag.current = null;
      const d = Math.max(0, y - g.y0);
      const recent = g.samples[0];
      const v = (y - recent.y) / Math.max(1, performance.now() - recent.t);
      // The exit picks up from the offset the drag left behind, so releasing
      // past the threshold reads as one continuous throw.
      if (d > CLOSE_PX || v > FLICK_V) dismiss();
      else springBack();
    },
    [dismiss, springBack]
  );
  const cancelDrag = useCallback(() => {
    drag.current = null;
    springBack();
  }, [springBack]);

  // Pull to dismiss: a downward swipe on the body, when it is scrolled to the
  // top, moves the sheet instead. Touch events, not pointer events: only a
  // non-passive touchmove can stop the browser scrolling, on iOS as well.
  useEffect(() => {
    const body = bodyRef.current;
    if (!isVisible || !body) return;
    let y0 = 0;
    let mode: "pending" | "scroll" | "drag" = "scroll";
    const onStart = (e: TouchEvent) => {
      y0 = e.touches[0].clientY;
      mode = e.touches.length === 1 && canDragRef.current && body.scrollTop <= 0 ? "pending" : "scroll";
    };
    const onMove = (e: TouchEvent) => {
      if (mode === "scroll") return;
      const y = e.touches[0].clientY;
      if (mode === "pending") {
        // Upward: the swipe scrolls the content as usual.
        if (y < y0) {
          mode = "scroll";
          return;
        }
        if (y - y0 > PULL_SLOP_PX) {
          mode = "drag";
          beginDrag(y0);
        }
      }
      if (e.cancelable) e.preventDefault();
      if (mode === "drag") moveDrag(y);
    };
    const onEnd = (e: TouchEvent) => {
      if (mode === "drag") endDrag(e.changedTouches[0].clientY);
      mode = "scroll";
    };
    const onCancel = () => {
      if (mode === "drag") cancelDrag();
      mode = "scroll";
    };
    body.addEventListener("touchstart", onStart, { passive: true });
    body.addEventListener("touchmove", onMove, { passive: false });
    body.addEventListener("touchend", onEnd, { passive: true });
    body.addEventListener("touchcancel", onCancel, { passive: true });
    return () => {
      body.removeEventListener("touchstart", onStart);
      body.removeEventListener("touchmove", onMove);
      body.removeEventListener("touchend", onEnd);
      body.removeEventListener("touchcancel", onCancel);
    };
  }, [bodyRef, isVisible, beginDrag, moveDrag, endDrag, cancelDrag]);

  /** For the header: drags with any pointer, mouse included. */
  const headerHandlers = {
    onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => {
      if (
        !canDrag ||
        !e.isPrimary ||
        (e.pointerType === "mouse" && e.button !== 0) ||
        closeRef.current?.contains(e.target as Node)
      )
        return;
      beginDrag(e.clientY);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    },
    onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => moveDrag(e.clientY),
    onPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => endDrag(e.clientY),
    onPointerCancel: cancelDrag,
  };

  return { dismiss, exitingRef, headerHandlers };
}
