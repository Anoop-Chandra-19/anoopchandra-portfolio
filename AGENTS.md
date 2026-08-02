# AGENTS.md — Development Guide

Guidance for coding agents working on this portfolio. Keep changes focused, preserve the established notebook/editorial visual language, and verify assumptions against the code before editing.

## Project Snapshot

- **Framework:** Next.js 16.2.12, App Router
- **UI:** React 19.2.8
- **Language:** TypeScript 6.0.3 with strict checking
- **Styling:** Tailwind CSS 4.1.11 plus global CSS
- **Animation:** Framer Motion, GSAP, and Lenis
- **Content:** Local MDX journal entries rendered with `next-mdx-remote`
- **ML:** TensorFlow.js models loaded and run in the browser
- **Package manager:** npm; keep `package-lock.json` in sync
- **Node.js:** 20.9.0 or newer is required by Next.js 16

Treat `package.json` and `tsconfig.json` as the source of truth if a version or compiler detail in this guide becomes stale.

## Commands

```bash
npm ci                 # Reproducible dependency install
npm run dev            # Local development server
npm run typecheck      # TypeScript compiler check
npm run lint           # ESLint across the repository
npm run build          # Production Next.js build
npm start              # Serve a completed production build
```

There is currently no automated test suite. For code changes, run `npm run typecheck` and `npm run lint`; run `npm run build` when routing, server/client boundaries, configuration, content loading, or production behavior may be affected.

Do not run a persistent development server unless the task requires interactive browser testing. Never edit generated output in `.next/`, `next-env.d.ts`, or `tsconfig.tsbuildinfo`.

## Repository Map

```text
app/                       App Router pages, metadata, sitemap, and global CSS
  journal/                 Journal index and statically generated article routes
  lab/                     Interactive lab index and individual lab routes
components/
  journal/                 MDX article and journal-index UI
  lab/                     Interactive ML and algorithm demos
  nav/                     Desktop and mobile navigation
  sections/                Home-page sections
  transition/              Ink transition system and provider
  ui/                      Shared UI primitives
content/journal/            Journal entries in MDX
hooks/                      Shared client hooks
lib/
  journal.ts               Server-only journal loading and validation
  journal-meta.ts          Client-safe journal types and display metadata
  lab-meta.ts              Lab metadata and accent types
  lab-models.ts            Lazy TensorFlow.js loading and model cache
public/
  journal/<slug>/          Images for one journal entry, folder named for its slug
  models/                  TensorFlow.js model manifests, weights, and vocabulary
  projects/                Work-card plates, one file per entry in lib/work-data.ts
scripts/                    One-off maintenance utilities
docs/                       Design and implementation notes
```

## Working Principles

- Make the smallest complete change that solves the task.
- Follow nearby code before introducing a new abstraction or dependency.
- Do not rewrite unrelated code, generated files, model artifacts, or journal content.
- Preserve server/client boundaries. Components are Server Components by default.
- Add `"use client"` only when a file needs hooks, event handlers, browser APIs, or a client-only library.
- Keep browser-heavy dependencies such as TensorFlow.js out of shared/server bundles; retain dynamic loading patterns where used.
- Prefer static generation for routes whose slugs are known at build time.
- Surface real failures with useful messages; do not fake loading progress or silently replace meaningful errors.

## TypeScript 6 Conventions

- Keep strict mode passing. Do not weaken `tsconfig.json` to bypass an error.
- Do not use `any`; model data precisely or use `unknown` and narrow it.
- Type function parameters and exported return values. Let obvious local values infer naturally.
- Use `import type` for type-only imports and inline `type` specifiers when mixing value and type imports.
- Prefer discriminated unions and literal unions for finite states.
- Use descriptive generic names such as `TData` rather than single-letter names when the meaning is not obvious.
- Do not use non-null assertions unless an invariant is guaranteed and clear at the use site.
- Keep `@/*` imports for cross-directory modules; use relative imports for closely related sibling files.
- Next.js 16 dynamic route `params` are asynchronous. Type them as `Promise<{ ... }>` and await them in pages and metadata functions.
- `tsconfig.json` uses `moduleResolution: "bundler"`, `jsx: "react-jsx"`, and `noEmit`; do not invoke `tsc` to produce runtime JavaScript.

## React and Next.js

- Put metadata and data loading in Server Components whenever possible.
- Avoid duplicating server-only data into client modules. `lib/journal.ts` imports `server-only`; client code should import types and presentation metadata from `lib/journal-meta.ts`.
- Keep effects focused and always clean up subscriptions, timers, observers, and event listeners.
- Use passive listeners for scroll or touch observation when the handler does not call `preventDefault`.
- Use dynamic imports for large client-only features when they are not needed for initial rendering.
- Do not add memoization by default. Use `useMemo` or `useCallback` only for an actual identity or computation requirement.
- Preserve static route behavior (`generateStaticParams`, `dynamicParams = false`) for journal and lab detail routes unless requirements change.

## Imports and Naming

Organize imports in readable groups:

1. React
2. Next.js
3. Third-party packages
4. Absolute local imports using `@/`
5. Relative sibling imports

Use these naming conventions:

- Components and component files: `PascalCase`
- Hooks: `camelCase` with a `use` prefix
- Utilities and variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE` when truly constant and module-wide
- Types: `PascalCase`
- Boolean values: prefer `is`, `has`, `can`, or `should` prefixes
- App Router files: Next.js lowercase conventions such as `page.tsx`, `layout.tsx`, and `loading.tsx`

## Styling and Visual Language

- Use Tailwind utilities for component styling and CSS for global systems or effects that utilities cannot express clearly.
- This project uses Tailwind CSS 4's CSS-first setup. Theme tokens live in `app/globals.css`; do not create a Tailwind config solely to add a token.
- Reuse the existing theme tokens and generated utilities:
  - `--color-paper`: `#fdfaf2`
  - `--color-paper-2`: `#f5f0e1`
  - `--color-ink`: `#1a1a1a`
  - `--color-electric`: `#cc00e6`
  - `--color-coral`: `#ff715b`
  - `--color-teal`: `#1ea896`
  - `--color-navy`: `#25283d`
- Preserve the editorial notebook aesthetic: paper backgrounds, ink borders, measured typography, and restrained accents.
- Build mobile-first and check the existing `900px` navigation/layout breakpoint before introducing a nearby competing breakpoint.
- Avoid inline styles unless values are computed dynamically or CSS custom properties are the cleanest bridge.
- Respect `prefers-reduced-motion`; use the shared `useReducedMotion` hook where client logic needs that preference.

## Accessibility

- Use semantic HTML before adding ARIA.
- Give icon-only controls an accessible name.
- Use native buttons and links for interaction; add `type="button"` to non-submit buttons.
- Ensure interactions work with keyboard input and have visible focus states.
- Preserve focus correctly for dialogs and other overlays; support Escape where users expect dismissal.
- Do not rely on color alone to communicate state.
- Provide meaningful alternative text for informative images and empty alt text for decorative images.

## Journal Content

Journal files live at `content/journal/<slug>.mdx`; the filename is the route slug. Frontmatter is validated during loading and can fail the build.

Required fields:

```yaml
title: "Entry title"
kind: note             # note | case
date: 2026-07-27       # YYYY-MM-DD
tag: web               # ai/ml | backend | web | linux | hardware | meta
dek: "Short summary"
```

Optional fields include `status` (`published` or `draft`), `sub`, `hero`, `heroAlt`, `heroCaption`, and `related`. A `hero` requires `heroAlt`; every `related` value must name an existing journal slug. Add a tag only by deliberately extending the allowlist in `lib/journal.ts`.

Journal table-of-contents entries are generated from level-two (`##`) headings. Avoid manually assigning metadata that `lib/journal.ts` derives, including reading time, entry number, and page number.

Entry images live in `public/journal/<slug>/`, named for what they show (`hero.png`, `heat-ramp.png`) rather than numbered — plate numbers come from document order, so a numbered filename goes stale the moment a plate is inserted above it. Reference them by public-root path in `hero` frontmatter or an MDX `<Figure src alt>`; both read intrinsic size through `lib/image-dims.ts` at build time, so a missing or moved file fails the build. Keep screenshot sources as PNG and let `next/image` handle delivery encoding.

## TensorFlow.js and Lab Code

- Model assets under `public/models/` are production artifacts. Do not replace or regenerate them unless explicitly requested.
- Keep model loading lazy and reuse the module-level cache in `lib/lab-models.ts`.
- Preserve the IndexedDB fallback behavior; private browsing and quota failures must remain non-fatal.
- Dispose every temporary tensor, including tensors created for warm-up or preprocessing.
- Clean up model-progress subscriptions in effects.
- Avoid moving TensorFlow.js into a static top-level runtime import in client UI; the dynamic import intentionally protects unrelated bundles.
- If the sentiment vocabulary changes, use or update `scripts/prune-word-index.mjs` rather than hand-editing generated JSON.

## Validation Checklist

1. Run `npm run typecheck`.
2. Run `npm run lint`.
3. Run `npm run build` for production-affecting changes.
4. If UI behavior changed, manually check keyboard access, responsive layout, reduced motion, and loading/error states.
5. Report which checks ran and distinguish pre-existing failures from failures introduced by the change.

## Common Pitfalls

- Do not import `lib/journal.ts` into a Client Component.
- Do not forget to await dynamic route `params`.
- Do not turn a Server Component into a Client Component just to solve a local interaction.
- Do not remove TensorFlow tensor disposal or effect cleanup.
- Do not edit `.next/`, model binaries, lockfile contents by hand, or generated TypeScript files.
- Do not add environment-variable documentation unless the variable is actually read by the application.
- Do not claim tests exist; this repository currently relies on typecheck, lint, build, and focused manual verification.
