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

// Notes are intentionally unlabelled; only warnings and tips receive labels.
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

// Place <Side> immediately before the paragraph it annotates; it aligns by floating
// right and collapses inline below 1140px.
function Side({ n, children }: { n?: number; children: React.ReactNode }) {
  return (
    <aside className={`je-side${n ? " is-fn" : ""}`}>
      {n ? <span className="n">{n}.</span> : null}
      {children}
    </aside>
  );
}

function Hl({ children }: { children: React.ReactNode }) {
  return <mark className="je-hl">{children}</mark>;
}

// Plate numbers and dimensions are generated; authors provide neither.
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

// Fence props provide a filename, highlighted lines, and caption through
// rehype-mdx-code-props: ```py title="intake.py" hi="3" cap="Never block the request."
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
