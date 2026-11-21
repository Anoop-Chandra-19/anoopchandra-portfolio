import type { CSSProperties } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import Label from "@/components/ui/Label";

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
        className="p-10 rounded-lg max-wide:p-[18px] max-wide:rounded-[8px]"
        style={{ background: "color-mix(in oklab, var(--color-coral) 8%, var(--color-paper-2))" }}
      >
        <div className="flex items-stretch gap-[18px] max-wide:flex-col max-wide:gap-[14px]">
          {CARDS.map((c) => (
            <div
              key={c.h}
              className="sketch-box now-card flex-1 bg-paper"
              // rotation rides on a custom property so the mobile pass can zero
              // it in CSS — an inline transform would need !important to undo
              style={{ "--rot": `${c.rot}deg` } as CSSProperties}
            >
              <Label kind="meta" className="mb-1.5">{c.tag}</Label>
              <h3 className="card-title">{c.h}</h3>
              <ul className="pl-[18px] mt-2 text-[16px] leading-[1.6]">
                {c.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
