import { useCallback, useEffect, useRef, useState } from "react";
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
import LabButton from "./LabButton";
import BenchBoot from "./BenchBoot";

/* Drawing pad + the QuickDraw CNN from the old site (public/models/doodle).
   The model expects what main's demo fed it: [1,28,28,1] grayscale, 0..255,
   strokes bright on black. The pad here draws ink-on-paper, so preprocessing
   bbox-crops the sketch, centers it into the 28×28 field, and inverts. */

const CLASS_NAMES = [
  "The Eiffel Tower", "The Great Wall of China", "The Mona Lisa", "aircraft carrier", "airplane", "alarm clock",
  "ambulance", "angel", "animal migration", "ant", "anvil", "apple", "arm", "asparagus", "axe", "backpack", "banana",
  "bandage", "barn", "baseball", "baseball bat", "basket", "basketball", "bat", "bathtub", "beach", "bear", "beard",
  "bed", "bee", "belt", "bench", "bicycle", "binoculars", "bird", "birthday cake", "blackberry", "blueberry",
  "book", "boomerang", "bottlecap", "bowtie", "bracelet", "brain", "bread", "bridge", "broccoli", "broom", "bucket", "bulldozer",
];

const FIELD = 28;
const FIELD_PAD = 3;

type LabError = { kind: "load" | "inference"; message: string };

export default function DoodleLab({ accent }: { accent: LabAccent }) {
  const { active: isTransitionActive } = useInkTransition();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [has, setHas] = useState(false);
  const [busy, setBusy] = useState(false);
  const [guesses, setGuesses] = useState<{ name: string; p: number }[] | null>(null);
  const [phase, setPhase] = useState<ModelPhase>("idle");
  const [error, setError] = useState<LabError | null>(null);

  useEffect(() => subscribeModel("doodle", (p) => setPhase(p.phase)), []);
  useEffect(() => {
    if (isTransitionActive) return;
    let isCancelled = false;
    loadModel("doodle").catch(() => {
      if (!isCancelled) {
        setError({ kind: "load", message: "The drawing model could not load. Check your connection, then retry." });
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [isTransitionActive]);

  /** 28×28 model input (0..255, bright strokes on black), or null if empty */
  const modelField = useCallback((): Float32Array | null => {
    const c = canvasRef.current;
    if (!c) return null;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    const img = ctx.getImageData(0, 0, c.width, c.height).data;
    // bbox of drawn ink — the pad is transparent, so scan the alpha channel
    let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
    for (let y = 0; y < c.height; y += 2) {
      for (let x = 0; x < c.width; x += 2) {
        if (img[(y * c.width + x) * 4 + 3] > 60) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    }
    if (x1 < 0) return null;
    const pad = 8;
    x0 = Math.max(0, x0 - pad);
    y0 = Math.max(0, y0 - pad);
    x1 = Math.min(c.width, x1 + pad);
    y1 = Math.min(c.height, y1 + pad);
    const w = x1 - x0;
    const h = y1 - y0;

    const t = document.createElement("canvas");
    t.width = FIELD;
    t.height = FIELD;
    const tx = t.getContext("2d")!;
    tx.fillStyle = "#fff";
    tx.fillRect(0, 0, FIELD, FIELD);
    const box = FIELD - FIELD_PAD * 2;
    const s = box / Math.max(w, h);
    const dw = w * s;
    const dh = h * s;
    tx.drawImage(c, x0, y0, w, h, (FIELD - dw) / 2, (FIELD - dh) / 2, dw, dh);

    const d = tx.getImageData(0, 0, FIELD, FIELD).data;
    const f = new Float32Array(FIELD * FIELD);
    for (let i = 0; i < f.length; i++) f[i] = 255 - d[i * 4];
    return f;
  }, []);

  const updatePreview = useCallback(() => {
    const pc = previewRef.current;
    if (!pc) return;
    const px = pc.getContext("2d")!;
    px.fillStyle = "#000";
    px.fillRect(0, 0, FIELD, FIELD);
    const f = modelField();
    if (!f) return;
    const id = px.createImageData(FIELD, FIELD);
    for (let i = 0; i < f.length; i++) {
      id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = f[i];
      id.data[i * 4 + 3] = 255;
    }
    px.putImageData(id, 0, 0);
  }, [modelField]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.lineWidth = 15;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#2a2a2a";
    let drawing = false;
    const pos = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      return [((e.clientX - r.left) * c.width) / r.width, ((e.clientY - r.top) * c.height) / r.height] as const;
    };
    const down = (e: PointerEvent) => {
      drawing = true;
      setGuesses(null);
      setError((current) => (current?.kind === "load" ? current : null));
      const [x, y] = pos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      try {
        c.setPointerCapture(e.pointerId);
      } catch {}
    };
    const move = (e: PointerEvent) => {
      if (!drawing) return;
      e.preventDefault();
      setHas(true);
      const [x, y] = pos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    };
    const up = () => {
      if (!drawing) return;
      drawing = false;
      updatePreview();
    };
    c.addEventListener("pointerdown", down);
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerup", up);
    c.addEventListener("pointerleave", up);
    return () => {
      c.removeEventListener("pointerdown", down);
      c.removeEventListener("pointermove", move);
      c.removeEventListener("pointerup", up);
      c.removeEventListener("pointerleave", up);
    };
  }, [updatePreview]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  const classify = useCallback(async () => {
    const f = modelField();
    if (!f) return;
    setBusy(true);
    setError(null);
    let input: import("@tensorflow/tfjs").Tensor | null = null;
    let output: ModelOutput | null = null;
    try {
      const { tf, model } = await loadModel("doodle");
      input = tf.tensor4d(f, [1, FIELD, FIELD, 1]);
      output = model.predict(input) as ModelOutput;
      const [firstOutput] = getModelOutputTensors(output);
      if (!firstOutput) throw new Error("The drawing model returned no prediction.");
      const data = await firstOutput.data();
      setGuesses(
        Array.from(data)
          .map((p, i) => ({ name: CLASS_NAMES[i], p }))
          .sort((a, b) => b.p - a.p)
          .slice(0, 4)
      );
    } catch {
      setError({
        kind: phase === "error" ? "load" : "inference",
        message:
          phase === "error"
            ? "The drawing model could not load. Check your connection, then retry."
            : "The sketch could not be classified. Your drawing is still here; retry the prediction.",
      });
    } finally {
      input?.dispose();
      disposeModelOutput(output);
      setBusy(false);
    }
  }, [modelField, phase]);

  const retryLoad = useCallback(() => {
    setError(null);
    void loadModel("doodle").catch(() => {
      setError({ kind: "load", message: "The drawing model still could not load. Check your connection and retry." });
    });
  }, []);

  const drawSample = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.lineWidth = 15;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.rect(65, 45, 230, 270);
    ctx.moveTo(225, 135);
    ctx.arc(180, 135, 45, 0, Math.PI * 2);
    ctx.moveTo(110, 275);
    ctx.bezierCurveTo(120, 215, 240, 215, 250, 275);
    ctx.moveTo(145, 127);
    ctx.bezierCurveTo(150, 85, 210, 85, 215, 127);
    ctx.stroke();
    setHas(true);
    setGuesses(null);
    setError((current) => (current?.kind === "load" ? current : null));
    updatePreview();
  }, [updatePreview]);

  const clear = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    setHas(false);
    setGuesses(null);
    setError((current) => (current?.kind === "load" ? current : null));
    updatePreview();
  }, [updatePreview]);

  return (
    <div className="lx-body">
      <div className="lx-panel">
        <div id="doodle-instructions" className="mono faint lx-cap">
          draw here ✎ · keyboard: use sample portrait
        </div>
        <div className="lx-canvaswrap">
          <canvas
            ref={canvasRef}
            width={360}
            height={360}
            className="lx-canvas"
            aria-label="Drawing pad"
            aria-describedby="doodle-instructions"
          />
          {!has && <span className="lx-canvas-hint">try a portrait, bird, bee…</span>}
        </div>
        <div className="lx-prevrow">
          <div>
            <div className="mono faint lx-cap">model input · {FIELD}×{FIELD}</div>
            <canvas ref={previewRef} width={FIELD} height={FIELD} className="lx-prev" />
          </div>
          <div className="lx-toolcol">
            <LabButton accent={accent} disabled={!has || busy || phase !== "ready"} onClick={classify}>
              ▸ classify
            </LabButton>
            <button type="button" className="lx-btn sm" disabled={busy} onClick={drawSample}>
              sample portrait
            </button>
            <LabButton sm disabled={!has} onClick={clear}>
              clear
            </LabButton>
          </div>
        </div>
      </div>
      <div className="lx-panel lx-out">
        <div className="mono faint lx-cap">$ classify ./sketch.png</div>
        {error ? (
          <div className="lx-cnote" role="alert">
            {error.message}{" "}
            <button
              type="button"
              className="lx-btn sm"
              disabled={busy}
              onClick={error.kind === "load" ? retryLoad : classify}
            >
              retry
            </button>
          </div>
        ) : guesses ? (
          <ul className="lx-guess">
            {guesses.map((g, i) => (
              <li key={g.name}>
                <span className="mono lx-g-rank">{i + 1}.</span>
                <span className="lx-g-name">{g.name}</span>
                <span className="lx-bar">
                  <span className="lx-bar-fill" style={{ width: `${Math.round(g.p * 100)}%` }} />
                </span>
                <span className="mono lx-g-pct">{Math.round(g.p * 100)}%</span>
              </li>
            ))}
          </ul>
        ) : (
          <BenchBoot
            id="doodle"
            num="exp-001"
            modelFlag="cnn-quickdraw"
            sizeMB="1.9"
            readyHint="draw a shape, then classify ✎"
          />
        )}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {guesses?.[0]
            ? `Classification complete. Best match: ${guesses[0].name}, ${Math.round(guesses[0].p * 100)} percent.`
            : ""}
        </div>
      </div>
    </div>
  );
}
