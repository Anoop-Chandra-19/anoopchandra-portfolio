# Plan: Journal page + ink-bleed transition (Claude Design "Portfolio" project)

> Status: **implemented on `redesign/hi-fi-v1`** (2026-07-15) — build green, static output verified; visual pass on the transition still pending.
> Implementation deltas from the plan: 11 entries (not 12 — the design has 3 case studies + 8 notes); shared types/helpers split into `lib/journal-meta.ts` so client components never import the fs loader; `body.ink-no-anim` is added once and kept for the session (removing it would restart the suppressed entrance animations); the layout's hardcoded `<link rel="canonical">` was removed in favor of per-page `alternates.canonical`; the RSS footer tease was dropped pending the open RSS decision.
> Source designs: Claude Design project `019dd9ee-087b-71ba-b30e-9dd64b1b5eae` (`journal.jsx`, `hifi-sections-v2.jsx`, `design_handoff_ink_bleed_transition/`).
> v2 changes: content layer switched from a typed TS array to **MDX files**; §05 NoteSpread overlay **removed** in favor of real article routes; read time auto-computed.

## Context

The Claude Design project contains three deliverables: the hi-fi v2 portfolio page, a **Journal** page, and an **ink-bleed / corner-peel page transition** between them. The portfolio page is already implemented on branch `redesign/hi-fi-v1` — what remains is the Journal and the transition, plus wiring the currently-inert "see all notes →" span in §05 Notes as the transition CTA.

**Decisions so far:**
- Real routes `/journal` + `/journal/[slug]` — shareable URLs, per-article SEO/metadata.
- Scope = Journal + transition only; no fidelity pass on existing portfolio sections.
- **Journal is a blog-first system: adding an entry = dropping one `.mdx` file in `content/journal/`.** Frontmatter for metadata, markdown body, custom components (`<Callout>`) for the notebook design blocks.
- **§05 Notes rows navigate to `/journal/[slug]`** — one reading surface, one rendering pipeline. The NoteSpread book-spread overlay from the design is removed (its aesthetic lives on in the article page's spread layout).
- Read time auto-computed from word count; notebook **page numbers stay hand-picked** in frontmatter (stable "notebook page" conceit), uniqueness checked at build.

**Design references:**
- Transition: **already in the repo, untracked** — `Portfolio/design_handoff_ink_bleed_transition/README.md` (full spec) and `transition-demo-v6.jsx` (primary reference to port: `blobClip`, `spatterClip`, `peelClip`, `BLEED_SEEDS`, `PeelShadow`, `hexA`, phase timeline).
- Journal layout/content: design file `journal.jsx` (3 case studies with full bodies + 9 notes).

**Repo facts the plan builds on:** Next.js 15.3.8 App Router, React 19, Tailwind v4 (`@theme` in `app/globals.css`), TS strict, Lenis via `components/LenisProvider.tsx` (currently mounted in `app/page.tsx`), framer-motion installed but unused. Design tokens + fonts already match the design exactly. CSS idiom: one file per feature imported in `app/layout.tsx`. `body` has `padding-left: 140px` (SideNav gutter, `globals.css:34`; 0 on mobile). Entrance animations gated on `body.hydrated` persist across client navigations → freshly pushed pages would replay them (must suppress). Conventions per AGENTS.md: Tailwind utilities first, inline styles only for dynamic values, `"use client"` only where needed.

**New dependencies:** `next-mdx-remote` (RSC-compatible MDX compile/render from a content dir), `gray-matter` (frontmatter parsing). Read-time is hand-rolled (word count / 200wpm) — no extra dep.

## Content architecture (the blog-first core)

```
content/journal/
  legalrescue-ai.mdx              ← slug = filename
  audio-genre-classification.mdx
  why-i-switched-to-hyprland.mdx
  ...
```

Frontmatter schema (validated at build with clear error messages):

```yaml
---
title: Why I switched to Hyprland     # required
kind: note                            # required: "case" | "note"
date: 2026-04-10                      # required, ISO; display-formatted as "apr 10, 2026"
tag: linux                            # required, free-form label
color: teal                           # optional: electric | coral | teal | navy (default ink)
page: 128                             # required, hand-picked notebook page no. (unique)
dek: After three years on i3...      # required, one-liner for TOC/dek/SEO description
sub: self · 2024                      # optional hand-font subtitle (case studies)
hero: /projects/audio-genres.png      # optional hero image (case studies)
heroAlt: ...                          # required if hero set
status: draft                         # optional, default "published" → "draft · in progress" stamp
related: [shipping-llms-at-a-startup] # optional, slugs (not titles — stable)
---

Markdown body. `## headings`, lists, blockquotes, fenced code blocks
all map to the notebook design. Plus:

<Callout color="coral">margin-note callout</Callout>
```

- **Adding an entry = one file.** Slug from filename, read time computed, appears in `/journal` index, §05 (if `kind: note`), sitemap, and static params automatically.
- Body semantics map 1:1 to the design's block types: p → paragraph, h → `##`, list → `-`, quote → `>`, code → fenced block, callout → `<Callout>`.
- Drafts (`status: draft`) still appear in the index and render with the "draft · in progress" stamp (matches the design's behavior).

## Architecture: transition = "destination-only overlay"

In both directions a fixed overlay renders **only the destination page**, clipped to growing regions, while the live current page stays visible outside the clips. No snapshot of the origin page needed. React mounts the overlay once; a single `requestAnimationFrame` loop writes `clipPath`/gradient styles **directly via refs** (no per-frame setState).

- **Forward (`/` → `/journal`), 1500 ms `easeOutCubic`:** drop dot at CTA center (local 0–0.05, scale 0.3→1.3) → 4 spatter layers born at [0.06, 0.10, 0.14, 0.18] → main blob layer `maxR · easeOutQuart((local−0.04)/0.96)`. Each layer = `<JournalIndex inert />` clipped by the 64-spoke noise polygon; overlapping layers of the same content read as a union. Halo (multiply rim) ON, veins OFF, jitter 0.22, ink `#0e0c08`, seed `0xDEADBEEF`.
- **Reverse (`/journal` → `/`), 1100 ms `easeInOutCubic`:** one layer of `<HomeContent inert />` clipped to the **complement half-plane `x+y ≤ k`** growing from top-left (visually identical to peeling the journal away); `k = (vw+vh+20) · ease(local)`; peel shadow band along the cut (visible local ∈ 0.03–0.97); the journal's brightness dim past 50% approximated by an extra multiply div over the unpeeled region.
- On completion: snap clips to full cover → `router.push(href)` → wait for `usePathname()` to report the target + double-rAF → unmount overlay (prevents handoff flash).
- `prefers-reduced-motion` → plain instant `router.push`. Direct loads and browser back/forward never show a transition.

**MDX interaction note:** the overlay is a client component, so the destination copies it renders (`JournalIndex`, `HomeContent`) must be client-renderable. They therefore take a serializable `entries: JournalEntryMeta[]` prop (metadata only — no MDX bodies), loaded once server-side in `app/layout.tsx` and passed down through `InkTransitionProvider`. Article bodies are only compiled/rendered on the server article pages, never in the overlay.

**Rejected alternatives:** solid-ink "cover" variant (spec requires the destination showing through the clip); Next `experimental.viewTransition` (unstable on 15.3.8, can't express blob unions or a live origin rect).

## Steps

### 1. Content loader: `lib/journal.ts` (new; new `lib/` + `content/journal/` dirs)
Server-only module (`import "server-only"`). Reads `content/journal/*.mdx` with `fs` + `gray-matter`.
- Types: `TagColor`, `JournalEntryMeta` { slug, kind, title, date, dateDisplay, read, tag, color, page, dek, sub?, hero?, heroAlt?, status, related } (fully serializable), `JournalEntry = JournalEntryMeta & { body: string /* raw mdx */ }`.
- Validation at load: required fields present, `kind`/`color`/`status` in range, unique slugs, unique page numbers — throw with filename + field in the message (build fails loudly, authoring stays safe).
- Derived: `read` from word count (~200 wpm, `"N min"`), `dateDisplay` ("apr 10, 2026" style), sort newest→oldest.
- API: `getEntries()`, `getEntryMetas()`, `getEntryBySlug(slug)`, `getNotes()`, `getCaseStudies()`, `getAdjacent(slug)`, `getRelated(meta)`, `pad(n)`, `tagColor(c)`. Cached per build via module scope (or `React.cache`).

### 2. Migrate the 12 design entries to `content/journal/*.mdx`
3 case studies (LegalRescue.ai p.4, Audio Genre Classification p.11, Stock Prediction LLM Benchmark p.17 — bodies/deks verbatim from design `journal.jsx`; heroes from `public/projects/*.png`) + 9 notes (4 with full bodies from the existing `NOTES_CONTENT` in Notes.tsx; 5 with the short fallback body + `status: draft`). Convert block arrays to markdown/`<Callout>` per the mapping above. `related` converted from titles to slugs.

### 3. MDX components: `components/journal/mdx-components.tsx` (new)
The component map passed to `<MDXRemote>`: styled `h2`/`h3` (Caveat, design sizes), `p`, `ul`/`li`, `blockquote` (hand-font electric-rule quote), `pre`/`code` (mono, ink-tinted paper block), `a`, plus `<Callout color>` (the "✎ margin note" dashed box). Port the styling from Notes.tsx's current `NoteBlock` renderers, then delete `NoteBlock`. No `"use client"`.

### 4. Simplify `components/sections/Notes.tsx` (shrinks ~783 → ~200 lines)
- Delete `POSTS`, `NOTES_CONTENT`, `NoteBlock`, **`NoteSpread`** and its focus/ESC/scroll-lock plumbing; delete `app/note-spread.css` + its layout import.
- New prop: `entries: JournalEntryMeta[]` (notes only, passed from the server Home page). Rows keep the notebook TOC visuals (date/title/tag/read, edge tabs) but become plain `<Link href={`/journal/${slug}`}>`.
- Footer CTA: replace the inert span (line ~517) with `<Link href="/journal">` labeled **"see all notes & case studies →"**, `onClick` = preventDefault + `useInkTransition().navigate("/journal", { effect: "bleed", originRect: e.currentTarget.getBoundingClientRect() })`.

### 5. Journal index: `components/journal/JournalIndex.tsx` + `app/journal/page.tsx` (new)
`JournalIndex` (`"use client"`, props `{ entries: JournalEntryMeta[], inert?: boolean }`):
- Top bar: back-pill "← back to portfolio" = `<Link href="/">` triggering `navigate("/", { effect: "peel" })`; mono "anoopchandra parampalli · journal · vol. 02" label.
- `.journal-cover` banner: "The Journal" h1 with electric accent, hand-font dek, rotated "est. 2024 · updated weekly" corner stamp.
- Filter rail: all entries / case studies / notes & stories with counts (`useState`).
- Notebook TOC panel: 2px ink border, coral margin rule, rotated margin label; grid `44px 1fr 90px 90px` = p.NNN / Caveat title + dotted leader + "★ case study" badge / read / date; colored tag tab off the right edge; rows = plain `<Link>`; hover paper-2 tint; footer "tap any line to open the page ↦".

`app/journal/page.tsx` (server): metadata (title/description/canonical/OG), loads `getEntryMetas()`, renders `<JournalIndex entries={…} />` inside `div[data-journal-root]` + `.page` shell.

### 6. Article route: `components/journal/ArticleSpread.tsx` + `app/journal/[slug]/page.tsx` (new)
`ArticleSpread` (server): breadcrumb ("← back to index" plain Link + "case study · p.NNN"), hero strip for cases (`.sketch-box` + `next/image` + rotated "★ shipped" stamp), inline two-page spread — left page (coral margin rule, rotated margin label, meta line, Caveat title, hand sub/dek, **`<MDXRemote source={entry.body} components={mdxComponents} />`**, "— end of entry — / p.NNN" footer), binding line, right page on paper-2 tint (dashed meta sheet type/tag/date/read/page, status stamp, "also in this notebook" related links, prev/next cards via `getAdjacent`). Mobile stacks vertically.
`app/journal/[slug]/page.tsx`: `generateStaticParams` from content filenames, `dynamicParams = false`, async `generateMetadata` (Next 15 `params: Promise<…>`; dek as description, hero as OG image), `notFound()` on unknown slug.

### 7. `app/journal.css` (new)
`.journal-cover`, `.journal-toc-row`/`.journal-toc-header` grids + ≤720px stacking (do **not** reuse `.notes-row` — its mobile `!important` rules assume different columns), article spread grid/binding + ≤900px stack, stamps, MDX typography that utilities can't express, and:

```css
body:has([data-journal-root]) { padding-left: 0; } /* no SideNav gutter on journal routes */
```

Import in layout (replaces the removed note-spread.css import).

### 8. Pure math: `lib/ink-bleed.ts` (new — port from `Portfolio/design_handoff_ink_bleed_transition/transition-demo-v6.jsx`)
`mulberry32`, `makeBleedSeeds(0xDEADBEEF, 64)` (two-octave: 8 broad lobes ×0.7 + fine ×0.3), `blobClip` (jitter window `(r−20)/180`), `spatterClip` (window `(r−6)/28`), `peelClip(k, vw, vh)` + `peelClipComplement` (**parameterize viewport — demo hardcodes 1000×680**), `peelShadowGeom`, easings, `hexA`, constants (`FWD_MS 1500`, `BACK_MS 1100`, `JITTER 0.22`, `INK #0e0c08`, spatter offsets/radii `(-110,-70)r38 (130,-90)r32 (160,60)r28 (-90,100)r34`, births `[0.06,0.10,0.14,0.18]`, `maxRadius = hypot(max(cx,vw−cx), max(cy,vh−cy)) + 80`). Scale spatter offsets by `min(vw,vh)/680` on phones (noted deviation). All pure functions; no `server-only` (client overlay uses them).

### 9. Extract Home + move providers
- `components/HomeContent.tsx` (new): section stack from `app/page.tsx` (Hero→Contact + dividers + footer), props `{ journalEntries: JournalEntryMeta[], inert?: boolean }` (forwarded to Notes). Excludes SideNav (fixed-position children don't anchor inside clip-path'd layers) and LenisProvider.
- `app/page.tsx` (server): loads `getNotes()` metas → `<div className="page"><HomeContent journalEntries={…} /><SideNav /></div>`.
- `app/layout.tsx` (server): loads `getEntryMetas()` once, wraps `{children}` in `<LenisProvider><InkTransitionProvider entries={…}>…</InkTransitionProvider></LenisProvider>`; swap CSS imports (drop note-spread.css, add journal.css + ink-transition.css).

### 10. Transition: `components/transition/InkTransitionProvider.tsx` + `InkBleedOverlay.tsx` + `app/ink-transition.css` (new)
Provider (`"use client"`, prop `entries` for the overlay copies): context `{ navigate(href, { effect: "bleed" | "peel", originRect? }), active }`. State machine `idle → animating → committing → idle`.
- `navigate`: no-op if active; reduced-motion → plain push; else capture origin center + viewport, `lenis.stop()`, add `body.ink-no-anim`, mount overlay, run the rAF loop writing styles via refs per the phase spec.
- At `local ≥ 1`: full-cover clips → `router.push` → `usePathname()` effect + double-rAF → unmount, `lenis.start()`, remove class after ~300 ms.
- Cleanup: `cancelAnimationFrame` + timers on unmount; `popstate` aborts mid-flight; overlay blocks pointer events; resize mid-flight ignored.

Overlay: fixed inset-0, `z-index: 300`. Layers: `position:fixed; inset:0; overflow:hidden; will-change:clip-path; contain:paint`, content in `.ink-layer-paper` (replicates body paper background stack from globals.css — comment both sides to stay in sync; home variant mirrors the 140px/0 `padding-left`). Forward layers render `<JournalIndex entries inert />`; reverse renders `<HomeContent journalEntries inert />`.

`animations.css` addition: `body.ink-no-anim` suppression of all `.anim-*` (+ resting-state resets mirroring the reduced-motion block) so the freshly pushed Home doesn't replay its entrance sequence. **Watch:** removing the class can restart suppressed animations — if observed, key suppression off a persistent attribute instead.

### 11. `app/sitemap.ts`
Add `/journal` (priority 0.8) + one entry per slug (0.6, `changeFrequency: "weekly"`).

## Edge cases
- Frontmatter validation failures fail the build with filename + field (authoring safety net); duplicate slugs/pages caught there too.
- Scroll: forward clips are viewport-relative + Lenis stopped; journal copy renders from top = Next's scroll-to-top on push. Reverse: back-pill sits at top of index so scrollY ≈ 0.
- Journal ↔ article navigation = plain Links, no ink transition (only the §05 CTA and the index back-pill trigger it).
- Drafts render with fallback-quality bodies + "draft · in progress" stamp, still routable.
- A11y: real links everywhere (prefetch, middle-click, Enter); overlay copies `inert` + `aria-hidden`; reduced motion = instant push. NoteSpread's focus-trap code is deleted along with it — nothing replaces it (no modals remain).
- `next-mdx-remote` + React 19 / Next 15: use the `/rsc` entrypoint; pin a version verified against React 19 peer deps at install time.

## Risks
- clip-path repaint perf on large viewports (5 full-viewport layers × 64-point polygons): mitigations (`will-change`, `contain: paint`, `toFixed(1)` coords); escalation = single SVG `<clipPath>` union layer, then fewer spatters.
- Overlay ↔ real-page handoff flash: identical components + paper-background parity + unmount-after-pathname-commit; verify visually.
- Notes.tsx rewrite is now a *removal* (NoteSpread) — much smaller regression surface than the v1 plan's refactor, but §05 loses in-place reading; confirm the TOC row → article page flow feels right in dev.
- Entrance-anim replay on pushed pages: handled by `body.ink-no-anim`; flagged for verification.

## Verification
1. `npm run lint` && `npm run build` clean (expect `/journal` + 12 static article pages; frontmatter validation runs during build).
2. **Painless-authoring test (the point of v2):** add a scratch `content/journal/test-entry.mdx` with minimal frontmatter → appears in `/journal`, §05 (if note), sitemap, gets read time; delete it after. Also test a broken frontmatter file → build fails with a clear message.
3. Dev server: `/` §05 rows navigate to article pages; direct `/journal` (no transition; filter counts 12/3/9; middle-click back-pill opens `/` in new tab); direct `/journal/legalrescue-ai` + one note + one draft (hero only on cases, spread layout, prev/next/related, stamps, MDX blocks render per design); `/journal/nope` → 404.
4. Forward transition from §05 CTA: drop at CTA center → 4 spatters → wet-edged main bleed with halo, ~1.5 s, seamless handoff (no flash, no entrance-anim replay), scroll at top, Lenis works after.
5. Reverse via back-pill: diagonal peel with shadow band + dim, ~1.1 s, SideNav present after.
6. Interruptions: browser Back mid-transition aborts cleanly; double-click CTA ignored.
7. Reduced-motion emulation: instant pushes both ways. Mobile ≤720px: TOC/spread stack, spatters stay on-screen, padding correct on both routes.
8. `/sitemap.xml` includes journal URLs; article view-source has correct `<title>`/OG tags.

## Resolved discussion items
- ~~Typed TS array vs MDX~~ → **MDX files**, slug = filename, frontmatter metadata, `<Callout>` component.
- ~~Keep NoteSpread overlay?~~ → **No** — §05 rows link to `/journal/[slug]`; overlay + note-spread.css deleted.
- ~~Metadata automation~~ → read time auto (word count), page numbers manual (unique, build-checked).
- ~~Drafts in index?~~ → shown with "draft · in progress" stamp (matches design).

## Still open
- RSS feed (`journal/feed.xml` is teased in the design's footer note) — easy to add later from `getEntryMetas()`; in or out of this iteration?
- Whether §05 should cap at N most-recent notes with "see all…" doing the heavy lifting, or keep showing all notes as today.
