"use client";
import { useEffect, useState } from "react";

// Thin coral bar at the top of the viewport. Optional — delete the import
// in ArticleEntry to drop it. This is the only client-side JS in the entry.
export default function ReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setP(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="je-progress" style={{ transform: `scaleX(${p})` }} aria-hidden="true" />;
}
