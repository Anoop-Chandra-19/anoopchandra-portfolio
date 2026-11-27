import type { ReactNode } from "react";
import PageInCue from "./PageInCue";

/**
 * The frame every route loader (`loading.tsx`) renders in. It is announced
 * through its visually hidden label; callers hide their drawing from
 * assistive tech.
 *
 * When its page arrives the loader goes at once and the page fades in over it
 * (`page-in:`, cued by PageInCue). A view transition fading the loader out
 * was tried: on slow phones it overlapped the end of the ink transition and
 * the browser aborted it ("Viewport size changed").
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
    <div role="status" className={className}>
      <span className="sr-only">{label}</span>
      <PageInCue />
      {children}
    </div>
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
