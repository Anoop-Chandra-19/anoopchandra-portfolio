// Panacea copy is scoped to what is safe in public: capability and architecture
// level, no repo names, ticket ids, people, or tenants. Status language is
// deliberate — "in production" only where it is true. Don't normalise it.
//
// The `short*` fields are what the mobile pass reads, so narrow viewports stay
// one dataset instead of a fork. Unpopulated until then; callers fall back.

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
  tags: string[];
};

export type Project = {
  t: string;
  org: string;
  cat: string;
  k: WorkAccent;
  img: string | null;
  imgAlt: string | null;
  /** "contain" for dark UI shots that shouldn't bleed into the paper */
  imgFit: "contain" | "cover";
  /** placeholder prompt for the empty media band when `img` is null */
  imgLabel: string | null;
  d: string;
  shortD?: string;
  bullets: string[];
  shortBullets?: string[];
  tags: string[];
  cta: string;
};

export type Minor = { t: string; y: string; d: string; cta: string };

export const ROLE: Role = {
  org: "Panacea Financial",
  role: "Full-stack engineer",
  period: "Aug 2024 — now",
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
    impact:
      "Puts the bank's credit-memo, internal, and partner data behind a question instead of a report request; the taxonomy turns those conversations into demand data.",
    tags: ["Python", "Azure AI Foundry", "Responses API", "RAG / MCP", "NestJS", "React", "OpenTelemetry"],
  },
  {
    n: "02",
    t: "Practice Loans — application digitization",
    kind: "full-stack · web",
    status: "in production",
    k: "electric",
    d: "Digitized manual PDF loan applications into guided, validated multi-step React web flows — practice acquisition, startup, expansion / relocation, buy-in, and refinance.",
    bullets: [
      "Architected the reference implementation — form structure, shared schemas, client / admin split, validation conventions — adopted by ~9 later loan forms.",
      "Mentored a ~5-engineer offshore team for three months as the design-system and form-architecture point of contact.",
      "Engineered dynamic-form handling for conditional rendering and multi-location property flows, with a NestJS / TypeORM layer that lets applicants save a partial application and resume it later.",
    ],
    impact:
      "Replaced paper-and-PDF intake with structured digital onboarding for the bank's highest-value borrowers, on patterns a larger team built the rest of the portfolio on.",
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
    impact:
      "Members recover their own logins instead of calling the bank, and the enforcement design is the access boundary banking resumes behind.",
    tags: ["React Native", "NativeWind", "Reanimated", "Redux", "biometrics / 2FA"],
  },
];

export const ALSO: string[] = [
  "Release engineering — owned recurring Helm / Kubernetes deployments across QA, staging, and production via Azure DevOps pipelines, including database migrations and hotfix cuts.",
  "Design system — published reusable components to a shared Tailwind library consumed by web, backoffice, and mobile; owned semantic versioning across downstream apps.",
  "Deep linking & access management — built a tenant-aware deep-link and invitation system, then authored the campaign-URL reference that let product and marketing launch campaigns without engineering involvement.",
  "Contract Review — extended backoffice search across clients, reps, and promo codes, with sortable tables and deep-linkable form fields across a React portal and an embeddable JS plugin.",
];

export const PROJECTS: Project[] = [
  {
    t: "fand — Linux fan control daemon",
    org: "self · 2026 — now",
    cat: "systems · Rust",
    k: "teal",
    img: "/projects/fand.png",
    imgAlt:
      "fand's desktop GUI — a live temperature graph for a Ryzen 7 7800X3D and an RTX 4090, with two PWM headers and their curve cards below it.",
    imgFit: "contain",
    imgLabel: null,
    d: "Fan control daemon, CLI, and GUI for Linux. No existing tool detected the NCT6799D controller on my motherboard, so I wrote one that does — a single privileged daemon owning sysfs and NVML, with a failsafe that hands control back to firmware.",
    bullets: [
      "Rust workspace splitting a pure curve-evaluation core (mix mode, hysteresis, ramp, unit-tested) from the privileged daemon.",
      "hwmon + NVML sensor reads, a systemd unit, and a Unix-socket protocol serving status and subscriptions to a fanctl CLI.",
      "Failsafe guard and --restore-auto emergency hand-back to firmware, live-tested on real hardware under load.",
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
    imgAlt: "Mosaic's editor beside its live print preview, mid-edit on a resume.",
    imgFit: "contain",
    imgLabel: null,
    d: "A modular resume editor with a live print-style preview, built local-first: resume data and preferences never leave the machine. Include/exclude toggles per entry and bullet, so one dataset can produce a targeted resume per application.",
    bullets: [
      "React 19 + TypeScript + Tailwind v4, with Zustand stores persisted to IndexedDB through a Dexie storage adapter.",
      "Measured pagination logic driving a multi-page A4 / US Letter preview, with PDF, Markdown, and plaintext export.",
      "Session-only API-key handling for the AI features, kept out of persisted app state by design.",
    ],
    tags: ["React 19", "TypeScript", "Tailwind v4", "Zustand", "Dexie / IndexedDB", "react-pdf"],
    cta: "github →",
  },
  {
    t: "LegalRescue.ai",
    org: "MS capstone · client under NDA",
    cat: "GenAI · backend",
    k: "coral",
    // Not the prototype's audio-2.png — that's a leftover from the audio project.
    img: "/projects/legalrescue-nda.png",
    imgAlt: "A placard standing in for the product UI, which the client's NDA keeps out of the portfolio.",
    imgFit: "contain",
    imgLabel: null,
    d: "Designed and shipped a scalable LLM backend for a legal-AI startup. Voice-driven case intake: Whisper for STT, GPT-4.1-mini for classification and summarization, Celery + Redis for async workflows, Postgres for session storage.",
    bullets: [
      "FastAPI + Celery + Redis on AWS EKS, with a prompt-eval harness gating releases.",
      "Whisper STT pipeline feeding GPT-4.1-mini classification at sub-2s P95.",
      "Full CI/CD; client NDA prevents UI screenshots.",
    ],
    tags: ["FastAPI", "OpenAI", "Whisper", "Redis", "Celery", "AWS EKS", "PostgreSQL"],
    cta: "request walkthrough",
  },
];

export const MINOR: Minor[] = [
  {
    t: "Audio Genre Classification",
    y: "2024",
    d: "PyTorch transformer over mel-spectrograms, 8-class, 85% top-1, served as a FastAPI microservice.",
    cta: "github →",
  },
  {
    t: "Stock Prediction LLM",
    y: "2024",
    d: "Benchmarked 11 LLMs on stock-movement prediction with chain-of-thought prompting and a custom trade-decision eval harness.",
    cta: "read the paper →",
  },
];
