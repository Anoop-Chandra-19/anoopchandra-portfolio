# AI advisor flagship card: design brief

Brief for the design tool. The AI advisor assistant ships in about 2 to 3 weeks
(early December 2026) and is the biggest thing on the portfolio. Today it uses
the same `WorkCard` as the other two Panacea systems, while the side projects
get large image slabs, so a hobby project currently looks more important than
the flagship. Goal: make the advisor read as the headline of §02 Work without
cutting its substance.

## What to design

1. **Flagship card, desktop** (wide layout, above the 900px breakpoint).
2. **Flagship card, phone** (720px and below; the phone design is its own pass).
3. **Visual for the card.** No product screenshots (NDA). Proposed: a
   hand-drawn architecture diagram showing one question fanning out in
   parallel to RAG, web search, and Snowflake MCP, then streaming back.
   Diagrams on the site bake `#fdfaf2` paper.
4. **Status badge, two states:** before launch ("launching soon" or a date)
   and after launch ("in production"). Swap on launch day only.
5. **How cards 02 and 03 sit underneath it.** They can stay as they are or
   get slightly more compact. Your call.
6. Optional: a "read the story" link slot for a future journal case study.

## Constraints from the current site

- Notebook/editorial look: paper `#fdfaf2` / `#f5f0e1`, ink `#1a1a1a`,
  `sketch-box` ink borders, mono kicker labels, handwritten numerals.
- Accents: electric `#cc00e6`, coral `#ff715b` (the advisor's current
  accent), teal `#1ea896`, navy `#25283d`.
- No rotation/tilt on cards that carry body copy. It blurs 14.5px text at 1x.
- Existing pattern worth reusing: `ProjectSlab`, the two-column
  image + content slab used for side projects.

## Content (current copy, public-safe)

- **Title:** AI advisor assistant
- **Kind:** AI / ML · full-stack
- **Status:** internal user testing → launching soon → in production
- **Description:** Streaming LLM assistant embedded in the platform, spanning
  a Python Azure Functions gateway over Azure AI Foundry, NestJS
  orchestration, topic classification, and a React chat UI. *(role sentence
  below replaces the old "four-engineer team" line)*
- **Bullets:**
  - Built a custom multi-turn orchestrator to replace Foundry's sequential
    managed agent. It fans tool calls out in parallel across RAG, web search,
    and Snowflake MCP over credit-memo, internal, and partner data, roughly
    halving time to first token.
  - Built an evaluation harness over hand-labeled conversations to pick a
    classification strategy for a 50-topic taxonomy, then shipped it as an
    idempotent NestJS service.
  - Investigated streaming failures across the frontend, API proxy, and
    gateway, then added OpenTelemetry instrumentation in Azure Application
    Insights for per-tool distributed tracing.
- **Impact:** Puts the bank's credit-memo, internal, and partner data behind a
  question instead of a report request; the taxonomy turns those
  conversations into demand data.
- **Tags:** Python, Azure AI Foundry, Responses API, RAG / MCP, NestJS,
  React, OpenTelemetry

### Role sentence (draft, needs Anoop's OK)

> It started with a four-engineer team. I became the only full-time engineer
> on it, redesigned the chat UI, and built most of its features, working with
> a full-time data engineer who owned the Snowflake side.

Add a bullet for the UI redesign if it deserves its own line. What changed?

### Possible headline stats (only if accurate)

- ~2× faster time to first token (from "roughly halving")
- 50-topic taxonomy
- 3 data sources queried in parallel

## Open questions

- Is Panacea fine with the launch being mentioned publicly, and with a date?
- What did the UI redesign change? It's currently missing from the copy.
