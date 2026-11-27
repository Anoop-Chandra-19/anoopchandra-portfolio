"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { transitionMs } from "@/lib/ink-bleed";
import InkMarks from "./InkMarks";
import type { InkEffect, InkOrigin } from "./inkViewTransition";

export type { InkEffect };

type NavigateOpts = {
  effect: InkEffect;
  /** bounding rect of the trigger element — the bleed grows from its center */
  originRect?: DOMRect;
};

type Transition = { href: string; effect: InkEffect; origin: InkOrigin };

/** If the route never commits, or the browser declines the view transition,
    the onEnter callbacks never run; this releases the page anyway. */
const SAFETY_MARGIN_MS = 3000;

const InkTransitionContext = createContext<{
  navigate: (href: string, opts: NavigateOpts) => void;
  active: boolean;
}>({ navigate: () => {}, active: false });

export function useInkTransition() {
  return useContext(InkTransitionContext);
}

export default function InkTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [transition, setTransition] = useState<Transition | null>(null);
  const active = transition !== null;

  const [firstPathname] = useState(pathname);
  // Entrance animations are a first-load ceremony: once there has been any
  // client navigation (ink, a plain link, back/forward), every page renders
  // settled. A layout effect, so the class lands before the new page paints.
  // It stays on for the session (removing it would restart the suppressed
  // CSS animations).
  const hasNavigated = pathname !== firstPathname;
  useLayoutEffect(() => {
    if (hasNavigated) document.body.classList.add("ink-no-anim");
  }, [hasNavigated]);
  const end = useCallback(() => {
    document.documentElement.style.removeProperty("view-transition-name");
    setTransition(null);
  }, []);

  const navigate = useCallback(
    (href: string, opts: NavigateOpts) => {
      if (transition || href === pathname) return;
      const canAnimate =
        typeof document.startViewTransition === "function" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!canAnimate) {
        router.push(href);
        return;
      }
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cx = opts.originRect ? opts.originRect.left + opts.originRect.width / 2 : vw / 2;
      const cy = opts.originRect ? opts.originRect.top + opts.originRect.height / 2 : vh / 2;
      // Set here too, ahead of the route change, so the page the ink reveals is
      // already settled when it is captured (see hasNavigated above).
      document.body.classList.add("ink-no-anim");
      // React leaves the page out of its view transitions (it renames the root
      // to none) unless the root already has an inline name. The ink reveal
      // animates the page snapshots, so ask for them explicitly.
      document.documentElement.style.setProperty("view-transition-name", "root");
      setTransition({ href, effect: opts.effect, origin: { cx, cy, vw, vh } });
      router.push(href, { transitionTypes: [`ink-${opts.effect}`] });
    },
    [transition, pathname, router]
  );

  useEffect(() => {
    if (!transition) return;
    const timeout = window.setTimeout(end, transitionMs(transition.effect, transition.origin.vw) + SAFETY_MARGIN_MS);
    return () => window.clearTimeout(timeout);
  }, [transition, end]);

  // Freeze the page for the whole transition. The root overflow catches
  // keyboard scrolling; wheel and touch still need blocking outright.
  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const prevent = (e: Event) => e.preventDefault();
    window.addEventListener("wheel", prevent, { passive: false });
    window.addEventListener("touchmove", prevent, { passive: false });
    window.addEventListener("popstate", end);
    return () => {
      root.style.overflow = prev;
      window.removeEventListener("wheel", prevent);
      window.removeEventListener("touchmove", prevent);
      window.removeEventListener("popstate", end);
    };
  }, [active, end]);

  return (
    <InkTransitionContext.Provider value={{ navigate, active }}>
      {children}
      {/* Rendered only once the destination is the current route, so the marks
          mount in the navigation's own commit and join its view transition. */}
      {transition && pathname === transition.href && (
        <InkMarks effect={transition.effect} origin={transition.origin} onDoneAction={end} />
      )}
    </InkTransitionContext.Provider>
  );
}
