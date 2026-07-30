// Maps MDX → the "Annotated Manuscript" entry blocks. Every component here
// renders on the server (next-mdx-remote/rsc); the interactive bits are
// client leaves it mounts, never this module. Section numbers (✎ §NN) and
// plate numbers auto-increment via CSS counters defined in journal.css —
// authors never number by hand.
import type { ComponentPropsWithoutRef, ReactElement } from "react";
import type { MDXComponents } from "mdx/types";
import CodeBlock from "@/components/journal/CodeBlock";
import ZoomableImage from "@/components/ui/ZoomableImage";
import { imageDims } from "@/lib/image-dims";

/* ---- custom blocks authored directly in MDX ---- */

// <Callout variant="note|warning|tip">…</Callout> — load-bearing content only:
// boxed, tinted, serif at body size, and it never leaves the reading column.
// `note` is deliberately unlabelled — a label on every callout tells the reader
// nothing and costs a line; the tint and the left rule carry it. Only warning
// and tip earn a label, and both sit off the accent so they can never be
// mistaken for "this entry's colour".
function Callout({
  variant = "note",
  children,
}: {
  variant?: "note" | "warning" | "tip";
  children: React.ReactNode;
}) {
  const label = variant === "warning" ? "⚠ warning" : variant === "tip" ? "✦ tip" : null;
  return (
    <aside className={`je-callout${variant === "note" ? "" : ` is-${variant}`}`}>
      {label && <span className="lbl">{label}</span>}
      {children}
    </aside>
  );
}

// <Side>…</Side> — commentary only. Renders in the live right margin: Caveat,
// no box, no tint, no label, with a short accent tick pointing back at the
// column. Place it immediately BEFORE the paragraph it annotates — it floats
// right and aligns to that paragraph. Collapses inline below 1140px.
//
// The rule of the page: boxes get serif, Caveat gets no box. A dotted box
// around handwriting is two metaphors fighting, which is why the old single
// <Callout> split into <Callout> (load-bearing, boxed, serif) and this.
function Side({ n, children }: { n?: number; children: React.ReactNode }) {
  return (
    <aside className={`je-side${n ? " is-fn" : ""}`}>
      {n ? <span className="n">{n}.</span> : null}
      {children}
    </aside>
  );
}

// <Hl>phrase</Hl> — coral marker highlight on an inline phrase.
function Hl({ children }: { children: React.ReactNode }) {
  return <mark className="je-hl">{children}</mark>;
}

// <Figure src alt>caption…</Figure> — a taped "plate". The tab text
// ("plate 00N") is filled by the CSS counter, so don't number it. The plate
// zooms like every other content image; the caption rides into the lightbox
// bar, so a plate reads the same enlarged as it does in the column.
//
// Dimensions are read off the file, never authored: a plate is written as one
// line of MDX, and a hand-typed pair that disagrees with the image reserves a
// box of the wrong shape for it to sit in.
function Figure({ src, alt, children }: { src: string; alt: string; children?: React.ReactNode }) {
  const { w, h } = imageDims(src);
  return (
    <figure className="je-plate">
      <span className="je-tape" aria-hidden="true" />
      <span className="je-plate-tab auto" aria-hidden="true" />
      <ZoomableImage
        src={src}
        alt={alt}
        caption={children ?? alt}
        width={w}
        height={h}
        sizes="(max-width: 880px) 100vw, 820px"
        className="je-plate-media"
      />
      {children ? <figcaption>{children}</figcaption> : null}
    </figure>
  );
}

// <Quote cite="field notes, week 14">…</Quote> — hand pull-quote.
// MDX already wraps block JSX children in <p>, so render children directly —
// adding our own <p> would nest <p><p> and break hydration.
function Quote({ cite, children }: { cite?: string; children: React.ReactNode }) {
  return (
    <blockquote className="je-quote">
      {children}
      {cite ? <cite>— {cite}</cite> : null}
    </blockquote>
  );
}

/* ---- native markdown element overrides ---- */

// ``` fenced code ``` → the light-on-paper code card. Fence props ride through
// rehype-mdx-code-props, so a fence can carry a filename, highlighted lines and
// a caption:  ```py title="intake.py" hi="3" cap="Never block the request."
function Pre({ title, hi, cap, children }: ComponentPropsWithoutRef<"pre"> & {
  hi?: string;
  cap?: string;
}) {
  const code = children as ReactElement<{ className?: string; children?: string }> | undefined;
  const cls = code?.props?.className ?? "";
  const lang = cls.replace(/language-/, "") || undefined;
  const src = typeof code?.props?.children === "string" ? code.props.children : "";
  const hiLines = hi
    ? hi.split(/[,\s]+/).map(Number).filter((n) => Number.isFinite(n) && n > 0)
    : undefined;
  return <CodeBlock code={src} lang={lang} file={title} hi={hiLines} cap={cap} />;
}

export const mdxComponents: MDXComponents = {
  p: (p) => <p {...p} />,
  // ## → hand section-number + wavy-underlined serif heading.
  // remark-gfm emits its own <h2 id="footnote-label"> as the (screen-reader
  // only) heading of the footnote list. That is not a section: giving it a
  // ✎ §NN kicker would both show a marker and bump the section counter, so it
  // renders plain and stays out of the count.
  h2: ({ children, ...rest }: ComponentPropsWithoutRef<"h2">) =>
    rest.id === "footnote-label" ? (
      <h2 {...rest}>{children}</h2>
    ) : (
      <div className="je-h2">
        <span className="je-secn" aria-hidden="true" />
        <h2 {...rest}>{children}</h2>
      </div>
    ),
  h3: (p: ComponentPropsWithoutRef<"h3">) => <h3 {...p} />,
  ul: (p: ComponentPropsWithoutRef<"ul">) => <ul className="je-ul" {...p} />,
  ol: (p: ComponentPropsWithoutRef<"ol">) => <ol className="je-ol" {...p} />,
  li: (p: ComponentPropsWithoutRef<"li">) => <li {...p} />,
  blockquote: (p: ComponentPropsWithoutRef<"blockquote">) => <blockquote className="je-quote" {...p} />,
  pre: Pre,
  code: (p: ComponentPropsWithoutRef<"code">) => <code className="je-ic" {...p} />,
  a: (p: ComponentPropsWithoutRef<"a">) => <a {...p} />,
  // remark-gfm renders footnote refs as <sup><a>…</a></sup>; style the anchor
  // as the accent-ink pill the design specifies.
  sup: (p: ComponentPropsWithoutRef<"sup">) => <sup className="je-fnref" {...p} />,
  // remark-gfm's footnote list carries its own class="footnotes", so spread
  // first and merge — otherwise it overwrites ours.
  section: ({ children, className, ...rest }: ComponentPropsWithoutRef<"section">) =>
    "data-footnotes" in rest ? (
      <section {...rest} className={`je-fnlist ${className ?? ""}`.trim()}>
        <div className="je-fnlbl">footnotes</div>
        {children}
      </section>
    ) : (
      <section {...rest} className={className}>{children}</section>
    ),
  Callout,
  Side,
  Hl,
  Figure,
  Quote,
};
