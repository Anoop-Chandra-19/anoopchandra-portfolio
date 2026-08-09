import type { CSSProperties, ReactNode } from "react";

type NoteColor = "coral" | "teal" | "navy";

export default function Annotation({
  children,
  color,
  style,
}: {
  children: ReactNode;
  color?: NoteColor;
  style?: CSSProperties;
}) {
  return (
    <div className={`note ${color ?? ""}`} style={style}>
      {children}
    </div>
  );
}
