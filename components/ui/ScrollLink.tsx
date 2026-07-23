"use client";
import { useLenisInstance } from "@/components/LenisProvider";

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
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        const target = document.getElementById(href.slice(1));
        if (!target) return;
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, { offset: 0, duration: 1.1, lerp: 0.1 });
        } else {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }}
    >
      {children}
    </a>
  );
}
