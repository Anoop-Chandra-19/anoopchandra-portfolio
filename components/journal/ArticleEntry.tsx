// Replaces ArticleSpread. Server component — renders the masthead, the hero
// plate, the MDX body, and prev/next. No JS except the tiny <ReadingProgress/>
// client component.
import Link from "next/link";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeMdxCodeProps from "rehype-mdx-code-props";
import type { JournalEntry, JournalEntryMeta } from "@/lib/journal";
import { pad } from "@/lib/journal-meta";
import { mdxComponents } from "@/components/journal/mdx-components";
import ReadingProgress from "@/components/journal/ReadingProgress";

const AUTHOR = "Anoopchandra Parampalli";

export default function ArticleEntry({
  entry,
  prev,
  next,
}: {
  entry: JournalEntry;
  prev: JournalEntryMeta | null;
  next: JournalEntryMeta | null;
}) {
  const kindLabel = entry.kind === "case" ? "case study" : "note";

  return (
    <div className="je">
      <ReadingProgress />
      <div className="je-inner">
        <nav className="je-top">
          <Link className="je-back" href="/journal">← back to index</Link>
          <span className="je-topmeta">the journal · vol. 02 · p.{pad(entry.page)}</span>
        </nav>

        <header className="je-mast">
          <div className="je-ledger">
            <span>entry № {pad(entry.page)}</span>
            <span className="dash" /><span>{entry.tag}</span>
            <span className="dash" /><span>the journal · vol. 02</span>
          </div>
          <div className="je-chips">
            <span className="je-chip is-kind">{kindLabel}</span>
            <span className="je-chip">{entry.dateDisplay}</span>
            <span className="je-chip">{entry.read}</span>
            {entry.status === "published" && <span className="je-stamp">★ shipped</span>}
          </div>
          <h1 className="je-title">{entry.title}</h1>
          <p className="je-dek">{entry.dek}</p>
          <div className="je-byline">
            <span className="je-dot" aria-hidden="true" />
            <b>{AUTHOR}</b>
            {entry.sub && <span className="je-bsub">{entry.sub}</span>}
            <span className="je-grow" />
            <span className="je-htag">#{entry.tag}</span>
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
          <MDXRemote
            source={entry.body}
            components={mdxComponents}
            options={{ mdxOptions: { rehypePlugins: [rehypeMdxCodeProps] } }}
          />
          <div className="je-end">
            <span>— end of entry —</span>
            <span>p.{pad(entry.page)}</span>
          </div>
        </article>

        <footer className="je-foot">
          <div className="je-navlbl">keep reading ↦</div>
          <div className="je-nav">
            {prev ? (
              <Link className="je-navcard" href={`/journal/${prev.slug}`}>
                <div className="d">← newer entry</div>
                <div className="t">{prev.title}</div>
                <div className="m">p.{pad(prev.page)} · {prev.read} · #{prev.tag}</div>
              </Link>
            ) : <span />}
            {next ? (
              <Link className="je-navcard older" href={`/journal/${next.slug}`}>
                <div className="d">older entry →</div>
                <div className="t">{next.title}</div>
                <div className="m">p.{pad(next.page)} · {next.read} · #{next.tag}</div>
              </Link>
            ) : <span />}
          </div>
          <div className="je-colophon">✦ © 2026 {AUTHOR} · journal · typeset by hand ✦</div>
        </footer>
      </div>
    </div>
  );
}
