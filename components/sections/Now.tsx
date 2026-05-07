import SectionHeader from "@/components/ui/SectionHeader";

const CARDS = [
  {
    tag: "// building",
    h: "this week",
    items: [
      "Loan-forms feature at Panacea Financial",
      "RN internal-build polish pass",
      "This portfolio rewrite",
    ],
    rot: -1.5,
  },
  {
    tag: "// reading",
    h: "on the desk",
    items: [
      "Designing Data-Intensive Apps",
      "Llama-3 architecture posts",
      "FastHTML docs",
    ],
    rot: 1.2,
  },
  {
    tag: "// listening",
    h: "headphones",
    items: ["Lo-fi for debugging", "Dwarkesh podcast", "occasional Tame Impala"],
    rot: -0.5,
  },
];

export default function Now() {
  // Static date — picked at design time so the page is consistent in SSR and client.
  const meta = "week of apr 29, 2026";
  return (
    <section id="sec-now" className="section">
      <SectionHeader num="01" title="Now" meta={meta} />
      <div
        style={{
          background: "color-mix(in oklab, var(--coral) 8%, var(--paper-2))",
          padding: 40,
          borderRadius: 8,
        }}
      >
        <div className="row" style={{ alignItems: "stretch", gap: 24 }}>
          {CARDS.map((c) => (
            <div
              key={c.h}
              className="sketch-box"
              style={{ flex: 1, transform: `rotate(${c.rot}deg)`, background: "var(--paper)" }}
            >
              <div className="mono faint" style={{ fontSize: 11, marginBottom: 6 }}>
                {c.tag}
              </div>
              <h4>{c.h}</h4>
              <ul style={{ paddingLeft: 18, margin: "8px 0 0", fontSize: 15, lineHeight: 1.65 }}>
                {c.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mono faint" style={{ marginTop: 18, fontSize: 11, textAlign: "right" }}>
          ↻ updates every couple of weeks
        </div>
      </div>
    </section>
  );
}
