import Image from "next/image";
import Chip from "@/components/ui/Chip";
import Annotation from "@/components/ui/Annotation";

export default function Hero() {
  return (
    <section id="sec-home" className="section" style={{ minHeight: 560, paddingTop: 40 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 40,
          alignItems: "center",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            className="mono faint anim-rise d-hello"
            style={{ fontSize: 12, letterSpacing: 3, textTransform: "uppercase" }}
          >
            {"// hello.tsx — apr 29, 2026"}
          </div>
          <h1
            style={{
              marginTop: 14,
              fontSize: "clamp(56px, 8vw, 96px)",
              lineHeight: 0.95,
              marginBottom: 6,
            }}
          >
            <span className="anim-swipe d-name1" style={{ display: "inline-block" }}>
              Anoop
            </span>
            <br />
            <span
              className="anim-swipe d-name2"
              style={{ color: "var(--electric)", display: "inline-block" }}
            >
              chandra.
            </span>
          </h1>
          <div style={{ marginTop: 18, fontSize: 26 }} className="hand anim-rise d-subtle">
            full-stack dev <span className="faint">×</span> AI engineer{" "}
            <span className="faint">×</span> linux daily-driver
          </div>
          <div className="anim-rise d-body" style={{ marginTop: 22, maxWidth: 520, fontSize: 18 }}>
            I build <span className="marker-highlight purple d-marker1">AI</span>,{" "}
            <span className="marker-highlight d-marker2">custom PCs</span>, and{" "}
            <span className="marker-highlight teal d-marker3">scalable backends</span> — always for the
            person, not just the specs.
          </div>
          <div style={{ marginTop: 26, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="#sec-contact" style={{ textDecoration: "none" }} className="anim-stamp d-chip1">
              <Chip kind="electric">say hi →</Chip>
            </a>
            <a href="#sec-lab" style={{ textDecoration: "none" }} className="anim-stamp d-chip2">
              <Chip>see the lab ↓</Chip>
            </a>
            <a
              href="/Anoopchandra_resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
              className="anim-stamp d-chip3"
            >
              <Chip>resume.pdf</Chip>
            </a>
          </div>
          <div className="mono faint anim-rise d-meta" style={{ marginTop: 28, fontSize: 12 }}>
            <span style={{ color: "var(--teal)" }}>●</span> open to interesting work · Boston, MA
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "relative",
              width: "min(360px, 80vw)",
              aspectRatio: "1 / 1",
              margin: "0 auto",
            }}
          >
            <div
              className="anim-portrait-shadow"
              style={{
                position: "absolute",
                inset: 0,
                top: 8,
                left: 8,
                borderRadius: "50%",
                background: "var(--electric)",
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                overflow: "hidden",
                zIndex: 1,
              }}
            >
              <Image
                className="anim-portrait-img"
                src="/anoopchandra.webp"
                alt="Anoopchandra Parampalli"
                width={360}
                height={360}
                priority
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
            <svg
              viewBox="0 0 360 360"
              preserveAspectRatio="xMidYMid meet"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                zIndex: 2,
                pointerEvents: "none",
              }}
            >
              <circle
                cx="180"
                cy="180"
                r="178"
                fill="none"
                stroke="var(--ink)"
                strokeWidth="4"
                strokeDasharray="1131"
                className="anim-portrait-outline"
              />
            </svg>
          </div>
          <div className="anim-stamp d-annot1" style={{ position: "absolute", top: -10, right: 10 }}>
            <Annotation color="coral">👋 hi!</Annotation>
          </div>
          <div className="anim-stamp d-annot2" style={{ position: "absolute", bottom: 0, left: -10 }}>
            <Annotation color="teal">↗ that&apos;s me</Annotation>
          </div>
        </div>
      </div>
    </section>
  );
}
