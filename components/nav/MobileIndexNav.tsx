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
        className={`m-nav-tab nav:hidden${tucked ? " tucked" : ""}`}
        aria-label="Open section index"
        aria-expanded={open}
        hidden={open}
        onClick={frozen ? undefined : () => setOpen(true)}
      >
        <span className="inline-flex flex-col gap-[3px] w-[16px]" aria-hidden="true">
          <i className="h-[2px] bg-ink rounded-[2px]" />
          <i className="h-[2px] w-[70%] bg-ink rounded-[2px]" />
          <i className="h-[2px] bg-ink rounded-[2px]" />
        </span>
        <span className="font-mono text-[11px] tracking-[1px]">index</span>
      </button>

      {open && (
        <div
          ref={overlayRef}
          className="m-nav-overlay nav:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Section index"
        >
          <div className="flex justify-between items-center gap-[12px] pb-[14px] mb-[14px] border-b-2 border-dashed border-ink text-[10px] tracking-[2.5px] uppercase">
            <span className="mono faint">✎ index — jump to</span>
            <button
              type="button"
              className="font-mono py-[4px] px-[8px] -my-[4px] -mx-[8px] border-0 bg-transparent text-ink text-[10px] tracking-[2.5px] uppercase cursor-pointer"
              onClick={() => setOpen(false)}
            >
              esc ×
            </button>
          </div>
          <ul className="flex-1 list-none p-0 m-0">
            {NAV_ITEMS.map(([id, num, label]) => {
              const on = active === id;
              return (
                <li key={id} className="[border-bottom:1px_dashed_color-mix(in_oklab,var(--color-ink)_14%,transparent)]">
                  <a
                    className="flex items-center gap-[12px] py-[13px] px-0 text-ink no-underline"
                    href={`#sec-${id}`}
                    aria-current={on ? "true" : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      go(id);
                    }}
                  >
                    <span className="font-mono text-[11px] tracking-[1px] text-ink-faint min-w-[22px]">{num}</span>
                    {/* the overlay is chrome end to end — the labels go mono
                        with the numbers rather than staying display type */}
                    <span
                      className={`font-mono text-[19px] leading-[1.1] font-medium tracking-[-0.02em] ${on ? "text-electric" : ""}`}
                    >
                      {label}
                    </span>
                    <span
                      className="flex-1 min-w-[16px] [border-bottom:1.5px_dotted_var(--color-ink-faint)]"
                      aria-hidden="true"
                    />
                    {on && (
                      <span className="font-mono text-[11px] tracking-[1.5px] uppercase text-electric">← here</span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="font-mono faint text-[9.5px] tracking-[1.5px] text-center mt-[14px]">
            — © 2026 Anoopchandra Parampalli —
          </div>
        </div>
      )}
    </>
  );
}
