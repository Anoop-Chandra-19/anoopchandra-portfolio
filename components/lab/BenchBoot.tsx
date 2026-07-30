import { useEffect, useMemo, useState } from "react";
import {
  subscribeModel,
  type LabModelId,
  type ModelPhase,
  type ModelProgress,
} from "@/lib/lab-models";

/* Terminal-style boot transcript for the output panel while a model loads —
   homage to the old site's terminal UI. Progress is real (loadGraphModel's
   onProgress); the only theater is a minimum stagger between lines so cached
   loads play a fast ~700ms pass instead of flashing. */

const PHASE_RANK: Record<ModelPhase, number> = {
  idle: 0,
  fetching: 0,
  wordindex: 1,
  warmup: 2,
  ready: 3,
  error: 3,
};

function bar(fraction: number): string {
  const n = Math.round(fraction * 10);
  return "▸".repeat(n) + "░".repeat(10 - n);
}

type BootLine = { key: string; cls?: string; text: React.ReactNode };

export default function BenchBoot({
  id,
  num,
  modelFlag,
  sizeMB,
  readyHint,
}: {
  id: LabModelId;
  num: string;
  modelFlag: string;
  sizeMB: string;
  readyHint: string;
}) {
  const [p, setP] = useState<ModelProgress>({ phase: "idle", fraction: 0, fromCache: false });
  useEffect(() => subscribeModel(id, setP), [id]);

  const rank = PHASE_RANK[p.phase];
  const lines = useMemo<BootLine[]>(() => {
    const out: BootLine[] = [
      { key: "cmd", cls: "faint", text: `$ ./wake ${num} --model ${modelFlag}` },
    ];
    if (p.phase === "error") {
      out.push({ key: "err", cls: "err", text: "✗ model failed to load — reload to retry" });
      return out;
    }
    out.push({
      key: "fetch",
      text:
        rank > 0 ? (
          <>
            fetching weights <span className="ok">✓</span>
            {p.fromCache ? " (cached)" : ` · ${sizeMB} MB`}
          </>
        ) : (
          `fetching weights ${bar(p.fraction)} ${Math.round(p.fraction * 100)}% · ${sizeMB} MB`
        ),
    });
    if (id === "sentiment" && rank >= 1) {
      out.push({
        key: "wi",
        text: rank > 1 ? <>loading word index <span className="ok">✓</span></> : "loading word index …",
      });
    }
    if (rank >= 2) {
      out.push({
        key: "warm",
        text: rank > 2 ? <>warming up gpu <span className="ok">✓</span></> : "warming up gpu …",
      });
    }
    if (p.phase === "ready") {
      out.push({ key: "ready", cls: "ready", text: `ready — ${readyHint}` });
    }
    return out;
  }, [id, num, modelFlag, sizeMB, readyHint, p, rank]);

  // Stagger newly available lines so a cached load still reads as a sequence.
  const [shown, setShown] = useState(1);
  useEffect(() => {
    if (shown >= lines.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), 170);
    return () => clearTimeout(t);
  }, [shown, lines.length]);

  const visible = lines.slice(0, shown);
  const booting = p.phase !== "ready" && p.phase !== "error";

  return (
    <div className="lx-boot" aria-live="polite">
      {visible.map((l, i) => (
        <div key={l.key} className={`lx-boot-line${l.cls ? ` ${l.cls}` : ""}`}>
          {l.text}
          {(booting || shown < lines.length) && i === visible.length - 1 && (
            <span className="lx-boot-cursor" />
          )}
        </div>
      ))}
    </div>
  );
}
