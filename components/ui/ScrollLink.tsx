"use client";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** In-page anchor that scrolls smoothly (same feel as the side-nav index)
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
  const shouldReduceMotion = useReducedMotion();
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        const target = document.getElementById(href.slice(1));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({
          behavior: shouldReduceMotion ? "auto" : "smooth",
          block: "start",
        });
      }}
    >
      {children}
    </a>
  );
}
