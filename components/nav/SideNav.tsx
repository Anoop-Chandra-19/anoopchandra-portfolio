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
    <nav
      className="side-nav-desktop fixed left-7 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-0.5 py-3.5 pr-2.5 pl-3.5"
      aria-label="Section navigation"
    >
      <div className="mono faint anim-rail d-rail-h text-[9px] tracking-[3px] uppercase mb-2.5 pl-0.5">
        index
      </div>
      {NAV_ITEMS.map(([id, num, label], idx) => {
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
              /* Persistent nav is chrome, so it leaves the serif behind entirely. */
              className={`mono text-[11.5px] tracking-[0.06em] whitespace-nowrap transition-all duration-[180ms] ${
                isActive ? "text-electric translate-x-0" : "text-ink -translate-x-0.5"
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
