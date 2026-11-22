"use client";
import Image from "next/image";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import Chip from "@/components/ui/Chip";
import Label from "@/components/ui/Label";
import { useInkTransition } from "@/components/transition/InkTransitionProvider";
import { LAB_EXPS } from "@/lib/lab-meta";
import type { LabSlug } from "@/lib/lab-meta";

const DESCRIPTIONS: Record<LabSlug, string> = {
  doodle: "Draw something and a CNN guesses what it is. 50 classes, trained on Google QuickDraw.",
  sentiment: "Type a sentence and an LSTM rates how positive it is. Trained on IMDB reviews.",
  kmeans: "Place points and watch k-means cluster them step by step.",
};

// Real captures of each experiment mid-run, cropped from the desktop Lab
// pages; phones show the same crop scaled down. Previews only, not zoomable:
// the live experiment is one click away, and a lightbox button can't sit inside
// the card's link. alt is empty because the link's visible text already names
// the experiment, and a description would only lengthen its accessible name.
const SHOTS: Record<LabSlug, string> = {
  doodle: "/lab/doodle.png",
  sentiment: "/lab/sentiment.png",
  kmeans: "/lab/kmeans.png",
};

// The phone design shortens only the doodle card.
const SHORT_DESCRIPTIONS: Partial<Record<LabSlug, string>> = {
  doodle: "Draw something and a CNN guesses what it is.",
};

export default function Lab() {
  const { navigate } = useInkTransition();

  return (
    <section id="sec-lab" className="section">
      <SectionHeader num="03" title="The Lab" meta="3 experiments · run in your browser" />
      <p className="faint max-w-[720px] mb-7.5 max-wide:mb-[16px] max-wide:leading-[1.6]">
        Real ML runs entirely in your browser with TensorFlow.js. There is no server and no cold
        start. Everything below is live, so open an experiment and try it.
      </p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[21px]">
        {LAB_EXPS.map((e) => {
          const short = SHORT_DESCRIPTIONS[e.slug];
          return (
            <Link
              key={e.slug}
              href={`/lab/${e.slug}`}
              className="block text-[color:inherit] no-underline cursor-pointer [transition:transform_0.14s,box-shadow_0.14s] hover:[transform:translateY(-3px)] motion-reduce:transition-none"
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
              {/* No tilt, unlike the design: a sub-degree rotation blurs the 15.5px
                  body copy at 1x, the same reason the Work cards dropped theirs. */}
              <div
                className="sketch-box lab-card p-0 overflow-hidden"
                style={{ borderTop: `4px solid var(--color-${e.accent})` }}
              >
                <div className="flex justify-between items-center px-[18px] pt-[12px]">
                  <Label
                    kind="caption"
                    tone="inherit"
                    as="span"
                    style={{ color: `var(--color-${e.accent}-ink)` }}
                  >
                    {e.num}
                  </Label>
                  <Label kind="caption" as="span">in your browser</Label>
                </div>
                <div
                  className="mx-[18px] mt-[8px] pb-[8px]"
                  style={{ borderBottom: "1.5px dashed rgba(0, 0, 0, 0.25)" }}
                >
                  <Image
                    src={SHOTS[e.slug]}
                    alt=""
                    width={640}
                    height={300}
                    sizes="(max-width: 720px) 90vw, 320px"
                    className="block w-full h-auto"
                  />
                </div>
                <div className="px-[18px] pt-[16px] pb-[18px]">
                  <h3 className="card-title">{e.title}</h3>
                  <p className="text-small mt-1.5">
                    {short ? (
                      <>
                        <span className="max-wide:hidden">{DESCRIPTIONS[e.slug]}</span>
                        <span className="wide:hidden">{short}</span>
                      </>
                    ) : (
                      DESCRIPTIONS[e.slug]
                    )}
                  </p>
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
