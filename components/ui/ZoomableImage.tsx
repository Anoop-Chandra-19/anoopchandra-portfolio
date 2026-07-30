"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Lightbox from "@/components/ui/Lightbox";

/** The one zoom affordance on the site: any content image gets the click-to-
 *  enlarge plate the work cards use. The caller owns the frame it sits in
 *  (`className` — .project-media, .je-plate-media, …); this only draws the
 *  image, the enlarge button and the overlay, so `.zoom-wrap`'s positioning is
 *  what the button anchors to. */
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
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`zoom-wrap${className ? ` ${className}` : ""}`} data-fit={fit}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className="zoomable"
        onClick={() => setOpen(true)}
      />
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
