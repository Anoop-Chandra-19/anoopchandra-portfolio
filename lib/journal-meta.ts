// Serializable journal metadata + display helpers.
// Safe to import from client components — the fs-backed loader lives in lib/journal.ts.


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
  /** hand-picked notebook page number (unique across entries) */
  page: number;
  dek: string;
  sub: string | null;
  hero: string | null;
  heroAlt: string | null;
  /** mono caption under the hero plate */
  heroCaption: string | null;
  status: "published" | "draft";
  /** slugs of related entries */
  related: string[];
};

/** Edge-tab colours for the notebook ledgers (journal index + §05 Notes).
 *
 *  One notebook, one accent. Tags are a taxonomy, not a palette — an earlier
 *  pass gave every tag its own hue, and three entries side by side read as
 *  three different sites. Tabs are ink; only case studies take the accent, so
 *  the thing worth spotting in a list of eleven entries is the only thing
 *  coloured. Do not colour-code tags. */
export const tabColors = (kind: JournalEntryMeta["kind"]) =>
  kind === "case"
    ? {
        background: "color-mix(in oklab, var(--color-coral) 18%, var(--color-paper))",
        borderColor: "var(--color-coral)",
        /* 58% toward ink: pure coral is 2.6:1 on cream — fine as a border,
           illegible as 9–10px mono sitting on its own tint. */
        color: "color-mix(in oklab, var(--color-coral) 58%, var(--color-ink))",
      }
    : {
        background: "var(--color-paper-2)",
        borderColor: "color-mix(in oklab, var(--color-ink) 40%, transparent)",
        color: "var(--color-ink-soft)",
      };

export const pad = (n: number) => String(n).padStart(3, "0");
