"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { pad, tabAccent, type JournalEntryMeta } from "@/lib/journal-meta";
import JournalBackLink from "@/components/journal/JournalBackLink";

type Filter = "all" | "case" | "note";
type SortKey = "title" | "read" | "date";
type Sort = { key: SortKey; dir: "asc" | "desc" };

/** [key, desktop label, phone label]. Both render so CSS can select by viewport. */
const FILTERS: ReadonlyArray<[Filter, string, string]> = [
  ["all", "all entries", "all"],
  ["case", "case studies", "case"],
  ["note", "notes & stories", "notes"],
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
    /* No aria-sort: this header is a div grid, not a table, and the attribute is
       only supported on columnheader/rowheader. The state rides on the button,
       where the arrow glyph is aria-hidden and would otherwise say nothing. */
    <span className={align === "right" ? "text-right" : undefined}>
      <button
        type="button"
        className={`journal-sort ${on ? "is-on" : ""}`}
        onClick={() => onSort(sortKey)}
      >
        {label}
        <span aria-hidden="true" className="journal-sort-arrow">
          {on && sort.dir === "asc" ? "▲" : "▼"}
        </span>
        {on && (
          <span className="sr-only">
            , sorted {sort.dir === "asc" ? "ascending" : "descending"}
          </span>
        )}
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
  /** Full notebook page range, including the final entry's last leaf. */
  book?: { first: number; last: number };
  /** Rendered as a non-interactive transition copy. */
  inert?: boolean;
}) {
  /* Kind, subject, year, and sort are intentionally local rather than URL state. */
  const [filter, setFilter] = useState<Filter>("all");
  const [tag, setTag] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>({ key: "date", dir: "desc" });

  const counts = useMemo(
    () => ({
      all: entries.length,
      case: entries.filter((e) => e.kind === "case").length,
      note: entries.filter((e) => e.kind === "note").length,
    }),
    [entries]
  );

  const years = useMemo(
    () => [...new Set(entries.map((entry) => entry.date.slice(0, 4)))].sort().reverse(),
    [entries]
  );

  // TODO(journal-scale): Add paginated index routes when the archive outgrows
  // one page. Apply kind, subject, year, and future search filters before
  // slicing entries so every filter continues to cover the full archive.
  const visible = useMemo(() => {
    const rows = entries.filter(
      (entry) =>
        (filter === "all" || entry.kind === filter) &&
        (!tag || entry.tag === tag) &&
        (!year || entry.date.startsWith(`${year}-`))
    );
    const compare = SORTERS[sort.key];
    return rows.sort((left, right) =>
      sort.dir === "asc" ? compare(left, right) : -compare(left, right)
    );
  }, [entries, filter, tag, year, sort]);

  // New columns default to title ascending and all others descending.
  const toggleSort = (key: SortKey) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "title" ? "asc" : "desc" }
    );

  const pages = entries.map((e) => e.page);
  const first = book?.first ?? Math.min(...pages);
  const last = book?.last ?? Math.max(...pages);
  const ppRange = `pp. ${pad(first)}–${pad(last)}`;

  return (
    <main
      id={inert ? undefined : "main-content"}
      className={`page journal-index ${tag ? "has-subject" : ""}`}
      inert={inert}
    >
      <div
        className="flex items-center justify-between flex-wrap gap-3 mb-7 pb-3.5"
        style={{ borderBottom: "1.5px dashed var(--color-ink-faint)" }}
      >
        <JournalBackLink href="/" peel>
          ← back to portfolio
        </JournalBackLink>
        <div className="mono faint text-[11px] tracking-[2px] uppercase">
          anoop parampalli · journal · vol. 02
        </div>
      </div>

      <div className="journal-cover">
        <div className="mono faint text-[11px] tracking-[3px] uppercase mb-3.5">
          a working notebook · {ppRange}
        </div>
        <h1 className="mb-2">
          The <span className="text-coral">Journal</span>
        </h1>
        <p className="text-[19px] leading-[1.5] italic font-normal mt-2.5 mb-0 max-w-[720px] text-ink-soft">
          A working notebook for bug stories, personal projects, opinions, and things I figured
          out the hard way.
        </p>
        <div
          className="mono journal-cover-stamp absolute top-[22px] right-[26px] text-[10px] tracking-[2px] uppercase py-1 px-2.5 rounded-[3px] border-[1.5px] border-coral"
          style={{
            transform: "rotate(3deg)",
            color: "color-mix(in oklab, var(--color-coral) 58%, var(--color-ink))",
          }}
        >
          est. 2025 · written by hand
        </div>
      </div>

      {/* Kind uses the top filters; subject uses each row's edge tab. */}
      <div className="flex items-center flex-wrap gap-2.5 mb-[22px]">
        <span className="mono journal-filter-lbl text-[11px] tracking-[1px] uppercase text-ink-soft">
          filter ↦
        </span>
        {FILTERS.map(([k, label, shortLabel]) => (
          <button
            key={k}
            type="button"
            className={`journal-filter-btn ${filter === k ? "is-active" : ""}`}
            onClick={() => setFilter(k)}
          >
            <span className="journal-filter-wide">{label}</span>
            <span className="journal-filter-narrow">{shortLabel}</span>
            <span className="mono text-[11px] opacity-70 ml-1">({counts[k]})</span>
          </button>
        ))}
        {years.length > 1 && (
          <label className="journal-year-filter">
            <span>year ↦</span>
            <select
              className="journal-year-select"
              value={year ?? ""}
              onChange={(event) => setYear(event.target.value || null)}
            >
              <option value="">all years</option>
              {years.map((entryYear) => (
                <option key={entryYear} value={entryYear}>
                  {entryYear}
                </option>
              ))}
            </select>
          </label>
        )}
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

      <div className="journal-toc-panel bg-paper border-2 border-ink rounded-md pt-7 pr-6 pb-[18px] pl-16 relative overflow-hidden">
        <span
          aria-hidden="true"
          className="journal-toc-rule absolute left-12 top-0 bottom-0 w-[1.2px] opacity-60"
          style={{ background: "color-mix(in oklab, var(--color-coral) 70%, transparent)" }}
        />
        <div
          className="mono faint journal-toc-stamp absolute left-2 top-7 text-[9px] tracking-[3px] uppercase whitespace-nowrap"
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
          {/* `subject` permanently labels the edge-tab controls. */}
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
              )}
              {year && (
                <>
                  {" "}
                  during <b className="font-semibold">{year}</b>
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
                setYear(null);
              }}
            >
              show the whole book
            </button>
          </div>
        )}

        <ul className="journal-toc-list list-none p-0 m-0">
          {visible.map((e) => (
            /* The accent rides on the row, not the tab: the phone kind label
               needs the same hue and sits inside the link. */
            <li key={e.slug} className="journal-toc-item" style={tabAccent(e.kind)}>
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
                  {/* The case badge provides a non-colour kind signal; mobile uses the tab. */}
                  {e.kind === "case" && (
                    <span className="mono journal-toc-case text-[9px] tracking-[2px] uppercase text-ink bg-paper-2 border border-ink px-[6px] py-[2px] rounded-[3px] shrink-0">
                      <span aria-hidden="true">★ </span>case study
                    </span>
                  )}
                  <span
                    aria-hidden="true"
                    className="journal-toc-leader flex-1 h-0 min-w-6 -translate-y-1"
                    style={{ borderBottom: "1.5px dotted var(--color-ink-faint)" }}
                  />
                </span>

                {/* `display: contents` above the phone breakpoint, so the ledger
                    grid still owns read and date as its own cells. On a phone it
                    collapses to the one meta line under the title, where kind and
                    subject join them and the two swap into reading order — date,
                    then how long it takes. */}
                <span className="journal-toc-metas">
                  {/* Kind as words. The ★ badge above is desktop-only, so this is
                      its phone equivalent and has to read for notes too. */}
                  <span className="journal-toc-kind">
                    {e.kind === "case" ? (
                      <>
                        <span aria-hidden="true">★ </span>case
                      </>
                    ) : (
                      "note"
                    )}
                  </span>
                  <span className="journal-toc-tag">{e.tag}</span>
                  <span className="mono faint journal-toc-meta journal-toc-read text-[11px] text-right text-ink-soft">
                    {e.read}
                  </span>
                  <span className="mono journal-toc-meta journal-toc-date text-[11px] text-right text-ink-soft">
                    {e.dateDisplay}
                  </span>
                </span>
              </Link>

              {/* The subject button sits beside the link because nested interactive
                  elements are invalid; absolute positioning preserves one row target. */}
              <button
                type="button"
                className={`journal-edge-tab ${tag === e.tag ? "is-on" : ""}`}
                title={tag === e.tag ? `showing ${e.tag}; click to clear` : `filter to ${e.tag}`}
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
          <span className="mono faint text-[11px]">
            {visible.length} shown
            {tag && (
              <>
                {" "}
                · subject <b className="font-medium text-ink">{tag}</b>
              </>
            )}
            {year && (
              <>
                {" "}
                · year <b className="font-medium text-ink">{year}</b>
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
        — © 2026 Anoop Parampalli · journal · made by hand —
      </div>
    </main>
  );
}
