import { useCallback, useEffect, useState } from "react";
import { useInkTransition } from "@/components/transition/InkTransitionProvider";
import {
  disposeModelOutput,
  getModelOutputTensors,
  loadModel,
  subscribeModel,
  type ModelOutput,
  type ModelPhase,
} from "@/lib/lab-models";
import type { LabAccent } from "@/lib/lab-meta";

import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import { LabBody, LabPanel, NOTE } from "./lab-ui";
import BenchBoot from "./BenchBoot";

/* Gauge + input UI from the design, verdict from the real IMDB LSTM
   (public/models/sentiment/v1). Tokenization is ported from main's
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
type LabError = { kind: "load" | "inference"; message: string };

function verdictColor(s: number): string {
  return s > 0.15 ? "var(--color-teal)" : s < -0.15 ? "var(--color-coral)" : "var(--color-ink-soft)";
}
function verdictLabel(s: number): string {
  return s > 0.15 ? "Positive" : s < -0.15 ? "Negative" : "Neutral";
}

// Word chips: tinted by which way the lexicon pulls the word.
const TOKEN_TONE = {
  pos: "bg-[color-mix(in_oklab,var(--color-teal)_18%,var(--color-paper))] text-[color:color-mix(in_oklab,var(--color-teal)_70%,var(--color-ink))]",
  neg: "bg-[color-mix(in_oklab,var(--color-coral)_20%,var(--color-paper))] text-[color:color-mix(in_oklab,var(--color-coral)_72%,var(--color-ink))]",
  neutral: "bg-[color-mix(in_oklab,var(--color-ink)_6%,transparent)] text-ink-soft",
} as const;

export default function SentimentLab({ accent }: { accent: LabAccent }) {
  const { active: isTransitionActive } = useInkTransition();
  const [text, setText] = useState("");
  const [res, setRes] = useState<Reading | null>(null);
  const [log, setLog] = useState<{ t: string; s: number }[]>([]);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<ModelPhase>("idle");
  const [error, setError] = useState<LabError | null>(null);

  useEffect(() => subscribeModel("sentiment", (p) => setPhase(p.phase)), []);
  useEffect(() => {
    if (isTransitionActive) return;
    let isCancelled = false;
    loadModel("sentiment").catch(() => {
      if (!isCancelled) {
        setError({ kind: "load", message: "The sentiment model could not load. Check your connection, then retry." });
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [isTransitionActive]);

  const run = useCallback(async () => {
    const t = text.trim();
    if (!t || busy || phase !== "ready") return;
    setBusy(true);
    setError(null);
    let input: import("@tensorflow/tfjs").Tensor | null = null;
    let output: ModelOutput | null = null;
    try {
      const { tf, model, wordIndex } = await loadModel("sentiment");
      if (!wordIndex) throw new Error("The sentiment word index is unavailable.");
      input = tf.tensor([tokenize(t, wordIndex)], [1, MAX_LEN]);
      output = model.predict(input) as ModelOutput;
      const [firstOutput] = getModelOutputTensors(output);
      if (!firstOutput) throw new Error("The sentiment model returned no prediction.");
      const raw = (await firstOutput.data())[0];
      const s = raw * 2 - 1;
      setRes({ s, ...lexiconHits(t) });
      setLog((l) => [...l.slice(-4), { t, s }]);
    } catch {
      setError({
        kind: "inference",
        message: "The sentence could not be analyzed. Your text is still here; retry the prediction.",
      });
    } finally {
      input?.dispose();
      disposeModelOutput(output);
      setBusy(false);
    }
  }, [text, busy, phase]);

  const retryLoad = useCallback(() => {
    setError(null);
    void loadModel("sentiment").catch(() => {
      setError({ kind: "load", message: "The sentiment model still could not load. Check your connection and retry." });
    });
  }, []);

  const s = res ? res.s : 0;
  const color = verdictColor(s);

  return (
    <LabBody>
      <LabPanel>
        <div className="flex flex-col items-center pt-2 pb-1">
          <svg viewBox="0 0 200 116" className="w-[280px] max-w-full h-auto" aria-hidden="true">
            <path d="M18 104 A82 82 0 0 1 182 104" fill="none" stroke="var(--color-ink)" strokeWidth="2" />
            <path d="M18 104 A82 82 0 0 1 100 22" fill="none" stroke="var(--color-coral)" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
            <path d="M100 22 A82 82 0 0 1 182 104" fill="none" stroke="var(--color-teal)" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
            <text x="20" y="114" className="font-mono text-[9px] uppercase tracking-[1px]" fill="var(--color-coral)">neg</text>
            <text x="163" y="114" className="font-mono text-[9px] uppercase tracking-[1px]" fill="var(--color-teal)">pos</text>
            <g
              className="[transition:transform_0.6s_cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none"
              style={{ transform: `rotate(${s * 72}deg)`, transformOrigin: "100px 104px" }}
            >
              <line x1="100" y1="104" x2="100" y2="34" stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" />
              <circle cx="100" cy="34" r="4" fill={color} stroke="var(--color-ink)" strokeWidth="1.5" />
            </g>
            <circle cx="100" cy="104" r="7" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="2" />
          </svg>
          <div className="mt-1.5 font-accent font-semibold text-[34px] leading-none tracking-[-0.015em] max-wide:text-[32px]" style={{ color: res ? color : "var(--color-ink-faint)" }}>
            {res ? verdictLabel(s) : "…"}
            <span className="ml-2 font-display text-[16px] tracking-[-0.2px] text-ink-soft max-wide:text-[15px]">{res ? ` ${Math.round(Math.abs(s) * 100)}%` : ""}</span>
          </div>
        </div>
        <form
          className="flex items-center gap-2.5 mt-5 py-2 px-3 border-2 border-ink rounded-[4px] bg-paper focus-within:outline-3 focus-within:outline-offset-3 focus-within:outline-[var(--lxa,var(--color-teal))]"
          onSubmit={(event) => {
            event.preventDefault();
            void run();
          }}
        >
          <label htmlFor="sentiment-text" className="sr-only">
            Text to analyze
          </label>
          <input
            id="sentiment-text"
            name="sentimentText"
            type="text"
            autoComplete="off"
            className="flex-1 min-w-0 border-none bg-transparent font-display text-[17px] text-ink outline-none"
            value={text}
            placeholder="e.g. I loved every minute…"
            onChange={(event) => setText(event.target.value)}
          />
          <Button
            kind="box"
            type="submit"
            filled
            accent={accent}
            disabled={!text.trim() || busy || phase !== "ready"}
          >
            read
          </Button>
        </form>
        {error && (
          <div className={NOTE} role="alert">
            {error.message}{" "}
            <Button
              kind="box"
              size="sm"
              disabled={busy}
              onClick={error.kind === "load" ? retryLoad : run}
            >
              retry
            </Button>
          </div>
        )}
        {res && (
          <div className="flex flex-wrap gap-[7px] mt-4">
            {res.hits.map(([w, v], i) => (
              <span key={i} className={`py-[3px] px-2 rounded-[3px] font-mono text-[13px] max-wide:text-[11.5px] ${TOKEN_TONE[v > 0 ? "pos" : v < 0 ? "neg" : "neutral"]}`}>
                {w}
                {v !== 0 && (
                  <sup className="ml-px text-[9px]">
                    {v > 0 ? "+" : ""}
                    {v}
                  </sup>
                )}
              </span>
            ))}
          </div>
        )}
        {res && !res.matched && (
          <div className="faint mt-3 max-w-[340px] font-mono text-[11.5px] leading-[1.5] tracking-[-0.2px]">
            none of these words are in the highlight lexicon. the needle still read the whole sentence
          </div>
        )}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {res
            ? `Analysis complete. ${verdictLabel(res.s)}, ${Math.round(Math.abs(res.s) * 100)} percent.`
            : ""}
        </div>
      </LabPanel>
      <LabPanel out>
        <Label kind="caption" className="mb-2">$ history</Label>
        {error?.kind === "load" ? (
          <div className={`${NOTE} tracking-[-0.2px]`}>model unavailable. use retry above</div>
        ) : log.length === 0 ? (
          <BenchBoot
            id="sentiment"
            num="exp-002"
            modelFlag="lstm-imdb"
            sizeMB="10.2"
            readyHint="type a sentence ✎"
          />
        ) : (
          <div className="flex flex-col gap-[9px] mt-3">
            {[...log].reverse().map((h, i) => (
              <div key={i} className="flex justify-between gap-3.5 pb-2 border-b border-dashed border-b-[color:color-mix(in_oklab,var(--color-ink)_12%,transparent)] font-mono text-[12px] tracking-[-0.01em] max-wide:text-[11.5px]">
                <span className="faint overflow-hidden text-ellipsis whitespace-nowrap">$ {h.t}</span>
                <span style={{ color: verdictColor(h.s) }}>
                  {verdictLabel(h.s).toLowerCase()} · {Math.round(Math.abs(h.s) * 100)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </LabPanel>
    </LabBody>
  );
}
