import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeMdxCodeProps from "rehype-mdx-code-props";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import type { JournalEntry, JournalEntryMeta, Section } from "@/lib/journal";
import { pad } from "@/lib/journal-meta";
import { Plate, mdxComponents } from "@/components/journal/mdx-components";
import FootnoteSheet from "@/components/journal/FootnoteSheet";
import ReadingProgress from "@/components/journal/ReadingProgress";
import SectionRail from "@/components/journal/SectionRail";
import BackLink from "@/components/ui/BackLink";
import Label from "@/components/ui/Label";
import Pill from "@/components/ui/Pill";
import { imageDims } from "@/lib/image-dims";

const AUTHOR = "Anoopchandra Parampalli";

const NAVCARD =
  "border-[1.5px] border-ink rounded-lg py-[18px] px-5 no-underline text-ink bg-paper [transition:background_.15s,transform_.15s] hover:bg-paper-2 hover:[transform:translateY(-3px)]";
const NAVCARD_OFF = "block opacity-45 border-dashed pointer-events-none";

function NavCardText({ dir, title, meta }: { dir: string; title: string; meta?: string }) {
  return (
    <>
      <span className="block font-mono text-tag uppercase text-ink-faint">{dir}</span>
      <span className="block mt-2 font-display font-semibold text-[25px] leading-[1.08]">{title}</span>
      {meta && <span className="block mt-[9px] font-mono text-meta text-ink-faint">{meta}</span>}
    </>
  );
}

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
  const hero = entry.hero ? imageDims(entry.hero) : null;
  return (
    <main
      id="main-content"
      // The article's layout variables: rail and gutter widths, the reading
      // measure, the margin-note column. Use --accent-ink for small text; pure
      // --accent is reserved for graphics.
      className="font-display text-ink [--accent:var(--color-coral)] [--accent-ink:var(--color-coral-ink)] [--je-measure:640px] [--col:640px] [--rail:132px] [--colgap:30px] [--side-w:330px] [--side-gap:34px] max-[1300px]:[--je-measure:600px] max-[1300px]:[--col:600px] max-[1300px]:[--side-w:288px] max-[1300px]:[--side-gap:26px] max-mid:[--rail:104px] max-mid:[--colgap:22px] max-nav:[--rail:26px] max-nav:[--colgap:14px] max-wide:[--rail:14px] max-wide:[--colgap:20px]"
    >
      <ReadingProgress />
      {/* Delegated over the whole entry — the [^N] refs are MDX output, so there
          is no React element for them to hang an onClick on. */}
      <FootnoteSheet />
      <div className="relative w-[1280px] max-w-full mx-auto pt-11 px-10 pb-25 max-mid:w-full max-mid:pt-8 max-mid:px-6.5 max-mid:pb-20 max-wide:pt-6 max-wide:px-[18px] max-wide:pb-18">
        <nav className="flex items-center justify-between flex-wrap gap-2.5 pb-4 mb-9.5 border-b-[1.5px] border-dashed border-ink-faint">
          <BackLink href="/journal">← back to journal</BackLink>
          <Label kind="eyebrow" as="span">
            the journal · vol. 02 · p.{pad(entry.page)}
          </Label>
        </nav>

        <header className="max-w-[860px] mb-9">
          {/* Kind and tag are intentionally omitted; the index already supplies them. */}
          <div className="flex items-center gap-3 py-2 mb-[22px] border-t-2 border-b border-ink font-mono text-tag uppercase text-ink-faint max-wide:gap-[9px] max-wide:text-stamp">
            <span>entry № {pad(entry.no)}</span>
            <span className="flex-[0_0_auto] w-4 h-px bg-ink-faint" /><span>the journal · vol. 02</span>
          </div>
          <div className="flex items-center flex-wrap gap-[9px] mb-[18px]">
            <Pill kind="tag">{entry.dateDisplay}</Pill>
            <Pill kind="tag">{entry.read} read</Pill>
          </div>
          <h1 className="m-0 mb-[18px] font-display font-semibold text-display text-ink text-balance">{entry.title}</h1>
          <p className="m-0 mb-6 max-w-[680px] font-display italic text-dek text-ink-soft text-pretty">{entry.dek}</p>
          <div className="flex items-center gap-[11px] py-[13px] border-y border-ink-faint font-mono text-meta text-ink-faint">
            <span
              className="flex-[0_0_auto] size-[22px] rounded-full border-[1.5px] border-ink bg-[repeating-linear-gradient(45deg,transparent_0_3px,rgba(0,0,0,.09)_3px_4px)]"
              aria-hidden="true"
            />
            <b className="font-medium text-ink">{AUTHOR}</b>
            {entry.sub && <span className="text-ink-soft">{entry.sub}</span>}
            <span className="flex-1" />
          </div>
        </header>

        {entry.hero && hero && (
          <Plate
            hero
            src={entry.hero}
            alt={entry.heroAlt ?? entry.title}
            caption={entry.heroCaption}
            zoomCaption={entry.heroCaption ?? entry.title}
            width={hero.w}
            height={hero.h}
          />
        )}

        <article className="relative w-full max-w-[min(100%,calc(var(--rail)+var(--colgap)+var(--col)))] pl-[calc(var(--rail)+var(--colgap))] [counter-reset:sec_plate]">
          <span
            className="absolute left-(--rail) -top-1 bottom-15 w-[1.4px] bg-[color-mix(in_oklab,var(--accent)_72%,transparent)] opacity-65"
            aria-hidden="true"
          />
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
          <div className="flex justify-between clear-right max-w-(--je-measure) max-mid:max-w-full mt-8.5 pt-3.5 border-t border-dashed border-ink-faint font-mono text-meta text-ink-faint">
            <span>— end of entry —</span>
            <span>p.{pad(entry.page)}</span>
          </div>
        </article>

        <footer className="mt-13 pt-6 border-t-2 border-ink">
          {related.length > 0 && (
            <>
              <Label kind="stamp" className="mb-[9px]">also in this notebook</Label>
              <div className="flex flex-wrap gap-2 mb-6.5">
                {related.map((r) => (
                  <Pill key={r.slug} kind="tag" href={`/journal/${r.slug}`}>
                    {r.title} · p.{pad(r.page)}
                  </Pill>
                ))}
              </div>
            </>
          )}
          <div className="mb-3.5 font-accent font-semibold text-[22px] text-ink-faint">keep reading ↦</div>
          <div className="grid grid-cols-2 gap-4 max-wide:grid-cols-1">
            {prev ? (
              <Link className={NAVCARD} href={`/journal/${prev.slug}`}>
                <NavCardText dir="← newer entry" title={prev.title} meta={`p.${pad(prev.page)} · ${prev.read} · #${prev.tag}`} />
              </Link>
            ) : (
              // the 2-up grid keeps both cells so the remaining card doesn't
              // drift to one side — the empty end is a dashed, inert card
              <span className={`${NAVCARD} ${NAVCARD_OFF}`} aria-hidden="true">
                <NavCardText dir="← newer entry" title="— end of the book —" />
              </span>
            )}
            {next ? (
              <Link className={`${NAVCARD} text-right max-wide:text-left`} href={`/journal/${next.slug}`}>
                <NavCardText dir="older entry →" title={next.title} meta={`p.${pad(next.page)} · ${next.read} · #${next.tag}`} />
              </Link>
            ) : (
              <span className={`${NAVCARD} ${NAVCARD_OFF} text-right max-wide:text-left`} aria-hidden="true">
                <NavCardText dir="older entry →" title="— start of the book —" />
              </span>
            )}
          </div>
          <div className="mt-8.5 font-mono text-caption text-ink-faint text-center">
            ✦ © 2026 {AUTHOR} · journal ✦
          </div>
        </footer>
      </div>
    </main>
  );
}
