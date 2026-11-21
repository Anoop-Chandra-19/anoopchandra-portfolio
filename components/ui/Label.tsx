import type { HTMLAttributes } from "react";

type LabelKind = "eyebrow" | "tag" | "stamp" | "meta" | "caption";
type LabelTone = "faint" | "soft" | "ink" | "inherit";

const KIND: Record<LabelKind, string> = {
  eyebrow: "text-eyebrow uppercase",
  tag: "text-tag uppercase",
  stamp: "text-stamp uppercase",
  meta: "text-meta",
  caption: "text-caption",
};

// Colour goes through `tone`, never `className`: two colour utilities on one
// element resolve by stylesheet order, not by the order they're written.
const TONE: Record<LabelTone, string> = {
  faint: "faint",
  soft: "text-ink-soft",
  ink: "text-ink",
  inherit: "",
};

type LabelProps = HTMLAttributes<HTMLElement> & {
  // `kind`, not `role`: role is the ARIA attribute.
  kind: LabelKind;
  tone?: LabelTone;
  as?: "div" | "span";
};

/** A small mono label in one of the type roles from `@theme`. */
export default function Label({
  kind,
  tone = "faint",
  as: Tag = "div",
  className,
  ...rest
}: LabelProps) {
  const cls = ["font-mono", TONE[tone], KIND[kind], className].filter(Boolean).join(" ");
  return <Tag className={cls} {...rest} />;
}
