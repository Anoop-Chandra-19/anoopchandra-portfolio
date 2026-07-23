// Serializable journal metadata + display helpers.
// Safe to import from client components — the fs-backed loader lives in lib/journal.ts.

export type TagColor = "electric" | "coral" | "teal" | "navy";

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
  color: TagColor | null;
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

export const tagColor = (c: TagColor | null) =>
  c ? `var(--color-${c})` : "var(--color-ink-soft)";

export const pad = (n: number) => String(n).padStart(3, "0");
