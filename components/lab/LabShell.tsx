"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useInkTransition } from "@/components/transition/InkTransitionProvider";
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
      className="lx-page-inner"
      style={{ "--lxa": `var(--color-${exp.accent})` } as React.CSSProperties}
    >
      <div className="lx-page-head">
        <button type="button" className="lx-back" onClick={() => navigate("/", { effect: "peel" })}>
          ← home
        </button>
        <nav className="lx-tabs" aria-label="Experiments">
          {LAB_EXPS.map((x) =>
            x.slug === exp.slug ? (
              <span key={x.slug} className="lx-tab mono on" aria-current="page">
                {x.num}
              </span>
            ) : (
              // static links — ink is a home-only ceremony
              <Link key={x.slug} href={`/lab/${x.slug}`} className="lx-tab mono">
                {x.num}
              </Link>
            )
          )}
        </nav>
      </div>

      <header className="lx-head">
        <span className="lx-tag mono">
          {exp.tag}
          <span className="lx-livedot" aria-hidden="true" />
          live
        </span>
        <h1 className="lx-title">{exp.title}</h1>
        <p className="lx-blurb">{exp.blurb}</p>
      </header>

      <Demo accent={exp.accent} />
      <KeyboardLegend isVisible={isKeyboardMode} hasPointField={exp.slug === "kmeans"} />

      <div className="lx-aside">
        <span className="lx-aside-mark mono">✎ how it actually works</span>
        <span className="lx-aside-body">{exp.foot}</span>
      </div>
    </main>
  );
}
