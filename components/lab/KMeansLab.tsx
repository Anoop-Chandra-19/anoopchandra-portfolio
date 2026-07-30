import { useEffect, useRef, useState } from "react";
import type { LabAccent } from "@/lib/lab-meta";
import LabButton from "./LabButton";

/* The real K-Means loop (assign → mean-update, ported from main's
   PlaygroundDemo) at the design's presentation pace: one Lloyd's step per
   650ms tick, CSS-transitioned centroids, converge when total centroid
   shift < 0.004. Coordinates are normalized 0..1 over the field. */

const CLUSTER_COLORS = ["electric", "teal", "coral", "navy"] as const;
const TICK_MS = 650;
const CONVERGED_SHIFT = 0.004;
const MAX_STEPS = 30;

type Pt = { x: number; y: number; c: number };
type Cent = { x: number; y: number };
type Field = { pts: Pt[]; cents: Cent[]; iter: number; done: boolean };

function step(f: Field): Field {
  const assigned = f.pts.map((p) => {
    let best = 0;
    let bestD = Infinity;
    f.cents.forEach((c, ci) => {
      const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = ci;
      }
    });
    return best;
  });
  const cents = f.cents.map((c, ci) => {
    const members = f.pts.filter((_, i) => assigned[i] === ci);
    if (!members.length) return c;
    return {
      x: members.reduce((a, p) => a + p.x, 0) / members.length,
      y: members.reduce((a, p) => a + p.y, 0) / members.length,
    };
  });
  const shift = cents.reduce((a, c, i) => a + Math.hypot(c.x - f.cents[i].x, c.y - f.cents[i].y), 0);
  const iter = f.iter + 1;
  return {
    pts: f.pts.map((p, i) => ({ ...p, c: assigned[i] })),
    cents,
    iter,
    done: shift < CONVERGED_SHIFT || iter >= MAX_STEPS,
  };
}

export default function KMeansLab({ accent }: { accent: LabAccent }) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(3);
  const [running, setRunning] = useState(false);
  const [field, setField] = useState<Field>({ pts: [], cents: [], iter: 0, done: false });

  const add = (e: React.PointerEvent) => {
    if (running) return;
    const r = fieldRef.current!.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;
    setField((f) => ({ ...f, pts: [...f.pts, { x, y, c: -1 }], done: false }));
  };

  const scatter = () => {
    if (running) return;
    const pts: Pt[] = [];
    for (let b = 0; b < 3; b++) {
      const cx = 0.2 + Math.random() * 0.6;
      const cy = 0.2 + Math.random() * 0.6;
      for (let i = 0; i < 11; i++) {
        pts.push({
          x: Math.min(0.97, Math.max(0.03, cx + (Math.random() - 0.5) * 0.26)),
          y: Math.min(0.97, Math.max(0.03, cy + (Math.random() - 0.5) * 0.26)),
          c: -1,
        });
      }
    }
    setField({ pts, cents: [], iter: 0, done: false });
  };

  const clear = () => {
    setRunning(false);
    setField({ pts: [], cents: [], iter: 0, done: false });
  };

  const start = () => {
    setField((f) => {
      if (f.pts.length < k) return f;
      const idx = [...f.pts.keys()].sort(() => Math.random() - 0.5).slice(0, k);
      setRunning(true);
      return { pts: f.pts, cents: idx.map((i) => ({ x: f.pts[i].x, y: f.pts[i].y })), iter: 0, done: false };
    });
  };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setField((f) => {
        const next = step(f);
        if (next.done) setRunning(false);
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [running]);

  const { pts, cents, iter, done } = field;

  return (
    <div className="lx-body lx-kbody">
      <div className="lx-panel">
        <div ref={fieldRef} className="lx-kfield" onPointerDown={add}>
          {pts.map((p, i) => (
            <span
              key={i}
              className="lx-kpt"
              style={{
                left: `${p.x * 100}%`,
                top: `${p.y * 100}%`,
                background: p.c >= 0 ? `var(--color-${CLUSTER_COLORS[p.c]})` : "var(--color-paper)",
              }}
            />
          ))}
          {cents.map((c, i) => (
            <span
              key={`c${i}`}
              className="lx-kcent"
              style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%`, color: `var(--color-${CLUSTER_COLORS[i]})` }}
            >
              ✕
            </span>
          ))}
          {!pts.length && (
            <span className="lx-kfield-hint">click anywhere to drop points ··· or scatter ↓</span>
          )}
        </div>
        <div className="lx-krow">
          <span className="mono faint">k =</span>
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              className={"lx-kbtn" + (k === n ? " on" : "")}
              disabled={running}
              onClick={() => setK(n)}
              style={k === n ? ({ "--lxa": `var(--color-${accent})` } as React.CSSProperties) : undefined}
            >
              {n}
            </button>
          ))}
          <span className="lx-krow-sp" />
          <LabButton sm onClick={scatter} disabled={running}>
            scatter
          </LabButton>
          <LabButton accent={accent} sm onClick={start} disabled={running || pts.length < k}>
            ▸ run
          </LabButton>
          <LabButton sm onClick={clear} disabled={running}>
            clear
          </LabButton>
        </div>
      </div>
      <div className="lx-panel lx-out">
        <div className="mono faint lx-cap">$ kmeans --k {k}</div>
        <div className="lx-kstat">
          {running
            ? `iterating… step ${iter}`
            : done
              ? `✓ converged in ${iter} steps`
              : pts.length
                ? `${pts.length} points ready · pick k, then run`
                : "drop some points to begin"}
        </div>
        <div className="lx-klegend">
          {Array.from({ length: k }).map((_, i) => (
            <span key={i} className="mono lx-kleg-row">
              <span className="lx-kdot" style={{ background: `var(--color-${CLUSTER_COLORS[i]})` }} />
              cluster {i + 1}
              <span className="faint">· {pts.filter((p) => p.c === i).length} pts</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
