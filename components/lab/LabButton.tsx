"use client";
import type { LabAccent } from "@/lib/lab-meta";

export default function LabButton({
  children,
  onClick,
  disabled,
  accent,
  sm,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  /** filled accent variant (the primary action) */
  accent?: LabAccent;
  sm?: boolean;
}) {
  return (
    <button
      className={`lx-btn${accent ? " on" : ""}${sm ? " sm" : ""}`}
      onClick={onClick}
      disabled={disabled}
      style={accent ? ({ "--lxa": `var(--color-${accent})` } as React.CSSProperties) : undefined}
    >
      {children}
    </button>
  );
}
