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
    <div className="sh-arrow relative mb-8 pb-3 border-b-2 border-dashed border-ink">
      <svg
        viewBox="0 0 220 90"
        width="180"
        height="74"
        aria-hidden="true"
        className="sh-arrow-svg absolute -top-7 -left-2.5 pointer-events-none overflow-visible"
      >
        <path
          d="M 8 14 C 60 4, 110 38, 150 62"
          fill="none"
          stroke="var(--color-electric)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M 150 62 L 140 50 M 150 62 L 138 64"
          fill="none"
          stroke="var(--color-electric)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <text
          x="14"
          y="10"
          fill="var(--color-electric)"
          fontFamily="Caveat, cursive"
          fontSize="20"
          transform="rotate(-6 14 10)"
        >
          the work ↘
        </text>
      </svg>
      <div className="sh-arrow-row flex items-baseline gap-[18px] pl-[170px]">
        <span className="sh-num mono text-sm text-ink-soft">{num}.</span>
        <h2 className="flex-1 m-0">{title}</h2>
        <span className="sh-meta mono text-xs text-ink-soft text-right">{meta}</span>
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
    <div className="sh-stamp relative mb-8 pb-3 border-b-2 border-dashed border-ink flex items-center gap-[22px] flex-wrap">
      <div
        className="sh-stamp-box relative border-2 border-ink rounded-[3px] px-[22px] pt-2 pb-2.5"
        style={{
          background: "color-mix(in oklab, var(--color-coral) 12%, var(--color-paper))",
          transform: "rotate(-1.2deg)",
        }}
      >
        <span
          aria-hidden="true"
          className="absolute inset-1 rounded-[1px] pointer-events-none"
          style={{ border: "1px dashed color-mix(in oklab, var(--color-ink) 50%, transparent)" }}
        />
        <div className="mono text-[10px] tracking-[3px] uppercase text-ink-soft -mb-0.5">
          § {num} · postage paid
        </div>
        <h2 className="m-0 text-[56px] leading-none">{title}</h2>
      </div>
      <svg
        viewBox="0 0 200 40"
        width="180"
        height="36"
        aria-hidden="true"
        className="sh-stamp-rule shrink-0"
      >
        <line x1="2" y1="12" x2="198" y2="12" stroke="var(--color-electric)" strokeWidth="1.4" opacity="0.9" />
        <line x1="2" y1="20" x2="198" y2="20" stroke="var(--color-electric)" strokeWidth="1.4" opacity="0.9" />
        <line x1="2" y1="28" x2="198" y2="28" stroke="var(--color-electric)" strokeWidth="1.4" opacity="0.9" />
      </svg>
      <span className="sh-meta mono text-xs text-ink-soft ml-auto">{meta}</span>
    </div>
  );
}
