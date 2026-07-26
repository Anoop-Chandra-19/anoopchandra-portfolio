# v3 redesign — typography

Source: Claude Design project `019dd9ee-087b-71ba-b30e-9dd64b1b5eae`
(`Type System v3.html`, `type-v3.css`, `type-v3-mobile.css`, `Portfolio Hi-Fi v3.html`,
`Portfolio Mobile Prototype.html`).

v3 is **not** a layout redesign. Every section, component and interaction stays where
it is. What changes is the type: handwriting stops being a text face and becomes an
accent, and the hierarchy moves from *typeface-swapping* to *weight + size*.

---

## The rule

> **Three families, three jobs.**

| role | family | does |
| --- | --- | --- |
| **reading** | Source Serif 4 (variable, `opsz 8–60`, italic) | everything you read: all headings, body, deks, lists, article text. 400 at reading size, 600 for headings. |
| **chrome** | JetBrains Mono | anything a machine produced or the interface says about itself: nav, chips, labels, timestamps, code, captions, lab output. 8.5–14px, tracking +0.5 → +3px. |
| **aside** | Caveat 600 | decoration and marginalia only: margin notes, § markers, pull quotes, the lab verdict. Never below 20px. Never carries information you must read twice. |

Seven supporting rules, lifted from §07 of the spec:

1. **Regular is the default.** Anything at reading size is 400. 600 is reserved for
   headings, `<strong>`, and deliberate lead-ins. A bare 24px dek is still 400.
2. **Let optical sizing do its job.** `font-optical-sizing: auto` maps `opsz` from
   `font-size`. Never pin it with `font-variation-settings` — that freezes `wght` and
   breaks every weight rule that inherits in.
3. **Italic means dek.** Italic marks a standfirst, never mid-paragraph emphasis.
   Emphasis inside prose is 600, or a marker highlight.
4. **Mono owns the chrome.** Serif keeps prose. Nothing gets both.
5. **Tracking follows size.** Serif tightens as it grows (−0.008em @ 21px →
   −0.022em @ 72px). Mono opens as it shrinks (+0.5px @ 13px → +3px @ 10px).
6. **Measure over width.** Reading columns cap in `ch`: 66ch site, 64ch journal,
   42ch for mono output.
7. **Journal runs one step larger.** Site scans at 18/1.65; journal reads at 20/1.75.
   Deliberate — don't unify them. Mobile keeps the same gap at 17 vs 16.
8. **Mobile re-tunes, never rescales.** Headings step *down* on the phone and body
   steps *up*. The old mobile sizes were fitted to handwriting, which reads ~25%
   smaller than serif at the same px.

## What we are *not* porting

The design ships `type-v3.css` as an **override layer** — `html[data-type="clean"]`
scoping, `!important` throughout, and attribute selectors matching inline `font-size`
values in the prototype markup (`h2[style*="font-size: 64px"]`). That exists so the
handwritten v2 build stays one toggle away in the prototype.

Our site has no inline font sizes and no need for the v2 fallback, so the v3 values
get folded **directly into the base rules**. Decided: ship `clean` + `serif` only —
no `data-type`, no `data-font`, no localStorage, no no-FOUC script, no IBM Plex.

---

## Phase 0 — fonts and tokens

The load-bearing change. Everything else is numbers.

**`app/layout.tsx`**

```
- Caveat, Kalam, JetBrains_Mono, Newsreader
+ Source_Serif_4, JetBrains_Mono, Caveat
```

Source Serif 4 as a variable font with the `opsz` axis and italic; `next/font/google`
handles the axis descriptor. Kalam and Newsreader are dropped outright — Source Serif 4
takes both jobs (the site's text face *and* the journal's serif).

**Variable roles.** Today `--font-hand` (Caveat) is misused as the display face:
`h1–h4` and the `.hand` utility both point at it, at ~50 call sites. v3 splits that
role in two, mirroring the design's own strategy:

| variable | v2 | v3 |
| --- | --- | --- |
| `--font-display` | *(new)* | Source Serif 4 |
| `--font-body` | Kalam | Source Serif 4 |
| `--font-serif` | Newsreader | *retired* → `--font-body` |
| `--font-mono` | JetBrains Mono | unchanged |
| `--font-hand` | Caveat | *retired* → split below |
| `--font-accent` | *(new)* | Caveat |

`.hand` gets repointed to `--font-display`, so all ~50 existing usages become serif in
one edit — correct for the large majority, since they were display type. Then a
`.accent` utility (Caveat) gets applied back to the genuine marginalia, audited one by
one:

- `.note` — `Annotation` (hero portrait notes, section margin notes)
- `.je-secn` — the `✎ §02` markers
- `.je-quote p` — pull quotes
- `.lx-verdict` — the sentiment verdict
- the contact postcard's signature line
- `.je-navlbl`

Everything else that currently says `.hand` becomes reading type.

**Risk:** this is the phase that can silently regress a lot. Ends with a grep audit of
every `hand` occurrence in `components/` and a full-page screenshot diff before
Phase 1 starts.

---

## Phase 1 — desktop base scale (`app/globals.css`)

```
body        18px / 1.65 / 0        (was 17 / 1.55)
h1          72   / 1.02 / −0.022em / 600    (was 96 / 0.98 / +0.5px / 700)
h2          42   / 1.08 / −0.016em / 600    (was 56)
h3          28   / 1.18 / −0.012em / 600    (was 36)
h4          21   / 1.25 / −0.008em / 600    (was 26)
```

Plus:

- `font-optical-sizing: auto` on body and headings.
- `text-wrap: pretty` on `p`, `balance` on headings.
- `.section > p` capped at `66ch`.
- Weight reset: `p, li, blockquote` → 400; `strong, b` → 600. The old build ran 700
  nearly everywhere, so hierarchy had nowhere to go.
- **Marker highlight** re-geometried: the band moves from 55%→95% of the line box to
  84%→96%, and padding 4px → 1px. At Kalam's small x-height a mid-box band read as a
  highlight; under serif it reads as a strikethrough. It becomes a baseline underline.
- **Noise reduction:** `.sketch-box.tilt-l` −0.6deg → −0.25deg, `.tilt-r` 0.5 → 0.2,
  and the double-outline `::after` opacity 0.35 → 0.18. Same signals, quieter — the
  tilts and outlines were tuned to sit beside handwriting.
- `.section-header` bottom margin 28 → 24px.
- `.note` 22px → 21px (Caveat floor is 20).

## Phase 2 — desktop chrome → mono

Mono takes the interface. All of these are currently serif/hand:

| target | v3 |
| --- | --- |
| `.side-nav-desktop` labels | mono 11.5px / 400 / +0.06em (was hand 17px) |
| `.chip`, `.je-chip` | mono 12px / 400 / +0.02em |
| `#sec-stack ul li` | mono 13px / −0.01em (tooling identifiers, not a bibliography) |
| `#sec-stack h4` | stays serif |
| `.notes-*` ledger meta | mono, already close |

## Phase 3 — desktop section retune

Per-section sizes, from §02 of the spec. Mostly Tailwind arbitrary values in the
section components (~80 `text-[…]` utilities inventoried, no inline `fontSize`).

- **Hero** — `h1` → `clamp(44px, 5.8vw, 72px)` (was `clamp(56px, 8vw, 96px)`); the
  tagline becomes the dek: 19px / 1.65 / **400 italic**, not 26px hand. Lede 18px.
  This is the "size is not a licence to go bold" rule's most visible application.
- **Work** — `h3` buckets 30 / 25 / 24 / 22px by header length; card `p` 18px.
- **Now / Lab §03 / Stack / Notes / Contact** — h3/h4 into the 28/21 buckets, body
  to 18px, meta lines to mono.
- **Notes index** — titles tighten so the dotted leader reads as a list; row
  `align-items: center`.

## Phase 4 — lab pages (`app/lab.css`)

The lab is the biggest numeric shift, because its sizes were fitted to Kalam and its
output panels were set in a reading face. Everything the model emits sits under a `$`
prompt, so it goes mono.

| target | v2 | v3 |
| --- | --- | --- |
| `.lx-title` | 44 / 1.0 | unchanged (600) |
| `.lx-blurb` | 21 | serif 19 / 1.5 / 400 |
| `.lx-empty` | 20 / 1.5 | **mono** 14 / 1.65, 42ch, ink-soft |
| `.lx-canvas-hint` | 22 | **mono** 13.5 / 1.6 |
| `.lx-kfield-hint` | 20 | **mono** 13 / 1.65 |
| `.lx-kstat` | 22 | **mono** 14 / 1.6 |
| `.lx-cnote` | 19 | **mono** 12.5–13 |
| `.lx-hint2` | 11 | **mono** 11.5 / 1.5 |
| `.lx-scroll-row` | 12 | **mono** |
| `.lx-g-name` | 23 / 1.0 | **serif** 21 / 1.1 / 400 — the predicted label is content |
| `.lx-g-rank` / `.lx-g-pct` | 13 / 14 | mono, unchanged |
| `.lx-verdict` | hand 34 / 1.0 | Caveat 34 / 1.0 / −0.015em — kept |
| `.lx-verdict-pct` | 16 | serif 16 |
| `.lx-aside-body` | 19 / 1.45 | serif 17.5 / 1.55 |
| `.lx-gauge-lab` | mono 9 / +1px | unchanged (the 9px floor, uppercase mono only) |

`≤1000px`: title drops to 34px.

## Phase 5 — journal (`app/journal.css`)

Good news: the journal is **already on the v3 scale**. `.je-title` 72/1.0/−1.4px/600,
`.je-dek` 24/1.42 italic, `.je-body p` 20/1.75, `.je-h2 h2` 33/1.12, `.je-h3` 24/1.2,
`.je-ul li` 19/1.6, `.je-quote p` Caveat 36/1.22, `.je-secn` Caveat 20 — all match the
spec exactly. It just needs `--font-serif` to become Source Serif 4, which Phase 0 does.

Remaining deltas:

- `.je-callout` — currently Caveat 23px. v3 makes it tinted **serif at body size**
  with a mono label. A callout carries information you must read; Caveat is never
  load-bearing.
- Measures move from `600px` to `64ch`.
- `.je-navlbl` — keeps Caveat, drops to 20–22px.

## Phase 5b — journal accent tokens *(added mid-flight)*

v3 ships a colour decision the type plan missed. `journal-entry.css` and
`Type System v3.html` both define:

```
--accent      = coral       → graphics: rules, borders, tints, bullets
--accent-ink  = 63% → ink   → all accent TEXT under ~14px
```

Pure coral is **2.59:1** on cream (measured, not assumed) — fine for a 3px
progress bar, illegible for 9–11px mono. Small accent text moved to
`--accent-ink`: **5.28:1**. Also fixed `.je-hl` (58→94% band → the design's
76→96%; the journal runs at 20px and needs a thinner band than the site) and
rebuilt `.je-callout` as the design's left-bar card at 19px.

One departure: the handoff sets `.je-callout .lbl` to pure `--cal` — coral at
9.5px, the exact case its own `--accent-ink` rule exists to prevent. Applied the
63% mix instead.

## Phase 5c — one notebook, one accent *(added mid-flight)*

From the journal handoff's "Colour" section: **tags are a taxonomy, not a
palette.** Colour-coding every tag made three entries side by side read as three
different sites.

- `tagColor()` and the `color:` frontmatter field are **retired** — replaced by
  `tabColors(kind)`. Tabs are ink (`paper-2` fill, 40% ink border, `ink-soft`
  text); only **case studies** take coral, at 58% toward ink.
- Journal wordmark + `EST. 2024` badge → **coral**, not electric. "The index
  shouldn't be the one place that doesn't speak its own palette."
- electric `#cc00e6` is now **body links only**. A hue is the wordmark or the
  link, never both.
- `<Callout>` takes `variant="note|warning|tip"`. `note` is **deliberately
  unlabelled** — a label on every callout tells the reader nothing. warning
  (ochre `oklch(.78 .155 85)`) and tip (`oklch(.5 .04 205)`) sit deliberately
  *off* the accent so neither reads as "this entry's colour".

Applies to the homepage §05 ledger too — same `tabColors`, one code path.

## Phase 8 — journal entry structure *(new, runs before Phase 6)*

`design_handoff_journal_entry/` — "The Annotated Manuscript". Roughly 70% is
already built (masthead, ledger, chips, plates, serif column, margin rule,
callout, quote, prev/next). Missing the parts that define the layout:

| feature | classes | component |
| --- | --- | --- |
| § rail — sticky section tabs, mono `§NN` over Caveat titles | `.je-secnav` | `SectionRail.tsx` |
| live right margin — `<Side>` commentary, Caveat, accent tick | `.je-side` | — |
| margin footnotes — `[^1]` lifted out of the column | `.je-fnref`, `.je-side.is-fn` | — |
| code block — line numbers, gutter rule, lang pill, copy, syntax tokens, caption | `.je-code .bar/.ln/.cap`, `--tk-*` | `CodeBlock.tsx` |
| "also in this notebook" | `.je-also` | — |
| three-band layout `[rail 132][col 640][margin 330]` | `--rail/--colgap/--col/--side-w/--side-gap` | — |

Plus the loader change: page numbers **derived, not authored** — `entry.no`
(chronological №) and `entry.page` (leaf) are different numbers, don't collapse
them. And `heroCaption` in frontmatter.

The handoff ships `implementation/` files written against this repo's
conventions, so this is adoption, not design work.

## Phase 6 — mobile re-tune

Source: `type-v3-mobile.css`. The prototype targets `.mscreen .m-*` / `.mv-*` / `.mx-*`;
our mobile build is the *same markup as desktop* under media queries, so every value has
to be re-anchored onto local class names. Straightforward but it's the bulk of the work.

**Site (`≤720px`)** — headings step down, body steps up:

```
body/base    16px / 1.6      (was 15)
h1           42   / 1.03 / −0.022em    (was clamp(42,13.5vw,58) / 0.94)
h2           28   / 1.10 / −0.014em    (was clamp(26,7.6vw,34))
h3           20   / 1.20 / −0.012em
h4           17   / 1.25 / −0.008em
tagline/dek  21 → the hero dek at 17 / 1.55 italic
```

- Chrome labels: header-top mono 11/+1.5px, rules 10/+2.5px, meta 10.5/+0.5px,
  stack list mono 12.5, chips mono 11.5.
- **Nav overlay** — `.m-nav-ov-label` goes Caveat 30px → **mono 19px / 500 / −0.02em**.
  The overlay is chrome, so it leaves the serif behind entirely. Biggest single visual
  change on mobile.
- Notes index titles 18 / 1.25 / 600.
- Caveat survives only on: the hero portrait note, the aside notes, the contact
  address lines, and the journal side note — all at 20px.
- `.marker-highlight` gets the same 84%→96% band as desktop.

**Journal mobile** — art title 34/1.04, dek 18/1.42 italic, body 17/1.7, h2 21/1.15,
callout serif 17/1.6 + mono label, quote Caveat 28/1.22, code mono 12/1.7, footnote
sheet serif 15/1.5, side note Caveat 20/1.36.

**Lab mobile** — exp title 34/1.04, blurb 17/1.5, output panels all mono
(empty 13.5, canvas-hint 13, kfield-hint 12.5, cnote 12.5, hint2 11.5),
`.lx-g-name` serif 18/1.15, verdict Caveat 32/1.0.

`≤360px` (SE-class) block gets re-checked against the new h1 — 42px may not need the
40px override any more.

## Phase 7 — verification

- `npm run lint` + `npm run build` clean.
- Screenshot pass at **1440**, **1100**, **820**, **393**, **331** across `/`,
  `/journal`, `/journal/[slug]`, `/lab/[slug]`.
- Check the ink-bleed transition still lands — it snapshots live DOM, so a type change
  that alters section heights changes what it captures.
- Confirm no `--font-hand` / `--font-serif` / Kalam / Newsreader references survive.
- Confirm Caveat appears *only* at the audited accent sites, and never below 20px.

---

## Sequencing

Phase 0 must land first and alone — it's the one with regression risk. Phases 1–3
(desktop) then 4–5 (lab, journal) are independent of each other. Phase 6 depends on
1–5 **and 8** being settled, since mobile is a re-tune of decisions made there, not
a scale of them — and the § rail and margin notes have their own responsive
behaviour. Phase 7 runs last.

Running order: `0 → 1 → 2 → 3 → 4 → 5 → 5b → 5c → 8 → 6 → 7`.

Suggested commits: one per phase, so any single step is revertable.

## Notes for later

- **Desktop notes titles are 17px, mobile spec says 18px** — the phone is larger
  than the desktop. That inversion is in the handoff itself (desktop takes the
  generic 22→17 bucket; mobile specifies `.m-note-title` directly). Worth looking
  at side by side once Phase 6 lands.
- **Tailwind cascade**: element defaults live in `@layer base`, role helpers
  (`.mono`, `.hand`, `.accent`) in `@layer components`. Anything unlayered silently
  beats every `text-…` class in the markup. Keep new element rules — including the
  ones inside media queries — inside `@layer base`.
