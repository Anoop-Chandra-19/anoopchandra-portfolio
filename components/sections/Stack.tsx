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
      style={{ display: "inline-flex", gap: 6, alignItems: "center" }}
    >
      {groups.map((g, gi) => (
        <span
          key={gi}
          style={{
            position: "relative",
            display: "inline-block",
            width: g >= 5 ? 22 : g * 4,
            height: 14,
          }}
        >
          {Array.from({ length: Math.min(g, 4) }).map((_, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                left: i * 4,
                top: 0,
                width: 1.5,
                height: 14,
                background: "var(--ink-soft)",
                transform: `rotate(${-2 + i}deg)`,
                transformOrigin: "top center",
              }}
            />
          ))}
          {g === 5 && (
            <span
              style={{
                position: "absolute",
                left: -2,
                top: 6,
                width: 22,
                height: 1.5,
                background: "var(--ink-soft)",
                transform: "rotate(-18deg)",
                transformOrigin: "left center",
              }}
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
      style={{
        position: "absolute",
        inset: "-6px -10px",
        width: "calc(100% + 20px)",
        height: "calc(100% + 12px)",
        pointerEvents: "none",
        overflow: "visible",
      }}
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
    c: "var(--electric)",
    note: "shipping product, paid in PRs",
    items: [
      ["TypeScript", 4],
      ["React", 5],
      ["NestJS", 3, true],
      ["PostgreSQL", 4],
      ["Redis", 3],
      ["Azure", 2],
      ["Terraform", 2],
      ["Snowflake", 1],
      ["Service Bus", 1],
      ["Git", 6],
    ],
  },
  {
    h: "in the lab",
    c: "var(--teal)",
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
    c: "var(--coral)",
    note: "linux daily, windows for games",
    items: [
      ["Arch / Hyprland", 2, true],
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
      <div
        className="mono faint"
        style={{ fontSize: 11, marginBottom: 18, display: "flex", gap: 18, flexWrap: "wrap" }}
      >
        <span>tally marks = rough years of use</span>
        <span>·</span>
        <span>circled = current obsession</span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 24,
        }}
      >
        {COLS.map((col) => (
          <div
            key={col.h}
            className="sketch-box"
            style={{ borderTop: "5px solid", borderTopColor: col.c, paddingRight: 22 }}
          >
            <h4 style={{ color: col.c }}>{col.h}</h4>
            <div className="mono faint" style={{ fontSize: 11, marginTop: 2 }}>
              {col.note}
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "16px 0 0",
                fontSize: 15,
                lineHeight: 1.4,
              }}
            >
              {col.items.map(([name, years, obsession]) => (
                <li
                  key={name}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    alignItems: "center",
                    columnGap: 10,
                    padding: "7px 0",
                    borderBottom:
                      "1px dashed color-mix(in oklab, var(--ink) 12%, transparent)",
                  }}
                >
                  <span
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: "fit-content",
                    }}
                  >
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
