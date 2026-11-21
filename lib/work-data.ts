// Panacea copy is scoped to what is safe in public: capability and architecture
// level, no repo names, ticket ids, people, or tenants. Status language is
// deliberate — "in production" only where it is true. Don't normalise it.
//
// The `short*` fields are the condensed phone variants of the same sentences —
// one dataset, not a fork. Optional ones are omitted wherever the design's
// mobile copy is identical to the desktop copy; callers fall back to the long
// field.
// `shortTags` replaces the whole list rather than subsetting it: the design
// both drops tags and renames them ("Dexie / IndexedDB" → "Dexie").

export type WorkAccent = "electric" | "coral" | "teal" | "navy";

// Flip a status only on the day it becomes true: the advisor launches
// 2026-12-10, the unified login reaches production around 2026-11-28.
export type WorkStatus = "closed beta" | "in production" | "user testing";

export type Role = {
  org: string;
  role: string;
  period: string;
  /** progression line under the title, e.g. a promotion */
  note?: string;
  blurb: string;
  shortBlurb?: string;
};

/** w/h are the PNG's real pixel size. Hard-coded rather than read with
 *  lib/image-dims because §02 also renders inside the ink-transition overlay,
 *  a client tree where the server-only reader can't run. */
export type Diagram = { src: string; w: number; h: number; alt: string };

export type Platform = {
  kicker: string;
  shortKicker: string;
  title: string;
  lead: string;
  shortLead: string;
  map: Diagram;
  shortMap: Diagram;
};

export type Flagship = {
  n: string;
  t: string;
  k: WorkAccent;
  /** one rail line each on wide screens */
  kind: string[];
  shortKind: string;
  status: WorkStatus;
  bandCap: string;
  shortBandCap: string;
  bandFoot: string;
  diagram: Diagram;
  shortDiagram: Diagram;
  lead: string;
  shortLead: string;
  role: string;
  shortRole: string;
  detailsLabel: string;
  bullets: string[];
  shortBullets: string[];
  impact: string;
  tags: string[];
  shortTags: string[];
};

export type Part = {
  n: string;
  t: string;
  k: WorkAccent;
  kind: string;
  shortKind: string;
  status: WorkStatus;
  /** wide screens only; the phone design drops the sketches */
  sketches: (Diagram & { caption: string })[];
  lead: string;
  shortLead: string;
  xref?: { label: string; tone: "electric" | "teal"; text: string; shortText?: string };
  bullets: string[];
  shortBullets: string[];
  /** wide screens only */
  tags: string[];
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
  role: "Applied AI engineer",
  period: "Sep 2025 to present",
  note: "promoted from full-stack engineer, nov 2026",
  blurb:
    "Fintech platform for healthcare professionals. Full-stack delivery across React and React Native clients, a NestJS / PostgreSQL API, a Python Azure Functions service fronting Azure AI Foundry, and Helm / Kubernetes release pipelines.",
};

const PLATFORM_MAP_ALT =
  "Map: one account goes through a unified sign-in to the web and the mobile app. On the web: the AI advisor, Practice Loans, and more. In the mobile app: the AI advisor, with more coming.";

export const PLATFORM: Platform = {
  kicker: "Panacea Financial · the platform I work on",
  shortKicker: "Panacea · the platform I work on",
  title: "The super app: one login, web and mobile",
  lead: "The bank's new super app puts its products behind one login. One account works on the web and in the mobile app. I work across it: the sign-in, the AI advisor, and the loan applications. The mobile app has the AI advisor today, and more parts are on the way.",
  shortLead:
    "One account works on the web and in the app. I work across it: sign-in, the AI advisor, and the loan applications.",
  map: { src: "/work/platform-desk.png", w: 2389, h: 784, alt: PLATFORM_MAP_ALT },
  shortMap: { src: "/work/platform-phone.png", w: 1336, h: 904, alt: PLATFORM_MAP_ALT },
};

export const FLAGSHIP: Flagship = {
  n: "01",
  t: "AI advisor assistant",
  k: "coral",
  kind: ["AI / ML", "full-stack", "web + mobile"],
  shortKind: "AI / ML",
  status: "closed beta",
  bandCap: "how a question gets answered, and what the user sees",
  shortBandCap: "how a question gets answered",
  bandFoot: "same chat on web and mobile · narrated activity · live citations · sources panel",
  diagram: {
    src: "/work/advisor-desk.png",
    w: 2384,
    h: 992,
    alt: "Diagram: a question goes to the assistant, which calls file search, web search, benchmark data and product recommendations. The benchmark data server is marked as made faster. The answer streams into a chat that shows the question, the model narrating what it is doing, a wavy status line with citation chips as sources arrive, a benchmark data block, text arriving as it is written, a product card that appears only when it fits, and a row of copy, thumbs up, thumbs down and sources buttons. A sources side panel peeks in from the right.",
  },
  shortDiagram: {
    src: "/work/advisor-phone.png",
    w: 1336,
    h: 2032,
    alt: "Diagram: a question goes to the assistant, which calls file search, web search, benchmark data marked as made faster, and product recommendations. The answer streams into a chat showing the model narrating its work, a wavy status line with citation chips, a benchmark data block, the streamed answer, a product card when it fits, and copy, thumbs and sources buttons, with a sources panel peeking in from the right.",
  },
  lead: "A chat assistant inside the platform, on the web and in the mobile app. I built its backend and both chat clients: answers that stream in as they're written, live progress for each tool, and product cards that show up only when they fit.",
  shortLead:
    "A chat assistant on the web and in the app. I built its backend and both chat clients: streamed answers, live progress for each tool, and product cards that show up when they fit.",
  role: "I'm the only full-time engineer on it now, working with a data engineer who owns the warehouse side.",
  shortRole: "I'm the only full-time engineer on it now.",
  detailsLabel: "details · how it was built",
  bullets: [
    "Built the streaming chat end to end: a NestJS backend over Foundry's agent with file search, web search, and a Snowflake MCP tool, and the chat in both clients (React on web, React Native in the mobile app), which renders text deltas as they arrive, narrates what the model is doing, shows citation chips as each source comes in, and ends each answer with copy, feedback, and a sources panel. Traced streaming failures across the frontend, API proxy, and gateway with OpenTelemetry in Application Insights.",
    "Connected the agent to the bank's recommendation engine through MCP, so a product card shows up in the chat only when it fits the question. The client turns a text marker into the card, because Foundry runs its tool calls before streaming text and won't mix the two.",
    "Built a parallel multi-turn orchestrator to measure where the managed agent spent its time. It showed the Snowflake MCP server taking 20 to 30 seconds per call; the fixes it led to brought that down to about 9 seconds in most cases.",
  ],
  shortBullets: [
    "NestJS backend over Foundry's agent with file search, web search, and MCP; chat in React (web) and React Native (app) with streamed text, narrated activity, live citations, and a sources panel.",
    "Product cards from a recommendation engine over MCP, shown only when they fit.",
    "A parallel orchestrator prototype found where the time went; the Snowflake MCP server dropped from 20–30s to about 9s.",
  ],
  impact:
    "Users get answers from the bank's own documents, benchmark data, and the web in one place, and the right questions turn into product leads.",
  tags: ["Python", "Azure AI Foundry", "Responses API", "RAG / MCP", "NestJS", "React", "React Native", "OpenTelemetry"],
  shortTags: ["Python", "Azure AI Foundry", "RAG / MCP", "NestJS", "React", "React Native"],
};

export const PARTS: Part[] = [
  {
    n: "02",
    t: "Practice Loans: every application online",
    k: "electric",
    kind: "full-stack · web",
    shortKind: "web",
    status: "in production",
    sketches: [
      {
        caption: "10 PDF forms, one pattern",
        src: "/work/loans-forms.png",
        w: 1767,
        h: 562,
        alt: "Sketch: ten PDF loan forms go through one shared schema with validation and become guided online flows, such as acquisition, buy-in and refinance, plus seven more. All ten are online.",
      },
      {
        caption: "some forms need several people",
        src: "/work/loans-multi.png",
        w: 1832,
        h: 496,
        alt: "Sketch: the financial statement form is split into parts for person 1, person 2 and person 3. Each completes their own part, and the statement is done when all parts are complete.",
      },
    ],
    lead: "The bank had 10 separate PDF loan applications. Our team turned all 10 into guided online forms, and no PDF forms are left. My part was the first version and the shared form patterns the others were built on.",
    shortLead:
      "Our team turned all 10 of the bank's PDF loan applications into guided online forms. My part was the first version and the shared patterns.",
    xref: {
      label: "↳ multi-person",
      tone: "electric",
      text: "Some forms need several people. The financial statement form splits into parts that each person completes on their own; I worked on part of that flow.",
      shortText: "The financial statement form splits into parts each person completes; I worked on part of that flow.",
    },
    bullets: [
      "Built the first version and set up the shared form structure, schemas, client and admin split, and validation patterns the team used across all 10 forms.",
      "Mentored a ~5-engineer offshore team for three months as the design-system and form-architecture point of contact.",
      "Added conditional rendering, multi-location property flows, and save-and-resume through a NestJS / TypeORM layer.",
    ],
    shortBullets: [
      "Set the shared form structure, schemas, and validation patterns.",
      "Mentored a ~5-engineer offshore team for three months.",
    ],
    tags: ["React 19", "React Hook Form", "TypeScript", "NestJS / TypeORM", "PostgreSQL"],
  },
  {
    n: "03",
    t: "Unified sign-in & the mobile app",
    k: "teal",
    kind: "React Native · NestJS",
    shortKind: "mobile · API",
    status: "user testing",
    sketches: [
      {
        caption: "one sign-in for web and app",
        src: "/work/sign-in.png",
        w: 1832,
        h: 416,
        alt: "Sketch: a sign-in from the web or the app goes to the server, which checks the user's access level and either lets them into the platform or sends them to a step-up check.",
      },
    ],
    lead: "Worked on sign-in and account security for the unified login, so one account works on the web and in the mobile app. Rebuilt the app's home and login screens.",
    shortLead: "One account for web and app: sign-in, account security, and the app's home and login screens.",
    xref: { label: "↳ also", tone: "teal", text: "built the AI advisor's chat in the app, see 01" },
    bullets: [
      "Worked across sign-in and account security: biometric login, email 2FA, phone OTP, password lifecycle, and lockout.",
      "Designed server-side auth-level checks across the API and both clients, routing under-leveled users into step-up onboarding.",
      "Made home and login work across screen sizes, font scales, and tablets; shipped a tools catalog, an in-app browser, and a custom video player.",
    ],
    shortBullets: [
      "Biometric login, email 2FA, phone OTP, lockout.",
      "Server-side auth-level checks across API and both clients.",
    ],
    tags: ["React Native", "NestJS", "NativeWind", "Reanimated", "biometrics / 2FA"],
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
