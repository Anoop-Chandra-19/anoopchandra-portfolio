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
  /** mono caption under the hero plate */
  heroCaption: string | null;
  /** slugs of related entries */
  related: string[];
};

/** Edge-tab colours for the notebook ledgers (journal index + §05 Notes).
 *
 *  One notebook, one accent. Tags are a taxonomy, not a palette — an earlier
 *  pass gave every tag its own hue, and three entries side by side read as
 *  three different sites. The tab encodes the KIND, never the tag: coral for
 *  case studies, teal for notes. The tag is the text inside it.
 *
 *  Both are mixed toward ink before they're drawn — pure coral is 2.6:1 on
 *  cream and pure teal not much better, which is fine for the border but
 *  illegible for 10px mono sitting on its own tint. */
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
export const tabAccent = (kind: JournalEntryMeta["kind"]): CSSProperties =>
  ({
    "--tab-c": kind === "case" ? "var(--color-coral)" : "var(--color-teal)",
    color:
      kind === "case"
        ? "color-mix(in oklab, var(--color-coral) 58%, var(--color-ink))"
        : "color-mix(in oklab, var(--color-teal) 62%, var(--color-ink))",
  }) as CSSProperties;

export const pad = (n: number) => String(n).padStart(3, "0");
