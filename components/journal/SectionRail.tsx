// The tabbed edge of a notebook — NOT a docs sidebar. A sticky list of the
// entry's § markers in the left gutter, active tab tinted with the accent and
// marked by a right border. Reuses the same § numbering as the heading kickers,
// so the numbers here match the ones in the body.
//
// Sections come from lib/journal.ts (a regex over the MDX source), not from
// scraping the DOM — the slugs match what rehype-slug stamps on <h2 id>.
// Hidden below 820px in CSS, and for entries with fewer than 3 sections.
"use client";
import { useEffect, useState } from "react";
import type { Section } from "@/lib/journal-meta";

/** A heading counts as reached once it crosses this far down the viewport. */
const ACTIVE_LINE = 130;

export default function SectionRail({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (sections.length < 3) return;
    function onScroll() {
      let cur = 0;
      sections.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= ACTIVE_LINE) cur = i;
      });
      // The last section is usually shorter than the viewport, and everything
      // after the entry — related, prev/next, footer — is taller still, so its
      // heading can stop short of the line and never light up. At the bottom of
      // the page you are in the last section whatever the arithmetic says.
      const doc = document.documentElement;
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) {
        cur = sections.length - 1;
      }
      setActive(cur);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
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
