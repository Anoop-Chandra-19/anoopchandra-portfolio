"use client";
import { NAV_ITEMS, useActiveSection, useSectionJump } from "@/hooks/useActiveSection";

/** Desktop-only vertical left rail (>900px). Below that the index chip +
    full-screen overlay in MobileIndexNav takes over. */
export default function SideNav({
  frozenAt,
}: {
  /** Render as a static snapshot inside a transition page copy. */
  frozenAt?: number;
}) {
  const active = useActiveSection(frozenAt);
  const jumpTo = useSectionJump();

  return (
    /* Whole pixels only, never rem: at a 17px basis the usual Tailwind steps
       land on fractions and the row pitch drifts, which puts each 2px dash on
       a different sub-pixel phase and antialiases them to different weights. */
    <nav
      className="side-nav-desktop fixed left-[30px] top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-[2px] py-[14px] pr-[10px] pl-[14px]"
      aria-label="Section navigation"
    >
      <div className="mono faint anim-rail d-rail-h text-[9px] leading-[12px] tracking-[3px] uppercase mb-[10px] pl-[2px]">
        index
      </div>
      {NAV_ITEMS.map(([id, num, label], idx) => {
        const isActive = active === id;
        return (
          <a
            key={id}
            href={`#sec-${id}`}
            /* Colour and dash length carry the active state — no dim. */
            className={`anim-rail d-rail-${idx} flex h-[30px] items-center gap-[10px] no-underline text-ink px-[6px] rounded`}
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
              className={`relative h-[2px] transition-[width] duration-200 overflow-hidden ${
                isActive ? "w-[28px] bg-electric" : "w-[10px] bg-ink"
              }`}
            />
            <span
              /* Persistent nav is chrome, so it leaves the serif behind entirely. */
              className={`mono text-[11.5px] tracking-[0.06em] whitespace-nowrap transition-all duration-[180ms] ${
                isActive ? "text-electric translate-x-0" : "text-ink -translate-x-[1px]"
              }`}
            >
              {label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
