# Plan: Mobile responsiveness pass + The Lab (interactive ML experiments)

**Status:** draft v2 — updated with Anoop's decisions (2026-07-23):
fluid mobile (not fixed 393px) · note rows bleed too · use the real TF.js
models in `public/models/` + the k-means from `main` · bottom dock nav removed.
**Design source:** claude.ai/design project `019dd9ee-087b-71ba-b30e-9dd64b1b5eae`
(`Portfolio Mobile Prototype.html`), handoff bundle at `design_handoff_ml_lab/`
(README + `mobile-lab.jsx`, `mobile-site.jsx`, `mobile-parts.jsx`, `mobile-nav.jsx`,
`mobile.css`, `ink-bleed-mobile.js`). Re-fetch via DesignSync when needed.

## What the design adds

1. **A real mobile design pass** — sections re-authored for ~393px: no tilts,
   margin scribbles become inline asides, single column, tighter type scale,
   and a new mobile nav ("index" chip → full-screen notebook index overlay,
   the design's recommended option B).
2. **The Lab, live** — the three §03 cards become tap targets that ink-bleed
   into full-screen "lab bench" pages where the demos actually run:
   - `exp-001` Doodle Classifier — draw on canvas → ranked guesses
   - `exp-002` Sentiment Analysis — sentence → needle gauge + per-word scoring
   - `exp-003` K-Means Playground — drop points → watch Lloyd's algorithm converge

## Current state (what we already have)

- Real routes + ink transition system: `InkTransitionProvider` + `InkBleedOverlay`
  driven by `lib/ink-bleed.ts` (same geometry the mobile prototype's
  `ink-bleed-mobile.js` mirrors — only durations differ: prototype mobile uses
  1050/820ms vs our 1500/1100ms).
- Mobile responsiveness exists as "primitives only" media queries in
  `globals.css` + a bottom horizontal dock in `SideNav`. Functional, not the
  designed experience.
- `Lab.tsx` renders the three cards statically — same copy/colors as the design,
  no interactivity.
- **Constraint found:** `InkBleedOverlay` hardcodes destinations (bleed →
  journal index copy, peel → `HomeContent`). Lab needs bleed → experiment page.

---

## Workstream A — Mobile pass

### A1. Mobile nav: index chip + full-screen overlay (replaces bottom dock)
- New `components/nav/MobileIndexNav.tsx`: floating "index" chip (hamburger
  lines + mono label, `≤900px` only) opening a full-screen notebook-ruled
  overlay — numbered list, hand-font labels, dotted leader, `← here` marker on
  the active section, `esc ×` close. Reuses `SideNav`'s scroll-spy + Lenis jump
  logic (extract shared hook `useActiveSection`).
- Remove the `side-nav-mobile` bottom dock; keep the desktop rail untouched.
- Chip hides while overlay is open; overlay animates in (`navIn` 280ms).
- A11y: overlay traps focus, `Esc` closes, chip gets `aria-expanded`.

### A2. Section-level mobile treatments (≤720px unless noted)
The prototype's 393px phone frame is a **design canvas, not a target width**.
Everything is built fluid: relative units, `clamp()` type sizes, intrinsic
grids — must hold from ~320px (SE) through ~430px+ (Pro Max) and the tablet
range up to the existing 720/900px breakpoints. Verify at 320 / 375 / 393 /
430 / 600 in device emulation.

Port the `m-*` patterns from `mobile.css` / `mobile-parts.jsx` into each
section's existing Tailwind/CSS (no separate mobile components — CSS-first,
matching how the codebase already handles breakpoints):
- **Hero:** centered 196px circular portrait (electric offset shadow + SVG
  outline + "👋 hi!" note), stacked title, tagline, lede, chip row, status line.
- **Section headers:** number + meta on one baseline row, big title below
  (already close — align to `m-header` spacing).
- **Now:** cards stack inside the tinted well (mostly works; tighten paddings).
- **Work:** experience cards + featured card + project slabs single-column,
  image top / body below (partially exists via `.project-slab` collapse — align
  visuals: featured tab, `@ org` hand line, `✎ ask me about it`).
- **Stack:** columns stack vertically, 5px accent top border, tally marks
  (`MTally` port — grouped strokes + slash for 5s).
- **Notes:** notebook block with `p.NNN` page column + red margin rule at
  mobile (design uses 46px page col, title/meta stacked, tag pill right).
- **Contact:** postcard stacks — message side above, dashed rule, address side
  with postmark + stamp below; washi tape strips.
- **Inline asides:** `m-aside` pattern (dashed accent border, `✎ note` mark)
  as the mobile home for floating margin notes that currently hide/overlap.

### A3. Motion
- Scale ink transition durations on small viewports (~1050ms fwd / 820ms back
  under 720px) — declarative, computed once at navigate time.

## Workstream B — The Lab

### B1. Routes + layout (desktop design: `lab-desktop.jsx`/`.css` in Hi-Fi v2)
- `app/lab/[slug]/page.tsx` with slugs `doodle`, `sentiment`, `kmeans`
  (statically generated; `generateStaticParams`). Each renders the shared
  experiment shell + its demo. Direct URL loads work without the transition.
- **Layout (one responsive shell, from the desktop design):** full-page lab
  bench on paper (`.lx-page`), inner column max-width 920px. Header row:
  `← home` back button + the three `exp-00N` tabs (active tab filled with the
  experiment accent) — tabs are links between `/lab/*` siblings. Title block:
  accent-bordered tag chip w/ pulsing live dot, 44px hand title, hand blurb.
  Demo body is a two-panel grid — input panel left (canvas / gauge+input /
  k-field), output panel right behind a dashed left border (`$`-prompt caption,
  ranked guesses / history / k-means status+legend); k-means uses a
  1.15fr/0.85fr split. "✎ how it actually works" aside below. `Esc` peels home.
- **≤760px:** the design's own collapse — single column, output panel's dashed
  divider moves to the top, tighter padding, 34px title. This replaces the
  mobile prototype's separate `mx-*` layout (same components, one code path);
  keep the mobile footer exp-dots out — the header tabs work at all sizes.
- Desktop sizing details: 360×360 doodle canvas (15px stroke), top-**4**
  guesses (mobile collapse can stay at 4), 280px gauge, k-means scatter
  11 pts/blob, per-cluster legend with live point counts.
- **Keep-alive intent from the design:** models/demos stay warm across tab
  switches and reopen. With real routes we get this via a module-level model
  cache (loaded tf model + word index survive route changes), not component
  keep-alive — same user-visible effect: each model downloads once per visit.

### B2. Generalize the ink transition destinations — SHIPPED (2026-07-24)
Landed differently (and better) than planned, after Anoop's feedback that
partial destination copies made the article body "just appear" at handoff:
- **Both effects reveal the REAL destination route** ("like how the static
  version works"). Bleed commits `router.push` up front; the destination
  renders underneath while an inert full-document copy of *home* covers it
  (offset to the origin scroll, paper background riding on the document so
  the ruled lines stay aligned, frozen `SideNav` rail included); the ink
  blobs are cut *through* the copy as growing holes via one SVG mask
  (white rect + black blob paths — unions where polygon() clips can't).
  The animation holds until `pathname` matches, so slow renders just wait
  under the covering copy.
- Since bleed only ever leaves home, home is the *only* page copy the system
  needs (`components/transition/layers.tsx` → `HomeLayer`). Peel is unchanged
  mechanically (home copy revealed over the live origin, push at cover) and
  `/lab/*` in PR 2 needs **zero** transition work — any bleed destination and
  any peel origin already works.
- **Ink is a home-only ceremony** (revised 2026-07-24): §05 rows bleed from
  the click point into their article; "see all" bleeds to `/journal`;
  `/journal → /` peels. Navigation *within* the journal (index rows →
  article, article → index) stays static plain links.
- Lab cards in `Lab.tsx` become buttons wired to
  `navigate("/lab/<slug>", { effect: "bleed", originRect })`; add the
  `▸ open experiment` run affordance + active-press styles. `← home` on the
  experiment page peels back (`effect: "peel"` to `/`), same as journal.

### B3. Experiment components (`components/lab/`) — real models, design UI
The trained TF.js models already live in `public/models/` (they shipped on the
old site), and `main` has working implementations to pull from:
`hooks/useDoodleModel.ts`, `hooks/useSentimentModel.ts`,
`components/demos/{DoodleClassifier,SentimentDemo,PlaygroundDemo}.tsx`.
`@tensorflow/tfjs@4` is still in package.json. So the Lab ships with the
**real models from day one** — design UI from `mobile-lab.jsx`, inference
from `main`:

- `DoodleLab.tsx` — design's drawing pad (pointer events + capture, 13px ink
  `#2a2a2a` on paper `#fdfaf2`, hand hint) driving the **QuickDraw CNN**
  (`/models/doodle/model.json`, port `useDoodleModel` from `main`).
  Preprocessing: main's version drew white-on-black and downscaled straight
  to `[1,28,28,1]`; new canvas is ink-on-paper, so invert + bbox-crop/center
  into the 28×28 field (keep the design's bbox-centering — it also improves
  accuracy for small/offset sketches). "model input" preview becomes 28×28.
  Top-3 of the 50 `CLASS_NAMES` with animated confidence bars.
- `SentimentLab.tsx` — design's gauge/input/history UI driving the **IMDB
  LSTM** (`/models/sentiment/model.json` + `word_index.json`, port
  `useSentimentModel`: clean → tokenize → pad to 64 → sigmoid score 0..1).
  Needle maps `(score·2−1)·72°`; verdict thresholds on the same remapped
  score (±0.15 → Neutral band). Token chips: the LSTM gives no per-word
  attribution, so keep the design's lexicon scorer as a purely visual
  "which words carry feeling" annotation layer while the model drives the
  needle/verdict (see open question 2).
- `KMeansLab.tsx` — design's field/controls UI running **Anoop's k-means
  from `main`'s `PlaygroundDemo.tsx`** (assign → mean-update loop, capped
  steps). Presentation per design: 650ms tick, CSS-transitioned centroid `✕`s,
  points colorize by assignment, converge when shift < 0.004, k ∈ {2,3,4},
  scatter = 3 gaussian blobs × 9. (`main`'s extra perceptron/classifier mode
  stays out — not in the design.)
- Model loading: lazy — dynamic-import tfjs + load the model on experiment
  mount (models only fetch when a bench opens; `/lab/*` stays out of the
  home bundle). Dispose tensors + model on unmount (AGENTS.md pattern).
- **Model loading UX — "bench boot" sequence** (decided 2026-07-23, homage to
  the old site's terminal boot): while the model loads, the output panel plays
  staggered mono lines in the paper aesthetic —
  `$ ./wake exp-002 --model lstm-imdb` → `fetching weights ▸▸▸░░ 68% · 4.1 MB`
  (real progress via `tf.loadGraphModel`'s `onProgress`) → `loading word
  index ✓` → `warming up gpu ✓` (the dummy-predict shader warm-up) →
  `ready — type a sentence ✎`. Character-drawn progress bar, pulsing cursor.
  Never fake: slow connections sit honestly on the fetch line; cached loads
  play a fast ~600ms minimum pass so it doesn't flash. Input side stays fully
  interactive throughout (draw/type during boot); the accent action button
  enables on `ready`. K-means needs no model — its output panel shows status
  immediately.
- **Model loading performance layers** (decided): sizes today — doodle ~1.9MB,
  sentiment ~12.3MB served (9.3MB weights + 884KB json + 2.1MB word_index;
  the 11MB tokenizer_config.json is never fetched — main's hook uses
  word_index.json only).
  1. Bench never blocks on the model (above).
  2. Prefetch on intent: warm the fetch during idle when the Lab section
     scrolls into view (skip when `navigator.connection.saveData`); card
     hover/pointerdown starts the load; tap gets the bleed (~1.5s) head start.
  3. Once per user, not per visit: `model.save("indexeddb://…")` after first
     load, try IndexedDB first, network fallback; immutable cache headers on
     `/models/*`.
  4. Shader warm-up dummy predict right after load (kills first-classify jank).
  5. Prune `word_index.json` to indices < 10,000 (hook ignores ≥ VOCAB_SIZE —
     lossless): ~2.1MB → ~150–250KB. Small build-time script.
  6. Optional follow-up: uint16/uint8 quantization of sentiment weights via
     tensorflowjs_converter tfjs→tfjs (needs accuracy spot-check) — 9.3MB →
     ~4.6/2.3MB. Doodle doesn't need it.
- Shared: `LabButton` (hand-drawn shadow button), styles as `app/lab.css`
  (`.mx-*` classes, same token approach as `journal.css`).
- Respect `useReducedMotion` (needle/centroid transitions, pulse dots).
- The "✎ how it actually works" asides get rewritten to match reality: the
  models ARE the trained CNN/LSTM now, so the honesty note flips — describe
  the real model + its limits (50 classes, IMDB-flavored sentiment) instead
  of the prototype-approximation caveat.

---

## Suggested sequencing

1. **PR 1 — Transition generalization + note-row bleed** (B2): the riskiest
   refactor lands alone — destination-aware overlay, article header layer,
   rows wired to bleed. Everything after builds on it.
2. **PR 2 — The Lab** (B1 + B3): routes, experiment components, real models,
   card wiring.
3. **PR 3 — Mobile nav** (A1): dock removed, index chip + overlay in.
4. **PR 4 — Mobile section pass** (A2 + A3): mostly CSS, review with device
   emulation screenshots per section at 320/375/393/430/600.

## Decided (2026-07-23)

- Mobile is **fluid** — 393px is only the design canvas; support ~320→430+
  phones and the in-between tablet range.
- **Note rows bleed** into their article, same as "see all" (home §05 and
  `/journal` index both).
- **Real TF.js models now** — `public/models/{doodle,sentiment}` + hooks and
  the k-means algorithm ported from `main`. No prototype-approximation phase.
- **Bottom dock nav is removed**, replaced by the index chip + overlay.

## Resolved (2026-07-23, round 2)

1. **Desktop layout for `/lab/*`** — designed: Hi-Fi v2's `lab-desktop.jsx` +
   `lab-desktop.css` (`.lx-*`). Full-page two-panel bench, header exp tabs,
   920px column, own ≤760px collapse. Folded into B1 above.
2. **Sentiment token chips** — lexicon stays as annotation only; model drives
   needle + verdict.
3. **Article bleed layer** — header block including `dek`, which already
   exists in `JournalEntryMeta`/frontmatter. No schema change needed.

No open questions remain — plan is ready to execute.
