"use client";

import { useEffect, useState, RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SectionProgressBarProps {
  scrollContainerRef: RefObject<HTMLElement | null>;
}

export default function SectionProgressBar({ scrollContainerRef }: SectionProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container) return;

    const handler = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      const total = Math.max(scrollHeight - clientHeight, 1);
      const percent = Math.min(scrollTop / total, 1);
      setProgress(percent);

      // Show after scrolling 40px or 5% of total scroll, hide otherwise
      setVisible(scrollTop > 40 || percent > 0.05);
    };

    container.addEventListener("scroll", handler, { passive: true });
    handler();

    return () => container.removeEventListener("scroll", handler);
  }, [scrollContainerRef]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="progressbar"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
          className="fixed right-8 top-1/2 -translate-y-1/2 z-[9999] flex flex-col items-center"
          style={{ height: "70vh" }}
          aria-label="Scroll progress"
        >
          {/* Track */}
          <div
            className="relative w-3 h-full rounded-full bg-[var(--color-navy)]/30"
            style={{
              boxShadow: "0 2px 24px 0 rgba(204,0,230,0.13)",
            }}
          >
            {/* Gradient fill: Top-to-bottom */}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
