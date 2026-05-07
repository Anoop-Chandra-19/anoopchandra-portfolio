import SectionHeader from "@/components/ui/SectionHeader";
import Chip from "@/components/ui/Chip";

const EXPS = [
  {
    t: "Doodle Classifier",
    n: "exp-001",
    d: "Draw → CNN guesses what it is. 50+ classes, trained on Google QuickDraw.",
    color: "var(--color-electric)",
    action: "draw something →",
  },
  {
    t: "Sentiment Analysis",
    n: "exp-002",
    d: "Type text → LSTM rates emotion. Trained on IMDB reviews.",
    color: "var(--color-teal)",
    action: "type to start →",
  },
  {
    t: "K-Means Playground",
    n: "exp-003",
    d: "Place points → watch clustering animate step-by-step.",
    color: "var(--color-coral)",
    action: "drop points →",
  },
];

const STRIPE_BG =
  "repeating-linear-gradient(45deg, transparent 0 8px, rgba(0,0,0,0.05) 8px 9px)";

export default function Lab() {
  return (
    <section id="sec-lab" className="section">
      <SectionHeader num="03" title="The Lab" meta="3 live experiments · all in-browser" />
      <p className="faint max-w-[720px] mb-7 text-base">
        Real ML running entirely in your browser with TensorFlow.js — no server, no cold starts.
        Everything below is interactive in the actual site.
      </p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
        {EXPS.map((e, i) => (
          <div
            key={e.t}
            className={`sketch-box ${i % 2 ? "tilt-r" : "tilt-l"} p-0 overflow-hidden`}
          >
            <div
              className="mono py-2.5 px-4 flex justify-between text-xs text-white"
              style={{ background: e.color }}
            >
              <span>{e.n}</span>
              <span>
                <span
                  className="inline-block w-2 h-2 rounded-full bg-white mr-1.5"
                  style={{ animation: "pulse 1.4s infinite" }}
                />
                live
              </span>
            </div>
            <div
              className="h-40 flex items-center justify-center border-b-2 border-ink"
              style={{ background: STRIPE_BG }}
            >
              <span className="hand text-[22px] text-ink-soft">{e.action}</span>
            </div>
            <div className="p-[18px]">
              <h4>{e.t}</h4>
              <p className="text-[13px] mt-1.5">{e.d}</p>
              <Chip>run experiment →</Chip>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
