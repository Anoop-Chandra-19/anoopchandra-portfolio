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

const tagColor = (c: TagColor) => (c ? `var(--${c})` : "var(--ink-soft)");
const pad = (n: number) => String(n).padStart(3, "0");

function NoteBlock({ block }: { block: Block }) {
  if (block.type === "p") {
    return <p style={{ fontSize: 16, lineHeight: 1.7, margin: "0 0 14px" }}>{block.t}</p>;
  }
  if (block.type === "h") {
    return <h4 style={{ fontSize: 24, marginTop: 22, marginBottom: 8, color: "var(--ink)" }}>{block.t}</h4>;
  }
  if (block.type === "list") {
    return (
      <ul style={{ paddingLeft: 20, margin: "6px 0 16px", fontSize: 15, lineHeight: 1.75 }}>
        {block.items.map((it, i) => (
          <li key={i} style={{ marginBottom: 4 }}>
            {it}
          </li>
        ))}
      </ul>
    );
  }
  if (block.type === "quote") {
    return (
      <blockquote
        className="hand"
        style={{
          margin: "18px 0",
          padding: "8px 18px",
          borderLeft: "3px solid var(--electric)",
          fontSize: 24,
          lineHeight: 1.35,
          color: "var(--ink)",
          fontStyle: "normal",
        }}
      >
        “{block.t}”
      </blockquote>
    );
  }
  if (block.type === "code") {
    return (
      <pre
        className="mono"
        style={{
          margin: "12px 0 18px",
          padding: "14px 16px",
          background: "color-mix(in oklab, var(--ink) 7%, var(--paper-2))",
          border: "1.5px solid var(--ink)",
          borderRadius: 4,
          fontSize: 12,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          overflow: "auto",
        }}
      >
        {block.t}
      </pre>
    );
  }
  // callout
  const c = block.c ?? "electric";
  return (
    <div
      style={{
        margin: "16px 0",
        padding: "12px 16px",
        background: `color-mix(in oklab, var(--${c}) 12%, var(--paper))`,
        border: `1.5px dashed var(--${c})`,
        borderRadius: 4,
        fontFamily: "var(--font-hand)",
        fontSize: 20,
        lineHeight: 1.35,
        color: "var(--ink)",
      }}
    >
      <span
        className="mono"
        style={{
          fontSize: 9,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: `var(--${c})`,
          display: "block",
          marginBottom: 4,
        }}
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
  const tagBg = c ? `color-mix(in oklab, var(--${c}) 14%, var(--paper))` : "var(--paper-2)";
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
          <span className="mono" style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>
            esc
          </span>
          <span style={{ fontSize: 22, lineHeight: 1, marginLeft: 6 }}>×</span>
        </button>

        <span aria-hidden="true" className="note-spread-binding" />

        <div className={`note-spread-page note-spread-left ${dirClass}`} key={`L-${openIdx}`}>
          <span aria-hidden="true" className="note-spread-rule" />
          <div className="mono faint note-spread-margin-label">
            ✎ p. {pad(pg)} — {t.toLowerCase()}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            <span
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: tagC,
                background: tagBg,
                border: `1.2px solid ${tagC}`,
                borderRadius: 3,
                padding: "3px 10px",
              }}
            >
              {tag}
            </span>
            <span className="mono faint" style={{ fontSize: 11 }}>
              {d}
            </span>
            <span className="mono faint" style={{ fontSize: 11 }}>
              · {r} read
            </span>
          </div>

          <h2 style={{ fontSize: 56, lineHeight: 0.98, margin: "0 0 14px" }}>{t}</h2>

          {content.dek && (
            <p
              className="hand"
              style={{
                fontSize: 24,
                lineHeight: 1.3,
                color: "var(--ink-soft)",
                margin: "0 0 22px",
                maxWidth: 540,
              }}
            >
              {content.dek}
            </p>
          )}

          <svg
            viewBox="0 0 200 8"
            preserveAspectRatio="none"
            width="160"
            height="8"
            aria-hidden="true"
            style={{ display: "block", marginBottom: 18 }}
          >
            <path
              d="M 2 4 Q 24 1, 48 4 T 96 4 T 144 4 T 198 4"
              fill="none"
              stroke="var(--ink)"
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
            className="hand"
            style={{
              marginTop: 28,
              fontSize: 22,
              color: "var(--ink-soft)",
              transform: "rotate(-1.5deg)",
              display: "inline-block",
            }}
          >
            — Anoop ✎
          </div>

          <div className="mono faint note-spread-pageno">{pad(pg)}</div>
        </div>

        <div className={`note-spread-page note-spread-right ${dirClass}`} key={`R-${openIdx}`}>
          <div
            className="mono faint"
            style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}
          >
            ✎ margin
          </div>

          <div
            className="sketch-box"
            style={{
              background: tagBg,
              padding: 18,
              marginBottom: 22,
              transform: "rotate(-0.6deg)",
            }}
          >
            <div
              className="mono faint"
              style={{
                fontSize: 9,
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              entry no. {pad(pg)}
            </div>
            <div
              className="mono"
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                columnGap: 14,
                rowGap: 6,
                fontSize: 13,
              }}
            >
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
              <div
                className="mono faint"
                style={{
                  fontSize: 9,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                see also ↘
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px" }}>
                {relatedPosts.map((rp) => {
                  const rIdx = posts.indexOf(rp);
                  const [, rt, , rtag, rc, rpg] = rp;
                  const rTagColor = tagColor(rc);
                  return (
                    <li
                      key={rt}
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px dashed var(--ink-faint)",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(rIdx)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") navigate(rIdx);
                      }}
                    >
                      <div
                        className="hand"
                        style={{ fontSize: 18, lineHeight: 1.2, color: "var(--ink)" }}
                      >
                        {rt}
                      </div>
                      <div
                        className="mono faint"
                        style={{ fontSize: 10, marginTop: 3, display: "flex", gap: 10 }}
                      >
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

          <div
            className="mono faint"
            style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}
          >
            scribble
          </div>
          <svg
            viewBox="0 0 220 60"
            width="220"
            height="60"
            aria-hidden="true"
            style={{ marginBottom: 18 }}
          >
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
            <text
              x="10"
              y="52"
              fontFamily="Caveat, cursive"
              fontSize="16"
              fill="var(--ink-soft)"
            >
              {tag === "linux"
                ? "rabbit-hole, started here"
                : tag === "ai/ml"
                ? "still figuring this out"
                : tag === "hardware"
                ? "do not buy 4 sticks"
                : "filed under: things I learned"}
            </text>
          </svg>

          <div style={{ flex: 1 }} />

          <div className="note-spread-nav">
            <button
              className="note-spread-navbtn"
              onClick={() => prev && navigate(openIdx - 1)}
              disabled={!prev}
              aria-label="Previous (newer) note"
            >
              <span
                className="mono faint"
                style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase" }}
              >
                ← newer
              </span>
              <span
                className="hand"
                style={{
                  fontSize: 17,
                  lineHeight: 1.1,
                  color: prev ? "var(--ink)" : "var(--ink-faint)",
                }}
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
              <span
                className="mono faint"
                style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase" }}
              >
                older →
              </span>
              <span
                className="hand"
                style={{
                  fontSize: 17,
                  lineHeight: 1.1,
                  color: next ? "var(--ink)" : "var(--ink-faint)",
                  textAlign: "right",
                }}
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
      <p className="faint" style={{ maxWidth: 720, marginBottom: 24, fontSize: 16 }}>
        Working journal — bug stories, hot takes, things I figured out the hard way.
      </p>

      <div style={{ position: "relative" }}>
        <div
          style={{
            background: "var(--paper)",
            border: "2px solid var(--ink)",
            borderRadius: 6,
            padding: "28px 24px 18px 64px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 48,
              top: 0,
              bottom: 0,
              width: 1.2,
              background: "color-mix(in oklab, var(--coral) 70%, transparent)",
              opacity: 0.6,
            }}
          />
          <div
            className="mono faint"
            style={{
              position: "absolute",
              left: 8,
              top: 28,
              fontSize: 9,
              letterSpacing: 3,
              textTransform: "uppercase",
              transform: "rotate(-90deg)",
              transformOrigin: "left top",
              whiteSpace: "nowrap",
            }}
          >
            ✎ index — pp. 018 — 142
          </div>

          <div
            className="mono faint notes-header"
            style={{
              display: "grid",
              gridTemplateColumns: "44px 1fr 90px 64px",
              gap: 14,
              padding: "0 90px 12px 6px",
              fontSize: 9,
              letterSpacing: 2,
              textTransform: "uppercase",
              borderBottom: "1px dashed var(--ink-faint)",
              marginBottom: 6,
            }}
          >
            <span style={{ textAlign: "right" }}>pg.</span>
            <span>title</span>
            <span style={{ textAlign: "right" }}>read</span>
            <span style={{ textAlign: "right" }}>date</span>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {posts.map((post, i) => {
              const [d, t, r, tag, c, pg] = post;
              return (
                <li
                  key={t}
                  className="notes-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "44px 1fr 90px 64px",
                    gap: 14,
                    alignItems: "baseline",
                    padding: "12px 90px 12px 6px",
                    position: "relative",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
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
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "color-mix(in oklab, var(--paper-2) 60%, transparent)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span
                    className="mono faint notes-date"
                    style={{ fontSize: 11, textAlign: "right", color: "var(--ink-soft)" }}
                  >
                    p.{pad(pg)}
                  </span>

                  <span
                    className="notes-title"
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      minWidth: 0,
                      gap: 8,
                      overflow: "hidden",
                    }}
                  >
                    <span
                      className="hand"
                      style={{
                        fontSize: 22,
                        lineHeight: 1.1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        flex: "0 1 auto",
                        color: "var(--ink)",
                      }}
                    >
                      {t}
                    </span>
                    <span
                      aria-hidden="true"
                      style={{
                        flex: 1,
                        height: 0,
                        borderBottom: "1.5px dotted var(--ink-faint)",
                        transform: "translateY(-4px)",
                        minWidth: 24,
                      }}
                    />
                  </span>

                  <span
                    className="mono faint notes-meta"
                    style={{ fontSize: 11, textAlign: "right", color: "var(--ink-soft)" }}
                  >
                    {r}
                  </span>

                  <span
                    className="mono notes-meta"
                    style={{ fontSize: 11, textAlign: "right", color: "var(--ink-soft)" }}
                  >
                    {d}
                  </span>

                  <span
                    aria-hidden="true"
                    className="notes-edge-tab"
                    style={{
                      position: "absolute",
                      right: -2,
                      top: "50%",
                      transform: "translateY(-50%)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        "color-mix(in oklab, " + tagColor(c) + " 18%, var(--paper))",
                      border: "1.2px solid " + tagColor(c),
                      borderRight: "none",
                      borderRadius: "3px 0 0 3px",
                      padding: "3px 8px 3px 10px",
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: 1,
                      color: tagColor(c),
                      minWidth: 70,
                      textAlign: "center",
                    }}
                  >
                    {tag}
                  </span>
                </li>
              );
            })}
          </ul>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 14,
              paddingTop: 12,
              borderTop: "1px dashed var(--ink-faint)",
            }}
          >
            <span className="mono faint" style={{ fontSize: 11 }}>
              {posts.length} entries · pp. {pad(posts[posts.length - 1][5])}–{pad(posts[0][5])}
            </span>
            <span
              className="hand"
              style={{ fontSize: 20, color: "var(--electric)", cursor: "pointer" }}
            >
              see all notes →
            </span>
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
