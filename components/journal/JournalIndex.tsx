"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { pad, tabColors, type JournalEntryMeta } from "@/lib/journal-meta";
import { useInkTransition } from "@/components/transition/InkTransitionProvider";

type Filter = "all" | "case" | "note";

const FILTERS: ReadonlyArray<[Filter, string]> = [
  ["all", "all entries"],
  ["case", "case studies"],
  ["note", "notes & stories"],
];

export default function JournalIndex({
  entries,
  book,
  inert,
}: {
  entries: JournalEntryMeta[];
  /** page range of the whole notebook — the last leaf, not the last entry's
   *  first leaf, so the header states the book's real extent */
  book?: { first: number; last: number };
  /** true when rendered as a non-interactive copy inside the transition overlay */
  inert?: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const { navigate } = useInkTransition();

  const counts = useMemo(
    () => ({
      all: entries.length,
      case: entries.filter((e) => e.kind === "case").length,
      note: entries.filter((e) => e.kind === "note").length,
    }),
    [entries]
  );
  const visible = filter === "all" ? entries : entries.filter((e) => e.kind === filter);
  const pages = entries.map((e) => e.page);
  const first = book?.first ?? Math.min(...pages);
  const last = book?.last ?? Math.max(...pages);
  const ppRange = `pp. ${pad(first)} — ${pad(last)}`;

  return (
    <div className="page" inert={inert}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between flex-wrap gap-3 mb-7 pb-3.5"
        style={{ borderBottom: "1.5px dashed var(--color-ink-faint)" }}
      >
        <Link
          href="/"
          className="mono inline-flex items-center gap-1.5 text-xs tracking-[1px] py-[5px] px-3 border-[1.5px] border-ink rounded-full bg-paper no-underline text-ink"
          onClick={(e) => {
            e.preventDefault();
            navigate("/", { effect: "peel" });
          }}
        >
          ← back to portfolio
        </Link>
        <div className="mono faint text-[11px] tracking-[2px] uppercase">
          anoopchandra parampalli · journal · vol. 02
        </div>
      </div>

      {/* Cover banner */}
      <div className="journal-cover">
        <div className="mono faint text-[11px] tracking-[3px] uppercase mb-3.5">
          a working notebook · {ppRange}
        </div>
        <h1 className="mb-2">
          The <span className="text-coral">Journal</span>
        </h1>
        <p className="text-[19px] leading-[1.5] italic font-normal mt-2.5 mb-0 max-w-[720px] text-ink-soft">
          Case studies from shipped work, plus notes-in-progress — bug stories, hot takes, things
          I figured out the hard way.
        </p>
        <div
          className="mono journal-cover-stamp absolute top-[22px] right-[26px] text-[10px] tracking-[2px] uppercase py-1 px-2.5 rounded-[3px] border-[1.5px] border-coral"
          style={{
            transform: "rotate(3deg)",
            // small accent text mixes toward ink; the border stays pure coral
            color: "color-mix(in oklab, var(--color-coral) 58%, var(--color-ink))",
          }}
        >
          est. 2024 · updated weekly
        </div>
      </div>

      {/* Filter rail */}
      <div className="flex items-center flex-wrap gap-2.5 mb-[22px]">
        <span className="mono text-[11px] tracking-[1px] uppercase text-ink-soft">filter ↦</span>
        {FILTERS.map(([k, label]) => (
          <button
            key={k}
            type="button"
            className={`journal-filter-btn ${filter === k ? "is-active" : ""}`}
            onClick={() => setFilter(k)}
          >
            {label}{" "}
            <span className="mono text-[11px] opacity-70 ml-1">({counts[k]})</span>
          </button>
        ))}
        <span className="mono text-[12px] text-ink-soft ml-auto">sorted newest → oldest</span>
      </div>

      {/* Notebook TOC panel */}
      <div className="bg-paper border-2 border-ink rounded-md pt-7 pr-6 pb-[18px] pl-16 relative overflow-hidden">
        <span
          aria-hidden="true"
          className="absolute left-12 top-0 bottom-0 w-[1.2px] opacity-60"
          style={{ background: "color-mix(in oklab, var(--color-coral) 70%, transparent)" }}
        />
        <div
          className="mono faint absolute left-2 top-7 text-[9px] tracking-[3px] uppercase whitespace-nowrap"
          style={{ transform: "rotate(-90deg)", transformOrigin: "left top" }}
        >
          ✎ index — {visible.length} of {entries.length}
        </div>

        <div
          className="mono faint journal-toc-header text-[9px] tracking-[2px] uppercase mb-1.5"
          style={{ borderBottom: "1px dashed var(--color-ink-faint)" }}
        >
          <span className="text-right">pg.</span>
          <span>title</span>
          <span className="text-right">read</span>
          <span className="text-right">date</span>
        </div>

        <ul className="list-none p-0 m-0">
          {visible.map((e) => (
            <li key={e.slug} className="relative">
              <Link
                href={`/journal/${e.slug}`}
                className="journal-toc-row items-baseline relative no-underline transition-colors duration-150"
                /* No aria-label: on a link it replaces the whole subtree, so it
                   was hiding the page number, kind, read time and date from
                   screen readers. The row's own text is the better name. */
              >
                <span className="mono faint journal-toc-page text-[11px] text-right text-ink-soft">
                  p.{pad(e.page)}
                </span>

                <span className="journal-toc-title flex items-baseline min-w-0 gap-2 overflow-hidden">
                  <span className="text-[18px] font-semibold leading-[1.4] whitespace-nowrap overflow-hidden text-ellipsis flex-[0_1_auto] text-ink">
                    {e.title}
                  </span>
                  {/* The one place the kind is stated in words. The edge tab
                      carries a subject now, not the bucket, so colour is
                      otherwise the only signal — and the tab is aria-hidden. */}
                  {e.kind === "case" && (
                    <span className="mono text-[9px] tracking-[2px] uppercase text-ink bg-paper-2 border border-ink px-[6px] py-[2px] rounded-[3px] shrink-0">
                      <span aria-hidden="true">★ </span>case study
                    </span>
                  )}
                  <span
                    aria-hidden="true"
                    className="journal-toc-leader flex-1 h-0 min-w-6 -translate-y-1"
                    style={{ borderBottom: "1.5px dotted var(--color-ink-faint)" }}
                  />
                </span>

                <span className="mono faint journal-toc-meta text-[11px] text-right text-ink-soft">
                  {e.read}
                </span>
                <span className="mono journal-toc-meta text-[11px] text-right text-ink-soft">
                  {e.dateDisplay}
                </span>

                {/* Audible now that the tab carries a subject rather than
                    restating the bucket — it was decorative when it read
                    "case study" next to a coral tab saying the same thing. */}
                <span
                  className="journal-edge-tab absolute -right-0.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-[10px] tracking-[1px] text-center min-w-[90px] py-[3px] pl-2.5 pr-2"
                  style={{
                    fontFamily: "var(--font-mono)",
                    ...tabColors(e.kind),
                    borderWidth: "1.2px",
                    borderStyle: "solid",
                    borderRight: "none",
                    borderRadius: "3px 0 0 3px",
                  }}
                >
                  {e.tag}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div
          className="flex justify-between items-center gap-3 flex-wrap mt-3.5 pt-3"
          style={{ borderTop: "1px dashed var(--color-ink-faint)" }}
        >
          <span className="mono faint text-[11px]">
            {visible.length} entries shown · {counts.case} case studies + {counts.note} notes · pp.{" "}
            {pad(first)}–{pad(last)}
          </span>
          <span className="text-[15px] italic text-ink-faint">tap any line to open the page ↦</span>
        </div>
      </div>

      <div className="mono faint text-center mt-10 text-[11px]">
        ✎ working notebook — entries are typeset by hand
      </div>

      <div style={{ marginTop: 40, textAlign: "center" }} className="mono faint">
        — © 2026 Anoopchandra Parampalli · journal · made by hand —
      </div>
    </div>
  );
}
