"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function isMobile() {
  return typeof window !== "undefined" && window.innerWidth < 768;
}

export default function SectionProgressBar() {
  const [visible, setVisible] = useState(false);
  const fillRef = useRef<HTMLDivElement>(null);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let ticking = false;

    function updateProgress() {
      const scrollY = window.scrollY || window.pageYOffset;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = Math.min(scrollY / totalHeight, 1);

      if (fillRef.current) {
        fillRef.current.style.height = `${percent * 100}%`;
      }

      // On desktop: persistent after small scroll; on mobile: handled below
      if (!isMobile()) {
        setVisible(scrollY > 40 || percent > 0.05);
      }

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
      // On mobile, show and auto-hide after delay
      if (isMobile()) {
        setVisible(true);
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        hideTimeout.current = setTimeout(() => setVisible(false), 250);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    updateProgress(); // Run on mount

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="progressbar"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
          className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center pointer-events-none"
          style={{ height: "70vh" }}
          aria-label="Scroll progress"
        >
          <div
            className="relative w-3 h-full rounded-full bg-[var(--color-navy)]/30"
            style={{
              boxShadow: "0 2px 24px 0 rgba(204,0,230,0.13)",
            }}
          >
            <div
              ref={fillRef}
              className="absolute left-0 top-0 w-3 rounded-full bg-gradient-to-b from-[var(--color-electric)] via-[var(--color-teal)] to-[var(--color-coral)]"
              style={{
                height: "0.4rem",
                minHeight: "0.4rem",
                transition: "height 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
                willChange: "height, transform",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
