"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "@/components/ui/Lightbox";

export default function ZoomableImage({
  src,
  alt,
  caption,
  width,
  height,
  fit,
}: {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  fit: "contain" | "cover";
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="project-media" data-fit={fit}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(max-width: 1000px) 100vw, 45vw"
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
