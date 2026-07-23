"use client";

import type { ReactNode } from "react";
import type { LenisOptions } from "lenis";
import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export { useLenis as useLenisInstance } from "lenis/react";

type Props = {
  children: ReactNode;
};

export function LenisProvider({ children }: Props) {
  const shouldReduceMotion = useReducedMotion();
  const options: LenisOptions = {
    autoRaf: true,
    gestureOrientation: "vertical",
    smoothWheel: !shouldReduceMotion,
    stopInertiaOnNavigate: true,
    touchMultiplier: 1.2,
  };

  return (
    <ReactLenis root options={options}>
      {children}
    </ReactLenis>
  );
}
