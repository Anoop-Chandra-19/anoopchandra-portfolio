// Maps MDX → the "Annotated Manuscript" entry blocks. Every component here
// renders on the server (next-mdx-remote/rsc); the interactive bits are
// client leaves it mounts, never this module. Section numbers (✎ §NN) and
// plate numbers auto-increment via CSS counters defined in journal.css —
// authors never number by hand.
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import CodeBlock from "@/components/journal/CodeBlock";
import ZoomableImage from "@/components/ui/ZoomableImage";
import { imageDims } from "@/lib/image-dims";

// The reading column: everything in the body stops at the measure, and goes
// full width once the side rail narrows.
const MEASURE = "max-w-(--je-measure) max-mid:max-w-full";

// MDX wraps block JSX children in <p>. Inside these blocks the paragraph takes
// the block's type instead of the body's.
const INHERIT_P =
  "[&_p]:[font-family:inherit] [&_p]:[font-size:inherit] [&_p]:[line-height:inherit] [&_p]:[color:inherit] [&_p]:m-0 [&_p]:max-w-none";

type CalloutVariant = "note" | "warning" | "tip";

// Each variant sets the whole look rather than overriding a base: two colour
// utilities on one element resolve by stylesheet order.
const CALLOUT: Record<CalloutVariant, { box: string; lbl: string }> = {
  note: {
    box: "[--cal:var(--accent)] bg-[color-mix(in_oklab,var(--cal)_7%,var(--color-paper))] border-[color:color-mix(in_oklab,var(--cal)_34%,var(--color-ink-faint))]",
    lbl: "text-[color:color-mix(in_oklab,var(--cal)_63%,var(--color-ink))]",
  },
  warning: {
    box: "[--cal:oklch(.78_.155_85)] bg-[color-mix(in_oklab,var(--cal)_26%,var(--color-paper))] border-[color:color-mix(in_oklab,var(--cal)_62%,var(--color-ink-faint))]",
    lbl: "text-[color:color-mix(in_oklab,var(--cal)_22%,var(--color-ink))]",
  },
  tip: {
    box: "[--cal:oklch(.5_.04_205)] bg-[color-mix(in_oklab,var(--cal)_5%,var(--color-paper))] border-[color:color-mix(in_oklab,var(--cal)_30%,var(--color-ink-faint))]",
    lbl: "text-[color:color-mix(in_oklab,var(--cal)_88%,var(--color-ink))]",
  },
};

// Notes are intentionally unlabelled; only warnings and tips receive labels.
function Callout({ variant = "note", children }: { variant?: CalloutVariant; children: ReactNode }) {
  const label = variant === "warning" ? "⚠ warning" : variant === "tip" ? "✦ tip" : null;
  const look = CALLOUT[variant];
  return (
    <aside
      className={`relative ${MEASURE} my-[26px] mx-0 py-[15px] px-5 border border-l-[3px] border-l-[color:var(--cal)] rounded-[3px] font-display font-normal text-prose-list text-ink text-pretty max-wide:py-[13px] max-wide:px-4 ${INHERIT_P} [&_p+p]:mt-2.5 ${look.box}`}
    >
      {label && (
        <span className={`flex items-center gap-[7px] mb-2 font-mono text-stamp font-medium uppercase ${look.lbl}`}>
          {label}
        </span>
      )}
      {children}
    </aside>
  );
}

// Place <Side> immediately before the paragraph it annotates; it floats into
// the right margin and drops inline, as a dashed-rule note, below 1140px.
const SIDE_BASE =
  "relative float-right clear-right w-(--side-w) mt-[5px] mr-[calc(-1*(var(--side-w)+var(--side-gap)))] mb-[18px] ml-(--side-gap) max-[1140px]:float-none max-[1140px]:w-auto max-[1140px]:mt-4 max-[1140px]:mr-0 max-[1140px]:mb-5 max-[1140px]:ml-0 max-[1140px]:[border-left:1.5px_dashed_color-mix(in_oklab,var(--accent)_45%,transparent)] before:content-[''] before:absolute before:left-[calc(6px-var(--side-gap))] before:top-3.5 before:w-[18px] before:h-[1.2px] before:bg-[color-mix(in_oklab,var(--accent)_70%,transparent)] max-[1140px]:before:hidden";

function Side({ n, children }: { n?: number; children: ReactNode }) {
  if (n) {
    return (
      <aside className={`${SIDE_BASE} font-display font-normal text-small text-ink-soft max-[1140px]:pl-3.5`}>
        <span className="mr-[7px] font-mono text-meta text-(--accent-ink)">{n}.</span>
        {children}
      </aside>
    );
  }
  return (
    <aside
      className={`${SIDE_BASE} font-accent font-semibold text-aside text-[color:color-mix(in_oklab,var(--color-ink)_68%,var(--color-paper))] max-[1140px]:pl-4`}
    >
      {children}
    </aside>
  );
}

function Hl({ children }: { children: ReactNode }) {
  return (
    <mark className="px-[3px] text-[color:inherit] bg-transparent bg-[linear-gradient(180deg,transparent_76%,color-mix(in_oklab,var(--accent)_58%,#fff)_76%,color-mix(in_oklab,var(--accent)_58%,#fff)_96%,transparent_96%)]">
      {children}
    </mark>
  );
}

/** A taped, numbered plate: the hero (plate 000) and every inline figure. */
export function Plate({
  src,
  alt,
  caption,
  zoomCaption,
  hero = false,
  width,
  height,
}: {
  src: string;
  alt: string;
  caption?: ReactNode;
  zoomCaption: ReactNode;
  hero?: boolean;
  width: number;
  height: number;
}) {
  return (
    <figure
      className={`relative ${hero ? "mb-[46px]" : "[counter-increment:plate] mb-10"} mt-0 mx-0 max-w-[820px] pt-3.5 px-3.5 pb-3 bg-[#fffdf7] border border-ink shadow-[0_8px_22px_rgba(0,0,0,.12)] max-wide:p-2.5 [&_img]:block [&_img]:w-full [&_img]:max-h-[420px] [&_img]:object-contain [&_img]:bg-paper-2 [&_.zoom-btn]:top-auto [&_.zoom-btn]:bottom-2.5`}
    >
      <span
        className="absolute -top-3 right-6.5 w-[74px] h-6 bg-[rgba(216,182,120,.5)] border border-[rgba(0,0,0,.06)] [transform:rotate(17deg)] max-wide:hidden"
        aria-hidden="true"
      />
      {/* The hero is plate 000; inline plates count from 001 (journal.css). */}
      <span
        className={`${hero ? "" : "je-plate-tab "}absolute -top-[11px] left-[18px] py-[3px] px-[9px] rounded-[3px] bg-ink font-mono text-stamp uppercase text-paper`}
        aria-hidden={hero ? undefined : true}
      >
        {hero ? "plate 000" : null}
      </span>
      <ZoomableImage
        src={src}
        alt={alt}
        caption={zoomCaption}
        width={width}
        height={height}
        sizes="(max-width: 880px) 100vw, 820px"
        priority={hero}
      />
      {caption ? (
        <figcaption
          className={`mt-[11px] pl-3.5 [border-left:2px_solid_var(--accent)] font-mono text-meta leading-[1.55] text-ink-faint ${INHERIT_P}`}
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

// Plate numbers and dimensions are generated; authors provide neither.
function Figure({ src, alt, children }: { src: string; alt: string; children?: ReactNode }) {
  const { w, h } = imageDims(src);
  return <Plate src={src} alt={alt} caption={children} zoomCaption={children ?? alt} width={w} height={h} />;
}

const QUOTE = `relative mt-9 mb-9 -ml-2 mr-0 max-w-[calc(var(--je-measure)+8px)] max-mid:max-w-full py-1.5 pr-0 pl-6.5 border-l-[3px] border-l-[color:var(--accent)] [&_p]:m-0 [&_p]:font-accent [&_p]:font-semibold [&_p]:text-pullquote [&_p]:text-ink`;

// MDX already wraps block JSX children in <p>, so render children directly —
// adding our own <p> would nest <p><p> and break hydration.
function Quote({ cite, children }: { cite?: string; children: ReactNode }) {
  return (
    <blockquote className={QUOTE}>
      {children}
      {cite ? (
        <cite className="block mt-3 font-mono not-italic text-eyebrow uppercase text-ink-faint max-wide:text-tag">
          — {cite}
        </cite>
      ) : null}
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
  // Explicit size and line-height: the base layer resizes a bare <p> on phones.
  p: (p) => (
    <p className={`mt-0 mx-0 mb-[22px] ${MEASURE} font-display text-prose text-ink text-pretty`} {...p} />
  ),
  // ## → hand section-number + wavy-underlined serif heading. On phones the
  // number moves into the margin rail.
  // remark-gfm emits its own <h2 id="footnote-label"> as the (screen-reader
  // only) heading of the footnote list. That is not a section: giving it a
  // ✎ §NN kicker would both show a marker and bump the section counter, so it
  // renders plain and stays out of the count.
  h2: ({ children, ...rest }: ComponentPropsWithoutRef<"h2">) =>
    rest.id === "footnote-label" ? (
      <h2 {...rest}>{children}</h2>
    ) : (
      <div className={`mt-11 mx-0 mb-4 ${MEASURE} [counter-increment:sec] max-wide:relative max-wide:mt-7.5 max-wide:mb-3`}>
        <span
          className="je-secn block mb-0.5 font-accent font-semibold text-[20px] leading-none text-(--accent-ink) max-wide:absolute max-wide:left-[calc(-1*(var(--rail)+var(--colgap)))] max-wide:top-[3px] max-wide:w-7 max-wide:py-0.5 max-wide:px-0 max-wide:font-mono max-wide:text-[9.5px] max-wide:font-normal max-wide:tracking-[.5px] max-wide:text-center max-wide:bg-paper"
          aria-hidden="true"
        />
        <h2
          className="m-0 font-display font-semibold text-prose-h2 text-ink underline decoration-wavy decoration-[color:color-mix(in_oklab,var(--accent)_55%,transparent)] decoration-[1.6px] underline-offset-9 max-wide:decoration-[1.4px] max-wide:underline-offset-6 max-wide:[text-decoration-skip-ink:none]"
          {...rest}
        >
          {children}
        </h2>
      </div>
    ),
  h3: (p: ComponentPropsWithoutRef<"h3">) => (
    <h3 className={`mt-7 mx-0 mb-2.5 ${MEASURE} font-display font-semibold text-prose-h3 text-ink`} {...p} />
  ),
  ul: (p: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className={`list-none p-0 mt-1.5 mx-0 mb-6 ${MEASURE} [&>li]:relative [&>li]:pl-7 [&>li]:mb-[11px] [&>li]:font-display [&>li]:text-prose-list [&>li]:before:content-[''] [&>li]:before:absolute [&>li]:before:left-0.5 [&>li]:before:top-[11px] [&>li]:before:size-2 [&>li]:before:border-[1.6px] [&>li]:before:border-[color:var(--accent)] [&>li]:before:rounded-[2px] [&>li]:before:[transform:rotate(45deg)]`}
      {...p}
    />
  ),
  // Numbered by a CSS counter (journal.css): preflight removes the markers.
  // The footnote list is an <ol> too, and reuses the counter for its numbers.
  ol: (p: ComponentPropsWithoutRef<"ol">) => <ol className="je-ol" {...p} />,
  li: (p: ComponentPropsWithoutRef<"li">) => <li {...p} />,
  blockquote: (p: ComponentPropsWithoutRef<"blockquote">) => <blockquote className={QUOTE} {...p} />,
  pre: Pre,
  code: (p: ComponentPropsWithoutRef<"code">) => (
    <code
      className="py-px px-[5px] font-mono text-[.8em] bg-[color-mix(in_oklab,var(--color-ink)_7%,var(--color-paper-2))] border border-ink-faint rounded-[3px]"
      {...p}
    />
  ),
  strong: (p: ComponentPropsWithoutRef<"strong">) => <strong className="font-semibold" {...p} />,
  // remark-gfm's footnote links carry their own class; merge, don't overwrite.
  a: ({ className, ...p }: ComponentPropsWithoutRef<"a">) => (
    <a
      {...p}
      className={`text-electric no-underline border-b-[1.5px] border-dotted border-b-[color:color-mix(in_oklab,var(--color-electric)_55%,transparent)] hover:text-ink hover:border-b-ink ${className ?? ""}`.trim()}
    />
  ),
  sup: (p: ComponentPropsWithoutRef<"sup">) => <sup className="je-fnref" {...p} />,
  // remark-gfm's footnote list carries its own class="footnotes", so spread
  // first and merge — otherwise it overwrites ours.
  section: ({ children, className, ...rest }: ComponentPropsWithoutRef<"section">) =>
    "data-footnotes" in rest ? (
      <section {...rest} className={`je-fnlist ${INHERIT_P} ${className ?? ""}`.trim()}>
        <div className="mb-2.5 font-mono text-stamp uppercase text-ink-faint">footnotes</div>
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
