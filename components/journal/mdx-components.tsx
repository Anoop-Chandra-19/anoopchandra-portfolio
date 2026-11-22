// Maps MDX → the "Annotated Manuscript" entry blocks. Every component here
// renders on the server (next-mdx-remote/rsc); the interactive bits are
// client leaves it mounts, never this module. Section, plate, list and code
// line numbers are CSS counters — authors never number by hand.
//
// remark-gfm generates the footnote markup, so its elements are told apart
// here by the attributes it puts on them (data-footnotes, user-content-fn-N,
// data-footnote-backref).
import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import CodeBlock from "@/components/journal/CodeBlock";
import ZoomableImage from "@/components/ui/ZoomableImage";
import { imageDims } from "@/lib/image-dims";

// The reading column: everything in the body stops at the measure, and goes
// full width once the side rail narrows.
const MEASURE = "max-w-(--je-measure) max-mid:max-w-full";

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
      className={`relative ${MEASURE} my-[26px] mx-0 py-[15px] px-5 border border-l-[3px] border-l-[color:var(--cal)] rounded-[3px] font-display font-normal text-prose-list text-ink text-pretty max-wide:py-[13px] max-wide:px-4 inherit-p [&_p+p]:mt-2.5 ${look.box}`}
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
          className={`mt-[11px] pl-3.5 [border-left:2px_solid_var(--accent)] font-mono text-meta leading-[1.55] text-ink-faint inherit-p`}
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

// ## kicker and heading. On phones the number moves into the margin rail.
const SECTION_NO =
  "je-secn block mb-0.5 font-accent font-semibold text-[20px] leading-none text-(--accent-ink)";
const SECTION_NO_RAIL =
  "max-wide:absolute max-wide:left-[calc(-1*(var(--rail)+var(--colgap)))] max-wide:top-[3px] max-wide:w-7 max-wide:py-0.5 max-wide:px-0 max-wide:font-mono max-wide:text-[9.5px] max-wide:font-normal max-wide:tracking-[.5px] max-wide:text-center max-wide:bg-paper";
const SECTION_H2 =
  "m-0 font-display font-semibold text-prose-h2 text-ink underline decoration-wavy decoration-[color:color-mix(in_oklab,var(--accent)_55%,transparent)] decoration-[1.6px] underline-offset-9 max-wide:decoration-[1.4px] max-wide:underline-offset-6 max-wide:[text-decoration-skip-ink:none]";

// Lists. Preflight removes the markers: bullets are a rotated square, numbers
// a counter. The footnote list is an <ol> too, and reuses the counter.
const LIST = `list-none mt-1.5 mx-0 mb-6 ${MEASURE}`;
const UL_ITEM = "[&>li]:relative [&>li]:pl-7 [&>li]:mb-[11px] [&>li]:font-display [&>li]:text-prose-list";
const UL_MARK =
  "[&>li]:before:content-[''] [&>li]:before:absolute [&>li]:before:left-0.5 [&>li]:before:top-[11px] [&>li]:before:size-2 [&>li]:before:border-[1.6px] [&>li]:before:border-[color:var(--accent)] [&>li]:before:rounded-[2px] [&>li]:before:[transform:rotate(45deg)]";
const OL_ITEM = "[&>li]:relative [&>li]:pl-8 [&>li]:mb-[9px] [&>li]:[counter-increment:oli]";
const OL_NUMBER =
  "[&>li]:before:content-[counter(oli,decimal-leading-zero)] [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-[5px] [&>li]:before:font-mono [&>li]:before:text-[12px] [&>li]:before:text-(--accent-ink)";

// The footnote ref. On phones it's a tinted pill that opens FootnoteSheet,
// which sets data-on while its note is showing.
const FN_REF =
  "pl-0.5 font-mono text-[.58em] font-medium leading-[0] align-super text-(--accent-ink) scroll-mt-[120px]";
const FN_REF_PILL =
  "max-wide:relative max-wide:inline-block max-wide:[vertical-align:.34em] max-wide:mr-px max-wide:ml-0.5 max-wide:pt-px max-wide:px-[5px] max-wide:pb-[1.5px] max-wide:rounded-full max-wide:text-[9.5px] max-wide:leading-[1.3] max-wide:cursor-pointer max-wide:[-webkit-tap-highlight-color:transparent]";
const FN_REF_TINT =
  "max-wide:bg-[color-mix(in_oklab,var(--accent)_20%,var(--color-paper))] max-wide:active:bg-[color-mix(in_oklab,var(--accent)_34%,var(--color-paper))] max-wide:data-on:bg-[color-mix(in_oklab,var(--accent)_40%,var(--color-paper))]";
/** A bigger tap target that doesn't change the line height. */
const FN_REF_TAP = "max-wide:after:content-[''] max-wide:after:absolute max-wide:after:-inset-y-[9px] max-wide:after:-inset-x-[7px]";

// The footnote list. Hidden on phones, where FootnoteSheet shows one note at
// a time; it stays in the DOM because the sheet clones from it.
const FOOTNOTES = `clear-right mt-[38px] pt-3.5 border-t border-dashed border-ink-faint max-w-(--je-measure) font-display text-small text-ink-soft max-wide:hidden [&>ol]:m-0 [&>ol]:pl-0 inherit-p`;
const FOOTNOTE =
  "text-small scroll-mt-[120px] target:bg-[color-mix(in_oklab,var(--accent)_12%,transparent)] target:rounded-[3px] target:before:text-ink";

export const mdxComponents: MDXComponents = {
  // Explicit size and line-height: the base layer resizes a bare <p> on phones.
  p: (p) => (
    <p className={`mt-0 mx-0 mb-[22px] ${MEASURE} font-display text-prose text-ink text-pretty`} {...p} />
  ),
  // ## → hand section-number + wavy-underlined serif heading.
  // remark-gfm emits its own <h2 id="footnote-label"> as the (screen-reader
  // only) heading of the footnote list. That is not a section: giving it a
  // ✎ §NN kicker would both show a marker and bump the section counter, so it
  // renders plain and stays out of the count.
  h2: ({ children, ...rest }: ComponentPropsWithoutRef<"h2">) =>
    rest.id === "footnote-label" ? (
      <h2 {...rest}>{children}</h2>
    ) : (
      <div className={`mt-11 mx-0 mb-4 ${MEASURE} [counter-increment:sec] max-wide:relative max-wide:mt-7.5 max-wide:mb-3`}>
        <span className={`${SECTION_NO} ${SECTION_NO_RAIL}`} aria-hidden="true" />
        <h2 className={SECTION_H2} {...rest}>
          {children}
        </h2>
      </div>
    ),
  h3: (p: ComponentPropsWithoutRef<"h3">) => (
    <h3 className={`mt-7 mx-0 mb-2.5 ${MEASURE} font-display font-semibold text-prose-h3 text-ink`} {...p} />
  ),
  ul: (p: ComponentPropsWithoutRef<"ul">) => (
    <ul className={`${LIST} p-0 ${UL_ITEM} ${UL_MARK}`} {...p} />
  ),
  ol: (p: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className={`${LIST} pl-0.5 font-display text-prose-list [counter-reset:oli] ${OL_ITEM} ${OL_NUMBER}`}
      {...p}
    />
  ),
  // A footnote; :target is the one a ref just jumped to.
  li: (p: ComponentPropsWithoutRef<"li">) =>
    p.id?.startsWith("user-content-fn-") ? (
      <li className={FOOTNOTE} {...p} />
    ) : (
      <li {...p} />
    ),
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
  // Footnote refs and ↩ backrefs keep the link look: they're links.
  a: ({ className, ...p }: ComponentPropsWithoutRef<"a">) => (
    <a
      {...p}
      className={`text-electric no-underline border-b-[1.5px] border-dotted border-b-[color:color-mix(in_oklab,var(--color-electric)_55%,transparent)] hover:text-ink hover:border-b-ink ${
        "data-footnote-backref" in p ? "px-1" : ""
      } ${className ?? ""}`.trim()}
    />
  ),
  sup: (p: ComponentPropsWithoutRef<"sup">) => (
    <sup className={`${FN_REF} ${FN_REF_PILL} ${FN_REF_TINT} ${FN_REF_TAP}`} {...p} />
  ),
  // remark-gfm's footnote list carries its own class="footnotes", so spread
  // first and merge — otherwise it overwrites ours.
  section: ({ children, className, ...rest }: ComponentPropsWithoutRef<"section">) =>
    "data-footnotes" in rest ? (
      <section {...rest} className={`${FOOTNOTES} ${className ?? ""}`.trim()}>
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
