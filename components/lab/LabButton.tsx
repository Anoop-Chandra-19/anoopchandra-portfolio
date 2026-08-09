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
  accent?: LabAccent;
  sm?: boolean;
}) {
  return (
    <button
      type="button"
      className={`lx-btn${accent ? " on" : ""}${sm ? " sm" : ""}`}
      onClick={onClick}
      disabled={disabled}
      style={accent ? ({ "--lxa": `var(--color-${accent})` } as React.CSSProperties) : undefined}
    >
      {children}
    </button>
  );
}
