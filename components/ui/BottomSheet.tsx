// A drag-dismissable bottom sheet: the portal, scrim and drag physics on top of
// useModalLifecycle, which already handles focus, scroll lock and Escape.
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
const OUT_PX = 420;
const OUT_MS = 170;
const SCRIM_FADE_PX = 260;

type Drag = { y0: number; t0: number };

export type BottomSheetProps = {
  open: boolean;
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
  const [settled, setSettled] = useState(false);
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<Drag | null>(null);
  const outTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lenis = useLenisInstance();
  const shouldReduceMotion = useReducedMotion();

  // Callers pass inline arrows, and `close` is a dependency of both the resize
  // effect and useModalLifecycle, so it has to keep one identity.
  const closeActionRef = useRef(onCloseAction);
  useEffect(() => {
    closeActionRef.current = onCloseAction;
  });

  const close = useCallback(() => {
    if (outTimer.current) clearTimeout(outTimer.current);
    outTimer.current = null;
    drag.current = null;
    setDragging(false);
    closeActionRef.current();
  }, []);

  // Only the portal unmounts on close, so without this a re-opened sheet is
  // still `settled` and skips its entry animation. During render, not in an
  // effect: an effect commits the stale offset first and the sheet flashes at
  // its last dragged position.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setDy(0);
      setSettled(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => setSettled(true), shouldReduceMotion ? 0 : SETTLE_MS);
    return () => clearTimeout(timer);
  }, [open, shouldReduceMotion]);

  useEffect(() => {
    if (!open || !dismissQuery) return;
    const mq = window.matchMedia(dismissQuery);
    const onChange = () => {
      if (!mq.matches) close();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [open, close, dismissQuery]);

  useEffect(
    () => () => {
      if (outTimer.current) clearTimeout(outTimer.current);
    },
    []
  );

  useModalLifecycle({
    isOpen: open,
    containerRef: dialogRef,
    initialFocusRef: closeRef,
    onCloseAction: close,
    lenis,
    opener,
  });

  if (!open) return null;

  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (
      !settled ||
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
    if (d > CLOSE_PX || v > FLICK_V) {
      if (shouldReduceMotion) {
        close();
        return;
      }
      setDy(OUT_PX);
      outTimer.current = setTimeout(close, OUT_MS);
    } else setDy(0);
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
          opacity: Math.max(0, 1 - dy / SCRIM_FADE_PX),
          animation: shouldReduceMotion ? "none" : undefined,
        }}
      />
      <div
        ref={dialogRef}
        className={`${classPrefix}${settled ? " settled" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? label}
        tabIndex={-1}
        // Once the entry animation has played the inline transform owns the
        // sheet; before that its fill would outrank whatever we set here.
        style={{
          transform: settled ? `translateY(${dy}px)` : undefined,
          transition:
            settled && !dragging && !shouldReduceMotion
              ? "transform .2s cubic-bezier(.2,.8,.2,1)"
              : "none",
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
