"use client";
import { useLenisInstance } from "@/components/LenisProvider";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** In-page anchor that scrolls through Lenis (same feel as the side-nav index)
    instead of the browser's instant jump. */
export default function ScrollLink({
  href,
  className,
  children,
}: {
  href: `#${string}`;
  className?: string;
  children: React.ReactNode;
}) {
  const lenis = useLenisInstance();
  const shouldReduceMotion = useReducedMotion();
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        const target = document.getElementById(href.slice(1));
        if (!target) return;
        e.preventDefault();
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
      }}
    >
      {children}
    </a>
  );
}
