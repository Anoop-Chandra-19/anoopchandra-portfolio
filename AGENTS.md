# AGENTS.md - Development Guide for AI Coding Agents

This guide provides essential information for AI coding agents working on this Next.js portfolio project.

## Project Overview

- **Framework**: Next.js 15.3.4 with App Router
- **Language**: TypeScript 5 (strict mode enabled)
- **Styling**: Tailwind CSS 4.1.11
- **Animations**: Framer Motion, GSAP, Lenis smooth scrolling
- **ML/AI**: TensorFlow.js for client-side ML demos
- **Package Manager**: npm

## Build, Lint, and Test Commands

### Development
```bash
npm run dev          # Start dev server with Turbopack
```

### Build & Production
```bash
npm run build        # Production build
npm start            # Start production server
```

### Code Quality
```bash
npm run lint         # Run ESLint with Next.js config
```

### Testing
Currently no test suite configured. If tests are added:
- Framework: Use Jest or Vitest
- Run single test: `npm test -- path/to/test.spec.ts`

## Code Style Guidelines

### Import Organization

1. **React imports first** (from "react")
2. **Next.js imports** (from "next/...")
3. **Third-party libraries** (alphabetically)
4. **Local components** (using @/ alias)
5. **Hooks** (using @/ alias)
6. **Types** (inline or from types file)

**Example:**
```typescript
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useLenis } from "@/hooks/useLenis";
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `SectionHero.tsx`, `ContactModal.tsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `useLenis.ts`, `useDoodleModel.ts`)
- **Pages**: lowercase (Next.js convention: `page.tsx`, `layout.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)

### Component Structure

```typescript
"use client"; // Add only when needed (hooks, state, browser APIs)

import statements...

type Props = {
  // Define prop types inline or separately
  onClose: () => void;
  open: boolean;
};

export default function ComponentName({ onClose, open }: Props) {
  // 1. State declarations
  const [state, setState] = useState();
  
  // 2. Refs
  const ref = useRef<HTMLDivElement>(null);
  
  // 3. Hooks
  const lenis = useLenisInstance();
  
  // 4. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 5. Event handlers
  function handleClick() {
    // Handler logic
  }
  
  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### TypeScript Guidelines

- **Strict mode enabled**: All code must satisfy TypeScript strict checks
- **Type annotations**: Always type function parameters and return values
- **Avoid `any`**: Use proper types or `unknown` if type is truly unknown
- **Type imports**: Use `import type` for type-only imports
- **Generics**: Use descriptive type parameters (e.g., `<TData>` not `<T>`)

**Examples:**
```typescript
// Good
function scrollToSection(id: string): void {
  const target = document.getElementById(id);
  if (lenis && target) {
    lenis.scrollTo(target, { offset: -64, duration: 1.1 });
  }
}

// Good - typed state
const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

// Good - typed ref
const modalRef = useRef<HTMLDivElement>(null);
```

### Styling Conventions

- **Primary**: Use Tailwind CSS utility classes
- **CSS Variables**: For colors and design tokens (defined in `app/globals.css`)
  - `var(--color-electric)`: #be00d9 (purple)
  - `var(--color-coral)`: #ff715b (coral)
  - `var(--color-navy)`: #18192d (dark navy)
  - `var(--color-teal)`: #1ea896 (teal)
- **Responsive**: Mobile-first approach (sm:, md:, lg:, xl:)
- **Avoid inline styles**: Except for dynamic values that can't use Tailwind

### Naming Conventions

- **Variables/Functions**: camelCase (`scrollToSection`, `handleClick`)
- **Constants**: UPPER_SNAKE_CASE (`SERVICE_ID`, `MODEL_PATH`)
- **Components**: PascalCase (`ContactModal`, `SectionHero`)
- **Types/Interfaces**: PascalCase (`NavLink`, `Props`)
- **Booleans**: Prefix with `is`, `has`, `should` (`isOpen`, `hasError`)

### Error Handling

```typescript
// Good - handle errors gracefully
useEffect(() => {
  tf.loadGraphModel(MODEL_PATH)
    .then(m => {
      setModel(m);
      setReady(true);
    })
    .catch(() => {
      setError("Could not load model.");
      setLoading(false);
    });
}, []);

// Good - type-safe error checking
if (!model) throw new Error("Model not loaded");
```

### Accessibility Guidelines

- **Add ARIA labels**: Use `aria-label` for buttons and interactive elements
- **Semantic HTML**: Use proper HTML5 elements (`<nav>`, `<main>`, `<section>`)
- **Keyboard navigation**: Support Tab, Escape, Enter
- **Focus management**: Trap focus in modals, restore focus on close
- **Role attributes**: Add `role="dialog"`, `aria-modal="true"` for modals

**Example:**
```typescript
<button
  onClick={handleClick}
  aria-label="Contact Me"
  tabIndex={0}
  type="button"
>
  Contact Me
</button>
```

### Performance Considerations

- **Lazy loading**: Use dynamic imports for heavy components
- **Memoization**: Use `useMemo`, `useCallback` for expensive computations
- **Cleanup**: Always cleanup effects, dispose TensorFlow tensors
- **Passive listeners**: Use `{ passive: true }` for scroll/touch events

```typescript
// Good - cleanup and passive listeners
useEffect(() => {
  function handleScroll() { /* ... */ }
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

// Good - dispose tensors
const output = model.predict(input) as tf.Tensor;
const data = await output.data();
input.dispose();
output.dispose();
```

## Path Aliases

- `@/*`: Maps to project root (`./`)
- **Usage**: `import Navbar from "@/components/Navbar"`

## Environment Variables

Prefix with `NEXT_PUBLIC_` for client-side access:
- `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
- `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
- `NEXT_PUBLIC_EMAILJS_USER_ID`

## Key Patterns Used in This Codebase

- **Client components**: Mark with `"use client"` directive
- **Smooth scrolling**: Lenis integration via custom hook
- **Framer Motion**: AnimatePresence for enter/exit animations
- **TensorFlow.js**: Custom hooks for model loading and prediction
- **Modal patterns**: Focus trapping, ESC to close, click outside to close

## Common Pitfalls to Avoid

- Don't use `cd` in bash commands - use `workdir` parameter instead
- Don't forget `"use client"` for components with hooks/state
- Don't mix Tailwind classes with inline styles unnecessarily
- Don't forget to cleanup event listeners and TensorFlow tensors
- Always type component props and state
- Use `type="button"` for non-submit buttons to prevent form submission
