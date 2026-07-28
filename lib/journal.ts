// Journal content loader — reads content/journal/*.mdx at build time.
// Server-only: uses fs. Client components import types from lib/journal-meta.ts instead.
import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { JournalEntryMeta, Section } from "@/lib/journal-meta";

export type { JournalEntryMeta, Section };
export { pad, tabColors } from "@/lib/journal-meta";

/** Mirrors github-slugger closely enough for our headings: lowercase, strip
 *  anything that isn't a word char/space/hyphen, spaces → hyphens. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export type JournalEntry = JournalEntryMeta & {
  /** raw MDX body (compiled by <MDXRemote> on the article page) */
  body: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content", "journal");
const KINDS = ["case", "note"] as const;
/* The tag is a shelf label, not a taxonomy — one 90px pill on the index, where
   the colour already carries case-vs-note. A closed list keeps it that way:
   left free-form it drifts toward one tag per entry, and the pill stops
   sorting anything. Adding a tag is a deliberate edit here, not a typo. */
const TAGS = ["ai/ml", "backend", "web", "linux", "hardware", "meta"] as const;
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function fail(file: string, msg: string): never {
  throw new Error(`content/journal/${file}: ${msg}`);
}

function displayDate(iso: string, file: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) fail(file, `"date" must be an ISO date (YYYY-MM-DD), got "${iso}"`);
  const month = MONTHS[Number(m[2]) - 1];
  if (!month) fail(file, `"date" has an invalid month: "${iso}"`);
  return `${month} ${m[3]}, ${m[1]}`;
}

function readTime(mdx: string): string {
  const words = mdx
    .replace(/```[\s\S]*?```/g, " code ")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min`;
}

function oneOf<T extends string>(v: unknown, allowed: readonly T[]): v is T {
  return typeof v === "string" && (allowed as readonly string[]).includes(v);
}

function parseEntry(file: string): JournalEntry {
  const slug = file.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
  const { data, content } = matter(raw);

  for (const field of ["title", "kind", "date", "tag", "dek"]) {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      fail(file, `missing required frontmatter field "${field}"`);
    }
  }
  if (!oneOf(data.kind, KINDS)) fail(file, `"kind" must be one of ${KINDS.join(" | ")}`);
  if (!oneOf(data.tag, TAGS)) fail(file, `"tag" must be one of ${TAGS.join(" | ")}`);
  if (data.hero && !data.heroAlt) fail(file, `"heroAlt" is required when "hero" is set`);
  if (data.related !== undefined && !Array.isArray(data.related)) {
    fail(file, `"related" must be a list of slugs`);
  }

  const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date);

  return {
    slug,
    kind: data.kind,
    title: String(data.title),
    date,
    dateDisplay: displayDate(date, file),
    read: readTime(content),
    tag: String(data.tag),
    no: 0,
    page: 0,
    dek: String(data.dek),
    sub: data.sub ? String(data.sub) : null,
    hero: data.hero ? String(data.hero) : null,
    heroAlt: data.heroAlt ? String(data.heroAlt) : null,
    heroCaption: data.heroCaption ? String(data.heroCaption) : null,
    related: (data.related as string[] | undefined)?.map(String) ?? [],
    body: content,
  };
}

/** Page range of the whole notebook, for the index header ("pp. 003 — 051").
 *  Populated by getEntries(); call that first. */
export const BOOK = { first: 3, last: 3 };

let cache: JournalEntry[] | null = null;

/** All entries, sorted newest → oldest. Validated; throws (failing the build) on bad frontmatter. */
export function getEntries(): JournalEntry[] {
  if (cache) return cache;
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .sort();
  const entries = files.map(parseEntry);

  const slugs = new Set(entries.map((e) => e.slug));
  for (const e of entries) {
    for (const r of e.related) {
      if (!slugs.has(r)) fail(`${e.slug}.mdx`, `"related" references unknown slug "${r}"`);
    }
  }

  // One continuous notebook: a page number only ever increases with time.
  // Authored page numbers gave the newest entry the lowest number, which was
  // internally consistent but broke the fiction. `no` (chronological entry
  // number, shown in the ledger) and `page` (the leaf the entry starts on) are
  // DIFFERENT numbers — don't collapse them.
  const chrono = entries.slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  let cursor = 3; // p.001–002 are the cover leaf
  chrono.forEach((e, i) => {
    e.no = i + 1;
    e.page = cursor;
    cursor += Math.max(2, Math.round(parseInt(e.read, 10) / 2));
  });
  BOOK.first = 3;
  BOOK.last = cursor - 1;

  entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  cache = entries;
  return entries;
}

function toMeta(entry: JournalEntry): JournalEntryMeta {
  const { body, ...meta } = entry;
  void body;
  return meta;
}

export function getEntryMetas(): JournalEntryMeta[] {
  return getEntries().map(toMeta);
}

export function getEntryBySlug(slug: string): JournalEntry | undefined {
  return getEntries().find((e) => e.slug === slug);
}

export function getNotes(): JournalEntryMeta[] {
  return getEntryMetas().filter((e) => e.kind === "note");
}

export function getCaseStudies(): JournalEntryMeta[] {
  return getEntryMetas().filter((e) => e.kind === "case");
}

/** prev = next-newer entry, next = next-older entry (index order). */
export function getAdjacent(slug: string): {
  prev: JournalEntryMeta | null;
  next: JournalEntryMeta | null;
} {
  const entries = getEntryMetas();
  const i = entries.findIndex((e) => e.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return { prev: entries[i - 1] ?? null, next: entries[i + 1] ?? null };
}

export function getRelated(meta: JournalEntryMeta): JournalEntryMeta[] {
  const entries = getEntryMetas();
  return meta.related
    .map((slug) => entries.find((e) => e.slug === slug))
    .filter((e): e is JournalEntryMeta => Boolean(e));
}

/** `##` headings of an entry, for the § rail. Slugs match what rehype-slug
 *  stamps on the rendered <h2 id>, so the rail's anchors resolve without any
 *  client-side DOM scraping. */
export function getSections(entry: JournalEntry): Section[] {
  const out: Section[] = [];
  const re = /^##\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(entry.body))) {
    const title = m[1].trim();
    out.push({ n: out.length + 1, id: slugify(title), title });
  }
  return out;
}
