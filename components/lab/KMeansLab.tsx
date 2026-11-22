import { useEffect, useRef, useState } from "react";
import type { LabAccent } from "@/lib/lab-meta";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import { CONTROL_ROW, FIELD, FIELD_HINT, LEGEND, LEGEND_DOT, LEGEND_ROW, LabBody, LabPanel, MARK, POINT, STATUS } from "./lab-ui";

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
  const pressedArrowKeysRef = useRef(new Set<string>());
  const [k, setK] = useState(3);
  const [running, setRunning] = useState(false);
  const [field, setField] = useState<Field>({ pts: [], cents: [], iter: 0, done: false });
  const [cursor, setCursor] = useState<Cent>({ x: 0.5, y: 0.5 });
  const [isKeyboardCursorActive, setIsKeyboardCursorActive] = useState(false);

  const addPoint = (x: number, y: number) => {
    if (running || x < 0 || x > 1 || y < 0 || y > 1) return;
    setField((f) => ({ ...f, pts: [...f.pts, { x, y, c: -1 }], done: false }));
  };

  const add = (event: React.PointerEvent) => {
    setIsKeyboardCursorActive(false);
    const fieldElement = fieldRef.current;
    if (!fieldElement) return;
    const rect = fieldElement.getBoundingClientRect();
    addPoint((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
  };

  const moveCursor = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (running) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (event.repeat) return;
      setIsKeyboardCursorActive(true);
      addPoint(cursor.x, cursor.y);
      return;
    }
    if (!event.key.startsWith("Arrow")) return;

    event.preventDefault();
    pressedArrowKeysRef.current.add(event.key);
    const amount = event.shiftKey ? 0.1 : 0.05;
    const horizontal = Number(pressedArrowKeysRef.current.has("ArrowRight")) - Number(pressedArrowKeysRef.current.has("ArrowLeft"));
    const vertical = Number(pressedArrowKeysRef.current.has("ArrowDown")) - Number(pressedArrowKeysRef.current.has("ArrowUp"));
    setIsKeyboardCursorActive(true);
    setCursor((current) => ({
      x: Math.min(0.97, Math.max(0.03, current.x + horizontal * amount)),
      y: Math.min(0.97, Math.max(0.03, current.y + vertical * amount)),
    }));
  };

  const releaseCursorKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    pressedArrowKeysRef.current.delete(event.key);
  };

  const deactivateKeyboardCursor = () => {
    pressedArrowKeysRef.current.clear();
    setIsKeyboardCursorActive(false);
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
    <LabBody field>
      <LabPanel>
        <div
          ref={fieldRef}
          className={FIELD}
          role="application"
          tabIndex={0}
          aria-label="K-means point field. Use arrow keys to move the cursor, hold two arrow keys to move diagonally, and hold Shift for larger steps. Press Enter or Space to place a point."
          aria-disabled={running}
          onBlur={deactivateKeyboardCursor}
          onKeyDown={moveCursor}
          onKeyUp={releaseCursorKey}
          onPointerDown={add}
        >
          {pts.map((p, i) => (
            <span
              key={i}
              className={POINT}
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
              className={MARK}
              style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%`, color: `var(--color-${CLUSTER_COLORS[i]})` }}
            >
              ✕
            </span>
          ))}
          {isKeyboardCursorActive && !running && (
            <span
              className={MARK}
              aria-hidden="true"
              style={{ left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%`, color: `var(--color-${accent})` }}
            >
              +
            </span>
          )}
          {!pts.length && (
            <span className={FIELD_HINT}>click to place points · tab into the field for keyboard controls</span>
          )}
        </div>
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {`${pts.length} points placed. Cursor at ${Math.round(cursor.x * 100)}, ${Math.round(cursor.y * 100)} percent.`}
        </div>
        <div className={CONTROL_ROW}>
          <span className="font-mono text-[13px] tracking-[-0.2px] faint">k =</span>
          {[2, 3, 4].map((n) => (
            <Button
              key={n}
              kind="key"
              pressed={k === n}
              accent={accent}
              disabled={running}
              onClick={() => setK(n)}
            >
              {n}
            </Button>
          ))}
          <span className="flex-1" />
          <Button kind="box" size="sm" onClick={scatter} disabled={running}>
            scatter
          </Button>
          <Button kind="box" size="sm" filled accent={accent} onClick={start} disabled={running || pts.length < k}>
            ▸ run
          </Button>
          <Button kind="box" size="sm" onClick={clear} disabled={running}>
            clear
          </Button>
        </div>
      </LabPanel>
      <LabPanel out>
        <Label kind="caption" className="mb-2">$ kmeans --k {k}</Label>
        <div className={STATUS}>
          {running
            ? `iterating… step ${iter}`
            : done
              ? `✓ converged in ${iter} steps`
              : pts.length
                ? `${pts.length} points ready · pick k, then run`
                : "drop some points to begin"}
        </div>
        <div className={LEGEND}>
          {Array.from({ length: k }).map((_, i) => (
            <span key={i} className={LEGEND_ROW}>
              <span className={LEGEND_DOT} style={{ background: `var(--color-${CLUSTER_COLORS[i]})` }} />
              cluster {i + 1}
              <span className="faint">· {pts.filter((p) => p.c === i).length} pts</span>
            </span>
          ))}
        </div>
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {done
            ? `K-means complete. ${pts.length} points grouped into ${cents.length} clusters in ${iter} steps.`
            : ""}
        </div>
      </LabPanel>
    </LabBody>
  );
}
