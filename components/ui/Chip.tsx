import type { ReactNode } from "react";

type ChipKind = "electric" | "coral" | "teal" | "navy";

export default function Chip({
  children,
  kind,
}: {
  children: ReactNode;
  kind?: ChipKind;
}) {
  return <span className={`chip ${kind ?? ""}`}>{children}</span>;
}
