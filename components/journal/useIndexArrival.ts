import { useEffect, useState } from "react";

/** Long enough for the last staggered row and its leader to finish. */
const ARRIVAL_MS = 1500;

/** True while the journal index's first-load entrance plays
    (app/animations.css), so rows a filter brings back later just appear
    instead of railing in. */
export function useIndexArrival(): boolean {
  const [isArriving, setIsArriving] = useState(true);
  useEffect(() => {
    const timeout = window.setTimeout(() => setIsArriving(false), ARRIVAL_MS);
    return () => window.clearTimeout(timeout);
  }, []);
  return isArriving;
}
