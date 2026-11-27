"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useInkTransition } from "@/components/transition/InkTransitionProvider";
import BackLink from "@/components/ui/BackLink";
import { LAB_EXPS, type LabExp } from "@/lib/lab-meta";
import DoodleLab from "@/components/lab/DoodleLab";
import SentimentLab from "@/components/lab/SentimentLab";
import ClusterClassifyLab from "@/components/lab/ClusterClassifyLab";
import KeyboardLegend from "./KeyboardLegend";

const DEMOS = {
  doodle: DoodleLab,
  sentiment: SentimentLab,
  kmeans: ClusterClassifyLab,
} as const;

const TAB = "py-[5px] px-3 border-[1.5px] rounded-[3px] font-mono text-caption no-underline [transition:all_0.14s]";

const MODIFIER_KEYS = new Set(["Alt", "Control", "Meta", "Shift", "CapsLock", "NumLock"]);



export default function LabShell({ exp }: { exp: LabExp }) {
  const { navigate } = useInkTransition();
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!MODIFIER_KEYS.has(event.key)) setIsKeyboardMode(true);
      if (event.key === "Escape") navigate("/", { effect: "peel" });
    };
    const onPointerDown = () => setIsKeyboardMode(false);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [navigate]);

  const Demo = DEMOS[exp.slug];

  return (
    <main
      id="main-content"
      className="max-w-[920px] mx-auto pt-9.5 px-10 pb-20 max-wide:pt-6.5 max-wide:px-5 max-wide:pb-[70px] page-in:animate-page-in"
      style={{ "--lxa": `var(--color-${exp.accent})` } as React.CSSProperties}
    >
      <div className="flex justify-between items-center gap-3.5 mb-6.5">
        <BackLink href="/" kind="box" peel>
          ← back to portfolio
        </BackLink>
        <nav className="flex gap-2" aria-label="Experiments">
          {LAB_EXPS.map((x) =>
            x.slug === exp.slug ? (
              <span key={x.slug} className={`${TAB} text-white bg-(--lxa) border-(--lxa)`} aria-current="page">
                {x.num}
              </span>
            ) : (
              // static links — ink is a home-only ceremony
              <Link
                key={x.slug}
                href={`/lab/${x.slug}`}
                className={`${TAB} bg-transparent text-ink-faint border-[color:color-mix(in_oklab,var(--color-ink)_26%,transparent)] hover:text-ink-soft hover:border-ink-soft`}
              >
                {x.num}
              </Link>
            )
          )}
        </nav>
      </div>

      <header className="pb-4 mb-[22px] [border-bottom:2px_dashed_color-mix(in_oklab,var(--color-ink)_30%,transparent)]">
        <span className="inline-flex items-center gap-[7px] py-1 px-[11px] border-[1.5px] border-(--lxa) rounded-[3px] bg-[color-mix(in_oklab,var(--lxa)_14%,var(--color-paper))] font-mono text-caption uppercase text-ink-soft">
          {exp.tag}
        </span>
        <h1 className="mt-3.5 mx-0 mb-1.5 text-[44px] leading-none max-wide:text-[34px] max-wide:leading-[1.04] max-wide:tracking-[-0.018em]">{exp.title}</h1>
        <p className="m-0 max-w-[640px] text-[19px] leading-[1.5] font-normal text-ink-soft max-wide:text-[17px]">{exp.blurb}</p>
      </header>

      <Demo accent={exp.accent} />
      <KeyboardLegend isVisible={isKeyboardMode} hasPointField={exp.slug === "kmeans"} />

      <div className="flex flex-col gap-[5px] mt-6.5 py-3.5 px-[18px] border-[1.5px] border-dashed border-(--lxa) rounded-[4px] bg-[color-mix(in_oklab,var(--lxa)_8%,var(--color-paper))]">
        <span className="font-mono text-caption uppercase text-(--lxa)">✎ how it actually works</span>
        <span className="text-[17.5px] leading-[1.55] text-ink max-wide:text-[17px]">{exp.foot}</span>
      </div>
    </main>
  );
}
