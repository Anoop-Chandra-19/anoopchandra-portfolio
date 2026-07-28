import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useLenisInstance } from "@/components/LenisProvider";

export default function Lightbox({
  src,
  alt,
  caption,
  width,
  height,
  onClose,
}: {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const lenis = useLenisInstance();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // Lenis drives the scroll, so `overflow: hidden` on the body would not hold it
    lenis?.stop();
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [onClose, lenis]);

  // Portalled so the band's `overflow: hidden` can never clip the overlay
  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={caption} onClick={onClose}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="100vw"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="lightbox-bar mono">
        <span>{caption}</span>
        <button type="button" ref={closeRef} onClick={onClose}>
          close · esc
        </button>
      </div>
    </div>,
    document.body
  );
}
