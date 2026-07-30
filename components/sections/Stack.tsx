import SectionHeader from "@/components/ui/SectionHeader";

function Tally({ n }: { n: number }) {
  const groups: number[] = [];
  let remaining = n;
  while (remaining > 0) {
    groups.push(Math.min(remaining, 5));
    remaining -= 5;
  }
  return (
    <span
      aria-label={`${n} year${n === 1 ? "" : "s"}`}
      title={`${n} yr`}
      className="inline-flex gap-1.5 items-center"
    >
      {groups.map((g, gi) => (
        <span
          key={gi}
          className="relative inline-block h-3.5"
          style={{ width: g >= 5 ? 22 : g * 4 }}
        >
          {Array.from({ length: Math.min(g, 4) }).map((_, i) => (
            <span
              key={i}
              className="absolute top-0 w-[1.5px] h-3.5 bg-ink-soft origin-top"
              style={{ left: i * 4, transform: `rotate(${-2 + i}deg)` }}
            />
          ))}
          {g === 5 && (
            <span
              className="absolute -left-0.5 top-1.5 w-[22px] h-[1.5px] bg-ink-soft origin-left"
              style={{ transform: "rotate(-18deg)" }}
            />
          )}
        </span>
      ))}
    </span>
  );
}

function CircleMark({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 200 60"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="absolute -inset-x-2.5 -inset-y-1.5 pointer-events-none overflow-visible"
      style={{ width: "calc(100% + 20px)", height: "calc(100% + 12px)" }}
    >
      <ellipse
        cx="100"
        cy="30"
        rx="94"
        ry="24"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        style={{ transform: "rotate(-1.5deg)", transformOrigin: "center" }}
      />
      <ellipse
        cx="100"
        cy="30"
        rx="92"
        ry="22"
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
        style={{ transform: "rotate(1deg)", transformOrigin: "center" }}
      />
    </svg>
  );
}

type StackItem = readonly [name: string, years: number, obsession?: boolean];

const COLS: ReadonlyArray<{
  h: string;
  c: string;
  note: string;
  items: ReadonlyArray<StackItem>;
}> = [
  {
    h: "at work",
    c: "var(--color-electric)",
    note: "shipping product, paid in PRs",
    items: [
      ["TypeScript", 4],
      ["React", 5],
      ["React Native", 1],
      ["NestJS", 3, true],
      ["Python", 6],
      ["Azure Functions", 1],
      ["Azure AI Foundry", 1],
      ["OpenTelemetry", 1],
      ["PostgreSQL", 4],
      ["Helm / K8s", 1],
      ["Azure DevOps", 2],
      ["Terraform", 2],
      ["Git", 6],
    ],
  },
  {
    h: "in the lab",
    c: "var(--color-teal)",
    note: "MS in applied ML, still hacking",
    items: [
      ["Python", 6],
      ["PyTorch", 3],
      ["LLMs / RAG", 2, true],
      ["FastAPI", 3],
      ["Hugging Face", 2],
      ["TensorFlow.js", 1],
      ["Whisper", 1],
      ["MongoDB", 2],
      ["AWS", 3],
    ],
  },
  {
    h: "at home",
    c: "var(--color-coral)",
    note: "linux daily, windows for games",
    items: [
      ["CachyOS + niri", 1, true],
      ["Rust", 1],
      ["Noctalia shell", 1],
      ["GNOME (for fun)", 3],
      ["Neovim", 3],
      ["tmux + zsh", 4],
      ["Custom PC builds", 5],
      ["Self-hosted services", 2],
      ["Tailscale", 2],
      ["Docker", 4],
    ],
  },
];

export default function Stack() {
  return (
    <section id="sec-stack" className="section">
      <SectionHeader num="04" title="Stack" meta="grouped by where I use it" />
      <div className="mono faint stack-legend text-[11px] mb-[18px] flex gap-[18px] flex-wrap">
        <span>tally marks = rough years of use</span>
        <span className="stack-legend-sep">·</span>
        <span>circled = current obsession</span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
        {COLS.map((col) => (
          <div
            key={col.h}
            className="sketch-box pr-[22px]"
            style={{ borderTop: "5px solid", borderTopColor: col.c }}
          >
            <h4 style={{ color: col.c }}>{col.h}</h4>
            <div className="mono faint text-[11px] mt-0.5">{col.note}</div>
            <ul className="mono stack-list list-none p-0 mt-4 text-[13px] tracking-[-0.01em] leading-[1.4]">
              {col.items.map(([name, years, obsession]) => (
                <li
                  key={name}
                  className="grid grid-cols-[1fr_auto] items-center gap-x-2.5 py-[7px]"
                  style={{
                    borderBottom:
                      "1px dashed color-mix(in oklab, var(--color-ink) 12%, transparent)",
                  }}
                >
                  <span className="relative inline-block w-fit">
                    {name}
                    {obsession && <CircleMark color={col.c} />}
                  </span>
                  <Tally n={years} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
