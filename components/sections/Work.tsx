import Image from "next/image";
import { SectionHeaderArrow } from "@/components/ui/SectionHeader";
import Chip from "@/components/ui/Chip";

type ColorKey = "electric" | "coral" | "teal" | "navy";

type Experience = {
  t: string;
  org: string;
  role: string;
  period: string;
  k: ColorKey;
  summary: string;
  contributions: string[];
  tags: string[];
};

type Project = {
  t: string;
  org: string;
  cat: string;
  k: ColorKey;
  img: string | null;
  imgLabel: string | null;
  d: string;
  bullets: string[];
  tags: string[];
  cta: string;
};

const EXPERIENCE: Experience[] = [
  {
    t: "Loan Form Digitization Platform",
    org: "Panacea Financial",
    role: "Full-stack engineer",
    period: "2025 — now",
    k: "electric",
    summary:
      "Member of the team replacing legacy PDF intake with a native digital experience across the commercial banking product. Worked across the React frontend, the NestJS API layer, and the data pipeline that powers downstream analytics.",
    contributions: [
      "Frontend feature work on the customer-facing form runtime",
      "Backend services and validation in TypeScript / NestJS",
      "Cloud + infra-as-code on Azure, deployed via Terraform",
    ],
    tags: ["React", "TypeScript", "NestJS", "PostgreSQL", "Redis", "Azure", "Terraform"],
  },
  {
    t: "Internal Mobile App",
    org: "Panacea Financial",
    role: "Full-stack engineer",
    period: "2025",
    k: "teal",
    summary:
      "Contributed to an internal-only React Native build serving the commercial banking team. Streamlined workflows that previously required desktop access — bringing core review tasks to mobile.",
    contributions: [
      "React Native feature work, sharing TypeScript with the web app",
      "Auth + secure transport on Azure",
      "Build + release tooling",
    ],
    tags: ["React Native", "TypeScript", "Azure"],
  },
];

const PROJECTS: Project[] = [
  {
    t: "LegalRescue.ai",
    org: "MS capstone · client under NDA",
    cat: "GenAI · backend",
    k: "coral",
    img: "/projects/legalrescue-nda.png",
    imgLabel: null,
    d: "Designed and shipped a scalable LLM backend for a legal-AI startup. Voice-driven case intake: Whisper for STT, GPT-4.1-mini for classification + summarization, Celery + Redis for async workflows, Postgres for session storage.",
    bullets: [
      "FastAPI + Celery + Redis on AWS EKS",
      "Whisper STT pipeline, GPT-4.1-mini classification",
      "Full CI/CD; client NDA prevents UI screenshots",
    ],
    tags: ["FastAPI", "OpenAI", "Whisper", "Redis", "Celery", "AWS EKS", "PostgreSQL"],
    cta: "request walkthrough",
  },
  {
    t: "Audio Genre Classification",
    org: "self · 2024",
    cat: "ML · transformers",
    k: "navy",
    img: "/projects/audio-genres.png",
    imgLabel: null,
    d: "PyTorch transformer trained on FMA / GTZAN-style audio for music genre recognition. Mel-spectrogram input, 8-class output, 85% test accuracy. Deployed as a FastAPI microservice with a React frontend.",
    bullets: [
      "Mel-spectrogram → transformer encoder, top-1 85%",
      "FastAPI inference microservice on AWS",
      "Live demo handled 100+ daily requests",
    ],
    tags: ["PyTorch", "Transformers", "FastAPI", "React", "AWS"],
    cta: "github →",
  },
  {
    t: "Stock Prediction LLM",
    org: "research · 2024",
    cat: "GenAI",
    k: "electric",
    img: "/projects/stock-pred.png",
    imgLabel: null,
    d: "Research project benchmarking 11 LLMs on stock-movement prediction — gpt-4o, gemini-2.0, deepseek-r1, llama-3.3, mistral, phi-4 — with chain-of-thought prompting, MongoDB time-series storage, and a custom evaluation harness for trade decisions.",
    bullets: [
      "11-model benchmark across S&P universe",
      "CoT prompting + structured trade decisions",
      "Mongo time-series + eval framework",
    ],
    tags: ["LLMs", "MongoDB", "Python", "Finance", "Eval"],
    cta: "read the paper →",
  },
];

function ExperienceCard({ p, i }: { p: Experience; i: number }) {
  return (
    <article
      className={`sketch-box ${i % 2 ? "tilt-r" : "tilt-l"}`}
      style={{
        padding: 24,
        display: "grid",
        gridTemplateColumns: "minmax(180px, 220px) 1fr",
        gap: 22,
        alignItems: "start",
      }}
    >
      <div>
        <div
          className="hand"
          style={{ fontSize: 24, color: `var(--${p.k})`, lineHeight: 1.05 }}
        >
          @ {p.org}
        </div>
        <div className="mono faint" style={{ fontSize: 11, marginTop: 8, lineHeight: 1.7 }}>
          <div>role&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;{p.role}</div>
          <div>year&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;{p.period}</div>
        </div>
      </div>
      <div style={{ minWidth: 0 }}>
        <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 28, lineHeight: 1.1 }}>{p.t}</h3>
        <p style={{ marginTop: 0, fontSize: 15, lineHeight: 1.6, marginBottom: 12 }}>
          {p.summary}
        </p>
        <ul style={{ paddingLeft: 18, marginTop: 0, fontSize: 14, lineHeight: 1.7 }}>
          {p.contributions.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
          {p.tags.map((t) => (
            <span
              key={t}
              className="mono"
              style={{
                fontSize: 11,
                padding: "3px 10px",
                border: "1.2px solid var(--ink-soft)",
                borderRadius: 999,
                color: "var(--ink-soft)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
        <div
          className="mono faint"
          style={{ fontSize: 11, marginTop: 14, fontStyle: "italic" }}
        >
          ✎ ask me about it — happy to walk through what I did
        </div>
      </div>
    </article>
  );
}

function ProjectImage({ p }: { p: Project }) {
  if (p.img) {
    return (
      <div
        style={{
          background: "var(--paper-2)",
          borderLeft: "2px solid var(--ink)",
          borderRight: "2px solid var(--ink)",
          position: "relative",
          minHeight: 280,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Image
          src={p.img}
          alt={p.t}
          width={520}
          height={280}
          style={{
            width: "100%",
            maxHeight: 280,
            objectFit: "contain",
            borderRadius: 4,
            height: "auto",
          }}
        />
      </div>
    );
  }
  return (
    <div className="ph" style={{ borderRadius: 0, border: "none", borderLeft: "2px solid var(--ink)", minHeight: 280 }}>
      <div style={{ textAlign: "center", padding: 20 }}>
        <div className="hand" style={{ fontSize: 22, color: "var(--ink)", marginBottom: 6 }}>
          diagram coming
        </div>
        <div className="mono faint" style={{ fontSize: 11, lineHeight: 1.5 }}>
          {p.imgLabel}
        </div>
      </div>
    </div>
  );
}

function ProjectSlab({ p, i }: { p: Project; i: number }) {
  const flip = i % 2 === 1;
  return (
    <article
      className="sketch-box project-slab"
      data-flip={flip ? "1" : "0"}
      style={{
        padding: 0,
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: flip ? "1fr 1.4fr" : "1.4fr 1fr",
      }}
    >
      {!flip && <ProjectImage p={p} />}
      <div className="project-content" style={{ padding: 32 }}>
        <div
          className="mono faint"
          style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}
        >
          {p.cat} · <span style={{ color: `var(--${p.k})` }}>{p.org}</span>
        </div>
        <h3 style={{ marginTop: 8, marginBottom: 14, fontSize: 30, lineHeight: 1.12 }}>{p.t}</h3>
        <p style={{ marginTop: 0, fontSize: 16, maxWidth: 520, marginBottom: 16 }}>{p.d}</p>
        <ul style={{ paddingLeft: 18, marginTop: 0, fontSize: 14, lineHeight: 1.7 }}>
          {p.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 16 }}>
          {p.tags.map((t) => (
            <span
              key={t}
              className="mono"
              style={{
                fontSize: 11,
                padding: "3px 10px",
                border: "1.2px solid var(--ink-soft)",
                borderRadius: 999,
                color: "var(--ink-soft)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 18 }}>
          <Chip kind={p.k}>{p.cta}</Chip>
        </div>
      </div>
      {flip && <ProjectImage p={p} />}
    </article>
  );
}

function FeaturedSlab({ p }: { p: Project }) {
  return (
    <article
      className="sketch-box featured-slab"
      style={{ padding: 0, overflow: "hidden", position: "relative" }}
    >
      <div
        className="mono"
        style={{
          position: "absolute",
          top: -1,
          left: 24,
          zIndex: 3,
          background: "var(--ink)",
          color: "var(--paper)",
          fontSize: 10,
          letterSpacing: 3,
          textTransform: "uppercase",
          padding: "5px 12px 6px",
          borderRadius: "0 0 4px 4px",
        }}
      >
        ★ featured project
      </div>

      <div
        style={{
          background: "var(--paper-2)",
          borderBottom: "2px solid var(--ink)",
          position: "relative",
          minHeight: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {p.img ? (
          <Image
            src={p.img}
            alt={p.t}
            width={1200}
            height={360}
            style={{
              width: "100%",
              height: "100%",
              maxHeight: 360,
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : null}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 280px) 1fr",
          gap: 36,
          padding: "36px 40px",
        }}
        className="featured-body"
      >
        <div>
          <div
            className="mono faint"
            style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}
          >
            {p.cat}
          </div>
          <h3 style={{ marginTop: 8, marginBottom: 14, fontSize: 38, lineHeight: 1.05 }}>{p.t}</h3>
          <div className="hand" style={{ fontSize: 20, color: `var(--${p.k})` }}>
            @ {p.org}
          </div>
          <div className="mono faint" style={{ fontSize: 11, marginTop: 14, lineHeight: 1.7 }}>
            <div>scope&nbsp;&nbsp;·&nbsp;&nbsp;full-stack lead</div>
            <div>year&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;2025 — now</div>
            <div>status·&nbsp;&nbsp;shipping</div>
          </div>
        </div>
        <div>
          <p style={{ marginTop: 0, fontSize: 17, lineHeight: 1.6, marginBottom: 18 }}>{p.d}</p>
          <ul style={{ paddingLeft: 18, marginTop: 0, fontSize: 15, lineHeight: 1.75 }}>
            {p.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 18 }}>
            {p.tags.map((t) => (
              <span
                key={t}
                className="mono"
                style={{
                  fontSize: 11,
                  padding: "3px 10px",
                  border: "1.2px solid var(--ink-soft)",
                  borderRadius: 999,
                  color: "var(--ink-soft)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 22 }}>
            <Chip kind={p.k}>{p.cta}</Chip>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Work() {
  const featured = PROJECTS[0];
  const rest = PROJECTS.slice(1);
  return (
    <section id="sec-work" className="section">
      <SectionHeaderArrow
        num="02"
        title="Work"
        meta={`${EXPERIENCE.length + PROJECTS.length} entries · 2024 — now`}
      />
      <p className="faint" style={{ maxWidth: 720, marginBottom: 28, fontSize: 16 }}>
        Day-job experience at <span className="marker-highlight">Panacea Financial</span>, plus
        AI/ML case studies from my MS at Northeastern and on the side.
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 18, margin: "0 0 20px" }}>
        <span
          className="mono faint"
          style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase" }}
        >
          shipped at work
        </span>
        <span style={{ flex: 1, height: 1, borderTop: "1.5px dashed var(--ink-faint)" }} />
        <span className="mono faint" style={{ fontSize: 11 }}>
          {EXPERIENCE.length} roles
        </span>
      </div>
      <div className="col" style={{ gap: 18 }}>
        {EXPERIENCE.map((p, i) => (
          <ExperienceCard key={p.t} p={p} i={i} />
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 18, margin: "44px 0 24px" }}>
        <span
          className="mono faint"
          style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase" }}
        >
          personal & academic — case studies
        </span>
        <span style={{ flex: 1, height: 1, borderTop: "1.5px dashed var(--ink-faint)" }} />
        <span className="mono faint" style={{ fontSize: 11 }}>
          {PROJECTS.length} projects
        </span>
      </div>

      <FeaturedSlab p={featured} />

      <div style={{ display: "flex", alignItems: "center", gap: 18, margin: "32px 0 22px" }}>
        <span
          className="mono faint"
          style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase" }}
        >
          also worth a look
        </span>
        <span style={{ flex: 1, height: 1, borderTop: "1.5px dashed var(--ink-faint)" }} />
        <span className="mono faint" style={{ fontSize: 11 }}>
          {rest.length} more
        </span>
      </div>
      <div className="col" style={{ gap: 22 }}>
        {rest.map((p, i) => (
          <ProjectSlab key={p.t} p={p} i={i} />
        ))}
      </div>
    </section>
  );
}
