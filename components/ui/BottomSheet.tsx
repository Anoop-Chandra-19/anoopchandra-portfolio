// A drag-dismissable bottom sheet: the portal, scrim and drag physics on top of
// useModalLifecycle, which already handles focus, scroll lock and Escape.
//
// `open` going false starts the exit; the portal outlives it and unmounts when
// the transition ends. Every dismissal — drag, scrim, ✕, Escape, or the caller
// closing itself — therefore animates out the same way.
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useModalLifecycle } from "@/hooks/useModalLifecycle";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EXIT_MS, SCRIM_EXIT, SHEET_EXIT, SHEET_OUT, SHEET_SPRING, useSheetDrag } from "./useSheetDrag";

/** Matches the mount animation. Until it finishes the animation owns the
 *  transform and the drag can't move the sheet, so the handle is inert. */
const SETTLE_MS = 300;
/** Backstop if transitionend never arrives — interrupted transition, sheet
 *  already offscreen, backgrounded tab. Without it the portal would stick. */
const EXIT_FALLBACK_MS = EXIT_MS + 90;

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

  const { dismiss, exitingRef, headerHandlers } = useSheetDrag({
    sheetRef: dialogRef,
    scrimRef,
    bodyRef,
    closeRef,
    isVisible: visible,
    canDrag: settled && !closing,
    shouldReduceMotion,
    requestClose: close,
  });

  useModalLifecycle({
    isOpen: visible,
    containerRef: dialogRef,
    initialFocusRef: closeRef,
    onCloseAction: dismiss,
    opener,
  });

  if (!visible) return null;

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
        // The drag (useSheetDrag) writes these same properties directly and
        // leaves them on the values rendered here. The exit is a
        // percentage so it clears the sheet whatever its height.
        style={{
          transform: closing ? SHEET_OUT : settled ? "translateY(0px)" : undefined,
          transition: closing ? SHEET_EXIT : !settled || shouldReduceMotion ? "none" : SHEET_SPRING,
        }}
      >
        <div className="touch-none" {...headerHandlers}>
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
