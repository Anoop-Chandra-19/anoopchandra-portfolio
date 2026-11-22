// Client component for the copy button and overflow cue.
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/** Slack before an edge counts as scrollable — a hair over a subpixel. */
const EDGE_SLOP = 2;

const KEYWORDS: Record<string, string> = {
  py: "def class return if elif else for while in not and or is None True False import from as with async await try except finally raise yield lambda pass break continue global nonlocal assert del self",
  js: "const let var function return if else for while of in new class extends super import from export default async await try catch finally throw typeof instanceof this null undefined true false switch case break continue delete yield static get set",
  ts: "const let var function return if else for while of in new class extends super implements interface type enum import from export default async await try catch finally throw typeof instanceof this null undefined true false switch case break continue readonly public private protected declare namespace as satisfies",
  bash: "if then fi else elif for do done while case esac function export local return source echo cd sudo apt pacman pip npm pnpm git",
  json: "true false null",
};

function normalizeLang(raw: string | undefined): keyof typeof KEYWORDS {
  const s = String(raw ?? "").toLowerCase();
  if (/^(py|python)$/.test(s) || /\.py$/.test(s)) return "py";
  if (/^(ts|tsx|typescript)$/.test(s) || /\.tsx?$/.test(s)) return "ts";
  if (/^(sh|bash|shell|zsh|console)$/.test(s) || /\.sh$/.test(s)) return "bash";
  if (/^json$/.test(s) || /\.json$/.test(s)) return "json";
  return "js";
}

// comment | string | decorator | number | call | word | punctuation
const TOKEN =
  /(#[^\n]*|\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(@[A-Za-z_][\w.]*)|(\b\d[\w.]*\b)|([A-Za-z_$][\w$]*)(?=\s*\()|([A-Za-z_$][\w$]*)|([{}()[\].,;:=+\-*/%<>!?|&]+)/g;

type TokenKind = "comment" | "string" | "decorator" | "number" | "call" | "keyword" | "punct";
type Tok = [kind: TokenKind | null, text: string];

const TOKEN_CLASS: Record<TokenKind, string> = {
  keyword: "text-[oklch(.47_.17_305)] font-medium",
  string: "text-[oklch(.46_.10_168)]",
  number: "text-[oklch(.5_.14_38)]",
  decorator: "text-[oklch(.5_.14_38)] font-medium",
  call: "text-[oklch(.44_.11_252)]",
  comment: "text-[color:color-mix(in_oklab,var(--color-ink)_44%,var(--color-paper))] italic",
  punct: "text-[color:color-mix(in_oklab,var(--color-ink)_66%,var(--color-paper))]",
};

function tokenize(src: string, lang: string | undefined): Tok[][] {
  const kws = new Set(KEYWORDS[normalizeLang(lang)].split(" "));
  const toks: Tok[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(src))) {
    if (m.index > last) toks.push([null, src.slice(last, m.index)]);
    let cls: TokenKind | null = null;
    if (m[1]) cls = "comment";
    else if (m[2]) cls = "string";
    else if (m[3]) cls = "decorator";
    else if (m[4]) cls = "number";
    else if (m[5]) cls = kws.has(m[5]) ? "keyword" : "call";
    else if (m[6]) cls = kws.has(m[6]) ? "keyword" : null;
    else if (m[7]) cls = "punct";
    toks.push([cls, m[0]]);
    last = TOKEN.lastIndex;
  }
  if (last < src.length) toks.push([null, src.slice(last)]);

  const lines: Tok[][] = [[]];
  toks.forEach(([c, t]) => {
    t.split("\n").forEach((part, i) => {
      if (i) lines.push([]);
      if (part) lines[lines.length - 1].push([c, part]);
    });
  });
  return lines;
}

export default function CodeBlock({
  code,
  lang,
  file,
  hi,
  cap,
}: {
  code: string;
  lang?: string;
  file?: string;
  /** 1-indexed lines to tint with the accent */
  hi?: number[];
  cap?: string;
}) {
  const [copied, setCopied] = useState(false);
  const src = code.replace(/\s+$/, "");
  const lines = useMemo(() => tokenize(src, lang), [src, lang]);
  const hiSet = useMemo(() => new Set(hi ?? []), [hi]);

  // The scrollbar only colours in on hover and touch has none at all, so an
  // overflowing card needs its own cue: paper fades on whichever edge still has
  // code behind it.
  const bodyRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ more: false, less: false });
  const check = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;
    setEdges({
      more: el.scrollWidth - el.clientWidth - el.scrollLeft > EDGE_SLOP,
      less: el.scrollLeft > EDGE_SLOP,
    });
  }, []);
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    // Mono loads with `display: swap`, so the code gets wider without the
    // container ever resizing — which the observer alone would miss.
    document.fonts?.ready.then(check);
    return () => ro.disconnect();
  }, [check]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(src);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard blocked — the code is selectable either way */
    }
  }

  return (
    <div className="group my-7 mx-0 max-w-(--je-measure) max-mid:max-w-full bg-[#fffdf7] border-[1.4px] border-ink rounded-[4px] shadow-[2px_2px_0_color-mix(in_oklab,var(--color-ink)_13%,transparent)]">
      <div className="flex items-center gap-2.5 py-[7px] px-3 border-b border-dashed border-b-[color:color-mix(in_oklab,var(--color-ink)_38%,var(--color-paper))] bg-[color-mix(in_oklab,var(--color-paper-2)_62%,#fff)] rounded-t-[3px]">
        {file && <span className="font-mono text-meta text-ink">{file}</span>}
        <span className="py-0.5 px-2 border border-[color:color-mix(in_oklab,var(--color-ink)_26%,var(--color-paper))] rounded-full font-mono text-stamp uppercase text-ink-faint">
          {lang || "code"}
        </span>
        <button
          className="ml-auto py-[3px] px-[7px] bg-transparent border border-transparent rounded-[3px] font-mono text-stamp uppercase text-ink-faint cursor-pointer hover:text-ink hover:border-[color:color-mix(in_oklab,var(--color-ink)_30%,var(--color-paper))]"
          onClick={copy}
          type="button"
          aria-label="Copy code"
        >
          {copied ? "copied ✓" : "copy"}
        </button>
      </div>
      {/* Paper fades over whichever edge still has code behind it. */}
      <div
        className={`relative before:content-[''] before:absolute before:top-0 before:bottom-0 before:left-0 before:z-1 before:w-[30px] before:pointer-events-none before:bg-[linear-gradient(270deg,rgba(255,253,247,0),#fffdf7_70%)] before:[transition:opacity_.18s_ease-out] after:content-[''] after:absolute after:top-0 after:bottom-0 after:right-0 after:z-1 after:w-[30px] after:pointer-events-none after:bg-[linear-gradient(90deg,rgba(255,253,247,0),#fffdf7_70%)] after:[transition:opacity_.18s_ease-out] ${
          edges.less ? "before:opacity-100" : "before:opacity-0"
        } ${edges.more ? "after:opacity-100" : "after:opacity-0"}`}
      >
        {/* The scrollbar track stays reserved and only colours in, so hovering
            never reflows the code. */}
        <div
          className="[counter-reset:ln] overflow-x-auto py-3 px-0 bg-[linear-gradient(90deg,transparent_0_42px,color-mix(in_oklab,var(--accent)_40%,transparent)_42px_43px,transparent_43px)] [scrollbar-width:thin] [scrollbar-color:transparent_transparent] [transition:scrollbar-color_.18s_ease-out] group-hover:[scrollbar-color:color-mix(in_oklab,var(--color-ink)_28%,transparent)_transparent] focus-visible:[scrollbar-color:color-mix(in_oklab,var(--color-ink)_28%,transparent)_transparent]"
          ref={bodyRef}
          onScroll={check}
        >
          {lines.map((toks, i) => (
            <span
              key={i}
              // A counter in ::before, not a rendered number, so copying the code
              // doesn't copy the line numbers.
              className={`relative block [counter-increment:ln] before:content-[counter(ln)] before:absolute before:left-0 before:w-[30px] before:text-right before:text-[11px] before:text-[color-mix(in_oklab,var(--color-ink)_32%,var(--color-paper))] py-0 pr-[18px] pl-[58px] max-wide:pl-[50px] font-mono text-code whitespace-pre text-ink ${
                hiSet.has(i + 1) ? "bg-[color-mix(in_oklab,var(--accent)_10%,transparent)]" : ""
              }`}
            >
              {toks.length
                ? toks.map(([c, t], j) => (
                    <span key={j} className={c ? TOKEN_CLASS[c] : undefined}>
                      {t}
                    </span>
                  ))
                : "​"}
            </span>
          ))}
        </div>
      </div>
      {cap && (
        <div className="py-[9px] px-3.5 pb-2.5 border-t border-dashed border-t-[color:color-mix(in_oklab,var(--color-ink)_30%,var(--color-paper))] font-mono text-meta leading-[1.5] text-ink-faint">
          {cap}
        </div>
      )}
    </div>
  );
}
