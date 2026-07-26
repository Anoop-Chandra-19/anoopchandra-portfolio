import type { CSSProperties } from "react";
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

function TagPill({ t }: { t: string }) {
  return (
    <span
      className="mono text-[11px] py-[3px] px-2.5 rounded-full text-ink-soft"
      style={{ border: "1.2px solid var(--color-ink-soft)" }}
    >
      {t}
    </span>
  );
}

function ExperienceCard({ p, i }: { p: Experience; i: number }) {
  return (
    <article
      className={`sketch-box exp-card ${i % 2 ? "tilt-r" : "tilt-l"} p-6 grid gap-[22px] items-start grid-cols-[minmax(180px,220px)_1fr]`}
    >
      <div>
        <div className="text-[18px] leading-[1.25]" style={{ color: `var(--color-${p.k})` }}>
          @ {p.org}
        </div>
        <div className="mono faint text-[11px] mt-2 leading-[1.7]">
          <div>role&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;{p.role}</div>
          <div>year&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;{p.period}</div>
        </div>
      </div>
      <div className="min-w-0">
        <h3 className="mt-0 mb-2.5 text-[24px] leading-[1.18] tracking-[-0.012em]">{p.t}</h3>
        <p className="mt-0 text-[17px] leading-[1.6] mb-3">{p.summary}</p>
        <ul className="pl-[18px] mt-0 text-[17px] leading-[1.7]">
          {p.contributions.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <div className="flex gap-1.5 flex-wrap mt-3.5">
          {p.tags.map((t) => (
            <TagPill key={t} t={t} />
          ))}
        </div>
        <div className="mono faint text-[11px] mt-3.5 italic">
          ✎ ask me about it — happy to walk through what I did
        </div>
      </div>
    </article>
  );
}

function ProjectImage({ p }: { p: Project }) {
  if (p.img) {
    return (
      <div className="project-media bg-paper-2 border-x-2 border-ink relative min-h-[280px] flex items-center justify-center p-5">
        <Image
          src={p.img}
          alt={p.t}
          width={520}
          height={280}
          className="w-full max-h-[280px] object-contain rounded h-auto"
        />
      </div>
    );
  }
  return (
    <div className="project-media ph border-0 border-l-2 border-ink rounded-none min-h-[280px]">
      <div className="text-center p-5">
        <div className="text-[17px] text-ink mb-1.5">diagram coming</div>
        <div className="mono faint text-[11px] leading-[1.5]">{p.imgLabel}</div>
      </div>
    </div>
  );
}

function ProjectSlab({ p, i }: { p: Project; i: number }) {
  const flip = i % 2 === 1;
  return (
    <article
      className="sketch-box project-slab p-0 overflow-hidden grid"
      data-flip={flip ? "1" : "0"}
      // column track rides a custom property so the mobile collapse is a plain
      // CSS override rather than an !important fight with the inline style
      style={{ "--slab-cols": flip ? "1fr 1.4fr" : "1.4fr 1fr" } as CSSProperties}
    >
      {!flip && <ProjectImage p={p} />}
      <div className="project-content p-8">
        <div className="mono faint text-[11px] tracking-[2px] uppercase">
          {p.cat} · <span style={{ color: `var(--color-${p.k})` }}>{p.org}</span>
        </div>
        <h3 className="mt-2 mb-3.5 text-[25px] leading-[1.18] tracking-[-0.012em]">{p.t}</h3>
        <p className="mt-0 text-[17px] max-w-[520px] mb-4">{p.d}</p>
        <ul className="pl-[18px] mt-0 text-[17px] leading-[1.7]">
          {p.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <div className="flex gap-1.5 flex-wrap mt-4">
          {p.tags.map((t) => (
            <TagPill key={t} t={t} />
          ))}
        </div>
        <div className="mt-[18px]">
          <Chip kind={p.k}>{p.cta}</Chip>
        </div>
      </div>
      {flip && <ProjectImage p={p} />}
    </article>
  );
}

function FeaturedSlab({ p }: { p: Project }) {
  return (
    <article className="sketch-box featured-slab p-0 overflow-hidden relative">
      <div className="mono featured-tab absolute -top-px left-6 z-[3] bg-ink text-paper text-[10px] tracking-[3px] uppercase pt-[5px] pb-1.5 px-3 rounded-b">
        ★ featured project
      </div>

      <div className="featured-hero bg-paper-2 border-b-2 border-ink relative min-h-[320px] flex items-center justify-center overflow-hidden">
        {p.img ? (
          <Image
            src={p.img}
            alt={p.t}
            width={1200}
            height={360}
            className="w-full h-full max-h-[360px] object-cover block"
          />
        ) : null}
      </div>

      <div className="featured-body grid gap-9 p-9 px-10 grid-cols-[minmax(220px,280px)_1fr]">
        <div>
          <div className="mono faint text-[11px] tracking-[2px] uppercase">{p.cat}</div>
          <h3 className="mt-2 mb-3.5 text-[30px] leading-[1.18] tracking-[-0.012em]">{p.t}</h3>
          <div className="text-[16px]" style={{ color: `var(--color-${p.k})` }}>
            @ {p.org}
          </div>
          <div className="mono faint text-[11px] mt-3.5 leading-[1.7]">
            <div>scope&nbsp;&nbsp;·&nbsp;&nbsp;full-stack lead</div>
            <div>year&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;2025 — now</div>
            <div>status·&nbsp;&nbsp;shipping</div>
          </div>
        </div>
        <div>
          <p className="mt-0 text-[18px] leading-[1.65] mb-[18px]">{p.d}</p>
          <ul className="pl-[18px] mt-0 text-[17px] leading-[1.7]">
            {p.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <div className="flex gap-1.5 flex-wrap mt-[18px]">
            {p.tags.map((t) => (
              <TagPill key={t} t={t} />
            ))}
          </div>
          <div className="mt-[22px]">
            <Chip kind={p.k}>{p.cta}</Chip>
          </div>
        </div>
      </div>
    </article>
  );
}

function GroupRule({
  label,
  count,
}: {
  label: string;
  count: string;
}) {
  return (
    <div className="group-rule flex items-center gap-[18px]">
      <span className="mono faint text-[11px] tracking-[3px] uppercase">{label}</span>
      <span
        className="group-rule-line flex-1 h-px"
        style={{ borderTop: "1.5px dashed var(--color-ink-faint)" }}
      />
      <span className="mono faint group-rule-count text-[11px]">{count}</span>
    </div>
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
      <p className="faint max-w-[720px] mb-7 text-base">
        Day-job experience at <span className="marker-highlight">Panacea Financial</span>, plus
        AI/ML case studies from my MS at Northeastern and on the side.
      </p>

      <div className="mb-5">
        <GroupRule label="shipped at work" count={`${EXPERIENCE.length} roles`} />
      </div>
      <div className="col gap-[18px]">
        {EXPERIENCE.map((p, i) => (
          <ExperienceCard key={p.t} p={p} i={i} />
        ))}
      </div>

      <div className="mt-11 mb-6">
        <GroupRule label="personal & academic — case studies" count={`${PROJECTS.length} projects`} />
      </div>

      <FeaturedSlab p={featured} />

      <div className="mt-8 mb-[22px]">
        <GroupRule label="also worth a look" count={`${rest.length} more`} />
      </div>
      <div className="col gap-[22px]">
        {rest.map((p, i) => (
          <ProjectSlab key={p.t} p={p} i={i} />
        ))}
      </div>
    </section>
  );
}
