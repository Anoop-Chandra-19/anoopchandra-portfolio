"use client";
import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  matchesEntry,
  pad,
  tabAccent,
  type Filter,
  type JournalEntryMeta,
} from "@/lib/journal-meta";
import BackLink from "@/components/ui/BackLink";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import Pill from "@/components/ui/Pill";
import JournalFilterSheet, {
  type Sort,
  type SortKey,
} from "@/components/journal/JournalFilterSheet";
import { useIndexArrival } from "./useIndexArrival";

const FILTERS: ReadonlyArray<[Filter, string]> = [
  ["all", "all entries"],
  ["case", "case studies"],
  ["note", "notes & stories"],
];

const KIND_LABEL: Record<Exclude<Filter, "all">, string> = {
  case: "case studies",
  note: "notes & stories",
};

const SORT_LABEL: Record<SortKey, string> = {
  date: "date",
  read: "read time",
  title: "title",
};

/** `no` is the chronological entry number, so date sorts without re-parsing the
 *  display string. `read` is "N min" — parseInt stops at the space. */
const SORTERS: Record<SortKey, (x: JournalEntryMeta, y: JournalEntryMeta) => number> = {
  date: (x, y) => x.no - y.no,
  read: (x, y) => parseInt(x.read, 10) - parseInt(y.read, 10),
  title: (x, y) => x.title.localeCompare(y.title),
};

// Edge tabs take their hue from the row (`tabAccent` sets --tab-c/--tab-ink).
const EDGE_TAB = `absolute -right-0.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center py-[3px] pr-2 pl-2.5 font-mono text-caption text-center cursor-pointer text-(--tab-ink) bg-[color-mix(in_oklab,var(--tab-c)_15%,var(--color-paper))] hover:bg-[color-mix(in_oklab,var(--tab-c)_34%,var(--color-paper))] focus-visible:bg-[color-mix(in_oklab,var(--tab-c)_34%,var(--color-paper))] border-[1.2px] border-(--tab-c) border-r-0 rounded-l-[3px] [transition:min-width_0.16s,opacity_0.16s,box-shadow_0.16s,background_0.16s] max-wide:hidden`;
const EDGE_TAB_OFF =
  "min-w-[90px] hover:min-w-[96px] focus-visible:min-w-[96px] hover:[box-shadow:-2px_2px_0_color-mix(in_oklab,var(--color-ink)_45%,transparent)] focus-visible:[box-shadow:-2px_2px_0_color-mix(in_oklab,var(--color-ink)_45%,transparent)]";
const EDGE_TAB_ON = "min-w-[100px] font-medium [box-shadow:-2px_2px_0_var(--color-ink)]";

// The first-load entrance (anim-*) and the after-loader fade (page-in) never
// share an element: ink-no-anim's `animation: none` would cancel the fade too.
const PAGE_IN_CARD = "page-in:animate-page-in page-in:[animation-delay:40ms]";
const PAGE_IN_FILTERS = "page-in:animate-page-in page-in:[animation-delay:80ms]";

// Phone meta line. On the items so they follow `order`, and trailing so a
// wrapped line never opens with a stray dot. Read time is last, so it has none.
const META_SEP = "max-wide:after:content-['·'] max-wide:after:ml-[7px] max-wide:after:text-ink-faint";

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
        className={`inline-flex items-center gap-1 [font:inherit] [letter-spacing:inherit] [text-transform:inherit] bg-transparent p-0 border-b cursor-pointer ${
          on ? "text-ink border-ink" : "text-inherit border-transparent hover:text-ink"
        }`}
        onClick={() => onSort(sortKey)}
      >
        {label}
        <span aria-hidden="true" className={on ? undefined : "opacity-35"}>
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
  const [sheetOpen, setSheetOpen] = useState(false);

  const isArriving = useIndexArrival();
  /* The element, not a ref: useModalLifecycle returns focus here on close. */
  const [opener, setOpener] = useState<HTMLElement | null>(null);

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
    const rows = entries.filter((entry) => matchesEntry(entry, { filter, tag, year }));
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

  const isFiltered = filter !== "all" || tag !== null || year !== null;
  const clearAll = () => {
    setFilter("all");
    setTag(null);
    setYear(null);
  };

  const sortLabel = `${SORT_LABEL[sort.key]} ${sort.dir === "asc" ? "↑" : "↓"}`;
  const facets = [filter !== "all" ? KIND_LABEL[filter] : null, tag, year].filter(Boolean);
  const pillText = facets.length
    ? [...facets, sortLabel].join(" · ")
    : `all · all years · ${sortLabel}`;

  const pages = entries.map((e) => e.page);
  const first = book?.first ?? Math.min(...pages);
  const last = book?.last ?? Math.max(...pages);
  const ppRange = `pp. ${pad(first)}–${pad(last)}`;

  return (
    <main
      id={inert ? undefined : "main-content"}
      className="page"
      inert={inert}
    >
      <div className="page-in:animate-page-in">
        <div
          className="flex items-center justify-between flex-wrap gap-[13px] mb-7.5 pb-[15px] anim-rise d-ix-top"
          style={{ borderBottom: "1.5px dashed var(--color-ink-faint)" }}
        >
          <BackLink href="/" peel>
            ← back to portfolio
          </BackLink>
          <Label kind="eyebrow">
            anoop parampalli · journal · vol. 02
          </Label>
        </div>
      </div>

      <div className={`relative before:content-[''] before:absolute before:inset-[7px] before:border before:border-[color-mix(in_oklab,var(--color-ink)_50%,transparent)] before:rounded-[4px] before:pointer-events-none bg-paper border-2 border-ink rounded-[7px] py-7 px-8 mb-9 max-wide:py-5 max-wide:px-[18px] ${PAGE_IN_CARD}`}>
        <Label kind="eyebrow" className="mb-[15px] anim-rise d-ix-top">
          a working notebook · {ppRange}
        </Label>
        <h1 className="mb-2 leading-[0.95] max-wide:text-[40px] max-wide:leading-[1.02] max-wide:tracking-[-0.02em] anim-swipe d-ix-title">
          The <span className="text-coral">Journal</span>
        </h1>
        <p className="text-summary italic font-normal mt-[11px] mb-0 max-w-[720px] text-ink-soft max-wide:leading-[1.5] anim-rise d-ix-sum">
          A working notebook for bug stories, personal projects, opinions, and things I figured
          out the hard way.
        </p>
        <Label
          kind="tag"
          tone="inherit"
          // `rotate`, so anim-stamp's transform doesn't straighten it.
          className="absolute top-[22px] right-[26px] py-1 px-[11px] rounded-[3px] border-[1.5px] border-coral text-coral-ink rotate-3 max-wide:static max-wide:inline-block max-wide:mt-3.5 anim-stamp d-ix-stamp"
        >
          est. 2025
        </Label>
      </div>

      <div className={PAGE_IN_FILTERS}>
        {/* Kind uses the top filters; subject uses each row's edge tab. Below the
            breakpoint this whole row is replaced by the filter pill. */}
        <div className="flex items-center flex-wrap gap-[11px] mb-[22px] max-wide:hidden anim-rise d-ix-filter">
          <span className="font-mono text-caption uppercase text-ink-soft">
            filter ↦
          </span>
          {FILTERS.map(([k, label]) => (
            <Button key={k} kind="tab" pressed={filter === k} onClick={() => setFilter(k)}>
              {label}
              <Label kind="meta" tone="inherit" as="span" className="opacity-70 ml-1">({counts[k]})</Label>
            </Button>
          ))}
          {years.length > 1 && (
            <label className="relative inline-flex items-center gap-[7px] ml-1 font-mono text-tag uppercase text-ink-soft after:content-['⌄'] after:absolute after:right-2 after:top-1/2 after:[translate:0_-56%] after:text-ink-soft after:pointer-events-none">
              <span>year ↦</span>
              <select
                className={`appearance-none min-w-[104px] py-1 pr-[25px] pl-2.5 border-[1.5px] border-ink rounded-md bg-paper hover:bg-paper-2 text-ink font-mono text-control leading-[1.2] cursor-pointer`}
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
            <Pill kind="filter" className="ml-1" title="clear subject filter" onClick={() => setTag(null)}>
              <span className="faint tracking-[1px]">subject:</span>
              {tag}
              <span aria-hidden="true">×</span>
            </Pill>
          )}
        </div>

        {/* Phone-only: one pill stands in for the kind buttons, the year select and
            the sort headers; the sheet owns subject filtering. The ✕ is a sibling,
            not a child: nesting it inside the pill would be a button in a button. */}
        <div className="hidden max-wide:flex items-center gap-2 mb-4 anim-rise d-ix-filter">
          <button
            type="button"
            className={`flex items-center gap-[7px] flex-1 min-w-0 min-h-11 box-border px-3.5 font-mono text-control-sm text-ink bg-paper border-[1.5px] rounded-full cursor-pointer ${
              isFiltered
                ? "border-coral [box-shadow:2px_2px_0_color-mix(in_oklab,var(--color-coral)_30%,transparent)]"
                : "border-ink [box-shadow:2px_2px_0_color-mix(in_oklab,var(--color-ink)_16%,transparent)]"
            }`}
            aria-expanded={sheetOpen}
            aria-controls="journal-filter-sheet"
            onClick={(e) => {
              setOpener(e.currentTarget);
              setSheetOpen(true);
            }}
          >
            <Label kind="stamp" as="span">filter</Label>
            <span
              className={`min-w-0 truncate ${
                isFiltered ? "text-coral-ink" : ""
              }`}
            >
              {pillText}
            </span>
            <span className="ml-auto text-ink-faint">{visible.length}</span>
          </button>
          {isFiltered && (
            <button
              type="button"
              className="flex items-center justify-center flex-none size-11 p-0 bg-transparent font-mono text-control text-ink-soft cursor-pointer"
              aria-label="clear all filters"
              onClick={clearAll}
            >
              <span aria-hidden="true">✕</span>
            </button>
          )}
        </div>

      </div>

      {isFiltered && (
        <div className="hidden max-wide:flex items-center gap-[7px] -mt-2 mb-2.5 font-mono text-tag uppercase text-ink-faint [&_b]:font-medium [&_b]:text-ink">
          <span>
            {filter !== "all" && (
              <>
                <b>{KIND_LABEL[filter]}</b>
                {" · "}
              </>
            )}
            {tag && (
              <>
                subject <b>{tag}</b>
                {" · "}
              </>
            )}
            {year && (
              <>
                year <b>{year}</b>
                {" · "}
              </>
            )}
            {visible.length} of {entries.length}
          </span>
          <button
            type="button"
            className="inline-flex items-center min-h-11 -my-[11px] ml-auto p-0 bg-transparent [border-bottom:1px_dotted_var(--color-ink-faint)] font-mono text-control-sm normal-case text-ink-soft cursor-pointer"
            onClick={clearAll}
          >
            show all {entries.length}
          </button>
        </div>
      )}

      <JournalFilterSheet
        open={sheetOpen}
        id="journal-filter-sheet"
        entries={entries}
        years={years}
        value={{ filter, tag, year, sort }}
        opener={opener}
        onApplyAction={(next) => {
          setFilter(next.filter);
          setTag(next.tag);
          setYear(next.year);
          setSort(next.sort);
        }}
        onCloseAction={() => setSheetOpen(false)}
      />

      {/* The notebook stays on phones: it is the page's only paper cue. */}
      <div className="bg-paper border-2 border-ink rounded-md pt-7.5 pr-6.5 pb-[18px] pl-17 relative overflow-hidden max-wide:pt-2 max-wide:pr-3.5 max-wide:pb-3 max-wide:pl-10">
        <span
          aria-hidden="true"
          className="absolute left-[51px] top-0 bottom-0 w-[1.2px] opacity-60 max-wide:left-7"
          style={{ background: "color-mix(in oklab, var(--color-coral) 70%, transparent)" }}
        />
        <Label
          kind="stamp"
          className="absolute left-2 top-7.5 whitespace-nowrap max-wide:hidden"
          style={{ transform: "rotate(-90deg)", transformOrigin: "left top" }}
        >
          ✎ index — {visible.length} of {entries.length}
        </Label>

        <Label
          kind="stamp"
          className="grid gap-3.5 grid-cols-[44px_1fr_90px_90px_96px] pb-3 pl-1.5 mb-1.5 max-wide:hidden"
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
        </Label>

        {visible.length === 0 && (
          <div className="pt-[26px] pb-[22px] px-1.5">
            <p className="text-summary italic text-ink-soft mt-0 mb-[11px]">
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
            <Button
              kind="pill"
              size="sm"
              onClick={() => {
                setFilter("all");
                setTag(null);
                setYear(null);
              }}
            >
              show the whole book
            </Button>
          </div>
        )}

        <ul className="list-none p-0 m-0 page-in-stagger [--page-in-from:120ms]">
          {visible.map((e, i) => (
            /* On the row, not the tab: the phone kind label needs the same
               hue and sits inside the link. */
            <li
              key={e.slug}
              className="relative [transition:background_0.15s] hover:bg-[color-mix(in_oklab,var(--color-paper-2)_60%,transparent)]"
              style={{ ...tabAccent(e.kind), "--i": i } as CSSProperties}
            >
              <Link
                href={`/journal/${e.slug}`}
                className={`grid gap-3.5 grid-cols-[44px_1fr_90px_90px] py-3.5 pr-[110px] pl-1.5 items-baseline no-underline max-wide:grid-cols-[1fr_auto] max-wide:[grid-template-areas:'title_page'_'meta_meta'] max-wide:gap-y-[7px] max-wide:gap-x-[10px] max-wide:pt-[13px] max-wide:px-0 max-wide:pb-3${isArriving ? " anim-rail d-ix-row" : ""}`}
                /* Areas, not reordering: the `page → title → metas` source order stays. */
                /* No aria-label: on a link it replaces the whole subtree, so it
                   was hiding the page number, kind, read time and date from
                   screen readers. The row's own text is the better name. */
              >
                <Label kind="meta" tone="soft" as="span" className="text-right max-wide:[grid-area:page] max-wide:self-baseline max-wide:pt-0 max-wide:text-ink-faint">
                  p.{pad(e.page)}
                </Label>

                <span className="flex items-baseline min-w-0 gap-2 overflow-hidden max-wide:[grid-area:title] max-wide:flex-wrap">
                  <span className="text-[18px] font-semibold leading-[1.4] whitespace-nowrap overflow-hidden text-ellipsis flex-[0_1_auto] text-ink max-wide:whitespace-normal max-wide:text-[17.5px] max-wide:leading-[1.28] max-wide:tracking-[-0.012em] max-wide:flex-[0_1_100%]">
                    {e.title}
                  </span>
                  {/* The case badge provides a non-colour kind signal; mobile uses the tab. */}
                  {e.kind === "case" && (
                    <Label kind="stamp" tone="ink" as="span" className="max-wide:hidden bg-paper-2 border border-ink px-[6px] py-[2px] rounded-[3px] shrink-0">
                      <span aria-hidden="true">★ </span>case study
                    </Label>
                  )}
                  <span
                    aria-hidden="true"
                    className={`flex-1 h-0 min-w-6.5 -translate-y-1 max-wide:hidden${isArriving ? " anim-lead" : ""}`}
                    style={{ borderBottom: "1.5px dotted var(--color-ink-faint)" }}
                  />
                </span>

                {/* `display: contents` above the phone breakpoint, so the ledger
                    grid still owns read and date as its own cells; below it, these
                    collapse into the one meta line under the title. Source order is
                    the desktop column order (read, date); `order` puts the date first
                    on phones. Each item is nowrap: a date breaking after its comma
                    reads as two values. */}
                <span className="contents max-wide:flex max-wide:[grid-area:meta] max-wide:items-center max-wide:flex-wrap max-wide:gap-[7px] max-wide:min-w-0">
                  {/* The ★ badge above is desktop-only; this is its phone
                      equivalent, and it has to read for notes too. */}
                  <span className={`hidden ${META_SEP} max-wide:inline max-wide:order-1 font-mono text-stamp uppercase whitespace-nowrap text-[color:var(--tab-ink)]`}>
                    {e.kind === "case" ? (
                      <>
                        <span aria-hidden="true">★ </span>case
                      </>
                    ) : (
                      "note"
                    )}
                  </span>
                  <span className={`hidden max-wide:inline max-wide:order-2 font-mono text-meta text-ink-soft ${META_SEP}`}>{e.tag}</span>
                  <Label kind="meta" tone="soft" as="span" className="text-right max-wide:order-4 max-wide:text-left max-wide:whitespace-nowrap">
                    {e.read}
                  </Label>
                  <Label kind="meta" tone="soft" as="span" className={`text-right max-wide:order-3 max-wide:text-left max-wide:whitespace-nowrap ${META_SEP}`}>
                    {e.dateDisplay}
                  </Label>
                </span>
              </Link>

              {/* The subject button sits beside the link because nested interactive
                  elements are invalid; absolute positioning preserves one row target. */}
              <button
                type="button"
                className={`${EDGE_TAB} ${
                  tag === e.tag ? EDGE_TAB_ON : EDGE_TAB_OFF
                }${isArriving ? " anim-rail d-ix-row" : ""}`}
                title={tag === e.tag ? `showing ${e.tag}; click to clear` : `filter to ${e.tag}`}
                onClick={() => setTag(tag === e.tag ? null : e.tag)}
              >
                {e.tag}
              </button>
            </li>
          ))}
        </ul>

        <div
          className="flex justify-between items-center gap-[13px] flex-wrap mt-[15px] pt-[13px] max-wide:justify-center max-wide:text-center"
          style={{ borderTop: "1px dashed var(--color-ink-faint)" }}
        >
          <Label kind="meta" as="span">
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
          </Label>
          <span className="text-[15px] italic text-ink-faint max-wide:hidden">
            tap a line to open it · tap a tab to filter ↦
          </span>
        </div>
      </div>

      <div style={{ marginTop: 40, textAlign: "center" }} className="font-mono text-[13px] tracking-[-0.2px] faint">
        — © 2026 Anoopchandra Parampalli · journal —
      </div>
    </main>
  );
}
