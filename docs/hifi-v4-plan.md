# Hi-Fi v4 — implementation plan

Porting the **v4** design pass into the Next.js site. Sources are the Claude Design
project `Portfolio` (`019dd9ee-087b-71ba-b30e-9dd64b1b5eae`).

**Design sources read for this plan**

| File | Role |
|---|---|
| `design_handoff_v4/README.md` | the handoff doc — spec + audit + open items |
| `Portfolio Hi-Fi v4.html` | desktop entry point (shell + entrance animation CSS) |
| `hifi-sections-v3.jsx` | **desktop content source of truth** (1716 lines) |
| `Journal.html` | journal entry point (edge-tab hover CSS lives in its `<style>`) |
| `journal.jsx` | **journal index reference implementation** — leads the repo |
| `je-blocks.jsx` | article primitives (callout / side / code / § rail / progress) |
| `journal-entry.css` | article stylesheet |
| `Portfolio Mobile Prototype.html` + `mobile-parts.jsx` | mobile parity |
| `ink-nav.js`, `ink-bleed-mobile.js` | transition geometry |

---

## 0. What is already done, and what is genuinely new

Three of the listed source files require **no work**, and saying so up front keeps
the phases honest:

- **`ink-bleed-mobile.js`** — fully ported. `lib/ink-bleed.ts` carries the same
  `SPATTERS`, `SPATTER_BIRTHS`, `JITTER`, `INK`, seeds and clip functions, and is
  *ahead*: it has `transitionMs()` picking `FWD_MS_SM`/`BACK_MS_SM` (1050/820 — the
  mobile values) by viewport width, instead of a separate mobile module. No change.
- **`ink-nav.js`** — a cross-*document* transition for two static HTML files. The
  repo does the same thing in-app via `components/transition/InkTransitionProvider.tsx`
  + `InkBleedOverlay.tsx`, with real routing. Its `sessionStorage` handoff and
  `location.href` navigation are prototype scaffolding. No change.
- **`journal-entry.css` / `je-blocks.jsx`** — already ported into `app/journal.css`
  (`.je-*`) and `components/journal/{ArticleEntry,CodeBlock,SectionRail,ReadingProgress,mdx-components}.tsx`.
  v4 changes exactly **one line** here (delete the `★ shipped` stamp, Phase 5).

So the real work is: **the Work section rebuild**, **the two-axis journal index**,
and a set of smaller copy/a11y deltas. Everything below is scoped to that.

### Delta table — design v4 vs. `redesign/hi-fi-v1` as it stands

| Area | Repo today | v4 wants | Phase |
|---|---|---|---|
| §02 Work | 2 `EXPERIENCE` cards + 3 `PROJECTS` (1 featured slab + 2 slabs) | 4 bands: role header → 3 system cards → 4 "also shipped" lines → 3 own-time slabs → 2 archive rows | 2–3 |
| Work data | inline `const` in `Work.tsx` | typed content module (`ROLE`/`WORK`/`ALSO`/`PROJECTS`/`MINOR`) | 1 |
| Project media | `<Image>` or "diagram coming" placeholder | media band + `⤡ enlarge` + lightbox; two projects have no shot yet | 3 |
| /journal index | single kind rail + `sorted newest → oldest` caption | kind rail + tab-as-subject-filter + sortable headers + state chip + footer readout + empty state | 4 |
| §05 Notes a11y | `aria-label` on row, `aria-hidden` on tab | no row label, audible tab | 5 |
| Article masthead | `★ shipped` stamp on every published entry | date + read time only | 5 |
| §04 Stack | 10 / 9 / 7 items, `Arch / Hyprland` obsession | 13 / 9 / 10 items, real 2026 stack, `CachyOS + niri` obsession | 6 |
| §01 Now | `Loan-forms feature…` / `RN internal-build polish pass` | **repo wins** — README §"Verified" says so explicitly | — |
| Mobile | responsive CSS over one component tree | same structure, condensed strings, zoomable lightbox | 7 |

---

## 1. Decisions already settled (do not re-litigate)

Taken from the handoff's audit section; recorded here so a later session doesn't
reopen them:

1. **Now-card copy: repo wins.** The prototype's `AI advisor…` / `fand…` wording in
   §5 of the README is stale. `components/sections/Now.tsx` stays as-is.
2. **Now-section date: repo wins.** Hardcoded `week of apr 29, 2026`. The
   prototype's `week of apr ${new Date().getDate()}, 2026` is a bug (drifts wrong
   outside April). Do not port it.
3. **Tag vs. kind is settled.** `kind` (`case`|`note`) is the bucket and drives the
   tab *colour* via `tabColors()`; `tag` is the subject and is the tab's *text*, from
   the closed six-value allowlist in `lib/journal.ts`. Already correct in the repo.
4. **§05 is notes-only** (`getNotes()`); `/journal` carries both behind the filter
   rail. No `★ case study` badge in §05.
5. **No multi-select facets.** Distribution is `ai/ml` 6 · `linux` 2 · `hardware` 1 ·
   `backend` 1 · `meta` 1 · `web` 0. Four subjects return a single row. Revisit past
   ~30 entries.
6. **Filters/sort are component state, not URL state.** Default = all entries,
   newest first.
7. **`scrollIntoView`** in the prototype is convenience — the repo's `ScrollLink` /
   Lenis path stays.

## 2. Open questions — answer before Phase 3 and Phase 4

These change what gets built, so they need your call. Everything not blocked on
them can proceed in parallel.

**Q1 — RESOLVED (2026-07-28).** Anoop supplied real screenshots. Installed:

- `public/projects/fand.png` (1696×1250) — the **Tauri GUI**: live temperature graph
  for a Ryzen 7 7800X3D + RTX 4090, two controllable PWM headers with duty/RPM/target,
  and the reusable curve cards (`case_mix`, `cpu_case`, `cpu_rad`, `gpu_case`).
  Trimmed ~160px of empty dark gutter below the last card.
- `public/projects/mosaic.png` (1728×1317) — the editor: content tree with per-entry
  and per-bullet include/exclude checkboxes on the left, live A4/Letter print preview
  on the right, `Export` in the header.

`<image-slot>` and the `.project-media.ph` placeholder path are no longer needed for
these two. Two consequences the placeholder plan didn't have to handle — see **Q1a**
and **Q1b** below.

**Q1a — the fand caption was written for a screenshot that doesn't exist.** Both the
desktop and mobile prototypes label the fand slot `terminal shot — fanctl watch under
load`. The actual image is the GUI, not the CLI. Rewrite alt + caption to match what
is on screen — the project's own tag list already carries `Tauri`, so a GUI shot is
on-brand; the *copy* is what's stale. Proposed:

> `alt`: "fand's control GUI — live CPU and GPU temperature graph, two PWM fan headers, and the reusable curve editor"

Mosaic's label (`screenshot — editor + live print preview`) describes the supplied
image exactly; keep it.

**Q1b — both screenshots are dark UI on a cream site.** Measured mean luminance
(alpha off): fand **0.16**, Mosaic **0.34**, versus the existing plates —
`legalrescue-nda.png` 0.98 and `stock-pred.png` 0.98, which are near-white diagrams.
The design system has an explicit position on this, in `journal-entry.css`'s code-block
comment: *"No dark theme on purpose: the architecture plates already put large black
rectangles on the cream, and two dark blocks on one page kills the paper."* v4's
own-time band stacks **fand (very dark) → Mosaic (dark) → LegalRescue (near-white)**,
so that is exactly the failure the note warns about.

*Recommendation:* render both dark shots with `imgFit: "contain"` — the band keeps its
`paper-2` background and `padding: 20px`, so the screenshot reads as a **plate mounted
on paper** rather than a full-bleed dark panel. The prototype already has this mode
(`ProjectImage`'s `contain` branch), and it is the same move `.je-plate` makes in the
journal. LegalRescue stays as it is. The alternating `data-flip` puts the two dark
bands on opposite sides, which helps further.

Worth a look at the comparison pass (Phase 8) before committing to it — if `contain`
letterboxes the fand shot too hard at narrow slab widths, the fallback is `cover` with
a tighter crop rather than going back to full-bleed dark.

**Q1c — no WebP conversion needed.** `next.config.ts` sets neither `images.unoptimized`
nor `output: "export"`, so the default Next image optimizer is live: PNGs referenced
through `<Image>` are re-encoded to AVIF/WebP per request `Accept` header and cached.
Keep the PNG originals as source. (Mosaic is 318 KB on disk — the largest asset in
`public/projects/` — but that is the un-optimized source, not what ships.)

**Q2 — RESOLVED (2026-07-28).** The README claims `status` "still gates `draft` out of
the index." It does not: `lib/journal.ts` validates and stores it, but nothing filters
on it. Its only consumer is the `★ shipped` badge that Phase 5.2 deletes, after which
it is read by nothing.

**Anoop's call: leave the stub entries in, build the index exactly as designed.** No
draft-gating. All 11 rows stay, §05 keeps its 8, and the subject filter keeps all six
values. Keep the field and its validation with a comment noting nothing reads it —
deleting it from 6 MDX files is churn for no functional gain, and the hook is wanted
the day a genuinely unpublishable entry exists.

### Q2a — read time is derived, and the book is thin

Found while investigating Q2, and the more consequential half. Read time is **computed,
not authored** (`lib/journal.ts:49`, `ceil(words / 200)`):

| entry | words | renders as | design shows |
|---|---|---|---|
| LegalRescue.ai | 387 | **2 min** | 12 min |
| The AM5 Memory Fix | 194 | 1 min | 5 min |
| Why I switched to Hyprland | 135 | 1 min | 8 min |
| Audio Genre Classification | 128 | 1 min | 9 min |
| Stock Prediction LLM Benchmark | 120 | 1 min | 15 min |
| Shipping LLMs at a startup | 114 | 1 min | 12 min |
| the 5 `draft` entries | 33 each | 1 min | 3–9 min |

**Ten of eleven render "1 min."** Page numbers derive from read time
(`page += max(2, read / 2)`), so every entry occupies exactly 2 leaves and the book runs
**pp. 003–023** against the design's **pp. 011–042**.

This matters because **Phase 4d makes `read` a sortable column** — with ten identical
values, clicking it produces no visible change, so the control cannot be verified
against the design.

**Do not fix this by authoring read times into frontmatter.** `AGENTS.md` is explicit:
never hand-assign metadata `lib/journal.ts` derives (reading time, entry number, page
number). The only correct lever is the word count itself — done in **Phase 1b**, below.

**Writing the real entries is out of scope for this port** (Anoop, 2026-07-28); they
land after the design is built.

Note also that padding was *not* needed to exercise the article layout: `legalrescue-ai.mdx`
already uses `<Side>`, `<Hl>`, `<Figure>`, `<Callout>`, footnotes, code and lists — the
full `je-*` component set — and other entries cover callouts, code and blockquotes. The
article design is verifiable against the content as it stands.

---

## Phase 1b — scaffold prose for read-time variance (DONE, 2026-07-28)

*Anoop's call: don't match the design's read times, just get enough distinct values to
prove the sort works.* Matching the design would have meant ~18,000 words; this took
~1,600, in four files.

| entry | words | read | design rank |
|---|---|---|---|
| Stock Prediction LLM Benchmark | 811 | **5 min** | longest ✓ |
| LegalRescue.ai | 635 | **4 min** | 2nd ✓ |
| Shipping LLMs at a startup | 443 | **3 min** | 3rd ✓ |
| Audio Genre Classification | 368 | **2 min** | 4th ✓ |
| the other seven | 33–166 | 1 min | — |

Five distinct values (1–5), and the four padded entries were chosen so the resulting
**order** matches the design's even though the magnitudes are smaller — Phase 8 can
compare orderings directly. Book now runs **pp. 003–024**.

**Every block is marked and reversible:**

- Fenced with an MDX comment `{/* ── SCAFFOLD-PROSE ── … */}` naming the date, the
  reason, and this section.
- Opens with a **visible** `<Callout variant="warning">Placeholder text follows — this
  entry has not been written yet.</Callout>`, so it cannot ship unnoticed.
- Every heading is prefixed `Placeholder — `, every paragraph opens `Placeholder
  paragraph.`
- Find all of it: `grep -rn SCAFFOLD-PROSE content/`
- Kept as its **own commit** so real entries land via a revert.

Verified: `npm run typecheck` clean, `npm run build` clean, all 11 journal routes
prerendered.

**Q3 — subject filter on touch.** `/journal`'s `.journal-edge-tab` is `display: none`
below 720px (`app/journal.css:122`). If the tab becomes the only subject control,
mobile loses the axis entirely. §05's Notes rows already solve this: at ≤720px the
edge tab becomes an in-flow pill via `grid-area` (`app/globals.css:563,624`).
*Recommendation, no decision needed:* port that same pill treatment to
`.journal-edge-tab` and make it the button. Flagging it because the handoff's
"reserve 110px at every breakpoint" rule assumes the desktop pinned-tab layout,
which does not apply once the tab is in flow.

---

## Phase 1 — Content data modules

*No visual change. Pure groundwork so Phase 2 is a rendering change, not a
content-plus-rendering change.*

**New:** `content/work.ts` (or `lib/work.ts` — `content/` currently holds only MDX,
so `lib/work-data.ts` is the more consistent home).

Port verbatim from `hifi-sections-v3.jsx:404–512`:

```ts
export type WorkAccent = "electric" | "coral" | "teal" | "navy";

export type Role    = { org; role; period; blurb };
export type System  = { n; t; kind; status; k: WorkAccent; d; bullets; impact; tags };
export type Project = { t; org; cat; k: WorkAccent; img; imgLabel; d; bullets; tags; cta };
export type Minor   = { t; y; d; cta };
```

- `ROLE` — Panacea Financial · Full-stack engineer · Aug 2024 — now + blurb.
- `WORK` — 3 systems: `AI advisor assistant` (coral, *internal user testing*),
  `Practice Loans — application digitization` (electric, *in production*),
  `Mobile app & online-banking auth` (teal, *internal user testing*).
- `ALSO` — 4 strings (release engineering, design system, deep linking, contract review).
- `PROJECTS` — `fand` (teal), `Mosaic` (electric), `LegalRescue.ai` (coral).
- `MINOR` — Audio Genre Classification (2024), Stock Prediction LLM (2024).

**Rules while porting**

- Copy the Panacea strings **verbatim**. They are scoped to capability/architecture
  level: no repo names, ticket ids, people, or tenant names. Don't "improve" them.
- Status language is load-bearing: `in production` only on Practice Loans; the other
  two read `internal user testing`. Do not normalise.
- **LegalRescue's image is `/projects/legalrescue-nda.png`.** The prototype still has
  `assets/audio-2.png` with `imgFit: "contain"` — a known leftover from the audio
  project, called out as open item #2 in the handoff. The repo is already correct;
  keep it correct.
- **`fand` and `Mosaic` now have real images** (Q1): `img: "/projects/fand.png"` and
  `img: "/projects/mosaic.png"`, both `imgFit: "contain"` per Q1b, `imgLabel: null`.
  fand's alt copy is rewritten per Q1a — it is a GUI shot, not a terminal shot.
- Add `shortD` / `shortBullets` optional fields now (unused until Phase 7) so mobile
  never becomes a second dataset. The prototype's `M_WORK` is a *condensed variant*,
  not a copy — model it as fields, not as a fork.

**Also fold in** the §04 Stack columns and §01 Now cards? No — leave those inline.
Stack changes in Phase 6 are a data edit inside `Stack.tsx`, and extracting them
buys nothing.

**Verify:** `npm run typecheck`. Nothing renders differently yet.

---

## Phase 2 — Work section rebuild (§02)

`components/sections/Work.tsx` is replaced structurally. This is the largest single
change in the pass.

### 2.1 New structure

```
SectionHeaderArrow  02 · Work · "{WORK+PROJECTS+MINOR} entries · 2024 — now"   → 8 entries
intro paragraph     "Panacea Financial — the systems I built there, plus …"
<RoleBlock/>
GroupRule  "what I built there"  · "{WORK.length} systems"
  WorkCard × 3
GroupRule  "also shipped"        · "{ALSO.length} things"
  AlsoList
GroupRule  "on my own time"      · "{PROJECTS.length} projects"
  ProjectSlab × 3
GroupRule  "earlier"             · "{MINOR.length} more"
  MinorRow × 2
```

Counts are **computed, never written** (handoff open item #6). The existing
`GroupRule` component already takes `label` + `count` — reuse it, only the strings
and spacing change (`0 0 20px` / `36px 0 20px` / `48px 0 24px` / `36px 0 4px`).

### 2.2 Components

**`RoleBlock`** — `.sketch-box`, `padding: 28px`, `margin-bottom: 26px`,
`background: color-mix(in oklab, var(--color-electric) 5%, var(--color-paper))`.
Org in the hand font at 34px electric; mono uppercase `role · period` on the same
baseline row (`flex`, `gap: 16px`, `flex-wrap`); blurb at 16.5px/1.62, `max-width: 760px`.

**`WorkCard`** — `.sketch-box`, alternating `tilt-l`/`tilt-r`, `padding: 26px`,
`grid-template-columns: minmax(150px, 190px) 1fr`, `gap: 24px`, `align-items: start`.

- Left rail: hand-font `n` at 46px/0.9 in `var(--color-{k})`; mono uppercase `kind`
  (11px, `letter-spacing: 2px`, `margin-top: 10px`); **status stamp** —
  `inline-block`, `1.5px solid var(--color-{k})`, same colour text, 10px mono
  uppercase, `padding: 3px 8px`, `border-radius: 3px`, `transform: rotate(-2.5deg)`.
- Right column (`min-width: 0`): `h3` 27px/1.12 · summary 15.5px/1.62 · bullets
  15px/1.68 in a `display: grid; gap: 8px` list · then the impact line — a mono
  10.5px uppercase `↳ impact` eyebrow in the accent, `margin-right: 8px`, followed
  by the sentence at 15px/1.6 · then pill tags (11px mono, `1.2px solid
  var(--color-ink-soft)`, `border-radius: 999px`).

**`AlsoList`** — `<ul>`, no bullets, `display: grid; gap: 12px`; each row is
`grid-template-columns: 20px 1fr` with a mono em-dash in `--color-ink-faint`.
Note the prototype uses `20px` for the dash column on desktop and `14px` on mobile.

**`ProjectSlab`** — carries over almost unchanged from the current implementation:
`data-flip`, the `--slab-cols` custom property (`1.4fr 1fr` / `1fr 1.4fr`), image
before or after the copy column. Keep the existing `--slab-cols` bridge — it exists
precisely so the ≤1000px collapse in `globals.css:351` is a plain override rather
than an `!important` fight.

**`MinorRow`** — `grid-template-columns: minmax(150px, 190px) 1fr`, `gap: 24px`,
`align-items: baseline`, `padding: 14px 0`, `border-top: 1.5px dashed
var(--color-ink-faint)`. Left: title 16px/600 + mono year. Right: copy 14.5px/1.6 +
a mono CTA with `border-bottom: 1px dotted`.

### 2.3 Deletions

- `ExperienceCard` and the `EXPERIENCE` array — replaced by `RoleBlock` + `WorkCard`.
- `FeaturedSlab` and the `★ featured project` tab — v4 has no featured slab; the
  role header does that job now.
- Dead CSS in `app/globals.css`: `.exp-card` rules (`:496,499,503`), `.featured-slab`
  (`:407`), `.featured-tab` (`:505`), `.featured-hero` (`:506–507`), `.featured-body`
  (`:498,501,514`). Sweep these in the same commit — leaving them is how a stylesheet
  rots.

### 2.4 New CSS

Add to `app/globals.css` beside the existing section rules:

- `.work-card` grid + its ≤900px collapse to one column (mirrors `.exp-card`'s
  current `grid-template-columns: 1fr; gap: 14px`).
- `.work-status` stamp — zero the rotation at ≤900px alongside the existing
  `.sketch-box.tilt-*` reset at `:403`.
- `.work-impact` eyebrow, `.also-list`, `.minor-row`.

**Verify:** `npm run typecheck`, `npm run lint`, `npm run build`. Then read §02 at
1440 / 1280 / 900 / 720 / 393.

---

## Phase 3 — Media band, lightbox

*Q1 resolved — all three own-time projects have real images, so no placeholder path
is needed. Unblocked.*

**Media band geometry** (unchanged from the design, applies whether the band holds
an image or a placeholder): fills its full grid column, `2px solid var(--color-ink)`
on both sides, `min-height: 200px`, `background: var(--color-paper-2)`,
`overflow: hidden`. Below 1000px the slab stacks; **above** that the side rules must
run the full card height (handoff build note #4). The current `.project-media` uses
`min-height: 280px` and `border-x-2` — reconcile to 200px per the v4 spec.

**Fit mode.** LegalRescue keeps `cover`; fand and Mosaic use `contain` with the band's
`padding: 20px` over `paper-2`, so the dark screenshots mount as plates instead of
full-bleed dark panels (Q1b). `.project-media.ph` and the `imgLabel` placeholder branch
are now unreachable for §02 — leave the code path only if something else still uses it,
otherwise delete it with the other Phase 2 sweeps.

**Lightbox** — new `components/ui/Lightbox.tsx` (client):

- Fixed overlay, `role="dialog"`, `aria-modal`, `aria-label` = image alt.
- Closes on `Esc` and on scrim click; `stopPropagation` on the image itself.
- Body scroll locked while open — and **restored on unmount**, not only on close.
- Bar with the alt text + a `close · esc` button.
- The prototype fires an `om-lightbox` `CustomEvent` because it has no shared state.
  In the app: lift `useState` into `Work` and pass an `onZoom` callback down. Do not
  port the event bus.
- **Focus management** — the prototype has none. Deprioritised per Anoop's call, but
  worth the ~15 lines if it's cheap when we get there: focus the close button on
  open, trap inside, return focus to the triggering `⤡ enlarge` button on close.
  Without it a keyboard user who opens the lightbox is stranded behind it.
- `⤡ enlarge` button (`.zoom-btn`) appears only on bands holding a real image.

`prefers-reduced-motion`: the overlay has no entrance animation to suppress, but if
one is added it goes behind `useReducedMotion`.

**Verify:** keyboard-only open/close on every slab; focus returns correctly; Escape
works; scroll lock releases.

---

## Phase 4 — Two-axis journal index

*The one place the prototype **leads** the repo, so the usual "repo wins" rule is
suspended. Reference: `journal.jsx` + `Journal.html`'s `<style>` block.*

Target: `components/journal/JournalIndex.tsx` + a new `app/journal-index.css`
(or a clearly-fenced section of `app/journal.css`).

Order matters — each step below is independently shippable.

### 4a. Delete the `sorted newest → oldest` caption

`JournalIndex.tsx:104`. The column headers will state the order in 4d; two claims
about the same thing is the clutter this pass removes.

### 4b. Edge tab becomes the subject filter

One hard constraint: **the tab must be a `<button>` that is not nested inside an
`<a>`.** This is a correctness issue, not a polish one — `<button>` inside `<a>` is
invalid HTML, and engines recover from it inconsistently, so the tab click may or may
not also fire the row's navigation. Today the whole row *is* one `<Link>`
(`JournalIndex.tsx:134–187`) with the tab inside it, so it has to come out.

**Keep the whole-row click target.** The prototype (`journal.jsx`) solves the nesting
by splitting the row into separately-anchored page-number and title `<a>`s with the
tab as their sibling — which costs it the big click target. The repo doesn't need
that trade: its `<li>` is already `position: relative` (`JournalIndex.tsx:133`), so
the tab moves out of the `<Link>` and becomes a **sibling of the `<Link>`, inside the
`<li>`**, absolutely positioned over the row's existing 110px right reserve. The
`<Link>` keeps all four cells and stays one target; the tab paints above it (later in
DOM order, no `z-index` needed) and takes its own clicks.

Diverges from the prototype deliberately — the design's split-link structure is an
artifact of its markup having no row wrapper, not an intent.

Nothing about the `navigate()` call changes: it stays on the `<Link>`, including
`Notes.tsx`'s origin logic (`ev.detail === 0` → keyboard, use the element rect;
otherwise use the click point), which is what makes the bleed originate under the
cursor.

Behaviour: click a tab → filter to that subject; click it again → clear.
`title` attribute swaps between `filter to {tag}` and `showing {tag} — click to clear`.

### 4c. Tab geometry into CSS

Move `--tab-w` / `--tab-tint` / `--tab-shadow` out of inline styles so hover,
`:focus-visible` and active are **one rule set**:

```css
.journal-edge-tab {
  --tab-c: var(--color-teal);           /* inline override per row from tabColors */
  right: -2px;                           /* pinned past the panel's clipped edge */
  min-width: var(--tab-w, 90px);
  background: color-mix(in oklab, var(--tab-c) var(--tab-tint, 15%), var(--color-paper));
  box-shadow: var(--tab-shadow, none);
  transition: min-width .16s, opacity .16s, box-shadow .16s, background .16s;
}
.journal-edge-tab:hover,
.journal-edge-tab:focus-visible { --tab-w: 96px; --tab-tint: 34%;
  --tab-shadow: -2px 2px 0 color-mix(in oklab, var(--color-ink) 45%, transparent); }
.journal-edge-tab:focus-visible { outline: 2px solid var(--color-ink); outline-offset: 2px; }
.journal-edge-tab.is-on { --tab-w: 100px; --tab-shadow: -2px 2px 0 var(--color-ink); font-weight: 500; }
.journal-index.has-subject .journal-edge-tab:not(.is-on) { opacity: .45; }
```

The rules that make this work, all of which the handoff states explicitly:

- **The tab elongates leftward; it never slides.** `right` stays at `-2px`. Sliding
  it left detaches its right edge from the page and turns it into a floating chip
  with a missing border.
- **90 → 96 → 100px, ceiling 110px.** 110px is the row's reserved right padding, and
  the tab stops ~10px short on purpose: reaching the date column reads as crowding
  it, not as emerging.
- **110px must be reserved at *every* breakpoint** where the tab is pinned. Repo
  desktop already does (`journal.css:69,72`). Note `Journal.html`'s own ≤720px
  override reserved only 100px and let the active tab overlap the meta — that's a
  prototype bug; don't copy it.
- **Hover borrows the row's language.** The tint deepens 15% → 34% — the same
  tint-the-paper move the row hover makes. Keep the depth in a custom property; a
  hardcoded per-kind hover colour duplicates the palette.
- Unmatched tabs drop to `opacity: .45` so the book reads as flipped-to-a-section.

**Mobile (Q3):** at ≤720px, instead of `display: none`, give `.journal-edge-tab` the
in-flow pill treatment §05's Notes rows already use (`app/globals.css:563,624`) and
drop the 110px reserve, since the tab is no longer pinned.

### 4d. Column headers: static `subject` + sortable `title` / `read` / `date`

- Grid becomes `44px 1fr 90px 90px 96px` on the header row (the 5th cell positions
  the static `subject` label over the tab strip). Rows stay `44px 1fr 90px 90px`
  with the tab absolutely positioned.
- `subject` is a **static label, not a control** — the affordance can't depend on
  hover (touch) or on the footer hint, which scrolls out of view once the book is
  long. The header names the axis permanently.
- `title` / `read` / `date` are `<button>`s showing ▲/▼ with `aria-sort` following.
- **`pg.` is deliberately not sortable.** In a book filled front to back the page
  number only increases with time, so "by page" and "by date" are one ordering.
- Sort on `no` (the chronological entry number), never by re-parsing `dateDisplay`.
- State starts `{ key: "date", dir: "desc" }`. Clicking the **same** column flips
  direction; clicking a **new** one starts in *that column's* expected direction
  (`title` → `asc`, everything else → `desc`) rather than inheriting the previous
  column's.
- `aria-sort` belongs on the header cell, not the button. The prototype puts it on
  the `<button>` — fix that on the way in.

### 4e. Active-subject chip + footer readout + empty state

- Chip in the filter row: `subject: {tag} ×`, shaped like the tab that set it, clears
  on click. One line of state instead of a pressed button in a row of six.
- Footer: `{n} shown · subject {tag} · {c} case studies + {n} notes · pp. NNN–NNN`.
  The `subject` clause appears only when a subject is active, so the line doubles as
  confirmation the filter took.
- Footer hint becomes `tap a line to open it · tap a tab to filter ↦`.
- **Empty state** — hand font, naming both axes:
  `Nothing filed under {tag} in {kind} yet.` plus a `show the whole book` reset
  button. Never a bare zero-row ledger.

### 4f. Keep

The `★ case study` badge on `kind === "case"` rows (mono 9px, ink border, paper-2
fill, `aria-hidden` star), the audible tab, and the absence of a row `aria-label` —
all already correct in the repo.

**Verify:** every filter × sort combination, including the empty ones; `aria-sort`
announced; keyboard reachable tabs; the 110px reserve holds at 1440 / 1280 / 900;
the mobile pill works at 720 / 393.

---

## Phase 5 — masthead cleanup (+ two cheap a11y deletions)

Three small, independent edits. **Low priority** — Anoop's call, 2026-07-28: the a11y
items are secondary. 5.2 is the one that changes what's on screen; 5.1 is two line
deletions kept in the phase because it costs nothing to do while the file is open,
not because it's blocking.

**5.1 — `Notes.tsx` missed the a11y pass.** `JournalIndex.tsx` dropped the row
`aria-label` and un-hid the edge tab; `components/sections/Notes.tsx` — the same
ledger row — still has `aria-label={`Open note: …`}` on the `<Link>` and
`aria-hidden="true"` on `.notes-edge-tab`. Remove both. On a link an `aria-label`
replaces the whole subtree, which was hiding the page number, read time and date
from screen readers. §05 needs no `★ case study` badge — it is notes-only.

*Note:* §05's tab is **not** a filter (there is nothing to filter — one kind, one
page). It only becomes audible. Phase 4's restructuring does not apply here, so the
§05 row stays one `<Link>`.

**5.2 — Delete the `★ shipped` stamp.** `ArticleEntry.tsx:53`:
`{entry.status === "published" && <span className="je-stamp">★ shipped</span>}`.
It was gated on a condition every published entry satisfies by definition, so it
appeared on all of them and distinguished nothing. The chip row becomes date +
read time only. `.je-stamp` in `app/journal.css:186` and its ≤`:376` override become
dead — delete both. The index's `★ case study` badge is unrelated and stays.

**5.3 — `status` follow-up.** Per **Q2**. If (a): add a comment at
`lib/journal.ts:99` recording that `status` is authored and validated but not yet
read by anything.

---

## Phase 6 — Stack, and copy sweep

**§04 Stack** (`components/sections/Stack.tsx`) — replace `COLS`:

- **at work** (13): TypeScript 4 · React 5 · **React Native 1** · NestJS 3 ★ ·
  Python 6 · **Azure Functions 1** · **Azure AI Foundry 1** · **OpenTelemetry 1** ·
  PostgreSQL 4 · **Helm / K8s 1** · **Azure DevOps 2** · Terraform 2 · Git 6.
  *Drops:* Redis, Azure, Snowflake, Service Bus.
- **in the lab** (9): unchanged — Python 6 · PyTorch 3 · LLMs / RAG 2 ★ · FastAPI 3 ·
  Hugging Face 2 · TensorFlow.js 1 · Whisper 1 · MongoDB 2 · AWS 3.
- **at home** (10): **CachyOS + niri 1 ★** · **Rust 1** · **Noctalia shell 1** ·
  **GNOME (for fun) 3** · Neovim 3 · tmux + zsh 4 · Custom PC builds 5 ·
  Self-hosted services 2 · Tailscale 2 · Docker 4. *Drops:* Arch / Hyprland
  (superseded as the obsession).

One `obsession: true` per column — the `CircleMark` ellipse. `at work` moves it to
NestJS, `at home` to CachyOS + niri.

**Copy checks** — verify, don't assume:

- Work intro: `Panacea Financial — the systems I built there, plus what I build on
  my own time.` with `Panacea Financial` inside `.marker-highlight`.
- Work meta: `8 entries · 2024 — now` (computed).
- Hero kicker `// hello.tsx — apr 29, 2026` — already correct (`Hero.tsx:12`).
- Now meta `week of apr 29, 2026` — already correct, repo wins.
- §05 heading/meta and `see all notes & case studies →` — already correct.

**Section numbering and anchors are fixed:** 00 cover · 01 now · 02 work · 03 lab ·
04 stack · 05 notes · 06 contact, `#sec-<id>`. The three header variants
(`SectionHeader`, `SectionHeaderArrow` on Work, `SectionHeaderStamp` on Contact) are
intentional — do not normalise them.

---

## Phase 7 — Mobile pass

The repo is one responsive component tree, not a separate mobile app, so `mobile-parts.jsx`
is read as a **spec for the ≤900px / ≤720px / ≤430px branches**, not as code to port.

**7.1 — Condensed copy.** Where the mobile strings differ, they are shorter bullets
and a couple of dropped tags (AI advisor loses `Responses API`; LegalRescue loses
`PostgreSQL`). Drive these from the `shortD` / `shortBullets` fields added in Phase 1,
selected in CSS-free fashion at render — **not** a second dataset.

Honest caveat: swapping copy by viewport means either a client-side width hook (adds
a hydration boundary and a flash) or rendering both and hiding one (ships both
strings, but no JS). *Recommendation:* render both, hide with CSS. The strings are
small and it keeps §02 a Server Component.

**7.2 — Layout, per `mobile.css`.** Single column, no tilts, tighter type:

- `.work-card` → stacked; number + status stamp on one flex row above the kind line.
- `.also-list` rows → `14px 1fr`.
- `.project-slab` → image band on top, body below (already collapses at ≤1000px;
  confirm the band keeps its geometry).
- `.minor-row` → title + year on one row, copy, dotted CTA.
- Role block keeps its electric 5% tint; org drops to 26px.

**7.3 — Zoomable lightbox.** The mobile prototype's `LightboxM` is pinch-zoomable:
scale clamped 1–6, one-finger drag to pan when zoomed, double-tap toggles 1× ↔ 2.6×,
translation clamped to scaled bounds, `touch-action: none` on the stage, bar shows
live zoom + `reset` / `close ×`.

Scope call: this is a meaningful chunk of pointer-event work for a placeholder-heavy
gallery. *Recommendation:* Phase 3 ships the plain lightbox everywhere; pinch-zoom
lands only if Q1 resolves to real screenshots worth zooming into. Flagging rather
than silently dropping.

**7.4 — Journal index on mobile.** Per Q3 — the tab pill.

**Verify:** the WM won't size below ~500px, so check narrow breakpoints through
same-origin iframes rather than by resizing the window (`docs/` convention from the
mobile/ML-lab pass).

---

## Phase 8 — Final design-vs-site comparison pass

A structured audit, not a vibe check. For each surface, put the prototype and the
built site side by side and walk a checklist.

**Setup.** Serve the design bundle locally (the prototypes are plain HTML +
in-browser Babel — a static file server over a directory containing
`Portfolio Hi-Fi v4.html`, `Journal.html`, their JSX/CSS and `assets/`), and
`npm run build && npm start` for the site. Two browser tabs; screenshot both at each
breakpoint.

**Breakpoints:** 1440 · 1280 · 1000 (slab collapse) · 900 (nav dock) · 720 (journal
row reflow) · 393 (phone).

**Per-surface checklist**

*§02 Work* — band order and the four rule labels; computed counts (3 / 4 / 3 / 2, meta
`8 entries`); role block tint and org size; card tilt alternation; status stamp
rotation, border weight and **wording**; the `↳ impact` eyebrow; tag pill set matches
the data module exactly; media band side rules run full height above 1000px.
**Judgement call to make here, not before:** whether `contain` on the two dark
screenshots keeps the paper alive (Q1b) or letterboxes them too hard — decide by
looking at the three slabs stacked, at 1440 and at 1000.

*§04 Stack* — 13 / 9 / 10 items in order; tally marks match the year counts; exactly
one circled item per column and it's the right one.

*/journal index* — tab elongates and never slides; 90 / 96 / 100px at rest / hover /
active with the 110px reserve intact; tint 15% → 34%; unmatched tabs at .45; active
tab's `-2px 2px 0` ink shadow and weight 500; the static `subject` header sits over
the tab strip; sort arrows and `aria-sort`; new-column direction defaults; chip
shape matches the tab; footer readout string; empty state names both axes.

*/journal/[slug]* — masthead chip row is date + read time **only**, no stamp; hero
plate is `plate 000` with authored alt + caption; § rail, callouts, code plates,
margin notes, prev/next `#{tag}` all unchanged from v3.

*§05 Notes* — no row `aria-label`, tab audible, no `★ case study` badge, teal tabs
throughout (notes-only).

**Cross-cutting**

- Tokens: paper `#fdfaf2` / paper-2 `#f5f0e1` / ink `#1a1a1a` / ink-soft `#4a4a4a` /
  ink-faint `#8a8a8a` / electric `#cc00e6` / teal `#1ea896` / coral `#ff715b` /
  navy `#25283d`. Accent tints follow `color-mix(in oklab, var(--accent) N%, var(--paper))`
  — 5% role block, 8% asides, 12–14% chips/stamps.
- Chrome: `2px dashed` section header rules, `1.5px dashed var(--ink-faint)` inner
  rules, `.sketch-box` = 2px ink border + offset shadow.
- Hairlines and repeating rails on **whole pixels** — the 17px rem basis puts
  Tailwind's rem steps on fractions and they antialias unevenly.
- Entrance animation intact: `.hydrated` on body, class-driven targets, delays
  0.00s → 2.26s, portrait outline → image (0.85s) → shadow (1.00s), and the full
  `prefers-reduced-motion` fallback showing end states.
- `.anim-rail` keeps `fill-mode: forwards` — SideNav's inactive-row dim is dead on
  purpose; changing the fill mode is a regression, not a fix.
- Reduced-motion pass with the OS setting on.
- Keyboard pass — **deprioritised**, but the sort headers and the subject tab are new
  controls, so at minimum confirm they can be *reached and fired* at all. That's
  function, not polish: a sort header that only responds to a mouse is a broken
  control.
- Deliberate divergences (Now copy, Now date, LegalRescue image, and anything Q1/Q2
  resolves against the prototype) are **expected** — check them off as intentional
  rather than "fixing" them back toward the prototype.

**Gate:** `npm run typecheck` · `npm run lint` · `npm run build`, clean. Report which
ran and separate pre-existing failures from new ones.

---

## Sequencing

```
Phase 1 ──► Phase 2 ──► Phase 3 (blocked on Q1)
                                   │
Phase 4 (blocked on Q3 answer) ────┤
Phase 5 ───────────────────────────┤──► Phase 7 ──► Phase 8
Phase 6 ───────────────────────────┘
```

Phases 4, 5 and 6 are independent of the Work rebuild and of each other — any of
them can go first if you'd rather see the journal index land early. Phase 8 needs
everything.

Suggested commits: one per phase, with Phase 4 split along its own a–f steps since
each is independently shippable. 4b is the structural one — it moves the tab out of
the `<Link>` — so it's worth its own commit to keep the diff readable.

Phase 5 is low priority (see its header). Everything else stands.
