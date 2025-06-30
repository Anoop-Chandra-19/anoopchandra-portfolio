import { useEffect, RefObject } from "react";
import Lenis from "@studio-freight/lenis";

export function useLenis(scrollRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!scrollRef?.current) return;

    const lenis = new Lenis({
      wrapper: scrollRef.current,
      content: scrollRef.current?.firstElementChild as HTMLElement | undefined,
      gestureOrientation: "vertical",
      touchMultiplier: 1.2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, [scrollRef]);
}
