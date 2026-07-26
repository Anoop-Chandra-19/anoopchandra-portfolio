// Maps MDX → the "Annotated Manuscript" entry blocks. All server-safe
// (works with next-mdx-remote/rsc). Section numbers (✎ §NN) and plate
// numbers auto-increment via CSS counters defined in journal.css —
// authors never number by hand.
import Image from "next/image";
import type { ComponentPropsWithoutRef, ReactElement } from "react";
import type { MDXComponents } from "mdx/types";

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

// <Hl>phrase</Hl> — coral marker highlight on an inline phrase.
function Hl({ children }: { children: React.ReactNode }) {
  return <mark className="je-hl">{children}</mark>;
}

// <Figure src alt>caption…</Figure> — a taped "plate". The tab text
// ("plate 00N") is filled by the CSS counter, so don't number it.
function Figure({ src, alt, children }: { src: string; alt: string; children?: React.ReactNode }) {
  return (
    <figure className="je-plate">
      <span className="je-tape" aria-hidden="true" />
      <span className="je-plate-tab auto" aria-hidden="true" />
      <Image src={src} alt={alt} width={1100} height={620} />
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

// ``` fenced code ``` → notebook code card. The bar label prefers a
// title="intake.py" fence prop (via rehype-mdx-code-props), then the
// fence language (```py).
function Pre({ title, children, ...rest }: ComponentPropsWithoutRef<"pre">) {
  const code = children as ReactElement<{ className?: string }> | undefined;
  const cls = code?.props?.className ?? "";
  const lang = cls.replace(/language-/, "") || "code";
  return (
    <div className="je-code">
      <div className="bar">
        <span className="prompt">&gt;_</span>
        <span className="fn">{title ?? lang}</span>
      </div>
      <pre {...rest}>{children}</pre>
    </div>
  );
}

export const mdxComponents: MDXComponents = {
  p: (p) => <p {...p} />,
  // ## → hand section-number + wavy-underlined serif heading
  h2: ({ children, ...rest }: ComponentPropsWithoutRef<"h2">) => (
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
  Callout,
  Hl,
  Figure,
  Quote,
};
