import { useEffect, useRef, useState } from "react";
import type { LabAccent } from "@/lib/lab-meta";
import LabButton from "./LabButton";

/* A single-layer perceptron trained on normalized user points. One waypoint is
   recorded per epoch, then replayed at constant visual speed along the smoothed
   path. */

const CLASS_COLORS = ["electric", "coral"] as const;
const LR = 0.13;
const EPOCHS = 26;
const MIN_EPOCHS = 1;
const MAX_EPOCHS = 40;
/* playback pace: ms per unit of boundary travel across the field, clamped so
   a two-step convergence still reads and a thrashing non-separable run
   doesn't drag */
const MS_PER_UNIT = 1600;
const MIN_MS = 1400;
const MAX_MS = 6500;

type Pt = { x: number; y: number; l: 0 | 1 };
type Cursor = { x: number; y: number };
type W = [number, number, number]; // bias, x, y
type Key = { w: W; epoch: number };
type Playback = { keys: Key[]; path: W[]; cum: number[]; total: number; T: number };

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/* Visual distance between two boundaries: how far the line moved, sampled at
   the field's corners and centre. Signed distance is clamped — once the
   boundary is this far from a probe point it's off-field and moving it
   further looks like nothing — which also keeps the metric finite when the
   weight vector passes near zero. Interpolating raw weights (rather than
   angle+offset) matters for the same reason: it has no singularity. */
const PROBE: [number, number][] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
  [0.5, 0.5],
];
const FAR = 1.5;

function signedDist(w: W, x: number, y: number) {
  const n = Math.hypot(w[1], w[2]);
  const d = n < 1e-6 ? (w[0] >= 0 ? FAR : -FAR) : (w[0] + w[1] * x + w[2] * y) / n;
  return Math.max(-FAR, Math.min(FAR, d));
}

function visualDist(a: W, b: W) {
  let s = 0;
  for (const [x, y] of PROBE) s += Math.abs(signedDist(a, x, y) - signedDist(b, x, y));
  return s / PROBE.length;
}

/* Round the corners of the weight path. The raw trajectory changes direction
   at every update and the eye reads those kinks as stutter; endpoints are
   pinned so the run still lands on the real trained weights. */
function smoothPath(src: W[], passes = 2): W[] {
  let cur = src.map((w) => [...w] as W);
  for (let p = 0; p < passes; p++) {
    const next = cur.map((w) => [...w] as W);
    for (let i = 1; i < cur.length - 1; i++)
      for (let c = 0; c < 3; c++)
        next[i][c] = cur[i - 1][c] * 0.25 + cur[i][c] * 0.5 + cur[i + 1][c] * 0.25;
    cur = next;
  }
  return cur;
}

/* half-plane w0+w1x+w2y>=0 clipped to the unit square: filled region + the
   boundary segment */
function clipHalfPlane(w: W) {
  const sq: [number, number][] = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ];
  const f = (p: [number, number]) => w[0] + w[1] * p[0] + w[2] * p[1];
  const poly: [number, number][] = [];
  const seg: [number, number][] = [];
  for (let i = 0; i < 4; i++) {
    const a = sq[i];
    const b = sq[(i + 1) % 4];
    const fa = f(a);
    const fb = f(b);
    if (fa >= 0) poly.push(a);
    if (fa >= 0 !== fb >= 0) {
      const t = fa / (fa - fb);
      const p: [number, number] = [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
      poly.push(p);
      seg.push(p);
    }
  }
  return { poly, seg: seg.length === 2 ? seg : null };
}

function accuracy(pts: Pt[], w: W) {
  if (!pts.length) return 0;
  let ok = 0;
  pts.forEach((p) => {
    if ((w[0] + w[1] * p.x + w[2] * p.y > 0 ? 1 : 0) === p.l) ok++;
  });
  return ok / pts.length;
}

export default function PerceptronLab({ accent }: { accent: LabAccent }) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [pts, setPts] = useState<Pt[]>([]);
  const [cls, setCls] = useState<0 | 1>(0);
  const [w, setW] = useState<W | null>(null); // final weights once playback lands
  const [dw, setDw] = useState<W | null>(null); // boundary as currently drawn
  const [keys, setKeys] = useState<Key[]>([]);
  const [ki, setKi] = useState(0); // keyframe the boundary is moving toward
  const [conv, setConv] = useState(-1);
  const [training, setTraining] = useState(false);
  const [epochs, setEpochs] = useState(EPOCHS);
  const epochsRef = useRef(EPOCHS);
  const [cursor, setCursor] = useState<Cursor>({ x: 0.5, y: 0.5 });
  const [isKeyboardCursorActive, setIsKeyboardCursorActive] = useState(false);
  const playRef = useRef<Playback | null>(null);

  // epochs stepper with press-and-hold auto-repeat (accelerating), so getting
  // from 26 down to a value that visibly fails isn't 20-odd clicks
  const holdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endHold = () => {
    if (holdRef.current) {
      clearTimeout(holdRef.current);
      holdRef.current = null;
    }
  };
  const adjustEpochs = (difference: number): boolean => {
    if (training) return false;
    const next = Math.max(MIN_EPOCHS, Math.min(MAX_EPOCHS, epochsRef.current + difference));
    if (next === epochsRef.current) return false;
    epochsRef.current = next;
    setEpochs(next);
    return true;
  };
  const startHold = (difference: number) => {
    if (!adjustEpochs(difference)) return;
    let delay = 320;
    const tick = () => {
      if (!adjustEpochs(difference)) {
        holdRef.current = null;
        return;
      }
      delay = Math.max(45, delay - 55);
      holdRef.current = setTimeout(tick, delay);
    };
    holdRef.current = setTimeout(tick, delay);
  };
  useEffect(() => endHold, []);

  const addPoint = (x: number, y: number) => {
    if (training || x < 0 || x > 1 || y < 0 || y > 1) return;
    setPts((points) => [...points, { x, y, l: cls }]);
    setW(null);
    setDw(null);
  };

  const add = (event: React.PointerEvent) => {
    setIsKeyboardCursorActive(false);
    const fieldElement = fieldRef.current;
    if (!fieldElement) return;
    const rect = fieldElement.getBoundingClientRect();
    addPoint((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
  };

  const moveCursor = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || training) return;
    const amount = event.shiftKey ? 0.1 : 0.05;
    const movement: Partial<Cursor> = {};
    if (event.key === "ArrowLeft") movement.x = -amount;
    else if (event.key === "ArrowRight") movement.x = amount;
    else if (event.key === "ArrowUp") movement.y = -amount;
    else if (event.key === "ArrowDown") movement.y = amount;
    else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsKeyboardCursorActive(true);
      addPoint(cursor.x, cursor.y);
      return;
    } else {
      return;
    }
    event.preventDefault();
    setIsKeyboardCursorActive(true);
    setCursor((current) => ({
      x: Math.min(0.97, Math.max(0.03, current.x + (movement.x ?? 0))),
      y: Math.min(0.97, Math.max(0.03, current.y + (movement.y ?? 0))),
    }));
  };

  const flip = (index: number) => {
    if (training) return;
    setPts((points) => points.map((point, pointIndex) => (pointIndex === index ? { ...point, l: point.l ? 0 : 1 } : point)));
    setW(null);
    setDw(null);
  };

  const scatter = () => {
    if (training) return;
    const out: Pt[] = [];
    (
      [
        [0.32, 0.34],
        [0.68, 0.68],
      ] as const
    ).forEach((c, l) => {
      for (let i = 0; i < 9; i++) {
        out.push({
          x: Math.min(0.96, Math.max(0.04, c[0] + (Math.random() - 0.5) * 0.3)),
          y: Math.min(0.96, Math.max(0.04, c[1] + (Math.random() - 0.5) * 0.3)),
          l: l as 0 | 1,
        });
      }
    });
    setPts(out);
    setW(null);
    setDw(null);
  };

  const clear = () => {
    setPts([]);
    setW(null);
    setDw(null);
    setTraining(false);
  };

  const ready = pts.length >= 2 && new Set(pts.map((p) => p.l)).size === 2;

  const train = () => {
    if (!ready) return;
    const th0 = Math.random() * Math.PI * 2;
    const px = 0.34 + Math.random() * 0.32;
    const py = 0.34 + Math.random() * 0.32;
    const v: W = [-(Math.cos(th0) * px + Math.sin(th0) * py), Math.cos(th0), Math.sin(th0)];
    const mis = (q: W) =>
      pts.reduce((a, p) => a + ((q[0] + q[1] * p.x + q[2] * p.y > 0 ? 1 : 0) === p.l ? 0 : 1), 0);
    if (mis(v) === 0) {
      // never start already-correct
      v[0] = -v[0];
      v[1] = -v[1];
      v[2] = -v[2];
    }
    // record one waypoint per epoch (the line's net position after the whole
    // pass), not per update — replaying every intra-epoch nudge makes the
    // boundary thrash back and forth as it fixes one point and breaks another
    const ks: Key[] = [{ w: [...v] as W, epoch: 1 }];
    let convergedAt = -1;
    for (let e = 0; e < epochs; e++) {
      let changed = 0;
      for (const p of pts) {
        const yh = v[0] + v[1] * p.x + v[2] * p.y > 0 ? 1 : 0;
        const err = p.l - yh;
        if (err) {
          changed++;
          v[0] += LR * err;
          v[1] += LR * err * p.x;
          v[2] += LR * err * p.y;
        }
      }
      if (changed) ks.push({ w: [...v] as W, epoch: e + 1 });
      if (!changed) {
        convergedAt = e;
        break;
      }
    }
    const final = ks[ks.length - 1].w;
    const path = smoothPath(ks.map((k) => k.w));
    const cum = [0];
    for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + visualDist(path[i - 1], path[i]));
    const total = cum[cum.length - 1];
    setConv(convergedAt);
    setKeys(ks);
    if (total < 1e-6 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      playRef.current = null;
      setKi(ks.length - 1);
      setDw([...final] as W);
      setW([...final] as W);
      return;
    }
    playRef.current = {
      keys: ks,
      path,
      cum,
      total,
      T: Math.min(MAX_MS, Math.max(MIN_MS, total * MS_PER_UNIT)),
    };
    setKi(0);
    setDw([...path[0]] as W);
    setW(null);
    setTraining(true);
  };

  // replay the recorded path: one wall-clock timeline, eased, constant
  // visual speed via the cumulative-distance table
  useEffect(() => {
    if (!training) return;
    const p = playRef.current;
    if (!p) return;
    let raf = 0;
    let start = 0;
    let seg = 1;
    const frame = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / p.T);
      if (t >= 1) {
        const final = p.keys[p.keys.length - 1].w;
        setKi(p.keys.length - 1);
        setDw([...final] as W);
        setW([...final] as W);
        setTraining(false);
        return;
      }
      const s = p.total * easeInOutCubic(t);
      while (seg < p.path.length - 1 && p.cum[seg] < s) seg++;
      const span = p.cum[seg] - p.cum[seg - 1];
      const u = span > 1e-9 ? Math.min(1, (s - p.cum[seg - 1]) / span) : 1;
      const a = p.path[seg - 1];
      const b = p.path[seg];
      setKi(seg);
      setDw([
        a[0] + (b[0] - a[0]) * u,
        a[1] + (b[1] - a[1]) * u,
        a[2] + (b[2] - a[2]) * u,
      ]);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [training]);

  const acc = w ? accuracy(pts, w) : 0;
  const raw = dw && (Math.abs(dw[1]) > 1e-4 || Math.abs(dw[2]) > 1e-4) ? clipHalfPlane(dw) : null;
  const reg = raw && raw.seg ? raw : null;
  const cur = training && keys.length ? keys[Math.min(ki, keys.length - 1)] : null;
  const shownW = cur ? cur.w : w;

  return (
    <div className="lx-body lx-kbody">
      <div className="lx-panel">
        <div
          ref={fieldRef}
          className="lx-kfield"
          role="application"
          tabIndex={0}
          aria-label={`Perceptron point field. Current class ${cls ? "B" : "A"}. Use arrow keys to move the cursor; press Enter or Space to place a point.`}
          aria-disabled={training}
          onBlur={() => setIsKeyboardCursorActive(false)}
          onKeyDown={moveCursor}
          onPointerDown={add}
        >
          {reg && (
            <svg className="lx-cbnd" viewBox="0 0 1 1" preserveAspectRatio="none">
              {reg.poly.length > 2 && (
                <polygon
                  points={reg.poly.map((p) => p.join(",")).join(" ")}
                  fill={`color-mix(in oklab, var(--color-${CLASS_COLORS[1]}) 15%, transparent)`}
                />
              )}
              {reg.seg && (
                <line
                  x1={reg.seg[0][0]}
                  y1={reg.seg[0][1]}
                  x2={reg.seg[1][0]}
                  y2={reg.seg[1][1]}
                  stroke="var(--color-ink)"
                  strokeWidth="0.009"
                  strokeDasharray="0.032 0.024"
                  strokeLinecap="round"
                />
              )}
            </svg>
          )}
          {pts.map((p, i) => (
            <button
              key={i}
              type="button"
              className="lx-kpt lx-cpt"
              aria-label={`Point ${i + 1}, class ${p.l ? "B" : "A"}. Activate to flip its class.`}
              disabled={training}
              onPointerDown={(event) => {
                event.stopPropagation();
                setIsKeyboardCursorActive(false);
              }}
              onClick={() => flip(i)}
              style={{
                left: `${p.x * 100}%`,
                top: `${p.y * 100}%`,
                background: `var(--color-${CLASS_COLORS[p.l]})`,
              }}
            />
          ))}
          {isKeyboardCursorActive && !training && (
            <span
              className="lx-kcent"
              aria-hidden="true"
              style={{
                left: `${cursor.x * 100}%`,
                top: `${cursor.y * 100}%`,
                color: `var(--color-${CLASS_COLORS[cls]})`,
              }}
            >
              +
            </span>
          )}
          {!pts.length && (
            <span className="lx-kfield-hint">
              click to place points · focus + arrows to move · enter to place · activate a point to flip
            </span>
          )}
        </div>
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {`${pts.length} points placed. Cursor at ${Math.round(cursor.x * 100)}, ${Math.round(cursor.y * 100)} percent. Current class ${cls ? "B" : "A"}.`}
        </div>
        <div className="lx-krow">
          <span className="mono faint">class</span>
          <button
            type="button"
            className="lx-cswatch mono"
            aria-label={`Current point class ${cls ? "B" : "A"}. Activate to switch class.`}
            aria-pressed={cls === 1}
            disabled={training}
            onClick={() => setCls((c) => (c ? 0 : 1))}
            style={{ background: `var(--color-${CLASS_COLORS[cls]})` }}
          >
            {cls ? "B" : "A"}
          </button>
          <span className="mono faint lx-chint">click to switch</span>
          <span className="lx-krow-sp" />
          <LabButton sm onClick={scatter} disabled={training}>
            scatter
          </LabButton>
          <LabButton accent={accent} sm onClick={train} disabled={training || !ready}>
            ▸ train
          </LabButton>
          <LabButton sm onClick={clear} disabled={training}>
            clear
          </LabButton>
        </div>
        <div className="lx-krow">
          <span className="mono faint">epochs</span>
          <button
            type="button"
            className="lx-kbtn"
            aria-label="Fewer epochs"
            disabled={training || epochs <= MIN_EPOCHS}
            onClick={(event) => {
              if (event.detail === 0) adjustEpochs(-1);
            }}
            onPointerDown={(event) => {
              if (event.button === 0) startHold(-1);
            }}
            onPointerUp={endHold}
            onPointerLeave={endHold}
            onPointerCancel={endHold}
          >
            −
          </button>
          <output className="lx-epn mono" aria-label="Epoch count">
            {epochs}
          </output>
          <button
            type="button"
            className="lx-kbtn"
            aria-label="More epochs"
            disabled={training || epochs >= MAX_EPOCHS}
            onClick={(event) => {
              if (event.detail === 0) adjustEpochs(1);
            }}
            onPointerDown={(event) => {
              if (event.button === 0) startHold(1);
            }}
            onPointerUp={endHold}
            onPointerLeave={endHold}
            onPointerCancel={endHold}
          >
            +
          </button>
          <span className="mono faint lx-chint">max passes before it gives up</span>
        </div>
      </div>
      <div className="lx-panel lx-out">
        <div className="mono faint lx-cap">
          $ perceptron --lr {LR} --epochs {epochs}
        </div>
        <div className="lx-kstat">
          {training
            ? `training… epoch ${cur ? cur.epoch : 1}`
            : w
              ? `${Math.round(acc * 100)}% on the right side · ${
                  conv >= 0
                    ? `converged at epoch ${conv + 1}`
                    : `stopped after ${epochs} epoch${epochs === 1 ? "" : "s"}`
                }`
              : pts.length
                ? ready
                  ? "ready — hit train"
                  : "needs points in both colours"
                : "place a few points of each colour"}
        </div>
        <div className="lx-klegend">
          {CLASS_COLORS.map((c, i) => (
            <span key={i} className="mono lx-kleg-row">
              <span className="lx-kdot" style={{ background: `var(--color-${c})` }} />
              class {i ? "B" : "A"}
              <span className="faint">· {pts.filter((p) => p.l === i).length} pts</span>
            </span>
          ))}
        </div>
        {shownW && (
          <div className="mono lx-cw">w = [{shownW.map((v) => v.toFixed(2)).join(", ")}]</div>
        )}
        {w && !training && acc < 1 && (
          <div className="lx-cnote">
            {epochs >= EPOCHS
              ? "a straight line can't split these — that's the ceiling of a linear model."
              : `didn't converge in ${epochs} pass${epochs === 1 ? "" : "es"} — give it more epochs to keep going.`}
          </div>
        )}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {w && !training
            ? `Training complete. ${Math.round(acc * 100)} percent accuracy. ${
                conv >= 0 ? `Converged at epoch ${conv + 1}.` : "The model did not converge."
              }`
            : ""}
        </div>
      </div>
    </div>
  );
}
