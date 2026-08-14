// Serializable journal metadata + display helpers.
// Safe to import from client components — the fs-backed loader lives in lib/journal.ts.
import type { CSSProperties } from "react";


/** A `##` heading in an entry, for the § rail. */
export type Section = { n: number; id: string; title: string };

export type JournalEntryMeta = {
  slug: string;
  kind: "case" | "note";
  title: string;
  /** ISO date from frontmatter, e.g. "2026-04-24" */
  date: string;
  /** notebook-style display date, e.g. "apr 24, 2026" */
  dateDisplay: string;
  /** auto-computed read time, e.g. "5 min" */
  read: string;
  tag: string;
  /** chronological entry number, shown in the ledger ("entry № 011") */
  no: number;
  /** the leaf this entry starts on — derived, never authored. Different from
   *  `no`: one continuous notebook where a page only increases with time. */
  page: number;
  dek: string;
  sub: string | null;
  hero: string | null;
  heroAlt: string | null;
  heroCaption: string | null;
  /** slugs of related entries */
  related: string[];
};

/* The tag is a shelf label, not a taxonomy — one 90px pill on the index, where
   the colour already carries case-vs-note. A closed list keeps it that way:
   left free-form it drifts toward one tag per entry, and the pill stops
   sorting anything. Adding a tag is a deliberate edit here, not a typo. */
export const TAGS = ["ai/ml", "backend", "web", "linux", "hardware", "meta"] as const;

export type Filter = "all" | "case" | "note";
export type JournalQuery = { filter: Filter; tag: string | null; year: string | null };

/** The index list and the filter sheet's result count must never disagree, so
 *  both go through this rather than each filtering for themselves. */
export const matchesEntry = (e: JournalEntryMeta, q: JournalQuery) =>
  (q.filter === "all" || e.kind === q.filter) &&
  (!q.tag || e.tag === q.tag) &&
  (!q.year || e.date.startsWith(`${q.year}-`));

const HOME_JOURNAL_ENTRY_LIMIT = 5;

/** The newest entries shown in the compact home-page index. The loader already
 * sorts metadata newest-first, so preserve the supplied order. */
export function selectHomeJournalEntries(entries: JournalEntryMeta[]): JournalEntryMeta[] {
  return entries.slice(0, HOME_JOURNAL_ENTRY_LIMIT);
}

/** Edge tabs encode kind, never tag: coral for cases and teal for notes.
 *  Text colours mix toward ink because the pure accents lack sufficient
 *  contrast at 10px. */
export const tabColors = (kind: JournalEntryMeta["kind"]) =>
  kind === "case"
    ? {
        background: "color-mix(in oklab, var(--color-coral) 15%, var(--color-paper))",
        borderColor: "var(--color-coral)",
        color: "color-mix(in oklab, var(--color-coral) 58%, var(--color-ink))",
      }
    : {
        background: "color-mix(in oklab, var(--color-teal) 15%, var(--color-paper))",
        borderColor: "var(--color-teal)",
        color: "color-mix(in oklab, var(--color-teal) 62%, var(--color-ink))",
      };

/** Same palette as `tabColors`, split for the /journal index, where the tab is
 *  a filter button: only the hue and the small-text colour are per-row: the
 *  tint DEPTH is a state (rest 15% / hover 34%), so `.journal-edge-tab`
 *  composes the background itself from `--tab-c` rather than being handed a
 *  finished colour. §05's tabs are static and keep `tabColors`. */
/* This rides on the row `<li>`, not the tab, because the phone kind label needs
   the same hue. Hence `--tab-ink` rather than `color`: a bare colour would
   inherit into the title and meta line. Consumers opt in explicitly. */
export const tabAccent = (kind: JournalEntryMeta["kind"]): CSSProperties =>
  ({
    "--tab-c": kind === "case" ? "var(--color-coral)" : "var(--color-teal)",
    "--tab-ink":
      kind === "case"
        ? "color-mix(in oklab, var(--color-coral) 58%, var(--color-ink))"
        : "color-mix(in oklab, var(--color-teal) 62%, var(--color-ink))",
  }) as CSSProperties;

export const pad = (n: number) => String(n).padStart(3, "0");
