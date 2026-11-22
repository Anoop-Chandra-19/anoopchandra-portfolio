import type { ButtonHTMLAttributes, CSSProperties } from "react";

type ButtonKind = "box" | "key" | "tab" | "pill";
type ButtonSize = "md" | "sm";
type ButtonAccent = "electric" | "coral" | "teal" | "navy";

// Shared by every kind: the border width, the mono control face, the disabled dim.
// Border colour goes with the fill below; two colour utilities on one element
// resolve by stylesheet order.
const BASE =
  "font-mono border-[1.5px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

// `transform`, not Tailwind's `translate`: the lift transitions on transform.
// `enabled:` keeps a disabled button from lifting.
const LIFT =
  "enabled:hover:[transform:translate(-1px,-1px)] enabled:hover:shadow-[2px_2px_0_color-mix(in_oklab,var(--color-ink)_18%,transparent)]";
// Lab pages set --lxa to the experiment's accent; elsewhere the ring is electric.
const RING =
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--lxa,var(--color-electric))]";

const KIND: Record<ButtonKind, string> = {
  /* The lab's square-cornered button. */
  box: `rounded-[3px] whitespace-nowrap [transition:transform_0.1s,background_0.14s] ${LIFT} ${RING}`,
  /* A 34px square key, for steppers and k pickers. Pressing drops the lift so
     a held auto-repeat reads as held. */
  key: `rounded-[3px] size-[34px] text-[13px] [transition:transform_0.12s,background_0.12s,border-color_0.12s,color_0.12s] ${LIFT} enabled:active:[transform:none] enabled:active:shadow-none ${RING}`,
  /* The journal's kind filters: index tabs, alternately tilted. */
  tab: "rounded-md font-normal text-[14px] px-3.5 py-0.5 [transform:rotate(-0.5deg)] odd:[transform:rotate(0.5deg)] [transition:background_0.15s,color_0.15s]",
  pill: "rounded-full",
};

const SIZE: Record<"box" | "pill", Record<ButtonSize, string>> = {
  box: { md: "text-[13px] px-4 py-[9px]", sm: "text-control px-[13px] py-[7px]" },
  pill: {
    md: "inline-flex items-center min-h-11 text-control px-[17px]",
    sm: "text-control-sm px-[13px] py-[5px]",
  },
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  kind: ButtonKind;
  size?: ButtonSize;
  /** A toggle's state. Sets aria-pressed and the filled look. */
  pressed?: boolean;
  /** Filled regardless of state: the primary action. */
  filled?: boolean;
  /** Fill colour for box and key; tab and pill fill with ink. */
  accent?: ButtonAccent;
};

export default function Button({
  kind,
  size = "md",
  pressed,
  filled,
  accent,
  type = "button",
  className,
  style,
  ...rest
}: ButtonProps) {
  const isFilled = Boolean(pressed || filled);
  const fill =
    kind === "box" || kind === "key"
      ? isFilled
        ? "bg-[var(--btn-fill)] border-[var(--btn-fill)] text-white"
        : "border-ink bg-paper text-ink"
      : isFilled
        ? "border-ink bg-ink text-paper"
        : // Hover only when unfilled: a filled tab keeps its ink on hover.
          `border-ink bg-paper text-ink ${kind === "tab" ? "hover:bg-paper-2" : ""}`;
  const sizeCls = kind === "box" || kind === "pill" ? SIZE[kind][size] : "";
  const cls = [BASE, KIND[kind], sizeCls, fill, className].filter(Boolean).join(" ");
  const fillStyle =
    isFilled && accent ? ({ "--btn-fill": `var(--color-${accent})` } as CSSProperties) : undefined;
  return (
    <button
      type={type}
      aria-pressed={pressed}
      className={cls}
      style={fillStyle || style ? { ...fillStyle, ...style } : undefined}
      {...rest}
    />
  );
}
