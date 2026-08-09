// Section IDs come from lib/journal.ts and match rehype-slug's rendered IDs.
// The rail is hidden below 820px and for entries with fewer than three sections.
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
    <nav className="je-secnav" aria-label="sections in this entry">
      <div className="je-secnav-in">
        <div className="hd">sections</div>
        {sections.map((s, i) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={i === active ? "on" : ""}
            title={s.title}
            aria-current={i === active ? "true" : undefined}
          >
            <span className="n">§{String(s.n).padStart(2, "0")}</span>
            <span className="t">{s.title}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
