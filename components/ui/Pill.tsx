import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type PillTone = "ink" | "teal";

// Rounded mono chips. `choice` is one option of a radio group (the filter
// sheet), `filter` is an applied filter that clears on click, `tag` is a
// read-only label, or a link when given an href.
const CHOICE =
  "inline-flex items-center gap-[5px] min-h-11 px-[13px] font-mono text-control border-[1.4px] rounded-[7px] cursor-pointer disabled:opacity-40 disabled:cursor-default disabled:border-dashed";
const CHOICE_TONE: Record<PillTone, { off: string; on: string }> = {
  ink: { off: "border-ink bg-paper text-ink", on: "border-ink bg-ink text-paper" },
  teal: {
    off: "border-[color-mix(in_oklab,var(--color-ink)_34%,transparent)] bg-paper text-ink-soft",
    on: "border-teal bg-[color-mix(in_oklab,var(--color-teal)_16%,var(--color-paper))] text-teal-deep",
  },
};
const FILTER =
  "inline-flex items-center gap-1.5 px-[9px] py-1 font-mono text-caption border-[1.5px] border-ink rounded-[3px] bg-paper-2 text-ink cursor-pointer";
const TAG =
  "font-mono font-normal text-control max-wide:text-control-sm text-ink-soft border-[1.4px] border-ink rounded-full px-3 py-1 bg-paper";

type ButtonPillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  kind: "choice" | "filter";
  /** choice only: selected. */
  on?: boolean;
  tone?: PillTone;
};

type TagPillProps = {
  kind: "tag";
  href?: string;
  className?: string;
  children: ReactNode;
};

export default function Pill(props: ButtonPillProps | TagPillProps) {
  if (props.kind === "tag") {
    const { href, className, children } = props;
    const cls = [TAG, className].filter(Boolean).join(" ");
    if (href) {
      return (
        <Link href={href} className={`${cls} no-underline hover:bg-paper-2`}>
          {children}
        </Link>
      );
    }
    return <span className={cls}>{children}</span>;
  }
  const { kind, on = false, tone = "ink", className, type = "button", ...rest } = props;
  const look = kind === "choice" ? `${CHOICE} ${CHOICE_TONE[tone][on ? "on" : "off"]}` : FILTER;
  return <button type={type} className={[look, className].filter(Boolean).join(" ")} {...rest} />;
}
