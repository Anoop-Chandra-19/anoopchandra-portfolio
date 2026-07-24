"use client";
import { useEffect, useState } from "react";
import { useLenisInstance } from "@/components/LenisProvider";
import { useReducedMotion } from "./useReducedMotion";

/** The home page's sections, in reading order: [id, page number, label]. */
export const NAV_ITEMS: ReadonlyArray<readonly [string, string, string]> = [
  ["home", "00", "cover"],
  ["now", "01", "now"],
  ["work", "02", "work"],
  ["lab", "03", "the lab"],
  ["stack", "04", "stack"],
  ["notes", "05", "notes"],
  ["contact", "06", "say hi"],
];

/** Which section the nav should mark at a given scroll offset. Reads the live
    document, so callers must be mounted after the home sections. */
function activeSectionAt(scrollY: number): string {
  const nearBottom = window.innerHeight + scrollY >= document.body.offsetHeight - 80;
  if (nearBottom) return "contact";
  const y = scrollY + window.innerHeight * 0.35;
  let cur = "home";
  for (const [id] of NAV_ITEMS) {
    const el = document.getElementById(`sec-${id}`);
    if (el && el.offsetTop <= y) cur = id;
  }
  return cur;
}

/** Scroll-spy shared by the desktop rail and the mobile index overlay.
    frozenAt: render as a static snapshot inside a transition page copy —
    compute the marker once as if scrolled to that offset, never track scroll. */
export function useActiveSection(frozenAt?: number) {
  const frozen = frozenAt !== undefined;
  // Frozen copies mount while the live page is still in the DOM — compute the
  // marker synchronously so the copy's first painted frame already matches
  // (an effect would flash the "cover" default for a frame first).
  const [active, setActive] = useState(() => (frozen ? activeSectionAt(frozenAt) : "home"));

  useEffect(() => {
    if (frozen) return;
    const onScroll = () => setActive(activeSectionAt(window.scrollY));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [frozen]);

  return active;
}

/** Smooth-scroll to a home section by id, through Lenis when it's running. */
export function useSectionJump() {
  const lenis = useLenisInstance();
  const shouldReduceMotion = useReducedMotion();

  return (id: string) => {
    const target = document.getElementById(`sec-${id}`);
    if (!target) return;
    if (lenis) {
      lenis.scrollTo(target, {
        immediate: shouldReduceMotion,
        lerp: shouldReduceMotion ? undefined : 0.1,
        offset: 0,
      });
    } else {
      target.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",
        block: "start",
      });
    }
  };
}
