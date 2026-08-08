---
name: journal-story-writing
description: Plan, draft, revise, and review portfolio entries in content/journal/*.mdx as first-person chronological stories grounded in verified facts and author-confirmed experience. Use for workplace debugging, personal projects, Linux or hardware experiences, technical notes, and opinion pieces, or when reviewing an entry for narrative structure, voice, sanitization, and purposeful MDX usage.
---

# Journal Story Writing

Treat every entry as a story about lived experience. Technology belongs where it changes an experience, investigation, preference, or decision. Do not organize technical documentation and add first-person language afterward.

Follow the repository's `AGENTS.md` for metadata, voice, privacy, assets, and validation requirements. This skill defines the writing workflow.

## 1. Confirm the material

Read the relevant notes, code, configurations, screenshots, conversation, existing entry, and nearby journal examples. Separate the material into:

- Verified facts
- Author-confirmed memories and experiences
- Personal opinions and preferences
- Private facts that require sanitization
- Inferences and unknowns

Establish public boundaries before drafting. For personal entries, distinguish remembered experience from externally verifiable fact and present preferences as the author's view. Never convert a plausible inference into a fact.

When chronology, causality, ownership, motivation, or emotion is unclear, ask the author. If the author corrects an assumption:

1. Stop editing.
2. Restate the corrected sequence.
3. Ask the author to confirm it.
4. Resume only after confirmation.

Do not fill the remaining gaps with another plausible assumption.

## 2. Build the sequence

Map the story before writing:

```text
event or observation
what the author did
what the author knew at that moment
what remained uncertain
what changed next
```

When the source does not establish a complete sequence, summarize your understanding to the author before drafting.

Choose the natural shape for the entry:

- Debugging: report, suspects, evidence, failed attempts, theory, test, result.
- Personal project: need or curiosity, first attempt, friction, decisions, current state.
- Linux or hardware: original setup, irritation or failure, experiments, tradeoffs, lasting configuration.
- Opinion: experiences and observations, changing view, current position.
- Implementation note: need, first approach, limitation, changed implementation, result.

Do not force a debugging mystery onto another kind of experience.

Open with a concrete situation, action, or observed result. Preserve mystery where appropriate. Do not introduce the final diagnosis, later evidence, or a defense of the author before the sequence reaches it.

## 3. Draft the story

Preserve what the author knew at each point. Keep failed attempts, contradictory evidence, uncertainty, long waits, ignored clues, and accidental discoveries when they shaped the experience. Do not make the process sound cleaner or more informed in hindsight.

Every section must advance the same story through an action, observation, decision, failed attempt, theory, test, changing preference, or result. If a section explains a subsystem but nothing happens or changes, remove it or attach the explanation to the event that made it relevant.

Introduce technical context at the moment it matters. Explain a protocol when the author traces it, a setting when changing it affects daily use, a hardware constraint when it changes an experiment, or an alternative when comparing it shapes an opinion. Avoid detached architecture tours, feature inventories, generic opinion lists, and `How it works` sections.

For workplace stories, treat user reports as valid descriptions of what the interface showed. Include coworkers and ownership boundaries without blame, defensiveness, or a lone-hero framing. For personal and opinion entries, explain the experiences behind a preference without presenting taste as a universal rule or inventing an opponent.

Include human context when it explains an action, constraint, assumption, persistence, preference, or reaction. Do not invent emotions or turn responsibilities into a resume list.

## 4. Review the narrative

For every section, ask:

1. What happens or develops here?
2. What does the author know, feel, or prefer before it?
3. What changes by the end?
4. Why does the next section follow?
5. Would removing this section leave the story intact?

Rewrite or remove sections that do not advance the sequence. Scan the complete entry for facts revealed before their discovery, retrospective certainty, repeated explanations, padding, condescension, unverified causality, and unnecessary private detail.

End when the experience resolves: the fix is verified, the result is measured, the project reaches its current state, the setup settles into use, the present opinion becomes clear, or the remaining boundary is established. Do not automatically add a lesson, recap, or polished conclusion.

## 5. Use MDX and validate

Use MDX components only when they improve the story:

- `<Quote>` gives weight to a real artifact or statement. Label paraphrases.
- `<Side>` holds short optional context that benefits from immediate visibility. The story must remain complete when it is skipped.
- Footnotes defer optional definitions and background.
- `<Callout>` is for a genuine warning, limitation, or practical note.
- `<Figure>` should reveal something prose cannot communicate as clearly.
- `<Hl>` may mark a rare pivotal phrase.

Do not add a component merely because it exists.

Before finishing, check the entry against the confirmed sequence and public boundaries, then follow the journal validation and commit guidance in `AGENTS.md`. Keep private source material untracked and separate article commits from unrelated code or UI changes.
