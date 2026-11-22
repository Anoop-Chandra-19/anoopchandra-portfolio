"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Lightbox from "@/components/ui/Lightbox";

/** How far ahead of the viewport a deferred image starts loading: one screen
    height, so it is ready before it scrolls in. That is ~800px on a phone and
    ~1,250px on a desktop window, in line with Chrome's own lazy loading on
    fast connections. */
const DEFER_MARGIN = "100% 0px";

/** The caller owns the outer frame; `.zoom-wrap` positions the enlarge button.
    `defer` holds the image back until it nears the viewport. Native lazy
    loading starts ~2,500px early on slow connections, which put the Work
    diagrams in the same window as the hero photo and took its bandwidth. */
export default function ZoomableImage({
  src,
  alt,
  caption,
  width,
  height,
  sizes,
  className,
  fit,
  priority,
  defer,
}: {
  src: string;
  alt: string;
  /** Shown in the lightbox bar; `alt` carries the accessible name. */
  caption: ReactNode;
  width: number;
  height: number;
  sizes?: string;
  className?: string;
  fit?: "contain" | "cover";
  priority?: boolean;
  defer?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [isNear, setIsNear] = useState(!defer);
  const placeholderRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const placeholder = placeholderRef.current;
    if (isNear || !placeholder) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setIsNear(true);
      },
      { rootMargin: DEFER_MARGIN }
    );
    observer.observe(placeholder);
    return () => observer.disconnect();
  }, [isNear]);

  const image = (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      preload={priority}
      fetchPriority={priority ? "high" : undefined}
      className="zoomable"
      onClick={() => setOpen(true)}
    />
  );
  return (
    <div className={`zoom-wrap${className ? ` ${className}` : ""}`} data-fit={fit}>
      {isNear ? (
        image
      ) : (
        // Same box the image will fill, so nothing moves when it arrives.
        // The noscript copy keeps the image for visitors without JavaScript.
        <span ref={placeholderRef} className="block w-full" style={{ aspectRatio: `${width} / ${height}` }}>
          <noscript>{image}</noscript>
        </span>
      )}
      <button type="button" className="zoom-btn" onClick={() => setOpen(true)}>
        ⤡ enlarge
      </button>
      {open && (
        <Lightbox
          src={src}
          alt={alt}
          caption={caption}
          width={width}
          height={height}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
