// The phone's stand-in for the desktop right margin. remark-gfm points every
// [^N] ref at the footnote list past the end of the entry; following that link
// costs the reader their place, so below the phone breakpoint the tap lifts that
// same list item into a bottom sheet and leaves the scroll position alone. Above
// it the ref stays an ordinary anchor into the list.
//
// The body is cloned out of the rendered list rather than passed in as data:
// footnotes are MDX and can carry emphasis, code and links, and cloning keeps
// all of it without a second render path for the same content.
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { useLenisInstance } from "@/components/LenisProvider";

/** Where the design's phone treatment starts — same breakpoint as journal.css. */
const PHONE = "(max-width: 640px)";
/** The grab handle promises swipe-to-dismiss, so it has to work: drag past this
 *  far, or flick faster than FLICK_V px/ms, and the sheet goes. Less springs back. */
const CLOSE_PX = 70;
const FLICK_V = 0.5;
/** Matches the mount animation. Until it finishes the animation owns the
 *  transform and the drag can't move the sheet, so the handle is inert. */
const SETTLE_MS = 300;
/** Throw distance and duration on release, before the sheet unmounts. */
const OUT_PX = 420;
const OUT_MS = 170;
/** How far down the drag has to go for the scrim to reach transparent. */
const SCRIM_FADE_PX = 260;

type Open = { id: string; label: string; ref: Element };
type Drag = { y0: number; t0: number };

export default function FootnoteSheet() {
  const [open, setOpen] = useState<Open | null>(null);
  const [settled, setSettled] = useState(false);
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<Drag | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const lenis = useLenisInstance();

  const close = useCallback(() => setOpen(null), []);

  // Delegated, because the refs are server-rendered MDX output — there is no
  // React element for them to carry an onClick.
  useEffect(() => {
    const mq = window.matchMedia(PHONE);
    const onClick = (e: MouseEvent) => {
      if (!mq.matches || e.metaKey || e.ctrlKey || e.shiftKey) return;
      // The pill's tap target is a ::after on the <sup>, not on the anchor, so
      // a thumb landing in the padding resolves through the sup.
      const ref = (e.target as Element | null)?.closest?.(".je-fnref");
      const a = ref?.querySelector<HTMLAnchorElement>("a[data-footnote-ref]");
      const id = a?.getAttribute("href")?.slice(1);
      if (!ref || !a || !id || !document.getElementById(id)) return;
      e.preventDefault();
      setDy(0);
      setSettled(false);
      setOpen({ id, label: (a.textContent ?? "").trim(), ref });
    };
    // Rotating to landscape or resizing past the breakpoint hands footnotes back
    // to the list, so the sheet must not be left hanging over it.
    const onChange = () => {
      if (!mq.matches) close();
    };
    document.addEventListener("click", onClick);
    mq.addEventListener("change", onChange);
    return () => {
      document.removeEventListener("click", onClick);
      mq.removeEventListener("change", onChange);
    };
  }, [close]);

  // Fill the sheet from the list item, and mark the ref it belongs to.
  useEffect(() => {
    if (!open) return;
    const el = bodyRef.current;
    const src = document.getElementById(open.id);
    if (el && src) {
      const clone = src.cloneNode(true) as HTMLElement;
      // The ↩ backref exists to walk you back up the page; in the sheet the
      // journey never happened.
      clone.querySelectorAll("[data-footnote-backref]").forEach((a) => a.remove());
      const num = document.createElement("span");
      num.className = "n";
      num.textContent = `${open.label.padStart(2, "0")}.`;
      // The number belongs to the first line of the note, not a line of its own.
      (clone.firstElementChild ?? clone).prepend(num);
      el.replaceChildren(...clone.childNodes);
    }
    open.ref.classList.add("is-on");
    return () => open.ref.classList.remove("is-on");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setSettled(true), SETTLE_MS);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    // Lenis drives the scroll, so the fixed scrim alone would not hold it.
    lenis?.stop();
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [open, close, lenis]);

  if (!open) return null;

  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!settled || (e.target as Element).closest(".je-fnsheet-x")) return;
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
      setDy(OUT_PX);
      setTimeout(close, OUT_MS);
    } else setDy(0);
  };

  return createPortal(
    <div className="je-fnsheet-wrap">
      <button
        type="button"
        className={`je-fnsheet-scrim${settled ? " settled" : ""}`}
        onClick={close}
        aria-label="close footnote"
        style={{ opacity: Math.max(0, 1 - dy / SCRIM_FADE_PX) }}
      />
      <div
        className={`je-fnsheet${settled ? " settled" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={`footnote ${open.label}`}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        // Once the entry animation has played the inline transform owns the
        // sheet; before that its fill would outrank whatever we set here.
        style={
          settled
            ? {
                transform: `translateY(${dy}px)`,
                transition: dragging ? "none" : "transform .2s cubic-bezier(.2,.8,.2,1)",
              }
            : undefined
        }
      >
        <span className="je-fnsheet-grab" aria-hidden="true" />
        <div className="je-fnsheet-head">
          <span>footnote</span>
          <button type="button" className="je-fnsheet-x" onClick={close} aria-label="close">
            ✕
          </button>
        </div>
        <div className="je-fnsheet-body" ref={bodyRef} />
      </div>
    </div>,
    document.body
  );
}
