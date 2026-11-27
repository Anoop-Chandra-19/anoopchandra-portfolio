import { useEffect, useRef, useState } from "react";
import { useInkTransition } from "@/components/transition/InkTransitionProvider";

/** Long enough for the last staggered row and its leader to finish. */
const ARRIVAL_MS = 1500;

/**
 * How the journal index arrives (app/animations.css).
 *
 * - `isArriving`: true while the first-load entrance plays, so rows a filter
 *   brings back later just appear instead of railing in.
 * - `markedSlug`: the entry you came back from, once its row (found in
 *   `rowsRef` by `data-slug`) is known to be on screen; the index paints its
 *   "you were here" mark.
 */
export function useIndexArrival() {
  const [isArriving, setIsArriving] = useState(true);
  useEffect(() => {
    const timeout = window.setTimeout(() => setIsArriving(false), ARRIVAL_MS);
    return () => window.clearTimeout(timeout);
  }, []);

  const { previousPathname } = useInkTransition();
  const [cameFrom] = useState(() => previousPathname?.match(/^\/journal\/([^/]+)$/)?.[1] ?? null);
  const [markedSlug, setMarkedSlug] = useState<string | null>(null);
  const rowsRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    if (!cameFrom) return;
    // A frame later, so a restored scroll position has been applied.
    const frame = window.requestAnimationFrame(() => {
      const row = rowsRef.current?.querySelector(`[data-slug="${CSS.escape(cameFrom)}"]`);
      const rect = row?.getBoundingClientRect();
      if (rect && rect.bottom > 0 && rect.top < window.innerHeight) setMarkedSlug(cameFrom);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [cameFrom]);

  return { isArriving, markedSlug, rowsRef };
}
