// Panacea copy is scoped to what is safe in public: capability and architecture
// level, no repo names, ticket ids, people, or tenants. Status language is
// deliberate — "in production" only where it is true. Don't normalise it.
//
// The `short*` fields are the condensed phone variants of the same sentences —
// one dataset, not a fork. Omitted wherever the design's mobile copy is
// identical to the desktop copy; callers fall back to the long field.
// `shortTags` replaces the whole list rather than subsetting it: the design
// both drops tags and renames them ("Dexie / IndexedDB" → "Dexie").

export type WorkAccent = "electric" | "coral" | "teal" | "navy";

export type Role = {
  org: string;
  role: string;
  period: string;
  blurb: string;
  shortBlurb?: string;
};

export type System = {
  /** display index, "01"–"03"; not an array position */
  n: string;
  t: string;
  /** discipline line, e.g. "AI / ML · full-stack" */
  kind: string;
  status: string;
  k: WorkAccent;
  d: string;
  shortD?: string;
  bullets: string[];
  shortBullets?: string[];
  impact: string;
  shortImpact?: string;
  tags: string[];
  shortTags?: string[];
};

export type Project = {
  t: string;
  org: string;
  cat: string;
  k: WorkAccent;
  img: string;
  imgAlt: string;
  /** intrinsic pixel size of `img`. Must be the real numbers: the lightbox sizes
   *  the element from them, and a wrong ratio letterboxes paper into the plate. */
  imgW: number;
  imgH: number;
  /** "contain" for dark UI shots that shouldn't bleed into the paper */
  imgFit: "contain" | "cover";
  d: string;
  shortD?: string;
  bullets: string[];
  shortBullets?: string[];
  tags: string[];
  shortTags?: string[];
  cta: string;
  href: string;
};

export type Also = { d: string; shortD?: string };

export type Minor = { t: string; y: string; d: string };

export const ROLE: Role = {
  org: "Panacea Financial",
  role: "Full-stack engineer",
  period: "Sep 2025 to present",
  blurb:
    "Fintech platform for healthcare professionals. Full-stack delivery across React and React Native clients, a NestJS / PostgreSQL API, a Python Azure Functions service fronting Azure AI Foundry, and Helm / Kubernetes release pipelines.",
};

export const WORK: System[] = [
  {
    n: "01",
    t: "AI advisor assistant",
    kind: "AI / ML · full-stack",
    status: "internal user testing",
    k: "coral",
    d: "Streaming LLM assistant embedded in the platform, spanning a Python Azure Functions gateway over Azure AI Foundry, NestJS orchestration, topic classification, and a React chat UI. I initially worked on it as part of a four-engineer team and now maintain it across the stack.",
    bullets: [
      "Built a custom multi-turn orchestrator to replace Foundry's sequential managed agent. It fans tool calls out in parallel across RAG, web search, and Snowflake MCP over credit-memo, internal, and partner data, roughly halving time to first token.",
      "Built an evaluation harness over hand-labeled conversations to pick a classification strategy for a 50-topic taxonomy, then shipped it as an idempotent NestJS service.",
      "Investigated streaming failures across the frontend, API proxy, and gateway, then added OpenTelemetry instrumentation in Azure Application Insights for per-tool distributed tracing.",
    ],
    shortBullets: [
      "Built a custom multi-turn orchestrator to replace Foundry's sequential managed agent. It fans RAG, web search, and Snowflake MCP tool calls out in parallel, roughly halving time to first token.",
      "Built an evaluation harness over hand-labeled conversations to pick a classification strategy for a 50-topic taxonomy, then shipped it as an idempotent NestJS service.",
      "Investigated streaming failures across the frontend, API proxy, and gateway, then added OpenTelemetry instrumentation in Application Insights.",
    ],
    impact:
      "Puts the bank's credit-memo, internal, and partner data behind a question instead of a report request; the taxonomy turns those conversations into demand data.",
    shortImpact:
      "Puts the bank's credit-memo, internal, and partner data behind a question instead of a report request.",
    tags: ["Python", "Azure AI Foundry", "Responses API", "RAG / MCP", "NestJS", "React", "OpenTelemetry"],
    shortTags: ["Python", "Azure AI Foundry", "RAG / MCP", "NestJS", "React", "OpenTelemetry"],
  },
  {
    n: "02",
    t: "Practice Loans: application digitization",
    kind: "full-stack · web",
    status: "in production",
    k: "electric",
    d: "Digitized manual PDF loan applications into guided, validated React flows for practice acquisition, startup, expansion or relocation, buy-in, and refinance.",
    shortD:
      "Digitized manual PDF loan applications into guided, validated React flows for acquisition, startup, expansion, buy-in, and refinance.",
    bullets: [
      "Built the initial implementation and established the shared form structure, schemas, client and admin split, and validation patterns later used across about nine forms.",
      "Mentored a ~5-engineer offshore team for three months as the design-system and form-architecture point of contact.",
      "Built support for conditional rendering and multi-location property flows, with a NestJS / TypeORM layer that lets applicants save a partial application and resume it later.",
    ],
    shortBullets: [
      "Built the initial implementation and established the shared form structure, schemas, client and admin split, and validation patterns later used across about nine forms.",
      "Mentored a ~5-engineer offshore team for three months as the design-system and form-architecture point of contact.",
      "Built support for conditional rendering and multi-location flows, with a NestJS / TypeORM layer for save and resume.",
    ],
    impact:
      "These flows replaced paper and PDF intake with structured digital onboarding, using shared patterns that a larger team extended across the loan portfolio.",
    shortImpact:
      "These flows replaced paper and PDF intake with structured digital onboarding for healthcare practice borrowers.",
    tags: ["React 19", "React Hook Form", "Redux Toolkit", "TypeScript", "NestJS / TypeORM", "PostgreSQL"],
  },
  {
    n: "03",
    t: "Mobile app & online-banking auth",
    kind: "React Native",
    status: "internal user testing",
    k: "teal",
    d: "React Native 0.83 client for iOS and Android. I learned the stack on the job and began contributing substantial features within weeks of joining.",
    bullets: [
      "Rebuilt home and login responsive across aspect ratios, font scales, and tablet; shipped a tools catalog, an in-app WebView browser, and a custom video player.",
      "Worked across mobile authentication and account security, including the onboarding gate, biometric login, email 2FA, phone OTP, password lifecycle, and lockout handling.",
      "Designed server-authoritative auth-level enforcement across the NestJS API and both clients, including the guard, error contract, and interceptor that routes under-leveled users into step-up onboarding.",
    ],
    shortBullets: [
      "Rebuilt home and login responsive across aspect ratios, font scales, and tablet; shipped a tools catalog, an in-app WebView browser, and a custom video player.",
      "Worked across mobile authentication and account security, including the onboarding gate, biometric login, email 2FA, phone OTP, password lifecycle, and lockout handling.",
      "Designed server-authoritative auth-level enforcement across the API and both clients.",
    ],
    impact:
      "Members can recover their logins without calling the bank, while server-side enforcement keeps access rules consistent across web and mobile.",
    tags: ["React Native", "NativeWind", "Reanimated", "Redux", "biometrics / 2FA"],
  },
];

export const ALSO: Also[] = [
  {
    d: "Release engineering: handled recurring Helm / Kubernetes deployments across QA, staging, and production through Azure DevOps pipelines, including database migrations and hotfix cuts.",
    shortD:
      "Release engineering: handled recurring Helm / Kubernetes deployments across QA, staging, and production through Azure DevOps pipelines.",
  },
  {
    d: "Design system: published reusable components to a shared Tailwind library consumed by web, backoffice, and mobile, and maintained semantic versioning across downstream apps.",
    shortD:
      "Design system: published reusable components to a shared Tailwind library consumed by web, backoffice, and mobile.",
  },
  {
    d: "Deep linking and access management: built a tenant-aware deep-link and invitation system, then wrote the campaign URL reference that lets product and marketing launch campaigns without engineering involvement.",
    shortD:
      "Deep linking and access management: built a tenant-aware deep-link and invitation system and the campaign URL reference used by product and marketing.",
  },
  {
    d: "Contract Review: extended backoffice search across clients, reps, and promo codes, with sortable tables and deep-linkable form fields across a React portal and an embeddable JS plugin.",
    shortD:
      "Contract Review: extended backoffice search across clients, reps, and promo codes with sortable tables and deep-linkable fields.",
  },
];

export const PROJECTS: Project[] = [
  {
    t: "fand: Linux fan control daemon",
    org: "self · 2026 to present",
    cat: "systems · Rust",
    k: "teal",
    img: "/projects/fand.png",
    imgW: 1696,
    imgH: 1250,
    imgAlt:
      "fand's desktop GUI, showing a live temperature graph for a Ryzen 7 7800X3D and an RTX 4090, with two PWM headers and their curve cards below it.",
    imgFit: "contain",
    d: "Fan control daemon, CLI, and GUI for Linux, written to learn Rust through a problem with real consequences. One privileged daemon owns sysfs and NVML, drives an AIO pump on a shared header with no tachometer, and hands control back to firmware on every exit path.",
    bullets: [
      "Rust workspace splitting a pure curve-evaluation core (mix mode, hysteresis, ramp, unit-tested) from the privileged daemon.",
      "hwmon + NVML sensor reads, a systemd unit, and a Unix-socket protocol serving status and subscriptions to a fanctl CLI.",
      "Failsafe guard and --restore-auto emergency hand-back to firmware, live-tested on real hardware under load.",
    ],
    shortBullets: [
      "Rust workspace splitting a pure curve-evaluation core (mix mode, hysteresis, ramp) from the privileged daemon.",
      "hwmon + NVML sensor reads, a systemd unit, and a Unix-socket protocol serving a fanctl CLI.",
      "Failsafe guard and --restore-auto hand-back, live-tested on real hardware under load.",
    ],
    tags: ["Rust", "systemd", "hwmon / sysfs", "NVML", "Unix sockets", "Tauri"],
    cta: "github →",
    href: "https://github.com/Anoop-Chandra-19/fand",
  },
  {
    t: "Mosaic: local-first resume builder",
    org: "self · in progress",
    cat: "frontend · local-first",
    k: "electric",
    img: "/projects/mosaic.png",
    imgW: 1696,
    imgH: 1321,
    imgAlt: "Mosaic's editor beside its live print preview, mid-edit on a resume.",
    imgFit: "contain",
    d: "A modular resume editor with a live print-style preview, built local-first: resume data and preferences never leave the machine. Include/exclude toggles per entry and bullet, so one dataset can produce a targeted resume per application.",
    shortD:
      "A modular resume editor with a live print-style preview, built local-first: resume data never leaves the machine. Include/exclude toggles per entry and bullet, so one dataset produces a targeted resume per application.",
    bullets: [
      "React 19 + TypeScript + Tailwind v4, with Zustand stores persisted to IndexedDB through a Dexie storage adapter.",
      "Measured pagination logic driving a multi-page A4 / US Letter preview, with PDF, Markdown, and plaintext export.",
      "Session-only API-key handling for the AI features, kept out of persisted app state by design.",
    ],
    shortBullets: [
      "React 19 + TypeScript + Tailwind v4, Zustand stores persisted to IndexedDB via Dexie.",
      "Measured pagination driving a multi-page A4 / US Letter preview, with PDF, Markdown, and plaintext export.",
      "Session-only API-key handling for the AI features, kept out of persisted state by design.",
    ],
    tags: ["React 19", "TypeScript", "Tailwind v4", "Zustand", "Dexie / IndexedDB", "react-pdf"],
    shortTags: ["React 19", "TypeScript", "Tailwind v4", "Zustand", "Dexie", "react-pdf"],
    cta: "github →",
    href: "https://github.com/Anoop-Chandra-19/mosaic",
  },
];

export const MINOR: Minor[] = [
  {
    t: "Audio Genre Classification",
    y: "2025",
    d: "Fine-tuned an Audio Spectrogram Transformer on FMA-Small, reaching 76.72% test accuracy and serving predictions through FastAPI.",
  },
  {
    t: "Stock Prediction LLM",
    y: "2025",
    d: "Benchmarked 11 LLMs on post-earnings trades with a custom simulator; every model lost money on average.",
  },
];
