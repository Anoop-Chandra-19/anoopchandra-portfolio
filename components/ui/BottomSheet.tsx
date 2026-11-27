// A drag-dismissable bottom sheet: the portal, scrim and drag physics on top of
// useModalLifecycle, which already handles focus, scroll lock and Escape.
//
// `open` going false starts the exit; the portal outlives it and unmounts when
// the transition ends. Every dismissal — drag, scrim, ✕, Escape, or the caller
// closing itself — therefore animates out the same way.
"use client";
import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { useModalLifecycle } from "@/hooks/useModalLifecycle";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** Drag past CLOSE_PX, or flick faster than FLICK_V px/ms, and the sheet goes.
 *  The flick is measured over the last FLICK_WINDOW_MS, so a slow drag that
 *  ends in a throw still counts. */
const CLOSE_PX = 70;
const FLICK_V = 0.5;
const FLICK_WINDOW_MS = 100;
/** A pull on the body has to travel this far down before the sheet follows. */
const PULL_SLOP_PX = 4;
/** Matches the mount animation. Until it finishes the animation owns the
 *  transform and the drag can't move the sheet, so the handle is inert. */
const SETTLE_MS = 300;
/** Snap back when a drag falls short of dismissing. */
const SPRING_MS = 200;
/** Slide out on dismiss. */
const EXIT_MS = 260;
/** Backstop if transitionend never arrives — interrupted transition, sheet
 *  already offscreen, backgrounded tab. Without it the portal would stick. */
const EXIT_FALLBACK_MS = EXIT_MS + 90;
/** How far down the drag has to go for the scrim to reach transparent. */
const SCRIM_FADE_PX = 260;

const SHEET_OUT = "translateY(calc(100% + 32px))";
const SHEET_EXIT = `transform ${EXIT_MS}ms cubic-bezier(.32,.72,0,1)`;
const SHEET_SPRING = `transform ${SPRING_MS}ms cubic-bezier(.2,.8,.2,1)`;
const SCRIM_EXIT = `opacity ${EXIT_MS}ms ease-out`;
const SCRIM_SPRING = `opacity ${SPRING_MS}ms ease-out`;

type Drag = { y0: number; samples: { y: number; t: number }[] };

export type BottomSheetProps = {
  open: boolean;
  /** Put on the dialog, so an opener can point `aria-controls` at it. */
  id?: string;
  label: string;
  ariaLabel?: string;
  closeLabel?: string;
  /** The body's type: the sheet sets size and colour, the caller the face. */
  bodyClassName?: string;
  opener?: HTMLElement | null;
  onCloseAction: () => void;
  /** Close when this stops matching. Right for a sheet that is one viewport's
   *  treatment of content with another home; leave unset otherwise. */
  dismissQuery?: string;
  children: ReactNode;
  /** Pinned outside the scroll area. */
  footer?: ReactNode;
};

export default function BottomSheet({
  open,
  id,
  label,
  ariaLabel,
  closeLabel,
  bodyClassName,
  opener,
  onCloseAction,
  dismissQuery,
  children,
  footer,
}: BottomSheetProps) {
  /** Tracks `open`, but lags it by the exit animation. */
  const [visible, setVisible] = useState(open);
  const [settled, setSettled] = useState(false);
  const [closing, setClosing] = useState(false);
  const drag = useRef<Drag | null>(null);
  /** Set when a dismiss started the exit itself, ahead of `closing`. */
  const exitingRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Callers pass inline arrows, and `close` is a dependency of the resize
  // effect, so it has to keep one identity.
  const closeActionRef = useRef(onCloseAction);
  useEffect(() => {
    closeActionRef.current = onCloseAction;
  });

  /** Ask the caller to close. The exit runs when `open` comes back false. */
  const close = useCallback(() => closeActionRef.current(), []);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setVisible(true);
      setClosing(false);
      setSettled(false);
    } else if (shouldReduceMotion) {
      setVisible(false);
    } else {
      // `settled` too: it is what drops the mount animation, whose `both` fill
      // would otherwise outrank the exit transform.
      setClosing(true);
      setSettled(true);
    }
  }

  const finish = useCallback(() => {
    exitingRef.current = false;
    setVisible(false);
    setClosing(false);
  }, []);

  useEffect(() => {
    if (!visible || closing) return;
    const timer = setTimeout(() => setSettled(true), shouldReduceMotion ? 0 : SETTLE_MS);
    return () => clearTimeout(timer);
  }, [visible, closing, shouldReduceMotion]);

  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(finish, EXIT_FALLBACK_MS);
    return () => clearTimeout(timer);
  }, [closing, finish]);

  useEffect(() => {
    if (!open || !dismissQuery) return;
    const mq = window.matchMedia(dismissQuery);
    const onChange = () => {
      if (!mq.matches) close();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [open, close, dismissQuery]);

  // The drag and the start of the exit write the sheet's and scrim's styles
  // directly. Through React state, every finger movement was a re-render, and
  // a dismiss waited for the caller's re-render before the sheet moved; on a
  // slow phone that held the sheet still for ~100ms after the finger lifted.
  const canDrag = settled && !closing;
  const canDragRef = useRef(canDrag);
  const reduceMotionRef = useRef(shouldReduceMotion);
  useEffect(() => {
    canDragRef.current = canDrag;
    reduceMotionRef.current = shouldReduceMotion;
  }, [canDrag, shouldReduceMotion]);

  /** Close from inside the sheet (drag, ✕, scrim, Escape): start the exit
   *  now, from wherever the sheet is, and let the caller's re-render follow
   *  at low priority. Before the entry animation settles its fill owns the
   *  transform, so then the exit is left to `closing` as usual. */
  const dismiss = useCallback(() => {
    const sheet = dialogRef.current;
    const scrim = scrimRef.current;
    if (!sheet || !scrim || !canDragRef.current || reduceMotionRef.current) {
      closeActionRef.current();
      return;
    }
    exitingRef.current = true;
    sheet.style.transition = SHEET_EXIT;
    sheet.style.transform = SHEET_OUT;
    scrim.style.transition = SCRIM_EXIT;
    scrim.style.opacity = "0";
    startTransition(() => closeActionRef.current());
  }, []);

  useModalLifecycle({
    isOpen: visible,
    containerRef: dialogRef,
    initialFocusRef: closeRef,
    onCloseAction: dismiss,
    opener,
  });

  // One drag, fed by the header's pointer events and the body's touch events.
  const place = useCallback((dy: number) => {
    const sheet = dialogRef.current;
    const scrim = scrimRef.current;
    if (!sheet || !scrim) return;
    sheet.style.transition = "none";
    sheet.style.transform = `translateY(${dy}px)`;
    scrim.style.transition = "none";
    scrim.style.opacity = String(Math.max(0, 1 - dy / SCRIM_FADE_PX));
  }, []);
  const springBack = useCallback(() => {
    const sheet = dialogRef.current;
    const scrim = scrimRef.current;
    if (!sheet || !scrim) return;
    const isInstant = reduceMotionRef.current;
    sheet.style.transition = isInstant ? "none" : SHEET_SPRING;
    sheet.style.transform = "translateY(0px)";
    scrim.style.transition = isInstant ? "none" : SCRIM_SPRING;
    scrim.style.opacity = "1";
  }, []);

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
    if (!visible || !body) return;
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
  }, [visible, beginDrag, moveDrag, endDrag, cancelDrag]);

  if (!visible) return null;

  // The header drags with any pointer, mouse included.
  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
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
  };

  return createPortal(
    // Portalled outside the article, so it redeclares the accent tokens.
    <div className="fixed inset-0 z-120 flex flex-col justify-end [--accent:var(--color-coral)] [--accent-ink:var(--color-coral-ink)]">
      <button
        ref={scrimRef}
        type="button"
        // The entry animation comes off once settled, so the drag's inline
        // opacity can take over.
        className={`absolute inset-0 p-0 bg-[color-mix(in_srgb,var(--color-ink)_26%,transparent)] cursor-pointer ${
          settled ? "" : "animate-sheet-fade motion-reduce:animate-none"
        }`}
        onClick={dismiss}
        aria-label={closeLabel ?? `close ${label}`}
        tabIndex={-1}
        style={{
          opacity: closing ? 0 : 1,
          transition: closing ? SCRIM_EXIT : "none",
          animation: shouldReduceMotion ? "none" : undefined,
        }}
      />
      <div
        ref={dialogRef}
        id={id}
        className={`relative flex flex-col max-h-[calc(100dvh_-_env(safe-area-inset-top)_-_16px)] pt-[9px] px-[18px] pb-[26px] bg-paper border-t-[1.4px] border-ink rounded-t-[15px] [box-shadow:0_-7px_24px_color-mix(in_srgb,var(--color-ink)_14%,transparent)] touch-pan-y ${
          settled ? "" : "animate-sheet-up motion-reduce:animate-none"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? label}
        tabIndex={-1}
        onTransitionEnd={(e) => {
          if ((closing || exitingRef.current) && e.propertyName === "transform" && e.target === e.currentTarget) {
            finish();
          }
        }}
        // Once the entry animation has played the inline transform owns the
        // sheet; before that its fill would outrank whatever we set here.
        // The drag writes these same properties directly (place, springBack,
        // dismiss) and leaves them on the values rendered here. The exit is a
        // percentage so it clears the sheet whatever its height.
        style={{
          transform: closing ? SHEET_OUT : settled ? "translateY(0px)" : undefined,
          transition: closing ? SHEET_EXIT : !settled || shouldReduceMotion ? "none" : SHEET_SPRING,
        }}
      >
        <div
          className="touch-none"
          onPointerDown={down}
          onPointerMove={(e) => moveDrag(e.clientY)}
          onPointerUp={(e) => endDrag(e.clientY)}
          onPointerCancel={cancelDrag}
        >
          <span
            className="block w-9 h-[3.5px] mx-auto mb-[13px] rounded-[3px] bg-[color-mix(in_oklab,var(--color-ink)_20%,transparent)] cursor-grab"
            aria-hidden="true"
          />
          <div className="flex items-center justify-between gap-3 mb-[7px] font-mono text-stamp uppercase text-(--accent-ink)">
            <span>{label}</span>
            <button
              ref={closeRef}
              type="button"
              className="flex items-center justify-center size-11 -my-[13px] -mr-4 p-0 bg-transparent font-mono text-[15px] leading-none tracking-normal text-ink-soft active:text-ink cursor-pointer [-webkit-tap-highlight-color:transparent]"
              onClick={dismiss}
              aria-label="close"
            >
              ✕
            </button>
          </div>
        </div>
        <div
          ref={bodyRef}
          className={`min-h-0 overflow-y-auto overscroll-contain touch-pan-y text-small text-ink-soft ${bodyClassName ?? ""}`}
        >
          {children}
        </div>
        {footer}
      </div>
    </div>,
    document.body
  );
}
