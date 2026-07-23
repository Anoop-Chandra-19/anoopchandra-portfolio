// Journal content loader — reads content/journal/*.mdx at build time.
// Server-only: uses fs. Client components import types from lib/journal-meta.ts instead.
import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { JournalEntryMeta, TagColor } from "@/lib/journal-meta";

export type { JournalEntryMeta, TagColor };
export { pad, tagColor } from "@/lib/journal-meta";

export type JournalEntry = JournalEntryMeta & {
  /** raw MDX body (compiled by <MDXRemote> on the article page) */
  body: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content", "journal");
const KINDS = ["case", "note"] as const;
const COLORS = ["electric", "coral", "teal", "navy"] as const;
const STATUSES = ["published", "draft"] as const;
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

  for (const field of ["title", "kind", "date", "tag", "page", "dek"]) {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      fail(file, `missing required frontmatter field "${field}"`);
    }
  }
  if (!oneOf(data.kind, KINDS)) fail(file, `"kind" must be one of ${KINDS.join(" | ")}`);
  if (data.color !== undefined && !oneOf(data.color, COLORS)) {
    fail(file, `"color" must be one of ${COLORS.join(" | ")}`);
  }
  if (data.status !== undefined && !oneOf(data.status, STATUSES)) {
    fail(file, `"status" must be one of ${STATUSES.join(" | ")}`);
  }
  if (typeof data.page !== "number" || !Number.isInteger(data.page) || data.page < 1) {
    fail(file, `"page" must be a positive integer, got ${JSON.stringify(data.page)}`);
  }
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
    color: (data.color as TagColor | undefined) ?? null,
    page: data.page,
    dek: String(data.dek),
    sub: data.sub ? String(data.sub) : null,
    hero: data.hero ? String(data.hero) : null,
    heroAlt: data.heroAlt ? String(data.heroAlt) : null,
    heroCaption: data.heroCaption ? String(data.heroCaption) : null,
    status: (data.status as "published" | "draft" | undefined) ?? "published",
    related: (data.related as string[] | undefined)?.map(String) ?? [],
    body: content,
  };
}

let cache: JournalEntry[] | null = null;

/** All entries, sorted newest → oldest. Validated; throws (failing the build) on bad frontmatter. */
export function getEntries(): JournalEntry[] {
  if (cache) return cache;
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .sort();
  const entries = files.map(parseEntry);

  const pages = new Map<number, string>();
  for (const e of entries) {
    const dupe = pages.get(e.page);
    if (dupe) fail(`${e.slug}.mdx`, `page ${e.page} is already used by ${dupe}.mdx`);
    pages.set(e.page, e.slug);
  }
  const slugs = new Set(entries.map((e) => e.slug));
  for (const e of entries) {
    for (const r of e.related) {
      if (!slugs.has(r)) fail(`${e.slug}.mdx`, `"related" references unknown slug "${r}"`);
    }
  }

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
