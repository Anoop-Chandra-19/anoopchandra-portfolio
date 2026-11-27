"use client";
import { useLayoutEffect } from "react";

/** Long enough for the latest staggered block (240ms in) to finish its
    450ms fade before the mark goes. */
const PAGE_IN_MS = 800;

let clearTimer: number | undefined;

/**
 * Marks <html> with `data-page-in` as a loader leaves, which turns on the
 * `page-in:` fade for the page replacing it (app/globals.css). A layout
 * effect, so the mark is set in the same commit that inserts the page,
 * before it paints. One loader handing off to another resets the timer, so
 * the mark is still there when the page itself arrives.
 */
export default function PageInCue() {
  useLayoutEffect(
    () => () => {
      const root = document.documentElement;
      window.clearTimeout(clearTimer);
      root.dataset.pageIn = "";
      clearTimer = window.setTimeout(() => {
        delete root.dataset.pageIn;
      }, PAGE_IN_MS);
    },
    []
  );
  return null;
}
