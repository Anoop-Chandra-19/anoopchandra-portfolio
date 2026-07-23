# Journal Entry redesign — "The Annotated Manuscript"

Implementation plan for the `/journal/[slug]` redesign from the Claude Design project
(`Journal Entry.html`). Design handoff lives in the design project under
`design_handoff_journal_entry/` (README + implementation files written against this repo).

**Status:** implemented 2026-07-23 (uncommitted). Verified: production build green,
all breakpoints eyeballed against reference, zero console errors.

**Implementation notes (deviations from handoff):**
- `Quote` renders MDX children directly — MDX auto-wraps block JSX children in `<p>`,
  so the handoff's own `<p>` wrapper produced invalid `<p><p>` nesting and a React
  hydration error (#418).
- Added `.je-callout p` / `.je-plate figcaption p` inherit-resets for the same reason
  (auto-wrapped paragraphs picked up `.je-body p` serif styles).
- Dropped the handoff's mobile `body{background-size}` override — our ruled paper is a
  repeating-gradient and journal.css loads site-wide.
- `<Figure>`/hero use `next/image` (nominal 1100×620 + CSS contain, repo pattern).
- Example figure uses `/projects/stock-pred.png` — the handoff's `capstone-2.png`
  doesn't exist in `public/projects/`.

## What it is

Replaces the current two-page spread (`ArticleSpread.tsx`) with a single serif reading
column on the ruled-paper background. Notebook personality moves into the chrome:
mono ledger header, stamp chips, red margin rule, wavy-underlined section headings with
auto-numbered `§NN` kickers, taped "plate" figures with auto plate numbers, marker
highlights, hand pull-quotes. Body copy moves from Kalam (handwriting) to Newsreader
(serif) — the core readability win.

It's also an authoring framework: MDX components (`<Hl>`, `<Callout>`, `<Figure>`,
`<Quote>`) plus native-markdown overrides, so plain `.mdx` gets the full treatment.

## Feasibility verdict

**High.** The handoff was authored against this exact repo and its assumptions verify:

- ✅ `@theme` tokens match exactly (paper `#fdfaf2`, coral `#ff715b`, etc. in `app/globals.css`)
- ✅ `lib/journal.ts` has `getAdjacent` / `getEntryBySlug`; `lib/journal-meta.ts` has the
  described `JournalEntryMeta` shape
- ✅ `components/journal/mdx-components.tsx` exports `mdxComponents` (same name the
  replacement keeps)
- ✅ Caveat / JetBrains Mono already loaded via `next/font`; only Newsreader is new
  (Google font via `next/font`, zero npm deps)
- ✅ `data-journal-root` wrapper stays in `page.tsx` — `body:has([data-journal-root])`
  styling and the ink-bleed transition are untouched by this change
- ⚠️ Minor: README says ruled paper is 33px lines; ours is 28/29px (`globals.css:38`).
  Cosmetic texture only — keep ours, no sync needed.

## Steps

1. **Font** — `app/layout.tsx`: add `Newsreader` (`--font-serif`, normal+italic,
   weights 400/500/600), append variable to the className list.
2. **Loader** — add optional `heroCaption: string | null` to `JournalEntryMeta`
   (`lib/journal-meta.ts`) and `parseEntry` (`lib/journal.ts`).
3. **CSS** — append handoff `journal-entry.css` (`.je-*` rules) to `app/journal.css`;
   delete the `.journal-spread*` / `.journal-binding` blocks (lines ~109–160).
4. **Components** —
   - replace `components/journal/mdx-components.tsx` with handoff version
   - add `components/journal/ArticleEntry.tsx` (server), set/thread `AUTHOR` const
   - add `components/journal/ReadingProgress.tsx` (only client component; see open Q3)
   - delete `components/journal/ArticleSpread.tsx`
5. **Page** — `app/journal/[slug]/page.tsx`: render `<ArticleEntry entry prev next />`.
6. **Content** — current entries are placeholder/seed content, not what will be
   published. Don't retrofit them; instead update **one** entry (e.g. from the handoff's
   `legalrescue-ai.example.mdx`) to exercise every component — `heroCaption`, `<Hl>`,
   `<Callout>`, `<Figure>`, `<Quote>`, fenced code with `title=` — as the rendering
   test bed. Real posts get authored against the framework later.
7. **Verify** — build, then eyeball against `reference/Journal Entry.html` +
   `screenshots/*-je*.png` at desktop / 1000px / 640px breakpoints.

## Decisions (2026-07-23)

1. **`related` entries** — drop from the entry page; prev/next covers navigation and
   the catalog is small (~11 entries). Keep the `related` frontmatter field and
   `getRelated` in the loader untouched so it can be resurfaced later if the catalog grows.
2. **Code block titles** — add `rehype-mdx-code-props` now. Current entries are
   placeholder content, not what will be published, so "no fences today" says nothing
   about real posts (likely technical case studies with code). The dep is tiny and
   makes the authoring framework complete from day one — `title="file.py"` on any
   fence just works.
3. **ReadingProgress** — ship the JS client component as-is. It's a feature (not a
   browser-quirk workaround), ~a dozen lines, and works in every browser; CSS
   scroll-driven animations would silently drop it in Firefox.
4. **Images** — swap the handoff's plain `<img>` (a Claude Design/Vite-preview artifact)
   for `next/image` in `Figure` and the hero plate.

## Risks / watch-outs

- **72px serif title** wrapping on long titles at desktop — check with the longest
  existing title (`a-year-of-arch-arch-is-great-and-awful`).
- **CSS counters** for `§NN` / `plate NNN` depend on DOM order of MDX output — verify
  hero plate participates (or doesn't) in the plate counter as designed (`plate 000`
  is hardcoded for hero per README).
- **Deleting old spread CSS** — grep for `.journal-spread` usage outside ArticleSpread
  before removing (JournalIndex must not reference it).
- **mdx-components replacement** — confirm nothing besides ArticleSpread imports
  `mdxComponents` with expectations about the current (Kalam-styled) output.
