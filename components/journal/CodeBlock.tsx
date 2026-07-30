// Light-on-paper fenced code, ruled like the rest of the book.
//
// No dark syntax theme on purpose: the architecture plates already put large
// black rectangles on the cream, and a second dark block on the same page kills
// the paper. The --tk-* token hues in journal.css are hue-shifted ink, tuned for
// #fffdf7.
//
// Client component for the copy button and the overflow cue; the tokenizing is
// pure and runs once per render.
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

type Tok = [cls: string | null, text: string];

function tokenize(src: string, lang: string | undefined): Tok[][] {
  const kws = new Set(KEYWORDS[normalizeLang(lang)].split(" "));
  const toks: Tok[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(src))) {
    if (m.index > last) toks.push([null, src.slice(last, m.index)]);
    let cls: string | null = null;
    if (m[1]) cls = "t-c";
    else if (m[2]) cls = "t-s";
    else if (m[3]) cls = "t-a";
    else if (m[4]) cls = "t-n";
    else if (m[5]) cls = kws.has(m[5]) ? "t-k" : "t-f";
    else if (m[6]) cls = kws.has(m[6]) ? "t-k" : null;
    else if (m[7]) cls = "t-p";
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
    <div className="je-code">
      <div className="bar">
        {file && <span className="fn">{file}</span>}
        <span className="lang">{lang || "code"}</span>
        <button className="copy" onClick={copy} type="button" aria-label="Copy code">
          {copied ? "copied ✓" : "copy"}
        </button>
      </div>
      <div className={`cwrap${edges.more ? " more" : ""}${edges.less ? " less" : ""}`}>
        <div className="cbody" ref={bodyRef} onScroll={check}>
          {lines.map((toks, i) => (
            <span key={i} className={`ln${hiSet.has(i + 1) ? " hi" : ""}`}>
              {toks.length
                ? toks.map(([c, t], j) =>
                    c ? (
                      <span key={j} className={c}>
                        {t}
                      </span>
                    ) : (
                      <span key={j}>{t}</span>
                    ),
                  )
                : "​"}
            </span>
          ))}
        </div>
      </div>
      {cap && <div className="cap">{cap}</div>}
    </div>
  );
}
