"use client";

import { useEffect, useState } from "react";

const MIDNIGHT_BUFFER_MS = 100;

function millisecondsUntilTomorrow(now: Date) {
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);
  return tomorrow.getTime() - now.getTime();
}

/** Returns the visitor's local date after hydration and updates it at midnight. */
export function useCurrentDate(): Date | null {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    function scheduleUpdate() {
      const now = new Date();
      setCurrentDate(now);
      timeoutId = setTimeout(
        scheduleUpdate,
        millisecondsUntilTomorrow(now) + MIDNIGHT_BUFFER_MS,
      );
    }

    function updateWhenVisible() {
      if (document.visibilityState !== "visible") return;
      if (timeoutId) clearTimeout(timeoutId);
      scheduleUpdate();
    }

    scheduleUpdate();
    document.addEventListener("visibilitychange", updateWhenVisible);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", updateWhenVisible);
    };
  }, []);

  return currentDate;
}
