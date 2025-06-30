"use client";

import React, { useRef } from "react";
import { useLenis } from "@/hooks/useLenis";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLElement | null>(null);
  useLenis(scrollRef);

  return (
    <section ref={scrollRef}>
      {children}
    </section>
  );
}
