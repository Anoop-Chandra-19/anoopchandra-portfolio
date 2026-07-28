// Replaces ArticleSpread. Server component — renders the masthead, the hero
// plate, the MDX body, and prev/next. No JS except the tiny <ReadingProgress/>
// client component.
import Link from "next/link";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeMdxCodeProps from "rehype-mdx-code-props";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import type { JournalEntry, JournalEntryMeta, Section } from "@/lib/journal";
import { pad } from "@/lib/journal-meta";
import { mdxComponents } from "@/components/journal/mdx-components";
import ReadingProgress from "@/components/journal/ReadingProgress";
import SectionRail from "@/components/journal/SectionRail";

const AUTHOR = "Anoopchandra Parampalli";

export default function ArticleEntry({
  entry,
  prev,
  next,
  sections,
  related,
}: {
  entry: JournalEntry;
  prev: JournalEntryMeta | null;
  next: JournalEntryMeta | null;
  sections: Section[];
  related: JournalEntryMeta[];
}) {
  return (
    <div className="je">
      <ReadingProgress />
      <div className="je-inner">
        <nav className="je-top">
          <Link className="je-back" href="/journal">← back to index</Link>
          <span className="je-topmeta">the journal · vol. 02 · p.{pad(entry.page)}</span>
        </nav>

        <header className="je-mast">
          {/* Neither the kind nor the tag appears here. You arrived from a
              coloured tab that already said which bucket this is, so the pill
              row is only what the index couldn't tell you: when, and how long. */}
          <div className="je-ledger">
            <span>entry № {pad(entry.no)}</span>
            <span className="dash" /><span>the journal · vol. 02</span>
          </div>
          <div className="je-chips">
            <span className="je-chip">{entry.dateDisplay}</span>
            <span className="je-chip">{entry.read} read</span>
          </div>
          <h1 className="je-title">{entry.title}</h1>
          <p className="je-dek">{entry.dek}</p>
          <div className="je-byline">
            <span className="je-dot" aria-hidden="true" />
            <b>{AUTHOR}</b>
            {entry.sub && <span className="je-bsub">{entry.sub}</span>}
            <span className="je-grow" />
          </div>
        </header>

        {entry.hero && (
          <figure className="je-plate je-hero">
            <span className="je-tape" aria-hidden="true" />
            {/* hero is plate 000; inline <Figure> plates auto-count from 001 */}
            <span className="je-plate-tab">plate 000</span>
            <Image
              src={entry.hero}
              alt={entry.heroAlt ?? entry.title}
              width={1100}
              height={620}
              priority
            />
            {entry.heroCaption && <figcaption>{entry.heroCaption}</figcaption>}
          </figure>
        )}

        <article className="je-body">
          <span className="je-rule" aria-hidden="true" />
          <SectionRail sections={sections} />
          <MDXRemote
            source={entry.body}
            components={mdxComponents}
            options={{
              mdxOptions: {
                // gfm for native [^1] footnotes; slug so the § rail's anchors
                // resolve against the same ids lib/journal.ts derived
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeSlug, rehypeMdxCodeProps],
              },
            }}
          />
          <div className="je-end">
            <span>— end of entry —</span>
            <span>p.{pad(entry.page)}</span>
          </div>
        </article>

        <footer className="je-foot">
          {related.length > 0 && (
            <>
              <div className="je-alsolbl">also in this notebook</div>
              <div className="je-also">
                {related.map((r) => (
                  <Link key={r.slug} className="je-chip" href={`/journal/${r.slug}`}>
                    {r.title} · p.{pad(r.page)}
                  </Link>
                ))}
              </div>
            </>
          )}
          <div className="je-navlbl">keep reading ↦</div>
          <div className="je-nav">
            {prev ? (
              <Link className="je-navcard" href={`/journal/${prev.slug}`}>
                <div className="d">← newer entry</div>
                <div className="t">{prev.title}</div>
                <div className="m">p.{pad(prev.page)} · {prev.read} · #{prev.tag}</div>
              </Link>
            ) : (
              // the 2-up grid keeps both cells so the remaining card doesn't
              // drift to one side — the empty end is a dashed, inert card
              <span className="je-navcard is-off" aria-hidden="true">
                <span className="d">← newer entry</span>
                <span className="t">— end of the book —</span>
              </span>
            )}
            {next ? (
              <Link className="je-navcard older" href={`/journal/${next.slug}`}>
                <div className="d">older entry →</div>
                <div className="t">{next.title}</div>
                <div className="m">p.{pad(next.page)} · {next.read} · #{next.tag}</div>
              </Link>
            ) : (
              <span className="je-navcard older is-off" aria-hidden="true">
                <span className="d">older entry →</span>
                <span className="t">— start of the book —</span>
              </span>
            )}
          </div>
          <div className="je-colophon">✦ © 2026 {AUTHOR} · journal · typeset by hand ✦</div>
        </footer>
      </div>
    </div>
  );
}
