"use client";
import { useEffect, useRef, useState } from "react";
import { useLenisInstance } from "@/components/LenisProvider";
import { NAV_ITEMS, useActiveSection, useSectionJump } from "@/hooks/useActiveSection";

/** Mobile chrome (≤900px): a floating "index" chip that opens a full-screen
    notebook index. Replaces the old bottom dock — the dock crowded seven
    labels into a scroller nobody scrolled, and ate a strip of every page. */
export default function MobileIndexNav({
  frozenAt,
}: {
  /** Render as a static snapshot inside a transition page copy: the chip only,
      no scroll tracking and no way to open the overlay. */
  frozenAt?: number;
}) {
  const frozen = frozenAt !== undefined;
  const active = useActiveSection(frozenAt);
  const jumpTo = useSectionJump();
  const lenis = useLenisInstance();
  const [open, setOpen] = useState(false);
  // A bleed copy mounts while the live chip is still in the DOM — inherit its
  // state, or the copy pops a chip back in that the user had just scrolled
  // away. A peel copy has no live chip to read (we're on an article) and lands
  // home at the top, where the chip is always out.
  const [tucked, setTucked] = useState(() => {
    if (!frozen) return false;
    const live = document.querySelector(".m-nav-tab");
    return live ? live.classList.contains("tucked") : false;
  });
  const chipRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // The chip is fixed, so anything scrolling past the top-right corner runs
  // under it — section headers put their meta line exactly there. Tuck it away
  // while reading downward; a flick back up brings it straight back.
  useEffect(() => {
    if (frozen) return;
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) > 6) {
        setTucked(y > last && y > 140);
        last = y;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [frozen]);

  // Freeze the page underneath while the index is up: Lenis owns the smooth
  // scroll, the root overflow catches the raw touch scroll it doesn't.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      root.style.overflow = prev;
      lenis?.start();
    };
  }, [open, lenis]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      // trap: the overlay covers the page, so tabbing out of it goes nowhere useful
      const f = overlayRef.current?.querySelectorAll<HTMLElement>("button, [href]");
      if (!f?.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // hand focus into the overlay on open, and back to the chip on close — but
  // not on mount, where "not open" is just the initial state, not a close
  const everOpened = useRef(false);
  useEffect(() => {
    if (open) {
      everOpened.current = true;
      overlayRef.current?.querySelector<HTMLElement>("button")?.focus();
    } else if (everOpened.current) {
      chipRef.current?.focus({ preventScroll: true });
    }
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    // The scroll lock above is torn down on the closing commit; jumping before
    // that lands on a stopped Lenis and an overflow:hidden root, and goes
    // nowhere. A frame later the page can scroll again.
    requestAnimationFrame(() => jumpTo(id));
  };

  return (
    <>
      <button
        ref={chipRef}
        type="button"
        className={`m-nav-tab${tucked ? " tucked" : ""}`}
        aria-label="Open section index"
        aria-expanded={open}
        hidden={open}
        onClick={frozen ? undefined : () => setOpen(true)}
      >
        <span className="m-nav-tab-lines" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="mono">index</span>
      </button>

      {open && (
        <div
          ref={overlayRef}
          className="m-nav-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Section index"
        >
          <div className="m-nav-overlay-head">
            <span className="mono faint">✎ index — jump to</span>
            <button type="button" className="m-nav-close mono" onClick={() => setOpen(false)}>
              esc ×
            </button>
          </div>
          <ul className="m-nav-overlay-list">
            {NAV_ITEMS.map(([id, num, label]) => {
              const on = active === id;
              return (
                <li key={id} className={on ? "on" : undefined}>
                  <a
                    href={`#sec-${id}`}
                    aria-current={on ? "true" : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      go(id);
                    }}
                  >
                    <span className="mono m-nav-ov-num">{num}</span>
                    {/* the overlay is chrome end to end — the labels go mono
                        with the numbers rather than staying display type */}
                    <span className="mono m-nav-ov-label">{label}</span>
                    <span className="m-nav-ov-rule" aria-hidden="true" />
                    {on && <span className="mono m-nav-ov-here">← here</span>}
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="mono faint m-nav-overlay-foot">
            — © 2026 Anoopchandra Parampalli · made by hand —
          </div>
        </div>
      )}
    </>
  );
}
