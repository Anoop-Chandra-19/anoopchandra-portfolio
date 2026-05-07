"use client";
import { useEffect, useRef, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";

type TagColor = "coral" | "teal" | "electric" | null;
type Post = readonly [date: string, title: string, read: string, tag: string, color: TagColor, page: number];

type Block =
  | { type: "p"; t: string }
  | { type: "h"; t: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; t: string }
  | { type: "code"; t: string }
  | { type: "callout"; c: TagColor; t: string };

type NoteContent = {
  dek: string;
  body: Block[];
  related: string[];
};

const POSTS: ReadonlyArray<Post> = [
  ["apr 24, 2026", "The AM5 Memory Fix", "5 min", "hardware", "coral", 142],
  ["apr 10, 2026", "Why I switched to Hyprland", "8 min", "linux", "teal", 128],
  ["mar 28, 2026", "Shipping LLMs at a startup", "12 min", "ai/ml", "electric", 109],
  ["mar 14, 2026", "NestJS vs Express in 2026", "6 min", "backend", null, 94],
  ["feb 22, 2026", "Quick: client-side ML w/ TF.js", "4 min", "ai/ml", "electric", 77],
  ["feb 02, 2026", "Reading list, Q1 2026", "3 min", "meta", null, 61],
  ["jan 19, 2026", "Notes on RAG eval harnesses", "9 min", "ai/ml", "electric", 42],
  ["jan 04, 2026", "A year of Arch (Arch is great, and awful)", "7 min", "linux", "teal", 18],
];

const NOTES_CONTENT: Record<string, NoteContent> = {
  "The AM5 Memory Fix": {
    dek: "Two sticks of DDR5-6000 should just work. Four sticks? Welcome to the BIOS rabbit hole.",
    body: [
      { type: "p", t: "I built a new AM5 box around a 7950X3D last month. Two sticks of G.Skill DDR5-6000 CL30 — booted to Windows on the first try, ran Prime95 for an hour, no complaints. Then I added the second kit." },
      { type: "p", t: "And then nothing booted." },
      { type: "h", t: "What actually happened" },
      { type: "p", t: "AM5's memory controller is fine with 2x DIMMs at the rated EXPO speed. With 4x DIMMs, it falls off a cliff — officially supported up to DDR5-3600 in some configurations, and even that is generous. The system was POSTing fine at JEDEC speeds; EXPO at 6000 was hard-failing into a memtest loop." },
      { type: "callout", c: "coral", t: "TL;DR — 4 sticks of DDR5 on AM5 is not a supported config at advertised speeds. Pick 2 sticks of higher density, or accept JEDEC." },
      { type: "h", t: "The fix" },
      { type: "p", t: "I returned the second kit and got a single 2x32GB kit instead. 64GB total, EXPO enabled, boots clean every time. The 'just buy more sticks' instinct from DDR4 doesn't carry over." },
      { type: "code", t: "# what I should have bought first time:\nG.Skill Trident Z5 — 2x32GB DDR5-6000 CL30\n# what I tried:\n2x  G.Skill 2x16GB kits = 4 sticks total" },
      { type: "p", t: "Lesson: density > stick count on AM5. Always." },
    ],
    related: ["Why I switched to Hyprland", "A year of Arch (Arch is great, and awful)"],
  },
  "Why I switched to Hyprland": {
    dek: "After three years on i3, I thought tiling was tiling. Hyprland proved me wrong.",
    body: [
      { type: "p", t: "i3 is wonderful. It's also from 2009. Animations are nonexistent, the rendering pipeline is X11, and HiDPI fractional scaling is a polite fiction." },
      { type: "p", t: "Hyprland is a Wayland compositor with the same tiling DNA — but it animates, it composites, it handles 1.5x scaling on a 4K display without me writing any xrandr scripts." },
      { type: "h", t: "What actually changed" },
      { type: "list", items: [
        "Window animations that aren't distracting — bezier curves, ~150ms",
        "Real fractional scaling, finally",
        "Per-monitor workspaces that just work",
        "A config file that reads like a config file, not a manifesto",
      ]},
      { type: "callout", c: "teal", t: "If you've been on i3/sway and stayed away from Hyprland because of the drama — try it. The compositor is excellent." },
      { type: "h", t: "What I miss" },
      { type: "p", t: "Stability, mostly. i3 never crashed. Hyprland crashes maybe once a week. I'll take it for what I get back." },
    ],
    related: ["A year of Arch (Arch is great, and awful)", "The AM5 Memory Fix"],
  },
  "Shipping LLMs at a startup": {
    dek: "Notes from building a production LLM pipeline that actually has to make money.",
    body: [
      { type: "p", t: "Shipping LLMs in research is one thing. Shipping them at a startup, where the wrong answer costs the company a customer, is different." },
      { type: "h", t: "Things I underestimated" },
      { type: "list", items: [
        "Eval is the hardest part. Not the model.",
        "Latency budgets get eaten by retrieval, not inference.",
        "Customers will paste the entire 40-page PDF into a 'short question' field.",
        "Streaming responses change the UX more than any prompt tweak.",
      ]},
      { type: "quote", t: "The model is 5% of the work. The other 95% is everything around it." },
      { type: "h", t: "Things I'd do again" },
      { type: "p", t: "Async-first architecture. Celery + Redis + Postgres for state. A boring stack around a non-boring model. The boring parts are what made the product reliable." },
    ],
    related: ["Notes on RAG eval harnesses", "NestJS vs Express in 2026"],
  },
};

function fallbackContent(): NoteContent {
  return {
    dek: "Notes-in-progress. The full write-up is on the way.",
    body: [
      { type: "p", t: "This is one of the older entries — I'm working through the archive and re-typesetting them in this notebook. The original is still up on the old blog if you want the raw version." },
      { type: "p", t: "Check back next week, or pick another tab from the index." },
    ],
    related: [],
  };
}

const tagColor = (c: TagColor) => (c ? `var(--color-${c})` : "var(--color-ink-soft)");
const pad = (n: number) => String(n).padStart(3, "0");

function NoteBlock({ block }: { block: Block }) {
  if (block.type === "p") {
    return <p className="text-base leading-[1.7] mt-0 mb-3.5">{block.t}</p>;
  }
  if (block.type === "h") {
    return <h4 className="text-2xl mt-[22px] mb-2 text-ink">{block.t}</h4>;
  }
  if (block.type === "list") {
    return (
      <ul className="pl-5 my-1.5 mb-4 text-[15px] leading-[1.75]">
        {block.items.map((it, i) => (
          <li key={i} className="mb-1">
            {it}
          </li>
        ))}
      </ul>
    );
  }
  if (block.type === "quote") {
    return (
      <blockquote className="hand my-[18px] py-2 px-[18px] border-l-[3px] border-electric text-2xl leading-[1.35] text-ink not-italic">
        “{block.t}”
      </blockquote>
    );
  }
  if (block.type === "code") {
    return (
      <pre
        className="mono my-3 mb-[18px] py-3.5 px-4 border-[1.5px] border-ink rounded text-xs leading-[1.6] whitespace-pre-wrap overflow-auto"
        style={{ background: "color-mix(in oklab, var(--color-ink) 7%, var(--color-paper-2))" }}
      >
        {block.t}
      </pre>
    );
  }
  // callout
  const c = block.c ?? "electric";
  return (
    <div
      className="my-4 py-3 px-4 rounded text-xl leading-[1.35] text-ink"
      style={{
        background: `color-mix(in oklab, var(--color-${c}) 12%, var(--color-paper))`,
        border: `1.5px dashed var(--color-${c})`,
        fontFamily: "var(--font-hand)",
      }}
    >
      <span
        className="mono text-[9px] tracking-[2px] uppercase block mb-1"
        style={{ color: `var(--color-${c})` }}
      >
        ✎ margin note
      </span>
      {block.t}
    </div>
  );
}

function NoteSpread({
  post,
  posts,
  openIdx,
  onClose,
  onOpenIdx,
}: {
  post: Post;
  posts: ReadonlyArray<Post>;
  openIdx: number;
  onClose: () => void;
  onOpenIdx: (i: number) => void;
}) {
  const [, t, r, tag, c, pg] = post;
  const d = post[0];
  const [dir, setDir] = useState(0);
  const prevIdxRef = useRef(openIdx);

  useEffect(() => {
    if (prevIdxRef.current === openIdx) return;
    setDir(openIdx > prevIdxRef.current ? 1 : -1);
    prevIdxRef.current = openIdx;
  }, [openIdx]);

  const navigate = (newIdx: number) => {
    setDir(newIdx > openIdx ? 1 : -1);
    onOpenIdx(newIdx);
  };
  const dirClass = dir === 1 ? "turn-fwd" : dir === -1 ? "turn-back" : "turn-first";
  const tagC = tagColor(c);
  const tagBg = c ? `color-mix(in oklab, var(--color-${c}) 14%, var(--color-paper))` : "var(--color-paper-2)";
  const content = NOTES_CONTENT[t] ?? fallbackContent();

  const prev = openIdx > 0 ? posts[openIdx - 1] : null;
  const next = openIdx < posts.length - 1 ? posts[openIdx + 1] : null;

  const relatedPosts = (content.related || [])
    .map((title) => posts.find((p) => p[1] === title))
    .filter((p): p is Post => Boolean(p));

  return (
    <div className="note-spread-overlay" onClick={onClose}>
      <div
        className="note-spread"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Note: ${t}`}
      >
        <button className="note-spread-close" onClick={onClose} aria-label="Close note">
          <span className="mono text-[11px] tracking-[2px] uppercase">esc</span>
          <span className="text-[22px] leading-none ml-1.5">×</span>
        </button>

        <span aria-hidden="true" className="note-spread-binding" />

        <div className={`note-spread-page note-spread-left ${dirClass}`} key={`L-${openIdx}`}>
          <span aria-hidden="true" className="note-spread-rule" />
          <div className="mono faint note-spread-margin-label">
            ✎ p. {pad(pg)} — {t.toLowerCase()}
          </div>

          <div className="flex items-center gap-3 mb-3.5 flex-wrap">
            <span
              className="mono text-[10px] tracking-[2px] uppercase rounded-sm py-[3px] px-2.5"
              style={{ color: tagC, background: tagBg, border: `1.2px solid ${tagC}` }}
            >
              {tag}
            </span>
            <span className="mono faint text-[11px]">{d}</span>
            <span className="mono faint text-[11px]">· {r} read</span>
          </div>

          <h2 className="text-[56px] leading-[0.98] m-0 mb-3.5">{t}</h2>

          {content.dek && (
            <p className="hand text-2xl leading-[1.3] text-ink-soft m-0 mb-[22px] max-w-[540px]">
              {content.dek}
            </p>
          )}

          <svg
            viewBox="0 0 200 8"
            preserveAspectRatio="none"
            width="160"
            height="8"
            aria-hidden="true"
            className="block mb-[18px]"
          >
            <path
              d="M 2 4 Q 24 1, 48 4 T 96 4 T 144 4 T 198 4"
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>

          <div className="note-spread-body">
            {content.body.map((b, i) => (
              <NoteBlock key={i} block={b} />
            ))}
          </div>

          <div
            className="hand mt-7 text-[22px] text-ink-soft inline-block"
            style={{ transform: "rotate(-1.5deg)" }}
          >
            — Anoop ✎
          </div>

          <div className="mono faint note-spread-pageno">{pad(pg)}</div>
        </div>

        <div className={`note-spread-page note-spread-right ${dirClass}`} key={`R-${openIdx}`}>
          <div className="mono faint text-[9px] tracking-[3px] uppercase mb-3.5">✎ margin</div>

          <div
            className="sketch-box p-[18px] mb-[22px]"
            style={{ background: tagBg, transform: "rotate(-0.6deg)" }}
          >
            <div className="mono faint text-[9px] tracking-[2px] uppercase mb-2.5">
              entry no. {pad(pg)}
            </div>
            <div className="mono grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-1.5 text-[13px]">
              <span className="faint">filed</span>
              <span>{d}</span>
              <span className="faint">tag</span>
              <span style={{ color: tagC }}>{tag}</span>
              <span className="faint">read</span>
              <span>{r}</span>
              <span className="faint">page</span>
              <span>p. {pad(pg)}</span>
            </div>
          </div>

          {relatedPosts.length > 0 && (
            <>
              <div className="mono faint text-[9px] tracking-[3px] uppercase mb-2.5">
                see also ↘
              </div>
              <ul className="list-none p-0 m-0 mb-[22px]">
                {relatedPosts.map((rp) => {
                  const rIdx = posts.indexOf(rp);
                  const [, rt, , rtag, rc, rpg] = rp;
                  const rTagColor = tagColor(rc);
                  return (
                    <li
                      key={rt}
                      className="py-2.5 cursor-pointer"
                      style={{ borderBottom: "1px dashed var(--color-ink-faint)" }}
                      onClick={() => navigate(rIdx)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") navigate(rIdx);
                      }}
                    >
                      <div className="hand text-[18px] leading-[1.2] text-ink">{rt}</div>
                      <div className="mono faint text-[10px] mt-[3px] flex gap-2.5">
                        <span style={{ color: rTagColor }}>{rtag}</span>
                        <span>·</span>
                        <span>p.{pad(rpg)}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <div className="mono faint text-[9px] tracking-[3px] uppercase mb-1.5">scribble</div>
          <svg viewBox="0 0 220 60" width="220" height="60" aria-hidden="true" className="mb-[18px]">
            <path
              d="M 6 30 C 40 6, 80 50, 120 28 S 200 32, 214 18"
              fill="none"
              stroke={tagC}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M 214 18 L 204 14 M 214 18 L 208 26"
              fill="none"
              stroke={tagC}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <text x="10" y="52" fontFamily="Caveat, cursive" fontSize="16" fill="var(--color-ink-soft)">
              {tag === "linux"
                ? "rabbit-hole, started here"
                : tag === "ai/ml"
                ? "still figuring this out"
                : tag === "hardware"
                ? "do not buy 4 sticks"
                : "filed under: things I learned"}
            </text>
          </svg>

          <div className="flex-1" />

          <div className="note-spread-nav">
            <button
              className="note-spread-navbtn"
              onClick={() => prev && navigate(openIdx - 1)}
              disabled={!prev}
              aria-label="Previous (newer) note"
            >
              <span className="mono faint text-[9px] tracking-[2px] uppercase">← newer</span>
              <span
                className={`hand text-[17px] leading-[1.1] ${
                  prev ? "text-ink" : "text-ink-faint"
                }`}
              >
                {prev ? prev[1] : "— end —"}
              </span>
            </button>
            <button
              className="note-spread-navbtn note-spread-navbtn-r"
              onClick={() => next && navigate(openIdx + 1)}
              disabled={!next}
              aria-label="Next (older) note"
            >
              <span className="mono faint text-[9px] tracking-[2px] uppercase">older →</span>
              <span
                className={`hand text-[17px] leading-[1.1] text-right ${
                  next ? "text-ink" : "text-ink-faint"
                }`}
              >
                {next ? next[1] : "— end —"}
              </span>
            </button>
          </div>

          <div className="mono faint note-spread-pageno">{pad(pg + 1)}</div>
        </div>
      </div>
    </div>
  );
}

export default function Notes() {
  const posts = POSTS;
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    if (openIdx === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIdx(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [openIdx]);

  const openPost = openIdx !== null ? posts[openIdx] : null;

  return (
    <section id="sec-notes" className="section">
      <SectionHeader num="05" title="Notes & Stories" meta={`${posts.length} entries · index`} />
      <p className="faint max-w-[720px] mb-6 text-base">
        Working journal — bug stories, hot takes, things I figured out the hard way.
      </p>

      <div className="relative">
        <div className="bg-paper border-2 border-ink rounded-md pt-7 pr-6 pb-[18px] pl-16 relative overflow-hidden">
          {/* Red margin rule */}
          <span
            aria-hidden="true"
            className="absolute left-12 top-0 bottom-0 w-[1.2px] opacity-60"
            style={{ background: "color-mix(in oklab, var(--color-coral) 70%, transparent)" }}
          />
          {/* Rotated INDEX label */}
          <div
            className="mono faint absolute left-2 top-7 text-[9px] tracking-[3px] uppercase whitespace-nowrap"
            style={{ transform: "rotate(-90deg)", transformOrigin: "left top" }}
          >
            ✎ index — pp. 018 — 142
          </div>

          <div
            className="mono faint notes-header grid gap-3.5 pt-0 pr-[90px] pb-3 pl-1.5 text-[9px] tracking-[2px] uppercase mb-1.5"
            style={{
              gridTemplateColumns: "44px 1fr 90px 64px",
              borderBottom: "1px dashed var(--color-ink-faint)",
            }}
          >
            <span className="text-right">pg.</span>
            <span>title</span>
            <span className="text-right">read</span>
            <span className="text-right">date</span>
          </div>

          <ul className="list-none p-0 m-0">
            {posts.map((post, i) => {
              const [d, t, r, tag, c, pg] = post;
              return (
                <li
                  key={t}
                  className="notes-row grid gap-3.5 items-baseline py-3 pr-[90px] pl-1.5 relative cursor-pointer transition-colors duration-150 hover:bg-[color-mix(in_oklab,var(--color-paper-2)_60%,transparent)]"
                  style={{ gridTemplateColumns: "44px 1fr 90px 64px" }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Open note: ${t}`}
                  onClick={() => setOpenIdx(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpenIdx(i);
                    }
                  }}
                >
                  <span className="mono faint notes-date text-[11px] text-right text-ink-soft">
                    p.{pad(pg)}
                  </span>

                  <span className="notes-title flex items-baseline min-w-0 gap-2 overflow-hidden">
                    <span className="hand text-[22px] leading-[1.1] whitespace-nowrap overflow-hidden text-ellipsis flex-[0_1_auto] text-ink">
                      {t}
                    </span>
                    <span
                      aria-hidden="true"
                      className="flex-1 h-0 min-w-6 -translate-y-1"
                      style={{ borderBottom: "1.5px dotted var(--color-ink-faint)" }}
                    />
                  </span>

                  <span className="mono faint notes-meta text-[11px] text-right text-ink-soft">{r}</span>

                  <span className="mono notes-meta text-[11px] text-right text-ink-soft">{d}</span>

                  <span
                    aria-hidden="true"
                    className="notes-edge-tab absolute -right-0.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-[10px] tracking-[1px] text-center min-w-[70px] py-[3px] pl-2.5 pr-2"
                    style={{
                      fontFamily: "var(--font-mono)",
                      background: `color-mix(in oklab, ${tagColor(c)} 18%, var(--color-paper))`,
                      border: `1.2px solid ${tagColor(c)}`,
                      borderRight: "none",
                      borderRadius: "3px 0 0 3px",
                      color: tagColor(c),
                    }}
                  >
                    {tag}
                  </span>
                </li>
              );
            })}
          </ul>

          <div
            className="flex justify-between items-center mt-3.5 pt-3"
            style={{ borderTop: "1px dashed var(--color-ink-faint)" }}
          >
            <span className="mono faint text-[11px]">
              {posts.length} entries · pp. {pad(posts[posts.length - 1][5])}–{pad(posts[0][5])}
            </span>
            <span className="hand text-xl text-electric cursor-pointer">see all notes →</span>
          </div>
        </div>
      </div>

      {openPost && openIdx !== null && (
        <NoteSpread
          post={openPost}
          posts={posts}
          openIdx={openIdx}
          onClose={() => setOpenIdx(null)}
          onOpenIdx={(i) => setOpenIdx(i)}
        />
      )}
    </section>
  );
}
