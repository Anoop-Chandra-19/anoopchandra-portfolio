"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { pad, tabAccent, type JournalEntryMeta } from "@/lib/journal-meta";
import { useInkTransition } from "@/components/transition/InkTransitionProvider";

type Filter = "all" | "case" | "note";
type SortKey = "title" | "read" | "date";
type Sort = { key: SortKey; dir: "asc" | "desc" };

const FILTERS: ReadonlyArray<[Filter, string]> = [
  ["all", "all entries"],
  ["case", "case studies"],
  ["note", "notes & stories"],
];

const KIND_LABEL: Record<Exclude<Filter, "all">, string> = {
  case: "case studies",
  note: "notes & stories",
};

/** `no` is the chronological entry number, so date sorts without re-parsing the
 *  display string. `read` is "N min" — parseInt stops at the space. */
const SORTERS: Record<SortKey, (x: JournalEntryMeta, y: JournalEntryMeta) => number> = {
  date: (x, y) => x.no - y.no,
  read: (x, y) => parseInt(x.read, 10) - parseInt(y.read, 10),
  title: (x, y) => x.title.localeCompare(y.title),
};

function SortHead({
  label,
  sortKey,
  sort,
  onSort,
  align,
}: {
  label: string;
  sortKey: SortKey;
  sort: Sort;
  onSort: (key: SortKey) => void;
  align?: "right";
}) {
  const on = sort.key === sortKey;
  return (
    /* aria-sort belongs on the header cell, not the button — the prototype had
       it on the button. It stays inert until this ledger is a real grid: the
       rows are links, and faking table roles over them would cost them their
       link semantics for an attribute nothing would announce anyway. */
    <span
      aria-sort={on ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
      className={align === "right" ? "text-right" : undefined}
    >
      <button
        type="button"
        className={`journal-sort ${on ? "is-on" : ""}`}
        onClick={() => onSort(sortKey)}
      >
        {label}
        <span aria-hidden="true" className="journal-sort-arrow">
          {on && sort.dir === "asc" ? "▲" : "▼"}
        </span>
      </button>
    </span>
  );
}

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
  /* Two axes, both component state: kind above the page, subject on the tabs.
     Not URL state — the default (whole book, newest first) is the only view
     worth linking to. */
  const [filter, setFilter] = useState<Filter>("all");
  const [tag, setTag] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>({ key: "date", dir: "desc" });
  const { navigate } = useInkTransition();

  const counts = useMemo(
    () => ({
      all: entries.length,
      case: entries.filter((e) => e.kind === "case").length,
      note: entries.filter((e) => e.kind === "note").length,
    }),
    [entries]
  );

  const visible = useMemo(() => {
    const rows = entries.filter(
      (e) => (filter === "all" || e.kind === filter) && (!tag || e.tag === tag)
    );
    const cmp = SORTERS[sort.key];
    return rows.sort((x, y) => (sort.dir === "asc" ? cmp(x, y) : -cmp(x, y)));
  }, [entries, filter, tag, sort]);

  // Clicking the same column flips it; a new column starts in the direction
  // people expect of it — newest and longest first, but titles A → Z.
  const toggleSort = (key: SortKey) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "title" ? "asc" : "desc" }
    );

  const pages = entries.map((e) => e.page);
  const first = book?.first ?? Math.min(...pages);
  const last = book?.last ?? Math.max(...pages);
  const ppRange = `pp. ${pad(first)} — ${pad(last)}`;

  return (
    <div className={`page journal-index ${tag ? "has-subject" : ""}`} inert={inert}>
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

      {/* Filter rail — kind only. Subject is set on the ledger's own edge tabs,
          which are already drawn on every row; a second row of buttons would be
          the index's vocabulary printed twice. Order is stated by the column
          headers below, so there is no caption for it here. */}
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
        {tag && (
          <button
            type="button"
            className="journal-subject-chip"
            title="clear subject filter"
            onClick={() => setTag(null)}
          >
            <span className="faint tracking-[1px]">subject:</span>
            {tag}
            <span aria-hidden="true">×</span>
          </button>
        )}
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
          <SortHead label="title" sortKey="title" sort={sort} onSort={toggleSort} />
          <SortHead label="read" sortKey="read" sort={sort} onSort={toggleSort} align="right" />
          <SortHead label="date" sortKey="date" sort={sort} onSort={toggleSort} align="right" />
          {/* `subject` is a label, never a control: the tabs' affordance can't
              depend on hover (touch) or on the footer hint, which scrolls out of
              view once the book is long. This names the axis permanently. */}
          <span className="relative">
            <span style={{ position: "absolute", right: -2, width: 90, textAlign: "center" }}>
              subject
            </span>
          </span>
        </div>

        {visible.length === 0 && (
          <div className="pt-[26px] pb-[22px] px-1.5">
            <p className="text-[19px] italic leading-[1.4] text-ink-soft mt-0 mb-2.5">
              Nothing filed under {tag ? <b className="font-semibold">{tag}</b> : "that"}
              {filter !== "all" && (
                <>
                  {" "}
                  in <b className="font-semibold">{KIND_LABEL[filter]}</b>
                </>
              )}{" "}
              yet.
            </p>
            <button
              type="button"
              className="mono text-[11px] tracking-[1px] py-[5px] px-3 border-[1.5px] border-ink rounded-full bg-paper text-ink cursor-pointer"
              onClick={() => {
                setFilter("all");
                setTag(null);
              }}
            >
              show the whole book
            </button>
          </div>
        )}

        <ul className="list-none p-0 m-0">
          {visible.map((e) => (
            <li key={e.slug} className="journal-toc-item">
              <Link
                href={`/journal/${e.slug}`}
                className="journal-toc-row items-baseline no-underline"
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
                      carries a subject, not the bucket, so its colour is
                      otherwise the only signal. */}
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
              </Link>

              {/* The tab IS the subject filter — it was already drawn on every
                  row, so filtering by subject needs no control above the page.
                  A <button> inside an <a> is invalid and recovers differently
                  per engine, so it sits BESIDE the Link, absolutely positioned
                  over the row's 110px right reserve: the Link keeps all four
                  cells and stays one click target, the tab takes its own. */}
              <button
                type="button"
                className={`journal-edge-tab ${tag === e.tag ? "is-on" : ""}`}
                style={tabAccent(e.kind)}
                title={tag === e.tag ? `showing ${e.tag} — click to clear` : `filter to ${e.tag}`}
                onClick={() => setTag(tag === e.tag ? null : e.tag)}
              >
                {e.tag}
              </button>
            </li>
          ))}
        </ul>

        <div
          className="flex justify-between items-center gap-3 flex-wrap mt-3.5 pt-3"
          style={{ borderTop: "1px dashed var(--color-ink-faint)" }}
        >
          {/* The `subject` clause appears only when one is active, so the line
              doubles as confirmation the tab took. */}
          <span className="mono faint text-[11px]">
            {visible.length} shown
            {tag && (
              <>
                {" "}
                · subject <b className="font-medium text-ink">{tag}</b>
              </>
            )}
            {" · "}
            {counts.case} case studies + {counts.note} notes · pp. {pad(first)}–{pad(last)}
          </span>
          <span className="text-[15px] italic text-ink-faint">
            tap a line to open it · tap a tab to filter ↦
          </span>
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
