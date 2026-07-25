# Briefing for the writing agent — journal authoring system article

Hand this whole file to whatever's drafting the article. It has two parts:
1. **Ground truth** — corrections to the earlier GPT outline, since that draft
   was written without seeing the actual code.
2. **Authoring toolkit reference** — every markdown/MDX feature actually
   available, with real syntax, for picking what to showcase.

Repo: `anoopchandra-portfolio` (Next.js 15 App Router). The system being
written about lives at `/journal/[slug]` — design name "The Annotated
Manuscript." Full technical plan + decisions: `docs/journal-entry-redesign-plan.md`.

## Part 1 — corrections to the GPT outline

The 7-section shape (why → pipeline → metadata-as-UI → markdown-as-components
→ design system → what broke → what's next) is good and worth keeping. These
specific claims need fixing:

**"Schema validation with a dedicated schema library" — skip this suggestion.**
There's no Zod/Yup here. `lib/journal.ts`'s `parseEntry()` is ~40 lines of
hand-rolled checks (required-field presence, enum membership for `kind` /
`color` / `status`, unique `page` numbers across all entries, `related` slugs
must reference real entries, `heroAlt` required if `hero` is set) that throw
a build-time error via a `fail(file, msg)` helper — so a bad frontmatter field
fails the Next.js build, not a silent runtime issue. This is a deliberate
choice, not a gap: it works, adds zero dependencies, and the error messages
are already good (`content/journal/foo.mdx: "page" must be a positive
integer, got "4a"`). Frame it as "validated by hand, not by a library" if it
comes up — don't suggest adding one.

**"Actually hiding draft articles" — this one is real, keep it.**
`status: draft` is a valid enum value and renders (or doesn't render) the
"★ shipped" stamp — but nothing filters draft entries out of
`getEntries()`/the index/routing. A draft post is fully live at its URL today.
Genuine, verifiable gap — good closing "what I'd improve" item.

**Most of the rest of the "what I'd improve" list is generic filler** —
footnotes/citations, per-article color theming, preview cards for internal
links, a component gallery page. None of these came from an actual need while
building this; they're best-practice padding. Cut to 2-3 honest items:
draft-hiding (above), and maybe syntax highlighting in code blocks (currently
plain `<pre>`, no `Shiki`/`Prism` — a real, small, deferred decision, not
implemented).

**Missing entirely: the two visual bugs from migrating the Lenis scroll
library**, which happened in the same work session and are much better "what
broke" material than the MDX paragraph bug alone — they show a cross-system
interaction bug, not just a markup gotcha. See Part 1a below.

**The pipeline diagram** — don't render this as a literal graphic/asset. A
one-line description plus the frontmatter example does the same job:

```
content/journal/*.mdx → gray-matter (frontmatter/body split) →
parseEntry() validates + derives (read time, display date, page padding) →
Next.js generateStaticParams (one static route per slug) →
<MDXRemote> compiles the body with a custom component map → journal.css
```

### Part 1a — the real bugs to write about (all from this session)

These are the interesting, true, specific incidents — use them, they're the
strongest part of the article:

**1. MDX wraps block JSX children in `<p>` — a hydration bug.**
The handoff's `<Quote>` component did `<p>{children}</p>`. But
`next-mdx-remote` had *already* wrapped the quote's markdown text in its own
`<p>` before passing it to the component. Result: `<p><p>...</p></p>` —
invalid HTML (a `<p>` can't contain a `<p>`), so the browser silently
re-parents it during HTML parsing, producing a DOM shape that doesn't match
what React expected from the server render → React hydration error #418.
Fix: render `children` directly, don't re-wrap. Second-order effect of the
same cause: text inside `<Callout>` and figure captions was silently
inheriting the reading column's serif *body* font instead of the intended
hand-written/mono voice, because the auto-inserted `<p>` matched a generic
`.je-body p` CSS rule. Fixed with explicit inherit-resets on those two
selectors. One root cause, two symptoms (a crash and a silent style bug) —
good narrative beat: "the same gotcha bit us twice before we saw the pattern."

**2. Upgrading Lenis (smooth-scroll library) broke the page-transition scrollbar.**
The site has a hand-built "ink bleed" page transition (`InkTransitionProvider`)
that calls `lenis.stop()` while the transition overlay plays, then
`lenis.start()` once the new route has rendered underneath. The *old*,
hand-rolled Lenis provider never applied any extra CSS during that stopped
state. The *new* Lenis package version ships its own stylesheet with
`.lenis-stopped { overflow: clip }` on `<html>` — which deletes the scrollbar
outright, widening the viewport by its width (~14px) for the transition's
duration. Every centered layout on the page (max-width columns, centered
content) recentered against the now-wider viewport, then snapped back when
the scrollbar reappeared — a visible left-right jitter on every single
transition, invisible until you actually watch a route change closely. Fixed
with a CSS override that keeps `overflow-y: scroll` during the lock (the
scrollbar renders, just doesn't move — Lenis already blocks wheel/touch input
itself while stopped) plus `scrollbar-gutter: stable` as a general guard.
Good detail for the article: a *dependency upgrade*, not a code change,
introduced a visual bug — worth a sentence on why you re-audit vendored CSS
after bumping a library, not just the API surface.

**3. The sidebar INDEX list appeared with no animation after transitioning home.**
The transition overlay previews the destination page while it animates in —
but that preview deliberately excludes anything `position: fixed` (fixed
elements can't be clipped correctly inside the overlay's animated layers).
The left-rail "INDEX" nav is fixed, so it was never part of the preview —
it simply wasn't on screen during the whole transition, then popped into
existence the instant the real route mounted underneath the overlay. Made
worse by an *unrelated* optimization: once a user does one client-side ink
navigation, all future navigations skip the homepage's one-time entrance
animation sequence (a CSS class `ink-no-anim` that's added once and never
removed, so animations that already played don't replay). The INDEX rail's
entrance animation was on that suppressed list too — so it wasn't just
un-animated, it was *specifically told not to animate*, on every visit after
the first. Fix: pulled the rail's animation out of the suppression list and
gave it a compressed delay (`animation-delay: calc(var(--d) - 1.75s)`) so it
replays with the same stagger rhythm as a fresh page load, timed to start as
soon as the transition overlay lifts rather than after. Good detail: two
separate, individually-reasonable optimizations (don't re-render fixed
elements in a preview; don't replay entrance animations you've already
played) combined to produce a bug neither one would cause alone.

## Part 2 — authoring toolkit reference (what to showcase)

This is the actual component/markdown vocabulary available in any
`content/journal/*.mdx` file today. Good candidates for "here's the syntax,
here's the result" side-by-side blocks in the article.

### Frontmatter fields

```yaml
---
title: "Post Title"          # required
kind: case                   # required — "case" | "note"
date: 2026-07-23              # required — ISO date
tag: legal-ai                 # required — single free-text tag
color: coral                  # optional — electric | coral | teal | navy (tints the tag chip on the /journal index only, not on the entry page)
page: 4                       # required — hand-picked, must be unique across all entries (build fails otherwise)
dek: "One-line deck/summary"  # required
sub: "MS capstone · client under NDA"  # optional — small byline subtext
hero: /projects/foo.png       # optional — hero plate image
heroAlt: "..."                # required IF hero is set
heroCaption: "..."            # optional — mono caption under the hero plate
status: published              # optional — "published" | "draft" (defaults published; NOTE: draft is not currently hidden anywhere — see Part 1)
related: [other-slug]          # optional — validated to exist, currently unused on the entry page (dropped in favor of prev/next; kept in the data model)
---
```

Auto-derived, never written by hand: `slug` (= filename), `dateDisplay`
("apr 24, 2026"), `read` (word-count based, ~200wpm), the zero-padded page
number shown as `p.004`, and prev/next navigation (by date order among all
entries).

### Native markdown → designed output

- **Paragraph** → serif body text, 600px reading measure.
- **`## Heading`** → auto-numbered `✎ §01`, `§02`... kicker (CSS counter, not
  manual — reordering sections renumbers itself) + a serif heading with a
  wavy coral underline.
- **`### Sub-heading`** → plain serif sub-head, no kicker.
- **`- list`** → rotated-square coral bullet.
- **`1. list`** → mono coral numeral markers.
- **`` `inline code` ``** → mono chip with a faint border.
- **Fenced code**, with an optional filename via `title=`:
  ````
  ```py title="intake.py"
  ...
  ```
  ````
  → a bordered card with a coral `>_` prompt and either the `title` or the
  fence's language as the label.
- **`> blockquote`** → same styling as `<Quote>` below (native markdown works,
  no need to reach for the component unless you want a `cite`).
- **Links** → electric (`#cc00e6`, a magenta/violet — the site's third accent
  color, not coral), dotted underline; solid + ink on hover.

### Custom components (import-free — registered globally via `mdxComponents`)

- **`<Hl>phrase</Hl>`** — coral marker-pen highlight behind inline text.
- **`<Callout label="note">...</Callout>`** — dashed box, hand-written font,
  small mono `✎ label` tag (`label` defaults to `"note"` if omitted).
- **`<Figure src="/projects/x.png" alt="...">caption</Figure>`** — a "taped"
  photo plate with an auto-incrementing `plate 001`, `plate 002`... tab (a
  custom 3-digit CSS `@counter-style`, to match the hero image's hardcoded
  `plate 000` — the built-in `decimal-leading-zero` keyword only pads to 2
  digits, which was a real mismatch until this was fixed). Renders via
  `next/image`.
- **`<Quote cite="field notes, week 14">...</Quote>`** — hand-written
  pull-quote with a coral left border; `cite` is optional.

### The showcase idea

The article itself is written as a `content/journal/*.mdx` entry, so it can
(and should) exercise this exact vocabulary while describing it — an `<Hl>`
on the key sentence, a `<Callout>` calling out a design decision, a `<Figure>`
of the pipeline or a before/after screenshot, a titled code fence showing a
real snippet from `ArticleEntry.tsx` or `mdx-components.tsx`, and a `<Quote>`
for whatever the one-sentence thesis of the piece ends up being. If any of
these feel awkward to reach for while drafting, that's a legitimate signal
the authoring API itself needs work — worth a callout in the "what's next"
section if it happens.
