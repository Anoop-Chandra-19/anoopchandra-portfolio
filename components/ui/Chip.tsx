import type { CSSProperties, ReactNode } from "react";

type ChipKind = "electric" | "coral" | "teal" | "navy";

export default function Chip({
  children,
  kind,
  style,
}: {
  children: ReactNode;
  kind?: ChipKind;
  style?: CSSProperties;
}) {
  return (
    <span className={`chip ${kind ?? ""}`} style={style}>
      {children}
    </span>
  );
}
