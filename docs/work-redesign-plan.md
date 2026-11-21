# Work section redesign: implementation plan

**Status:** implemented on `feat/work-platform-redesign` (2026-11-21), not yet
reviewed in a browser or committed. Typecheck, lint and build pass.

**Design source:** "Work section redesign" page in the Portfolio design project
(claude.ai artifact `XdPdVC9aAW21WxQD2gRtXr`, file `project/Work Section Redesign.html`).
**Diagram source:** `work-diagrams.excalidraw` (four diagrams: advisor desktop,
advisor phone, Practice Loans, mobile auth). Same drawings, labels and colours
as the design's built-in specs.

Supersedes the earlier brief in `docs/ai-advisor-flagship-brief.md`; that was
the input to this design.

## What the design changes

1. **Flagship advisor card** (WORK[0]) gets its own layout instead of `WorkCard`:
   - full-width diagram band on top with a mono caption above and a footnote
     line below
   - body: 170px rail (58px coral numeral, three-line kind, status) + content
   - 31px title, 19px lead, 15.5px role line in `ink-soft`
   - bullets, impact and tags move behind a `<details>` "details · how it
     was built" toggle, closed by default
   - "read the story →" slot, hidden until the case study exists
2. **Cards 02 and 03** become compact, full-width cards: 320px sketch panel on
   the left, numeral + kind + status in one row, 22px title, 16.5px lead, and
   bullets and tags behind "details". Card 03 gains an "↳ also: built the AI
   advisor's chat in this app, see 01" cross-reference.
3. **Status** becomes a coloured dot plus a word, with no bordered badge and no
   rotation: coral = closed beta, teal = in production, faint = user testing.
4. **Lab cards** lose the coloured "live" bar and the pulsing dot. They get a
   4px accent top edge, the id in a text-safe accent colour, "in your
   browser" instead of "live", and a small sketch replacing the striped
   placeholder. Header meta becomes "3 experiments · run in your browser".
5. **Phone (≤720px):** the advisor diagram switches to the vertical version,
   02/03 drop their sketches, and details stay closed.
6. **New copy** throughout (see "Copy changes" below).

The design is silent on the role block, "across the platform", side projects
and "earlier". Those stay as they are.

## Implementation

### Diagrams: PNG exports from Excalidraw

- Fix the Excalidraw layout problems first (see "Diagram fixes" below).
- Export the four diagrams to `public/work/` as PNG at 2x (`advisor-desk.png`,
  `advisor-phone.png`, `loans.png`, `auth.png`), with the `#fdfaf2` background
  baked in like the journal diagrams, and without the frame title text
  ("AI advisor: desktop" etc.). No manual compression: `next/image` serves
  AVIF/WebP. No JPEG XL (browser support is incomplete).
- Render with `next/image` and `lib/image-dims.ts`-style real dimensions, with
  the design's `aria-label` text as `alt`.
- Advisor desktop/phone swap uses the existing `wide-only` / `narrow-only`
  classes, the same mechanism `Copy` already uses, so Work stays a Server
  Component.
- This keeps rough.js out of the bundle. The mock draws at runtime with
  rough.js; shipping static SVGs gives the same picture with no client JS.

### Data (`lib/work-data.ts`)

- `System` gains: `lead`, `shortLead?`, `role?`, `shortRole?`, `diagram`
  (desk/phone or single sketch path + alt), `xref?`, and a status literal
  union (`"closed beta" | "in production" | "user testing"`) that drives the
  dot colour.
- Existing `d` / `bullets` / `impact` / `tags` and their `short*` variants are
  rewritten to the design's copy.

### Components (`components/sections/Work.tsx`)

- New `FlagshipCard` for WORK[0]; new `CompactCard` replacing `WorkCard` for
  the rest. `WorkCard` and its CSS (`.work-card`, `.work-rail`,
  `.work-status`) are removed.
- New `StatusDot` and `Details` (native `<details>`/`<summary>`, so no client
  JS, keyboard and screen-reader support for free).
- Accent text colours: add `--color-coral-ink` `#b8402c`, `--color-teal-ink`
  `#137a6d`, `--color-electric-ink` `#a800be` tokens to `app/globals.css`,
  as the design defines them.

### Lab (`components/sections/Lab.tsx`, `lib/lab-meta.ts`)

- Replace the bar with the quiet header; drop `.pulse-dot` usage (keep the
  keyframe only if something else uses it).
- Three small inline SVG sketches from the design (cat doodle, needle gauge,
  clusters), `aria-hidden`, with the `#wob` displacement filter.
- Descriptions updated to the design's copy.

## Copy changes that change facts

These differ from the current site and should be confirmed as accurate before
going public:

- Status: "internal user testing" → **"closed beta"**.
- Role: now in the lead and role line ("I built its backend and both chat
  clients, web and mobile"; "now the only full-time engineer on it").
- The parallel orchestrator moves from "replaced Foundry's agent, ~halved time
  to first token" to **a measurement prototype whose findings sped up the
  Snowflake MCP server**.
- New: product cards from the bank's recommendation engine over MCP, and the
  React Native chat in the mobile app.
- Removed: the 50-topic classification eval harness bullet.
- **Practice Loans (correction from Anoop):** 9 to 12 separate PDF forms were
  digitized and **no PDF forms remain**. The design's lead ("…for about nine
  more") and the diagram's "×9" undersell this. Proposed lead:
  "Replaced every PDF loan application with guided online forms. I built the
  first ones and set the form patterns a larger team used for the rest."
  Diagram multiplier and any count in the copy wait on the exact number.

## Decisions (2026-11-21)

- Scope: Work and Lab together, one pass.
- Role block: keep it above "selected work"; the mock just left it out.
- Lab card tilt: dropped, despite the design (blurs 15.5px body copy at 1x).
- Diagrams: PNG, compressed by `next/image`. Not animated; they stay static.
- Lab sketches: dropped on every width (Anoop, 2026-11-21). They only
  illustrated what the card text says, and the doodle's "cat? 92%" named a
  class the 50-class model doesn't have. Lab cards use the phone design's
  layout everywhere: accent edge, id, "in your browser", title, sentence, chip.
- Lab previews: real screenshots of each experiment mid-run in
  `public/lab/` (640×300 crops of the desktop pages), shown on every width.
  Not zoomable: the live demo is one click away and the whole card stays one
  link. All Work diagrams open in the lightbox (`ZoomableImage`). The hero
  portrait doesn't.
- Motion: only the "details" toggles animate (CSS `::details-content` +
  `interpolate-size`, instant open where unsupported, off under reduced
  motion). Durations still need a value from the designer or Anoop.
- The design is now one "super app" platform card with three parts and seven
  diagrams (platform map desk/phone, advisor desk/phone, loans forms, loans
  multi-person, sign-in). Work also renders inside the ink-transition overlay,
  so diagram sizes are hard-coded in `lib/work-data.ts` like `PROJECTS` images.

## Diagram fixes (seen in Excalidraw)

Excalidraw has no shrink-to-fit, which the mock's rough.js renderer did
(`fit`), so several labels are larger than their boxes:

- Desktop: "product recs" overflows its box; "how do we compare?" overflows
  its pill; "a question" touches both sides of its box.
- Phone: the four fan-out arrows all start from nearly the same spot on the
  assistant's edge and cross; "product recs · MCP" is tight.
- Practice Loans: only the bottom flow box is labelled.
- Mobile auth: "sign in" wraps onto two lines; arrows stop short of the boxes.

## Copy confirmed by Anoop (2026-11-21)

- Part 02 "I worked on part of that flow" (multi-person financial statement)
  is accurate as written.
- Part 03 stays "user testing" for now; the unified login goes to production
  around 2026-11-28. Flip it to "in production" then.
- Part 01 stays "closed beta" until launch on 2026-12-10. Flip it to
  "in production" then.
- "product leads": ships as the design wrote it. Revisit if Panacea objects.
- MCP speedup (Anoop): answers used to take ~60s; the Snowflake MCP server
  took 20–30s per call and now takes ~9s in most cases (sometimes 15–20s).
  He also replaced the plain loader with per-tool progress notes and
  animations. Proposed copy, pending his OK:
  - Desktop bullet 3: "Built a parallel multi-turn orchestrator to measure
    where the managed agent spent its time. It showed the Snowflake MCP server
    taking 20 to 30 seconds per call; the fixes it led to brought that down to
    about 9 seconds in most cases."
  - New desktop bullet (after bullet 1), the waiting experience Anoop built:
    "Designed the waiting experience so a slow answer never looks stuck: each
    tool call gets an animated status line ("querying practice benchmarks",
    "searching the web"), an activity panel narrates what the model is doing
    as it works, and sources show up live as citations, with links for
    documents and web results and a separate block for benchmark data."
  - New phone bullet: "Animated tool status, a live activity panel, and
    citations that appear as the answer streams: documents, web results, and
    benchmark data."
  - Appended to that bullet: "Each finished answer has a sources button that
    opens a side panel, plus copy and thumbs-up/down feedback." Phone: append
    "…plus a sources panel, copy, and feedback on every answer."
  - Facts behind it: wavy per-tool animation with labels; an activity area
    where the model narrates its steps; live citations as circle chips next
    to the status text for file-search docs and web search, plus a block for
    warehouse data; under each answer an action row with copy, thumbs up/down,
    and a sources button (stacked circles) that opens a side panel. Unknown:
    whether feedback is reviewed or used, so the copy doesn't claim it.
  - Phone bullet 3: "A parallel orchestrator prototype found where the time
    went; the Snowflake MCP server dropped from 20–30s to about 9s."
  - Left out: the 60s total (no current total to compare against) and the
    15–20s outliers.

## Design revision 2026-11-21 (13:34)

- The designer folded narration, citation chips, copy/feedback and the sources
  panel into advisor bullet 1 and the band footnote. That replaces the
  separate "waiting experience" bullet proposed above: ship the design's
  bullet 1, don't add a fourth bullet.
- The design's bullet 3 still has no numbers. Ship the numbered speedup
  bullet from "Copy confirmed" above (20–30s → ~9s), desktop and phone.
- Diagrams checked in Excalidraw: thumbs now drawn as thumbs, sources panel
  has a gap from the chat border, "MCP · made faster" on both. One problem left:
  "unified sign-in" on the platform maps is teal text on a teal hachure fill
  and is hard to read.

## Open items for discussion

1. **Practice Loans form count:** exact number of PDF forms digitized (9–12)?
   Drives the diagram's "×N" and any count in the copy.
2. **From the design's "still open" notes:**
   - Is there a number for the MCP speedup (X → Y seconds)?
   - Is "product leads" OK publicly, or use "points members to the right
     product"?
