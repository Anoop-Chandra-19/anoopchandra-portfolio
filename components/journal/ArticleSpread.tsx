import Link from "next/link";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { JournalEntry, JournalEntryMeta } from "@/lib/journal";
import { pad, tagColor } from "@/lib/journal-meta";
import { mdxComponents } from "@/components/journal/mdx-components";

function AdjacentCard({
  entry,
  dir,
}: {
  entry: JournalEntryMeta | null;
  dir: "newer" | "older";
}) {
  const label = dir === "newer" ? "← newer" : "older →";
  const inner = (
    <div
      className={`border-[1.5px] border-ink rounded-[5px] py-2.5 px-3 ${
        dir === "older" ? "text-right" : ""
      } ${entry ? "" : "opacity-45 border-dashed"}`}
    >
      <div className="mono faint text-[9px] tracking-[2px] uppercase">{label}</div>
      <div className="hand text-lg leading-[1.1] mt-1 text-ink">{entry ? entry.title : "—"}</div>
    </div>
  );
  if (!entry) return inner;
  return (
    <Link href={`/journal/${entry.slug}`} className="no-underline">
      {inner}
    </Link>
  );
}

export default function ArticleSpread({
  entry,
  related,
  prev,
  next,
}: {
  entry: JournalEntry;
  related: JournalEntryMeta[];
  prev: JournalEntryMeta | null;
  next: JournalEntryMeta | null;
}) {
  const c = tagColor(entry.color);
  const kindLabel = entry.kind === "case" ? "case study" : "note";

  return (
    <div className="page">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-[22px]">
        <Link
          href="/journal"
          className="mono inline-flex items-center gap-1.5 text-xs tracking-[1px] py-[5px] px-3 border-[1.5px] border-ink rounded-full bg-paper no-underline text-ink"
        >
          ← back to index
        </Link>
        <div className="mono faint text-[11px] tracking-[2px] uppercase">
          {kindLabel} · p.{pad(entry.page)}
        </div>
      </div>

      {/* Hero strip (case studies only) */}
      {entry.hero && entry.kind === "case" && (
        <div className="sketch-box p-0 overflow-hidden mb-7 relative">
          <div className="bg-paper-2 min-h-[280px] flex items-center justify-center p-6">
            <Image
              src={entry.hero}
              alt={entry.heroAlt ?? entry.title}
              width={1100}
              height={320}
              className="w-full h-auto max-h-[320px] object-contain rounded"
              priority
            />
          </div>
          <div
            className="mono absolute top-4 right-[18px] bg-paper text-[10px] tracking-[2px] uppercase py-[3px] px-2 rounded-[3px]"
            style={{ border: `1.5px solid ${c}`, color: c, transform: "rotate(-3deg)" }}
          >
            ★ shipped
          </div>
        </div>
      )}

      {/* The spread: left page = article, right page = margin meta */}
      <article className="journal-spread sketch-box p-0 overflow-hidden relative">
        <span aria-hidden="true" className="journal-binding" />

        {/* LEFT PAGE */}
        <div className="journal-spread-left relative">
          <span
            aria-hidden="true"
            className="journal-spread-rule absolute top-0 bottom-0 w-[1.2px] opacity-60"
            style={{ background: "color-mix(in oklab, var(--color-coral) 70%, transparent)" }}
          />
          <div
            className="mono faint journal-spread-label absolute text-[9px] tracking-[3px] uppercase whitespace-nowrap max-w-[400px] overflow-hidden text-ellipsis"
            style={{ transform: "rotate(-90deg)", transformOrigin: "left top" }}
          >
            ✎ {entry.tag} — {entry.dateDisplay}
          </div>

          <div className="mono faint text-[11px] tracking-[2px] uppercase mb-2">
            {entry.dateDisplay} · {entry.read} · {entry.tag}
          </div>
          <h2 className="journal-title leading-[1.02] mb-3.5 text-ink">{entry.title}</h2>
          {entry.sub && (
            <div className="hand text-[22px] mb-[18px]" style={{ color: c }}>
              @ {entry.sub}
            </div>
          )}
          <p className="hand text-2xl leading-[1.3] text-ink-soft mb-[22px]">{entry.dek}</p>

          <div className="journal-body max-w-[620px]">
            <MDXRemote source={entry.body} components={mdxComponents} />
          </div>

          <div
            className="mono faint mt-[30px] pt-3 flex justify-between text-[11px]"
            style={{ borderTop: "1px dashed var(--color-ink-faint)" }}
          >
            <span>— end of entry —</span>
            <span>p.{pad(entry.page)}</span>
          </div>
        </div>

        {/* RIGHT PAGE */}
        <div className="journal-spread-right flex flex-col">
          <div className="mono faint text-[9px] tracking-[3px] uppercase mb-3">✎ margin notes</div>

          <div className="border-[1.5px] border-dashed border-ink rounded p-4 mb-5 bg-paper">
            <div className="mono text-[11px] leading-[1.9]">
              <div>
                <span className="faint">type</span>&nbsp;&nbsp;·&nbsp;&nbsp;{kindLabel}
              </div>
              <div>
                <span className="faint">tag</span>&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;
                <span style={{ color: c }}>{entry.tag}</span>
              </div>
              <div>
                <span className="faint">date</span>&nbsp;&nbsp;·&nbsp;&nbsp;{entry.dateDisplay}
              </div>
              <div>
                <span className="faint">read</span>&nbsp;&nbsp;·&nbsp;&nbsp;{entry.read}
              </div>
              <div>
                <span className="faint">page</span>&nbsp;&nbsp;·&nbsp;&nbsp;{pad(entry.page)}
              </div>
            </div>
          </div>

          <div
            className="mono inline-block self-start text-[10px] tracking-[2px] uppercase py-1 px-2.5 rounded-[3px] mb-[22px]"
            style={{ border: `1.5px solid ${c}`, color: c, transform: "rotate(-3deg)" }}
          >
            {entry.status === "published" ? "typeset · published" : "draft · in progress"}
          </div>

          {related.length > 0 && (
            <div className="mb-5">
              <div className="mono faint text-[9px] tracking-[3px] uppercase mb-2.5">
                also in this notebook
              </div>
              <ul className="list-none p-0 m-0">
                {related.map((r) => (
                  <li key={r.slug} className="mb-2">
                    <Link href={`/journal/${r.slug}`} className="no-underline">
                      <span
                        className="hand text-xl text-ink"
                        style={{ borderBottom: "1.5px dotted var(--color-ink-soft)" }}
                      >
                        {r.title}
                      </span>
                    </Link>
                    <div className="mono faint text-[10px] mt-0.5">
                      p.{pad(r.page)} · {r.read}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex-1" />

          <div
            className="grid grid-cols-2 gap-3 pt-4 mt-4"
            style={{ borderTop: "1.5px dashed var(--color-ink-faint)" }}
          >
            <AdjacentCard entry={prev} dir="newer" />
            <AdjacentCard entry={next} dir="older" />
          </div>
        </div>
      </article>
    </div>
  );
}
