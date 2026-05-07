import SectionHeader from "@/components/ui/SectionHeader";
import Chip from "@/components/ui/Chip";

const EXPS = [
  {
    t: "Doodle Classifier",
    n: "exp-001",
    d: "Draw → CNN guesses what it is. 50+ classes, trained on Google QuickDraw.",
    color: "var(--electric)",
    action: "draw something →",
  },
  {
    t: "Sentiment Analysis",
    n: "exp-002",
    d: "Type text → LSTM rates emotion. Trained on IMDB reviews.",
    color: "var(--teal)",
    action: "type to start →",
  },
  {
    t: "K-Means Playground",
    n: "exp-003",
    d: "Place points → watch clustering animate step-by-step.",
    color: "var(--coral)",
    action: "drop points →",
  },
];

export default function Lab() {
  return (
    <section id="sec-lab" className="section">
      <SectionHeader num="03" title="The Lab" meta="3 live experiments · all in-browser" />
      <p className="faint" style={{ maxWidth: 720, marginBottom: 28, fontSize: 16 }}>
        Real ML running entirely in your browser with TensorFlow.js — no server, no cold starts.
        Everything below is interactive in the actual site.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}
      >
        {EXPS.map((e, i) => (
          <div
            key={e.t}
            className={`sketch-box ${i % 2 ? "tilt-r" : "tilt-l"}`}
            style={{ padding: 0, overflow: "hidden" }}
          >
            <div
              className="mono"
              style={{
                padding: "10px 16px",
                background: e.color,
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
              }}
            >
              <span>{e.n}</span>
              <span>
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "white",
                    marginRight: 6,
                    animation: "pulse 1.4s infinite",
                  }}
                />
                live
              </span>
            </div>
            <div
              style={{
                height: 160,
                background: `repeating-linear-gradient(45deg, transparent 0 8px, rgba(0,0,0,0.05) 8px 9px)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderBottom: "2px solid var(--ink)",
              }}
            >
              <span className="hand" style={{ fontSize: 22, color: "var(--ink-soft)" }}>
                {e.action}
              </span>
            </div>
            <div style={{ padding: 18 }}>
              <h4>{e.t}</h4>
              <p style={{ fontSize: 13, marginTop: 6 }}>{e.d}</p>
              <Chip>run experiment →</Chip>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
