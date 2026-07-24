"use client";
import { useEffect, useState } from "react";
import { useLenisInstance } from "@/components/LenisProvider";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const ITEMS: ReadonlyArray<readonly [string, string, string]> = [
  ["home", "00", "cover"],
  ["now", "01", "now"],
  ["work", "02", "work"],
  ["lab", "03", "the lab"],
  ["stack", "04", "stack"],
  ["notes", "05", "notes"],
  ["contact", "06", "say hi"],
];

/** Which section the rail should mark at a given scroll offset. Reads the live
    document, so callers must be mounted after the home sections. */
function activeSectionAt(scrollY: number): string {
  const nearBottom = window.innerHeight + scrollY >= document.body.offsetHeight - 80;
  if (nearBottom) return "contact";
  const y = scrollY + window.innerHeight * 0.35;
  let cur = "home";
  for (const [id] of ITEMS) {
    const el = document.getElementById(`sec-${id}`);
    if (el && el.offsetTop <= y) cur = id;
  }
  return cur;
}

export default function SideNav({
  frozenAt,
}: {
  /** Render as a static snapshot inside a transition page copy: compute the
      active section once as if scrolled to this offset, never track scroll. */
  frozenAt?: number;
}) {
  const frozen = frozenAt !== undefined;
  // Frozen copies mount while the live page is still in the DOM — compute the
  // marker synchronously so the copy's first painted frame already matches
  // (an effect would flash the "cover" default for a frame first).
  const [active, setActive] = useState(() =>
    frozen ? activeSectionAt(frozenAt) : "home"
  );
  const lenis = useLenisInstance();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (frozen) return;
    const onScroll = () => setActive(activeSectionAt(window.scrollY));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [frozen]);

  useEffect(() => {
    if (frozen) return;
    const el = document.querySelector<HTMLElement>(`.dock-item[data-id="${active}"]`);
    if (el && el.parentElement) {
      el.parentElement.scrollTo({ left: el.offsetLeft - 40, behavior: "smooth" });
    }
  }, [active, frozen]);

  function jumpTo(id: string) {
    const target = document.getElementById(`sec-${id}`);
    if (!target) return;
    if (lenis) {
      lenis.scrollTo(target, {
        immediate: shouldReduceMotion,
        lerp: shouldReduceMotion ? undefined : 0.1,
        offset: 0,
      });
    } else {
      target.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",
        block: "start",
      });
    }
  }

  return (
    <>
      {/* Desktop: vertical left rail */}
      <nav
        className="side-nav-desktop fixed left-7 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-0.5 py-3.5 pr-2.5 pl-3.5"
        aria-label="Section navigation"
      >
        <div className="mono faint anim-rail d-rail-h text-[9px] tracking-[3px] uppercase mb-2.5 pl-0.5">
          index
        </div>
        {ITEMS.map(([id, num, label], idx) => {
          const isActive = active === id;
          return (
            <a
              key={id}
              href={`#sec-${id}`}
              className={`anim-rail d-rail-${idx} flex items-center gap-2.5 no-underline text-ink py-[5px] px-1.5 rounded transition-opacity duration-[180ms] ${
                isActive ? "opacity-100" : "opacity-55 hover:opacity-100"
              }`}
              onClick={(e) => {
                e.preventDefault();
                jumpTo(id);
              }}
            >
              <span
                className={`mono text-[10px] min-w-[18px] ${
                  isActive ? "text-electric" : "text-ink-faint"
                }`}
              >
                {num}
              </span>
              <span
                className={`relative h-0.5 transition-[width] duration-200 overflow-hidden ${
                  isActive ? "w-7 bg-electric" : "w-2.5 bg-ink"
                }`}
              />
              <span
                className={`hand text-[17px] whitespace-nowrap transition-all duration-[180ms] ${
                  isActive ? "text-electric translate-x-0" : "text-ink -translate-x-0.5"
                }`}
              >
                {label}
              </span>
            </a>
          );
        })}
      </nav>

      {/* Mobile: bottom horizontal dock */}
      <nav
        className="side-nav-mobile fixed inset-x-0 bottom-0 z-[100] backdrop-blur border-t-2 border-ink shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        style={{ background: "color-mix(in oklab, var(--color-paper) 92%, transparent)" }}
        aria-label="Section navigation"
      >
        <div
          className="flex gap-1 overflow-x-auto pt-2.5 px-3.5 pb-3 [scrollbar-width:none]"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {ITEMS.map(([id, num, label]) => {
            const isActive = active === id;
            return (
              <a
                key={id}
                href={`#sec-${id}`}
                className={`dock-item flex flex-col items-center gap-0.5 py-1 px-2.5 no-underline rounded-md shrink-0 transition-colors duration-150 ${
                  isActive ? "bg-ink text-paper" : "text-ink"
                }`}
                data-id={id}
                onClick={(e) => {
                  e.preventDefault();
                  jumpTo(id);
                }}
              >
                <span
                  className={`mono text-[9px] tracking-[1px] ${
                    isActive
                      ? "text-[color-mix(in_oklab,var(--color-electric)_60%,white)]"
                      : "text-ink-faint"
                  }`}
                >
                  {num}
                </span>
                <span
                  className={`hand text-[18px] leading-none whitespace-nowrap ${
                    isActive ? "text-paper" : "text-ink"
                  }`}
                >
                  {label}
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
