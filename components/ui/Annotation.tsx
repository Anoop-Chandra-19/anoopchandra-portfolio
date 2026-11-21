import type { CSSProperties, ReactNode } from "react";

type NoteColor = "electric" | "coral" | "teal" | "navy";

const COLOR: Record<NoteColor, string> = {
  electric: "text-electric",
  coral: "text-coral",
  teal: "text-teal",
  navy: "text-navy",
};

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
    <div
      className={`accent absolute pointer-events-none text-[21px] leading-none max-wide:text-[20px] ${COLOR[color ?? "electric"]}`}
      style={style}
    >
      {children}
    </div>
  );
}
