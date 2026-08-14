// A drag-dismissable bottom sheet: the portal, scrim and drag physics on top of
// useModalLifecycle, which already handles focus, scroll lock and Escape.
//
// `open` going false starts the exit; the portal outlives it and unmounts when
// the transition ends. Every dismissal — drag, scrim, ✕, Escape, or the caller
// closing itself — therefore animates out the same way.
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLenisInstance } from "@/components/LenisProvider";
import { useModalLifecycle } from "@/hooks/useModalLifecycle";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** Drag past CLOSE_PX, or flick faster than FLICK_V px/ms, and the sheet goes. */
const CLOSE_PX = 70;
const FLICK_V = 0.5;
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

type Drag = { y0: number; t0: number };

export type BottomSheetProps = {
  open: boolean;
  /** Put on the dialog, so an opener can point `aria-controls` at it. */
  id?: string;
  label: string;
  ariaLabel?: string;
  closeLabel?: string;
  /** Class stem for every part. The sheet ships no CSS, so the caller's
   *  stylesheet owns the look and two sheets can share this without a skin. */
  classPrefix: string;
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
  classPrefix,
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
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<Drag | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lenis = useLenisInstance();
  const shouldReduceMotion = useReducedMotion();

  // Callers pass inline arrows, and `close` is a dependency of the resize
  // effect, so it has to keep one identity.
  const closeActionRef = useRef(onCloseAction);
  useEffect(() => {
    closeActionRef.current = onCloseAction;
  });

  /** Ask the caller to close. The exit runs when `open` comes back false. */
  const close = useCallback(() => closeActionRef.current(), []);

  // Drag state outlives a single opening, so it is reset on the way in rather
  // than on the way out — the sheet is still on screen during the exit and
  // needs to keep the offset it is sliding from.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    setDragging(false);
    if (open) {
      setVisible(true);
      setClosing(false);
      setSettled(false);
      setDy(0);
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

  useModalLifecycle({
    isOpen: visible,
    containerRef: dialogRef,
    initialFocusRef: closeRef,
    onCloseAction: close,
    lenis,
    opener,
  });

  if (!visible) return null;

  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (
      !settled ||
      closing ||
      !e.isPrimary ||
      (e.pointerType === "mouse" && e.button !== 0) ||
      (e.target as Element).closest(`.${classPrefix}-x`)
    )
      return;
    drag.current = { y0: e.clientY, t0: performance.now() };
    setDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current) setDy(Math.max(0, e.clientY - drag.current.y0));
  };
  const up = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = drag.current;
    if (!g) return;
    drag.current = null;
    setDragging(false);
    const d = Math.max(0, e.clientY - g.y0);
    const v = d / Math.max(1, performance.now() - g.t0);
    // The exit picks up from the offset the drag left behind, so releasing past
    // the threshold reads as one continuous throw.
    if (d > CLOSE_PX || v > FLICK_V) close();
    else setDy(0);
  };
  const cancel = () => {
    drag.current = null;
    setDragging(false);
    setDy(0);
  };

  return createPortal(
    <div className={`${classPrefix}-wrap`}>
      <button
        type="button"
        className={`${classPrefix}-scrim${settled ? " settled" : ""}`}
        onClick={close}
        aria-label={closeLabel ?? `close ${label}`}
        tabIndex={-1}
        style={{
          opacity: closing ? 0 : Math.max(0, 1 - dy / SCRIM_FADE_PX),
          // Untransitioned during a drag, where it tracks the finger directly.
          transition: closing ? `opacity ${EXIT_MS}ms ease-out` : "none",
          animation: shouldReduceMotion ? "none" : undefined,
        }}
      />
      <div
        ref={dialogRef}
        id={id}
        className={`${classPrefix}${settled ? " settled" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? label}
        tabIndex={-1}
        onTransitionEnd={(e) => {
          if (closing && e.propertyName === "transform" && e.target === e.currentTarget) finish();
        }}
        // Once the entry animation has played the inline transform owns the
        // sheet; before that its fill would outrank whatever we set here.
        // The exit is a percentage so it clears the sheet whatever its height.
        style={{
          transform: closing
            ? "translateY(calc(100% + 32px))"
            : settled
              ? `translateY(${dy}px)`
              : undefined,
          transition: closing
            ? `transform ${EXIT_MS}ms cubic-bezier(.32,.72,0,1)`
            : !settled || dragging || shouldReduceMotion
              ? "none"
              : `transform ${SPRING_MS}ms cubic-bezier(.2,.8,.2,1)`,
        }}
      >
        <div
          className={`${classPrefix}-drag`}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={cancel}
        >
          <span className={`${classPrefix}-grab`} aria-hidden="true" />
          <div className={`${classPrefix}-head`}>
            <span>{label}</span>
            <button
              ref={closeRef}
              type="button"
              className={`${classPrefix}-x`}
              onClick={close}
              aria-label="close"
            >
              ✕
            </button>
          </div>
        </div>
        <div className={`${classPrefix}-body`} data-lenis-prevent>
          {children}
        </div>
        {footer}
      </div>
    </div>,
    document.body
  );
}
