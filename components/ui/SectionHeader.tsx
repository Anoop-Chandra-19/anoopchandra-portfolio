import Label from "./Label";

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
    <div className="flex items-baseline gap-[18px] mb-[24px] pb-[8px] border-b-2 border-dashed border-ink max-wide:flex-wrap max-wide:gap-x-[14px] max-wide:gap-y-[6px] max-wide:mb-[20px] max-wide:pb-[8px]">
      <span className="font-mono text-[14px] text-ink-soft max-wide:order-1 max-wide:text-[11px] max-wide:tracking-[1px]">{num}.</span>
      <h2 className="flex-1 max-wide:order-3 max-wide:flex-[1_0_100%] max-wide:mt-[6px] max-wide:mb-0 max-wide:mx-0">{title}</h2>
      <span className="font-mono text-[12px] text-ink-soft text-right max-wide:order-2 max-wide:ml-auto max-wide:text-[10.5px] max-wide:tracking-[0.5px]">{meta}</span>
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
    <div className="relative mb-8 pb-3 border-b-2 border-dashed border-ink max-wide:mb-[20px] max-wide:pb-[8px]">
      <svg
        viewBox="0 0 220 90"
        width="180"
        height="74"
        aria-hidden="true"
        className="max-wide:hidden absolute -top-7 -left-2.5 pointer-events-none overflow-visible"
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
      <div className="flex items-baseline gap-[18px] pl-[170px] max-wide:flex-wrap max-wide:gap-x-[14px] max-wide:gap-y-[6px] max-wide:pl-0">
        <span className="mono text-sm text-ink-soft max-wide:order-1 max-wide:text-[11px] max-wide:tracking-[1px]">{num}.</span>
        <h2 className="flex-1 m-0 max-wide:order-3 max-wide:flex-[1_0_100%] max-wide:mt-[6px]">{title}</h2>
        <span className="mono text-xs text-ink-soft text-right max-wide:order-2 max-wide:ml-auto max-wide:text-[10.5px] max-wide:tracking-[0.5px]">{meta}</span>
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
    <div className="relative mb-8 pb-3 border-b-2 border-dashed border-ink flex items-center gap-[22px] flex-wrap max-wide:mb-[20px] max-wide:gap-[12px]">
      <div
        className="relative border-2 border-ink rounded-[3px] px-[22px] pt-2 pb-2.5 max-wide:px-[16px] max-wide:pt-[6px] max-wide:pb-[8px]"
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
        <Label kind="tag" tone="soft" className="-mb-0.5">
          § {num} · postage paid
        </Label>
        <h2 className="m-0 text-[40px] leading-[1.08] tracking-[-0.016em] max-wide:text-[28px] max-wide:leading-[1.1] max-wide:tracking-[-0.014em]">{title}</h2>
      </div>
      <svg
        viewBox="0 0 200 40"
        width="180"
        height="36"
        aria-hidden="true"
        className="shrink-0 max-wide:hidden"
      >
        <line x1="2" y1="12" x2="198" y2="12" stroke="var(--color-electric)" strokeWidth="1.4" opacity="0.9" />
        <line x1="2" y1="20" x2="198" y2="20" stroke="var(--color-electric)" strokeWidth="1.4" opacity="0.9" />
        <line x1="2" y1="28" x2="198" y2="28" stroke="var(--color-electric)" strokeWidth="1.4" opacity="0.9" />
      </svg>
      <span className="mono text-xs text-ink-soft ml-auto max-wide:text-[10.5px] max-wide:tracking-[0.5px]">{meta}</span>
    </div>
  );
}
