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
};

export type Also = { d: string; shortD?: string };

export type Minor = { t: string; y: string; d: string };

export const ROLE: Role = {
  org: "Panacea Financial",
  role: "Full-stack engineer",
  period: "Sept 2025 — now",
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
    d: "Streaming LLM assistant embedded in the platform — Python Azure Functions gateway over Azure AI Foundry, NestJS orchestration, topic classification, React chat UI. Started on a five-engineer team; the only engineer on it since.",
    bullets: [
      "Replaced Foundry's sequential managed agent with a custom multi-turn orchestrator that fans tool calls out in parallel — RAG, web search, and Snowflake MCP over credit-memo, internal, and partner data. Roughly halved time-to-first-token.",
      "Built an evaluation harness over hand-labeled conversations to pick a classification strategy for a 50-topic taxonomy, then shipped it as an idempotent NestJS service.",
      "Root-caused streaming failures spanning frontend, API proxy, and gateway, and instrumented the pipeline with OpenTelemetry into Azure Application Insights for per-tool distributed tracing.",
    ],
    shortBullets: [
      "Replaced Foundry's sequential managed agent with a custom multi-turn orchestrator that fans tool calls out in parallel — RAG, web search, and Snowflake MCP. Roughly halved time-to-first-token.",
      "Built an evaluation harness over hand-labeled conversations to pick a classification strategy for a 50-topic taxonomy, then shipped it as an idempotent NestJS service.",
      "Root-caused streaming failures across frontend, API proxy, and gateway, and instrumented the pipeline with OpenTelemetry into Application Insights.",
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
    t: "Practice Loans — application digitization",
    kind: "full-stack · web",
    status: "in production",
    k: "electric",
    d: "Digitized manual PDF loan applications into guided, validated multi-step React web flows — practice acquisition, startup, expansion / relocation, buy-in, and refinance.",
    shortD:
      "Digitized manual PDF loan applications into guided, validated multi-step React web flows — acquisition, startup, expansion, buy-in, and refinance.",
    bullets: [
      "Architected the reference implementation — form structure, shared schemas, client / admin split, validation conventions — adopted by ~9 later loan forms.",
      "Mentored a ~5-engineer offshore team for three months as the design-system and form-architecture point of contact.",
      "Engineered dynamic-form handling for conditional rendering and multi-location property flows, with a NestJS / TypeORM layer that lets applicants save a partial application and resume it later.",
    ],
    shortBullets: [
      "Architected the reference implementation — form structure, shared schemas, client / admin split, validation conventions — adopted by ~9 later loan forms.",
      "Mentored a ~5-engineer offshore team for three months as the design-system and form-architecture point of contact.",
      "Engineered dynamic-form handling for conditional rendering and multi-location flows, with a NestJS / TypeORM layer for save-and-resume.",
    ],
    impact:
      "Replaced paper-and-PDF intake with structured digital onboarding for the bank's highest-value borrowers, on patterns a larger team built the rest of the portfolio on.",
    shortImpact:
      "Replaced paper-and-PDF intake with structured digital onboarding for the bank's highest-value borrowers.",
    tags: ["React 19", "React Hook Form", "Redux Toolkit", "TypeScript", "NestJS / TypeORM", "PostgreSQL"],
  },
  {
    n: "03",
    t: "Mobile app & online-banking auth",
    kind: "React Native",
    status: "internal user testing",
    k: "teal",
    d: "React Native 0.83 iOS + Android client. Learned the stack on the job and shipped major features within weeks of joining.",
    bullets: [
      "Rebuilt home and login responsive across aspect ratios, font scales, and tablet; shipped a tools catalog, an in-app WebView browser, and a custom video player.",
      "Built the mobile auth and account-security layer: onboarding gate, biometric login, email 2FA, phone OTP, password lifecycle, and lockout handling.",
      "Designed the server-authoritative auth-level enforcement architecture across the NestJS API and both clients — guard, error contract, and an interceptor routing under-leveled users into step-up onboarding.",
    ],
    shortBullets: [
      "Rebuilt home and login responsive across aspect ratios, font scales, and tablet; shipped a tools catalog, an in-app WebView browser, and a custom video player.",
      "Built the mobile auth and account-security layer: onboarding gate, biometric login, email 2FA, phone OTP, password lifecycle, lockout handling.",
      "Designed the server-authoritative auth-level enforcement architecture across the API and both clients.",
    ],
    impact:
      "Members recover their own logins instead of calling the bank, and the enforcement design is the access boundary banking resumes behind.",
    tags: ["React Native", "NativeWind", "Reanimated", "Redux", "biometrics / 2FA"],
  },
];

export const ALSO: Also[] = [
  {
    d: "Release engineering — owned recurring Helm / Kubernetes deployments across QA, staging, and production via Azure DevOps pipelines, including database migrations and hotfix cuts.",
    shortD:
      "Release engineering — owned recurring Helm / Kubernetes deployments across QA, staging, and production via Azure DevOps pipelines.",
  },
  {
    d: "Design system — published reusable components to a shared Tailwind library consumed by web, backoffice, and mobile; owned semantic versioning across downstream apps.",
    shortD:
      "Design system — published reusable components to a shared Tailwind library consumed by web, backoffice, and mobile.",
  },
  {
    d: "Deep linking & access management — built a tenant-aware deep-link and invitation system, then authored the campaign-URL reference that let product and marketing launch campaigns without engineering involvement.",
    shortD:
      "Deep linking & access management — built a tenant-aware deep-link and invitation system, plus the campaign-URL reference product and marketing run on.",
  },
  {
    d: "Contract Review — extended backoffice search across clients, reps, and promo codes, with sortable tables and deep-linkable form fields across a React portal and an embeddable JS plugin.",
    shortD:
      "Contract Review — extended backoffice search across clients, reps, and promo codes with sortable tables and deep-linkable fields.",
  },
];

export const PROJECTS: Project[] = [
  {
    t: "fand — Linux fan control daemon",
    org: "self · 2026 — now",
    cat: "systems · Rust",
    k: "teal",
    img: "/projects/fand.png",
    imgW: 1696,
    imgH: 1250,
    imgAlt:
      "fand's desktop GUI — a live temperature graph for a Ryzen 7 7800X3D and an RTX 4090, with two PWM headers and their curve cards below it.",
    imgFit: "contain",
    d: "Fan control daemon, CLI, and GUI for Linux, written to learn Rust on something with real consequences — one privileged daemon owning sysfs and NVML, driving an AIO pump on a shared header with no tachometer, with a failsafe that hands control back to firmware on every exit path.",
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
  },
  {
    t: "Mosaic — local-first resume builder",
    org: "self · in progress",
    cat: "frontend · local-first",
    k: "electric",
    img: "/projects/mosaic.png",
    imgW: 1696,
    imgH: 1285,
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
