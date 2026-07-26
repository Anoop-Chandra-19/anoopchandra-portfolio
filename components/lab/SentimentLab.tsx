"use client";
import { useCallback, useEffect, useState } from "react";
import { useInkTransition } from "@/components/transition/InkTransitionProvider";
import { loadModel, subscribeModel, type ModelPhase } from "@/lib/lab-models";
import type { LabAccent } from "@/lib/lab-meta";
import LabButton from "./LabButton";
import BenchBoot from "./BenchBoot";

/* Gauge + input UI from the design, verdict from the real IMDB LSTM
   (public/models/sentiment). Tokenization is ported from main's
   useSentimentModel: clean → word_index lookup (OOV=1, vocab 10k) → pad to
   64 → sigmoid score 0..1, remapped here to -1..1 for the needle.
   The word chips are the design's lexicon scorer kept as a purely visual
   "which words carry feeling" annotation — the LSTM offers no per-word
   attribution, so the needle and verdict are the model's alone. */

const MAX_LEN = 64;
const OOV_TOKEN_INDEX = 1;
const VOCAB_SIZE = 10000;

function tokenize(text: string, wordIndex: Record<string, number>): number[] {
  const words = text.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/);
  let seq = words.map((word) => {
    const idx = wordIndex[word] ?? OOV_TOKEN_INDEX;
    return typeof idx === "number" && idx > 0 && idx < VOCAB_SIZE ? idx : OOV_TOKEN_INDEX;
  });
  if (seq.length > MAX_LEN) seq = seq.slice(0, MAX_LEN);
  while (seq.length < MAX_LEN) seq.push(0);
  return seq;
}

/* annotation-only lexicon (from the design prototype) */
const LEX: Record<string, number> = { love: 3, loved: 3, loves: 3, amazing: 3, excellent: 3, fantastic: 3, wonderful: 3, brilliant: 3, perfect: 3, best: 3, great: 2, good: 2, happy: 2, enjoy: 2, enjoyed: 2, glad: 2, nice: 2, beautiful: 2, awesome: 3, delightful: 2, superb: 3, gem: 2, masterpiece: 3, fun: 2, recommend: 2, impressive: 2, favorite: 2, like: 1, liked: 1, fine: 1, solid: 1, decent: 1, worth: 1, smooth: 1, clever: 1, hate: -3, hated: -3, awful: -3, terrible: -3, horrible: -3, worst: -3, disgusting: -3, garbage: -3, useless: -3, boring: -2, bad: -2, poor: -2, disappointing: -2, disappointed: -2, waste: -3, annoying: -2, slow: -1, broken: -2, buggy: -2, ugly: -2, sad: -1, dull: -2, mediocre: -1, meh: -1, confusing: -1, overrated: -2, painful: -2, nightmare: -3, dislike: -2, lacking: -1 };
const NEGATORS = new Set(["not", "no", "never", "n't", "cant", "cannot", "dont", "doesnt", "isnt", "wasnt", "hardly", "barely", "without"]);

function lexiconHits(s: string): { hits: [string, number][]; matched: boolean } {
  const toks = s.toLowerCase().replace(/n't/g, " n't").match(/[a-z']+/g) || [];
  const hits: [string, number][] = [];
  for (let i = 0; i < toks.length; i++) {
    const w = toks[i];
    let v = LEX[w] || 0;
    if (v) {
      let neg = false;
      for (let j = Math.max(0, i - 3); j < i; j++) if (NEGATORS.has(toks[j])) neg = true;
      if (neg) v = -v * 0.85;
    }
    hits.push([w, v]);
  }
  return { hits, matched: hits.some((h) => h[1] !== 0) };
}

type Reading = { s: number; hits: [string, number][]; matched: boolean };

function verdictColor(s: number): string {
  return s > 0.15 ? "var(--color-teal)" : s < -0.15 ? "var(--color-coral)" : "var(--color-ink-soft)";
}
function verdictLabel(s: number): string {
  return s > 0.15 ? "Positive" : s < -0.15 ? "Negative" : "Neutral";
}

export default function SentimentLab({ accent }: { accent: LabAccent }) {
  const { active: isTransitionActive } = useInkTransition();
  const [text, setText] = useState("");
  const [res, setRes] = useState<Reading | null>(null);
  const [log, setLog] = useState<{ t: string; s: number }[]>([]);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<ModelPhase>("idle");

  useEffect(() => subscribeModel("sentiment", (p) => setPhase(p.phase)), []);
  useEffect(() => {
    if (isTransitionActive) return;
    loadModel("sentiment").catch(() => {});
  }, [isTransitionActive]);

  const run = useCallback(async () => {
    const t = text.trim();
    if (!t || busy || phase !== "ready") return;
    setBusy(true);
    try {
      const { tf, model, wordIndex } = await loadModel("sentiment");
      const input = tf.tensor([tokenize(t, wordIndex!)], [1, MAX_LEN]);
      const out = model.predict(input) as import("@tensorflow/tfjs").Tensor;
      const raw = (await out.data())[0];
      input.dispose();
      out.dispose();
      const s = raw * 2 - 1;
      setRes({ s, ...lexiconHits(t) });
      setLog((l) => [...l.slice(-4), { t, s }]);
    } catch {
      // load/predict failure — BenchBoot shows the error line
    } finally {
      setBusy(false);
    }
  }, [text, busy, phase]);

  const s = res ? res.s : 0;
  const color = verdictColor(s);

  return (
    <div className="lx-body">
      <div className="lx-panel">
        <div className="lx-gauge-wrap">
          <svg viewBox="0 0 200 116" className="lx-gauge" aria-hidden="true">
            <path d="M18 104 A82 82 0 0 1 182 104" fill="none" stroke="var(--color-ink)" strokeWidth="2" />
            <path d="M18 104 A82 82 0 0 1 100 22" fill="none" stroke="var(--color-coral)" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
            <path d="M100 22 A82 82 0 0 1 182 104" fill="none" stroke="var(--color-teal)" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
            <text x="20" y="114" className="lx-gauge-lab" fill="var(--color-coral)">neg</text>
            <text x="163" y="114" className="lx-gauge-lab" fill="var(--color-teal)">pos</text>
            <g
              className="lx-needle"
              style={{ transform: `rotate(${s * 72}deg)`, transformOrigin: "100px 104px" }}
            >
              <line x1="100" y1="104" x2="100" y2="34" stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" />
              <circle cx="100" cy="34" r="4" fill={color} stroke="var(--color-ink)" strokeWidth="1.5" />
            </g>
            <circle cx="100" cy="104" r="7" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="2" />
          </svg>
          <div className="lx-verdict" style={{ color: res ? color : "var(--color-ink-faint)" }}>
            {res ? verdictLabel(s) : "—"}
            <span className="mono lx-verdict-pct">{res ? ` ${Math.round(Math.abs(s) * 100)}%` : ""}</span>
          </div>
        </div>
        <div className="lx-inputrow">
          <span className="mono" style={{ color: `var(--color-${accent})`, fontSize: 20 }}>$</span>
          <input
            className="lx-input"
            value={text}
            placeholder="type a sentence to analyze…"
            spellCheck={false}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") run();
            }}
          />
          <LabButton accent={accent} onClick={run} disabled={!text.trim() || busy || phase !== "ready"}>
            read
          </LabButton>
        </div>
        {res && (
          <div className="lx-tokens">
            {res.hits.map(([w, v], i) => (
              <span key={i} className={"lx-tok" + (v > 0 ? " pos" : v < 0 ? " neg" : "")}>
                {w}
                {v !== 0 && (
                  <sup>
                    {v > 0 ? "+" : ""}
                    {v}
                  </sup>
                )}
              </span>
            ))}
          </div>
        )}
        {res && !res.matched && (
          <div className="mono faint lx-hint2">
            none of these words are in the highlight lexicon — the needle still read the whole sentence
          </div>
        )}
      </div>
      <div className="lx-panel lx-out">
        <div className="mono faint lx-cap">$ history</div>
        {log.length === 0 ? (
          <BenchBoot
            id="sentiment"
            num="exp-002"
            modelFlag="lstm-imdb"
            sizeMB="10.2"
            readyHint="type a sentence ✎"
          />
        ) : (
          <div className="lx-scroll">
            {[...log].reverse().map((h, i) => (
              <div key={i} className="mono lx-scroll-row">
                <span className="faint">$ {h.t}</span>
                <span style={{ color: verdictColor(h.s) }}>
                  {verdictLabel(h.s).toLowerCase()} · {Math.round(Math.abs(h.s) * 100)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
