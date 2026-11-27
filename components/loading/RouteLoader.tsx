import { ViewTransition, type ReactNode } from "react";

/**
 * The frame every route loader (`loading.tsx`) renders in. It is announced
 * through its visually hidden label; callers hide their drawing from
 * assistive tech.
 *
 * The ViewTransition names the loader only as it leaves, when its page
 * arrives, so it fades off the page beneath (`.loader-out` in
 * app/ink-transition.css). Entering, it stays part of the page, which keeps an
 * ink navigation that lands on a loader exactly as it is.
 */
export default function RouteLoader({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <ViewTransition enter="none" exit="loader-out" update="none" default="none">
      <div role="status" className={className}>
        <span className="sr-only">{label}</span>
        {children}
      </div>
    </ViewTransition>
  );
}

const SKETCH =
  "relative overflow-hidden rounded-[3px] after:absolute after:inset-0 after:content-[''] after:bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--color-electric)_10%,transparent),transparent)] after:animate-ink-dry motion-reduce:after:hidden";

/**
 * A block standing in for text that hasn't arrived, with a faint electric
 * "drying ink" pass along it. Set its size, and its `display` where it sits
 * in a line, through `className`; stagger the pass with an
 * `after:[animation-delay:…]` class.
 */
export function Sketch({
  isStrong = false,
  className,
  children,
}: {
  /** Darker, for the title. */
  isStrong?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const tone = isStrong
    ? "bg-[color-mix(in_oklab,var(--color-ink)_12%,transparent)]"
    : "bg-[color-mix(in_oklab,var(--color-ink)_8%,transparent)]";
  return <span className={[SKETCH, tone, className].filter(Boolean).join(" ")}>{children}</span>;
}
