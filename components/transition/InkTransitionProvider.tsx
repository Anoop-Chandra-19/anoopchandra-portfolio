"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLenisInstance } from "@/components/LenisProvider";
import type { JournalEntryMeta } from "@/lib/journal-meta";
import InkBleedOverlay from "@/components/transition/InkBleedOverlay";

export type InkEffect = "bleed" | "peel";

type NavigateOpts = {
  effect: InkEffect;
  /** bounding rect of the trigger element — the bleed grows from its center */
  originRect?: DOMRect;
};

type Transition = {
  href: string;
  effect: InkEffect;
  cx: number;
  cy: number;
  vw: number;
  vh: number;
};

const InkTransitionContext = createContext<{
  navigate: (href: string, opts: NavigateOpts) => void;
  active: boolean;
}>({ navigate: () => {}, active: false });

export function useInkTransition() {
  return useContext(InkTransitionContext);
}

export default function InkTransitionProvider({
  entries,
  children,
}: {
  entries: JournalEntryMeta[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenisInstance();
  const [transition, setTransition] = useState<Transition | null>(null);
  const committingRef = useRef(false);

  const navigate = useCallback(
    (href: string, opts: NavigateOpts) => {
      if (transition || href === pathname) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        return;
      }
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cx = opts.originRect ? opts.originRect.left + opts.originRect.width / 2 : vw / 2;
      const cy = opts.originRect ? opts.originRect.top + opts.originRect.height / 2 : vh / 2;
      lenis?.stop();
      // Entrance animations are a first-load ceremony: once we start doing client
      // navigations, every freshly pushed page should render settled. The class
      // stays on for the rest of the session (removing it would restart the
      // suppressed CSS animations).
      document.body.classList.add("ink-no-anim");
      setTransition({ href, effect: opts.effect, cx, cy, vw, vh });
    },
    [transition, pathname, router, lenis]
  );

  // Overlay finished animating (clips at full cover) → commit the route change.
  const handleComplete = useCallback(() => {
    if (!transition || committingRef.current) return;
    committingRef.current = true;
    router.push(transition.href);
  }, [transition, router]);

  // Once the destination route has actually rendered underneath the overlay,
  // wait two frames (paint settled) and unmount it — no handoff flash.
  useEffect(() => {
    if (!committingRef.current || !transition || pathname !== transition.href) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        committingRef.current = false;
        setTransition(null);
        lenis?.start();
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [pathname, transition, lenis]);

  // Browser back/forward mid-flight: drop the overlay immediately.
  useEffect(() => {
    if (!transition) return;
    const abort = () => {
      committingRef.current = false;
      setTransition(null);
      lenis?.start();
    };
    window.addEventListener("popstate", abort);
    return () => window.removeEventListener("popstate", abort);
  }, [transition, lenis]);

  return (
    <InkTransitionContext.Provider value={{ navigate, active: transition !== null }}>
      {children}
      {transition && (
        <InkBleedOverlay
          effect={transition.effect}
          cx={transition.cx}
          cy={transition.cy}
          vw={transition.vw}
          vh={transition.vh}
          entries={entries}
          onCompleteAction={handleComplete}
        />
      )}
    </InkTransitionContext.Provider>
  );
}
