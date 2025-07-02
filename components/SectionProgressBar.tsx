"use client";

import { useEffect, useState, RefObject } from "react";
import { motion } from "framer-motion";

interface SectionProgressBarProps {
  scrollContainerRef: RefObject<HTMLElement | null>;
}

export default function SectionProgressBar({ scrollContainerRef }: SectionProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container) return;

    const handler = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      // Prevent division by zero
      const total = Math.max(scrollHeight - clientHeight, 1);
      const percent = Math.min(scrollTop / total, 1);
      setProgress(percent);
    };

    container.addEventListener("scroll", handler, { passive: true });
    handler(); // Initialize

    return () => container.removeEventListener("scroll", handler);
  }, [scrollContainerRef]);

  return (
    <div
      className="fixed right-8 top-1/2 -translate-y-1/2 z-[9999] flex flex-col items-center"
      style={{ height: "70vh" }}
      aria-label="Scroll progress"
    >
      {/* Track (gray background bar) */}
      <div
        className="relative w-3 h-full rounded-full bg-[var(--color-navy)]/30"
        style={{
          boxShadow: "0 2px 24px 0 rgba(204,0,230,0.13)",
        }}
      >
        {/* Gradient accent fill: Fills from top to bottom */}
        <motion.div
          className="absolute left-0 top-0 w-3 rounded-full
            bg-gradient-to-b from-[var(--color-electric)] via-[var(--color-teal)] to-[var(--color-coral)]"
          style={{
            height: `${progress * 100}%`,
            minHeight: "0.4rem",
          }}
          initial={{ height: 0 }}
          animate={{ height: `${progress * 100}%` }}
          transition={{ ease: "easeOut", duration: 0.22 }}
        />
      </div>
    </div>
  );
}
