import type { ComponentPropsWithoutRef } from "react";
import type { MDXComponents } from "mdx/types";
import type { TagColor } from "@/lib/journal-meta";

// Maps markdown → the notebook design's article blocks
// (ported from the old NoteBlock renderer in Notes.tsx).

function Callout({
  color = "electric",
  children,
}: {
  color?: TagColor;
  children: React.ReactNode;
}) {
  return (
    <div
      className="my-[18px] py-3.5 px-[18px] rounded text-[22px] leading-[1.35] text-ink"
      style={{
        background: `color-mix(in oklab, var(--color-${color}) 12%, var(--color-paper))`,
        border: `1.5px dashed var(--color-${color})`,
        fontFamily: "var(--font-hand)",
      }}
    >
      <span
        className="mono text-[9px] tracking-[2px] uppercase block mb-1"
        style={{ color: `var(--color-${color})` }}
      >
        ✎ margin note
      </span>
      {children}
    </div>
  );
}

export const mdxComponents: MDXComponents = {
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="text-[17px] leading-[1.7] mt-0 mb-3.5" {...props} />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h3 className="text-[28px] mt-[26px] mb-2.5 text-ink" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h4 className="text-[22px] mt-5 mb-2 text-ink" {...props} />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="list-disc pl-[22px] mt-1.5 mb-[18px] text-[16px] leading-[1.75]" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="list-decimal pl-[22px] mt-1.5 mb-[18px] text-[16px] leading-[1.75]" {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => <li className="mb-1" {...props} />,
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="journal-quote hand my-5 py-2 px-5 border-l-[3px] border-electric text-[26px] leading-[1.35] text-ink not-italic"
      {...props}
    />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="journal-pre mono mt-3.5 mb-5 py-3.5 px-4 border-[1.5px] border-ink rounded text-xs leading-[1.6] whitespace-pre-wrap overflow-auto"
      style={{ background: "color-mix(in oklab, var(--color-ink) 7%, var(--color-paper-2))" }}
      {...props}
    />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a
      className="text-ink underline decoration-dotted underline-offset-4 decoration-electric"
      {...props}
    />
  ),
  Callout,
};
