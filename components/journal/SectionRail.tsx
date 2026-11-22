// Section IDs come from lib/journal.ts and match rehype-slug's rendered IDs.
// The rail is hidden below 900px and for entries with fewer than three sections.
"use client";
import { useEffect, useState } from "react";
import type { Section } from "@/lib/journal-meta";

/** A new section takes over after its heading reaches the upper reading area. */
const ACTIVE_VIEWPORT_RATIO = 0.4;

export default function SectionRail({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (sections.length < 3) return;

    let frame = 0;

    function updateActive() {
      frame = 0;
      const activeLine = window.innerHeight * ACTIVE_VIEWPORT_RATIO;
      let current = 0;

      sections.forEach(({ id }, index) => {
        const heading = document.getElementById(id);
        if (heading && heading.getBoundingClientRect().top <= activeLine) {
          current = index;
        }
      });

      // The final heading can be too close to the bottom to reach the reading
      // line, so the end of the page always belongs to the final section.
      const root = document.documentElement;
      if (window.scrollY + window.innerHeight >= root.scrollHeight - 2) {
        current = sections.length - 1;
      }

      setActive((previous) => (previous === current ? previous : current));
    }

    function scheduleUpdate() {
      if (frame) return;
      frame = requestAnimationFrame(updateActive);
    }

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      cancelAnimationFrame(frame);
    };
  }, [sections]);

  if (sections.length < 3) return null;

  return (
    <nav className="absolute left-0 top-0 bottom-0 w-(--rail) max-nav:hidden" aria-label="sections in this entry">
      <div className="sticky top-6.5 flex flex-col gap-px">
        <div className="pr-[13px] pb-[9px] font-mono text-stamp uppercase text-ink-faint text-right">sections</div>
        {sections.map((s, i) => {
          const isOn = i === active;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`group block pt-1.5 pr-[11px] pb-[7px] pl-1 text-right no-underline border-r-2 rounded-l-[3px] [transition:background_.15s,color_.15s,border-color_.15s] ${
                isOn
                  ? "bg-[color-mix(in_oklab,var(--accent)_11%,var(--color-paper))] border-r-(--accent)"
                  : "border-r-transparent hover:bg-[color-mix(in_oklab,var(--color-paper-2)_70%,transparent)]"
              }`}
              title={s.title}
              aria-current={isOn ? "true" : undefined}
            >
              <span className={`block font-mono text-stamp ${isOn ? "text-(--accent-ink)" : "text-ink-faint"}`}>
                §{String(s.n).padStart(2, "0")}
              </span>
              <span
                className={`line-clamp-4 pt-[3px] px-1 pb-[5px] -mt-[3px] -mx-1 -mb-[3px] font-accent font-semibold text-[20px] leading-[1.22] ${
                  isOn ? "text-ink" : "text-[color:color-mix(in_oklab,var(--color-ink)_55%,var(--color-paper))] group-hover:text-ink"
                }`}
              >
                {s.title}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
