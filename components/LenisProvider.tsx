"use client";

import type { ReactNode } from "react";
import type { LenisOptions } from "lenis";
import { ReactLenis } from "lenis/react";

export { useLenis as useLenisInstance } from "lenis/react";

type Props = {
  children: ReactNode;
};

export function LenisProvider({ children }: Props) {
  // Wheel scrolling stays native: smoothing it eased each tick over ~870ms
  // (90% at ~370ms), which read as lag. Lenis stays for animated section
  // jumps and stop() under overlays.
  const options: LenisOptions = {
    autoRaf: true,
    gestureOrientation: "vertical",
    smoothWheel: false,
    stopInertiaOnNavigate: true,
    touchMultiplier: 1.2,
  };

  return (
    <ReactLenis root options={options}>
      {children}
    </ReactLenis>
  );
}
