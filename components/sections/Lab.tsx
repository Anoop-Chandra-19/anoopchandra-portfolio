"use client";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import Chip from "@/components/ui/Chip";
import { useInkTransition } from "@/components/transition/InkTransitionProvider";
import { LAB_EXPS } from "@/lib/lab-meta";

const ACTIONS: Record<string, string> = {
  doodle: "draw something →",
  sentiment: "type to start →",
  kmeans: "drop points →",
};

const DESCRIPTIONS: Record<string, string> = {
  doodle: "Draw → CNN guesses what it is. 50 classes, trained on Google QuickDraw.",
  sentiment: "Type text → LSTM rates emotion. Trained on IMDB reviews.",
  kmeans: "Place points → watch clustering animate step-by-step.",
};

const STRIPE_BG =
  "repeating-linear-gradient(45deg, transparent 0 8px, rgba(0,0,0,0.05) 8px 9px)";

export default function Lab() {
  const { navigate } = useInkTransition();

  return (
    <section id="sec-lab" className="section">
      <SectionHeader num="03" title="The Lab" meta="3 live experiments · all in-browser" />
      <p className="faint max-w-[720px] mb-7">
        Real ML runs entirely in your browser with TensorFlow.js. There is no server and no cold
        start. Everything below is live, so open an experiment and try it.
      </p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
        {LAB_EXPS.map((e, i) => {
          return (
            <Link
              key={e.slug}
              href={`/lab/${e.slug}`}
              className="lab-card-btn"
              /* No aria-label: it replaced the card's whole subtree, hiding the
                 number, status and description, and left the accessible name
                 without the visible "open experiment" text. */
              onClick={(ev) => {
                // keep native behavior for new-tab/window clicks
                if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
                ev.preventDefault();
                // bleed from the click point (ev.detail === 0 → keyboard
                // activation, no coords — fall back to the card)
                const originRect =
                  ev.detail === 0
                    ? ev.currentTarget.getBoundingClientRect()
                    : new DOMRect(ev.clientX, ev.clientY, 0, 0);
                navigate(`/lab/${e.slug}`, { effect: "bleed", originRect });
              }}
            >
              <div className={`sketch-box ${i % 2 ? "tilt-r" : "tilt-l"} p-0 overflow-hidden`}>
                <div
                  className="mono py-2.5 px-4 flex justify-between text-xs text-white"
                  style={{ background: `var(--color-${e.accent})` }}
                >
                  <span>{e.num}</span>
                  <span>
                    <span
                      className="inline-block w-2 h-2 rounded-full bg-white mr-1.5"
                      style={{ animation: "pulse 1.4s infinite" }}
                    />
                    live
                  </span>
                </div>
                <div
                  className="lab-card-canvas h-40 flex items-center justify-center border-b-2 border-ink"
                  style={{ background: STRIPE_BG }}
                >
                  <span className="text-[17px] text-ink-soft">{ACTIONS[e.slug]}</span>
                </div>
                <div className="p-[18px]">
                  <h3 className="card-title">{e.title}</h3>
                  <p className="text-[16px] leading-[1.55] mt-1.5">{DESCRIPTIONS[e.slug]}</p>
                  <Chip>▸ open experiment</Chip>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
