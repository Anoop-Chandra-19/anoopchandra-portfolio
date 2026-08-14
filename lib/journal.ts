// Journal content loader — reads content/journal/*.mdx at build time.
// Server-only: uses fs. Client components import types from lib/journal-meta.ts instead.
import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { TAGS, type JournalEntryMeta, type Section } from "@/lib/journal-meta";

export type { JournalEntryMeta, Section };
export { pad, tabColors } from "@/lib/journal-meta";

/** Mirrors github-slugger, which is what rehype-slug stamps on <h2 id>: lowercase,
 *  strip anything that isn't a word char/space/hyphen, spaces → hyphens.
 *
 *  One space per hyphen, NOT `\s+` — github-slugger substitutes each space
 *  individually, so "Notes — on eval" keeps the two spaces the stripped em dash
 *  left behind and slugs to `notes--on-eval` with a double hyphen. Collapsing
 *  the run here produces an id that exists nowhere in the DOM: every rail link
 *  for a heading with punctuation in it goes dead, and the scroll-spy freezes on
 *  the last section it can still resolve. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s/g, "-");
}

export type JournalEntry = JournalEntryMeta & {
  /** raw MDX body (compiled by <MDXRemote> on the article page) */
  body: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content", "journal");
const KINDS = ["case", "note"] as const;
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function fail(file: string, msg: string): never {
  throw new Error(`content/journal/${file}: ${msg}`);
}

function displayDate(iso: string, file: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) fail(file, `"date" must be an ISO date (YYYY-MM-DD), got "${iso}"`);
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  // Shape alone is not validity: 2026-02-31 matches the pattern and would render
  // as "feb 31, 2026". UTC round-trip, because Date overflows rather than
  // rejecting — Feb 31 comes back as Mar 3 and no longer matches what was typed.
  const asDate = new Date(Date.UTC(y, mo - 1, d));
  if (
    asDate.getUTCFullYear() !== y ||
    asDate.getUTCMonth() !== mo - 1 ||
    asDate.getUTCDate() !== d
  ) {
    fail(file, `"date" is not a real calendar date: "${iso}"`);
  }
  return `${MONTHS[mo - 1]} ${m[3]}, ${m[1]}`;
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
  const { data, content, matter: frontmatter } = matter(raw);

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

  // An unquoted `date:` is resolved by YAML into a Date before it ever reaches
  // here, and Date overflows instead of rejecting: 2026-02-31 arrives already
  // rewritten to 2026-03-03 and renders as a real but wrong day. displayDate
  // cannot catch that — by then the evidence is gone — so compare against what
  // was actually typed. A quoted date stays a string and displayDate rejects it.
  const authored = /^\s*date:\s*["']?(\d{4}-\d{2}-\d{2})["']?\s*$/m.exec(frontmatter)?.[1];
  if (authored && authored !== date) {
    fail(file, `"date" is not a real calendar date: "${authored}" (YAML read it as ${date})`);
  }

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
  // github-slugger suffixes a repeat with -1, -2, … and rehype-slug stamps that
  // onto the DOM, so two headings with the same words have to be counted here
  // too or the second one's rail link points at the first one's heading.
  const seen = new Map<string, number>();
  // Scanned line by line with fence tracking rather than by one global regex.
  // A `##` line inside a fenced block is code: the MDX pipeline stamps no id for
  // it, so counting it here invents a rail link pointing at an anchor that
  // exists nowhere in the DOM — and shifts the -1/-2 suffix of every repeated
  // heading after it.
  let fence: string | null = null;
  for (const raw of entry.body.split("\n")) {
    const line = raw.replace(/\r$/, "");
    // Up to three leading spaces still opens a fence; a fourth makes it an
    // indented code block, which cannot contain a heading either way.
    const f = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (f) {
      const marker = f[1][0];
      if (!fence) fence = marker;
      else if (marker === fence) fence = null;
      continue;
    }
    if (fence) continue;
    const m = /^##\s+(.+)$/.exec(line);
    if (!m) continue;
    // CommonMark treats a trailing run of #s as a closing marker and drops it,
    // so it must not reach the slug or the rail link misses the real heading.
    const title = m[1].replace(/\s+#+\s*$/, "").trim();
    if (!title) continue;
    const base = slugify(title);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    out.push({ n: out.length + 1, id: n ? `${base}-${n}` : base, title });
  }
  return out;
}
