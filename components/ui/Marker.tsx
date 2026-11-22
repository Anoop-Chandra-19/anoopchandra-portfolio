import type { CSSProperties } from "react";

/**
 * Highlighter stroke under a phrase. Each word carries its own stripe, which
 * paints in by scaling (a compositor animation, so it stays smooth while the
 * page is still loading), and the words are timed to chain into one sweep.
 * A per-word stripe also follows the phrase when it wraps; one box couldn't.
 * Spaces are segments of their own: inside a word's span, a line break after
 * the space splits the span across two lines and its stripe collapses. On its
 * own, a space mid-line underlines the gap and one at a line end has no width.
 */
export default function Marker({
  children,
  tone,
  className,
}: {
  children: string;
  tone?: "purple" | "teal";
  className?: string;
}) {
  const segments = children.split(/( )/).filter(Boolean);
  const total = children.length;
  return (
    <span className={["marker-highlight", tone, className].filter(Boolean).join(" ")}>
      {segments.map((text, i) => {
        const start = segments.slice(0, i).join("").length;
        const style = { "--ws": start / total, "--wl": text.length / total } as CSSProperties;
        return (
          <span key={i} className="marker-word" style={style}>
            {text}
          </span>
        );
      })}
    </span>
  );
}
