export default function SectionHeader({
  num,
  title,
  meta,
}: {
  num: string;
  title: string;
  meta: string;
}) {
  return (
    <div className="section-header">
      <span className="num">{num}.</span>
      <h2>{title}</h2>
      <span className="meta">{meta}</span>
    </div>
  );
}

export function SectionHeaderArrow({
  num,
  title,
  meta,
}: {
  num: string;
  title: string;
  meta: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        marginBottom: 32,
        paddingBottom: 12,
        borderBottom: "2px dashed var(--ink)",
      }}
    >
      <svg
        viewBox="0 0 220 90"
        width="180"
        height="74"
        aria-hidden="true"
        style={{ position: "absolute", top: -28, left: -10, pointerEvents: "none", overflow: "visible" }}
      >
        <path
          d="M 8 14 C 60 4, 110 38, 150 62"
          fill="none"
          stroke="var(--electric)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M 150 62 L 140 50 M 150 62 L 138 64"
          fill="none"
          stroke="var(--electric)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <text
          x="14"
          y="10"
          fill="var(--electric)"
          fontFamily="Caveat, cursive"
          fontSize="20"
          transform="rotate(-6 14 10)"
        >
          the work ↘
        </text>
      </svg>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18, paddingLeft: 170 }}>
        <span className="mono" style={{ fontSize: 14, color: "var(--ink-soft)" }}>
          {num}.
        </span>
        <h2 style={{ flex: 1, margin: 0 }}>{title}</h2>
        <span className="mono" style={{ fontSize: 12, color: "var(--ink-soft)", textAlign: "right" }}>
          {meta}
        </span>
      </div>
    </div>
  );
}

export function SectionHeaderStamp({
  num,
  title,
  meta,
}: {
  num: string;
  title: string;
  meta: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        marginBottom: 32,
        paddingBottom: 12,
        borderBottom: "2px dashed var(--ink)",
        display: "flex",
        alignItems: "center",
        gap: 22,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          position: "relative",
          border: "2px solid var(--ink)",
          background: "color-mix(in oklab, var(--coral) 12%, var(--paper))",
          padding: "8px 22px 10px",
          borderRadius: 3,
          transform: "rotate(-1.2deg)",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 4,
            border: "1px dashed color-mix(in oklab, var(--ink) 50%, transparent)",
            borderRadius: 1,
            pointerEvents: "none",
          }}
        />
        <div
          className="mono"
          style={{
            fontSize: 10,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "var(--ink-soft)",
            marginBottom: -2,
          }}
        >
          § {num} · postage paid
        </div>
        <h2 style={{ margin: 0, fontSize: 56, lineHeight: 1 }}>{title}</h2>
      </div>
      <svg viewBox="0 0 200 40" width="180" height="36" aria-hidden="true" style={{ flexShrink: 0 }}>
        <line x1="2" y1="12" x2="198" y2="12" stroke="var(--electric)" strokeWidth="1.4" opacity="0.9" />
        <line x1="2" y1="20" x2="198" y2="20" stroke="var(--electric)" strokeWidth="1.4" opacity="0.9" />
        <line x1="2" y1="28" x2="198" y2="28" stroke="var(--electric)" strokeWidth="1.4" opacity="0.9" />
      </svg>
      <span className="mono" style={{ fontSize: 12, color: "var(--ink-soft)", marginLeft: "auto" }}>
        {meta}
      </span>
    </div>
  );
}
