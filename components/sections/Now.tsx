import type { CSSProperties } from "react";
import SectionHeader from "@/components/ui/SectionHeader";

const CARDS = [
  {
    tag: "// making",
    h: "after work",
    items: ["Pushing Mosaic toward its first useful release"],
    rot: -1.5,
  },
  {
    tag: "// learning",
    h: "working through",
    items: ["Rust, with The Rust Programming Language nearby"],
    rot: 1.2,
  },
  {
    tag: "// reading",
    h: "on the nightstand",
    items: ["The Way of Kings by Brandon Sanderson"],
    rot: -0.5,
  },
];

export default function Now() {
  return (
    <section id="sec-now" className="section">
      <SectionHeader num="01" title="Now" meta="what has my attention lately" />
      <div
        className="now-well p-10 rounded-lg"
        style={{ background: "color-mix(in oklab, var(--color-coral) 8%, var(--color-paper-2))" }}
      >
        <div className="row items-stretch gap-6">
          {CARDS.map((c) => (
            <div
              key={c.h}
              className="sketch-box now-card flex-1 bg-paper"
              // rotation rides on a custom property so the mobile pass can zero
              // it in CSS — an inline transform would need !important to undo
              style={{ "--rot": `${c.rot}deg` } as CSSProperties}
            >
              <div className="mono faint text-[11px] mb-1.5">{c.tag}</div>
              <h4>{c.h}</h4>
              <ul className="pl-[18px] mt-2 text-[16px] leading-[1.6]">
                {c.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mono faint mt-[18px] text-[11px] text-right">
          ↻ a snapshot, updated by hand
        </div>
      </div>
    </section>
  );
}
