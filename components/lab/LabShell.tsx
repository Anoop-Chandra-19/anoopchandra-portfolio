"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useInkTransition } from "@/components/transition/InkTransitionProvider";
import { LAB_EXPS, type LabExp } from "@/lib/lab-meta";
import DoodleLab from "@/components/lab/DoodleLab";
import SentimentLab from "@/components/lab/SentimentLab";
import KMeansLab from "@/components/lab/KMeansLab";

const DEMOS = {
  doodle: DoodleLab,
  sentiment: SentimentLab,
  kmeans: KMeansLab,
} as const;

export default function LabShell({ exp }: { exp: LabExp }) {
  const { navigate } = useInkTransition();

  // Esc peels back home, same ceremony as the ← home button
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate("/", { effect: "peel" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const Demo = DEMOS[exp.slug];

  return (
    <main
      className="lx-page-inner"
      style={{ "--lxa": `var(--color-${exp.accent})` } as React.CSSProperties}
    >
      <div className="lx-page-head">
        <button className="lx-back" onClick={() => navigate("/", { effect: "peel" })}>
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
          <span className="lx-livedot" />
          live
        </span>
        <h1 className="lx-title">{exp.title}</h1>
        <p className="hand lx-blurb">{exp.blurb}</p>
      </header>

      <Demo accent={exp.accent} />

      <div className="lx-aside">
        <span className="lx-aside-mark mono">✎ how it actually works</span>
        <span className="hand lx-aside-body">{exp.foot}</span>
      </div>
    </main>
  );
}
