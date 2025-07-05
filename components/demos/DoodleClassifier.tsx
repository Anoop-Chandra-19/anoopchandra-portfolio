"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";
import { motion, AnimatePresence } from "framer-motion";
import InfoModal from "../InfoModal";
import { FaGithub } from "react-icons/fa";
import { useDoodleModel } from "@/hooks/useDoodleModel";

const CLASS_NAMES = [
  "The Eiffel Tower", "The Great Wall of China", "The Mona Lisa", "aircraft carrier", "airplane", "alarm clock",
  "ambulance", "angel", "animal migration", "ant", "anvil", "apple", "arm", "asparagus", "axe", "backpack", "banana",
  "bandage", "barn", "baseball", "baseball bat", "basket", "basketball", "bat", "bathtub", "beach", "bear", "beard",
  "bed", "bee", "belt", "bench", "bicycle", "binoculars", "bird", "birthday cake", "blackberry", "blueberry",
  "book", "boomerang", "bottlecap", "bowtie", "bracelet", "brain", "bread", "bridge", "broccoli", "broom", "bucket", "bulldozer"
];

export default function DoodleClassifier() {
  const { predict, ready, loading, error: modelError } = useDoodleModel();

  // Strokes for undo
  const strokes = useRef<Array<Array<{ x: number; y: number }>>>([]);
  let currentStroke: Array<{ x: number; y: number }> = [];

  const [predicting, setPredicting] = useState(false);
  const [predictions, setPredictions] = useState<{ className: string; score: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [canvasDirty, setCanvasDirty] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  // ---- Drawing logic (mouse/touch) ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#fff";

    let drawing = false;

    function getPos(e: MouseEvent | TouchEvent) {
      if (!canvas) return [0, 0];
      if ("touches" in e) {
        const rect = canvas.getBoundingClientRect();
        return [
          e.touches[0].clientX - rect.left,
          e.touches[0].clientY - rect.top
        ];
      } else {
        const rect = canvas.getBoundingClientRect();
        return [
          (e as MouseEvent).clientX - rect.left,
          (e as MouseEvent).clientY - rect.top
        ];
      }
    }

    function startDraw(e: MouseEvent | TouchEvent) {
      if (!ctx) return;
      drawing = true;
      ctx.beginPath();
      const [x, y] = getPos(e);
      ctx.moveTo(x, y);
      currentStroke = [{ x, y }];
    }

    function draw(e: MouseEvent | TouchEvent) {
      if (!drawing || !ctx) return;
      e.preventDefault();
      setCanvasDirty(true);
      const [x, y] = getPos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
      currentStroke.push({ x, y });
    }

    function endDraw() {
      if (drawing && currentStroke.length) {
        strokes.current.push([...currentStroke]);
        currentStroke = [];
      }
      drawing = false;
    }

    // Mouse events
    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", endDraw);
    canvas.addEventListener("mouseleave", endDraw);
    // Touch events
    canvas.addEventListener("touchstart", startDraw);
    canvas.addEventListener("touchmove", draw);
    canvas.addEventListener("touchend", endDraw);

    return () => {
      canvas.removeEventListener("mousedown", startDraw);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", endDraw);
      canvas.removeEventListener("mouseleave", endDraw);
      canvas.removeEventListener("touchstart", startDraw);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", endDraw);
    };
    // eslint-disable-next-line
  }, []);

  // ---- Undo support ----
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#fff";
    for (const stroke of strokes.current) {
      ctx.beginPath();
      stroke.forEach(({ x, y }, i) => {
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
    updatePreview();
  }, []);

  function handleUndo() {
    strokes.current.pop();
    redraw();
    setCanvasDirty(strokes.current.length > 0);
  }

  // ---- Model input preview ----
  function updatePreview() {
    preprocess(true);
  }

  // ---- Preprocess canvas to [1,28,28,1] grayscale for model, update preview ----
  function preprocess(onlyPreview = false): tf.Tensor4D | void {
    const src = canvasRef.current!;
    const temp = document.createElement("canvas");
    temp.width = 28;
    temp.height = 28;
    const tctx = temp.getContext("2d")!;
    tctx.fillStyle = "#000";
    tctx.fillRect(0, 0, 28, 28);
    tctx.drawImage(src, 0, 0, 28, 28);

    // --- Update model input preview
    if (previewRef.current) {
      const pctx = previewRef.current.getContext("2d")!;
      pctx.clearRect(0, 0, 28, 28);
      pctx.drawImage(temp, 0, 0);
    }

    const img = tctx.getImageData(0, 0, 28, 28);
    const input = [];
    for (let i = 0; i < img.data.length; i += 4) {
      input.push(img.data[i]);
    }
    if (onlyPreview) return;
    return tf.tensor4d(input, [1, 28, 28, 1]);
  }

  // ---- Predict ----
  async function handlePredict() {
    if (!ready) return;
    setPredicting(true);
    setPredictions([]);
    setError(null);
    try {
      const input = preprocess() as tf.Tensor4D;
      const data = await predict(input); // predict is from hook
      const top = data
        .map((score, i) => ({ className: CLASS_NAMES[i], score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      setPredictions(top);
    } catch (e) {
      setError("Prediction failed.");
    } finally {
      setPredicting(false);
    }
  }

  // ---- Clear canvas ----
  function handleClear() {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx!.fillStyle = "#000";
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
    }
    strokes.current = [];
    setCanvasDirty(false);
    setPredictions([]);
    setError(null);
    updatePreview();
  }

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "Enter" || e.key === "Return")) {
        e.preventDefault();
        handlePredict();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "Backspace" || e.key === "Delete")) {
        e.preventDefault();
        handleClear();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line
  }, [canvasDirty, predicting, ready, predictions]);

  function handleHelp() {
    setModalOpen(true);
  }

  // ---- Render ----
  return (
    <motion.div
      className="flex flex-col items-center w-full"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 150, damping: 18 }}
      aria-live="polite"
    >
      <div className="flex flex-col md:flex-row gap-8 md:gap-14 items-center justify-center w-full max-w-2xl">
        {/* Drawing Canvas + Preview */}
        <div className="flex flex-col items-center">
          <div className="rounded-xl overflow-hidden shadow-xl border-2 border-[var(--color-electric)] bg-black relative">
            <canvas
              ref={canvasRef}
              width={280}
              height={280}
              aria-label="Drawing canvas"
              className="block touch-none"
              style={{
                touchAction: "none",
                width: "280px",
                height: "280px",
                background: "#000",
                cursor: "crosshair"
              }}
            />
            {!canvasDirty && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[var(--color-electric)] text-2xl font-mono opacity-60 select-none">Draw here!</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center mb-2 mt-2">
            <span className="font-mono text-xs text-white/60 mb-1">Model Input (28x28)</span>
            <canvas
              ref={previewRef}
              width={28}
              height={28}
              style={{
                width: "56px",
                height: "56px",
                border: "1px solid #888",
                background: "#000",
                imageRendering: "pixelated"
              }}
              aria-label="Model Input Preview"
            />
          </div>
        </div>

        {/* Controls & Results with Framer Motion Layout! */}
        <motion.div
          className="flex flex-col gap-4 w-full max-w-xs"
          layout
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
        >
          <div className="flex gap-4 justify-center">
            <button
              className="px-5 py-2 rounded-lg bg-[var(--color-electric)] text-white font-semibold border border-[var(--color-navy)] shadow hover:bg-[var(--color-coral)] transition"
              onClick={handlePredict}
              disabled={!canvasDirty || predicting || !ready}
              aria-disabled={!canvasDirty || predicting || !ready}
            >
              {predicting ? "Predicting..." : "Predict"}
            </button>
            <button
              className="px-5 py-2 rounded-lg bg-black text-white font-semibold border border-[var(--color-navy)] shadow hover:bg-[var(--color-electric)]/80 transition"
              onClick={handleClear}
              disabled={!canvasDirty && strokes.current.length === 0}
            >
              Clear
            </button>
          </div>
          <div className="flex flex-col items-center font-mono text-xs text-white/40 mb-1">
            <span>Shortcuts:</span>
            <span>
              <b>Ctrl+Z</b> Undo &nbsp; | &nbsp; <b>Ctrl+Enter</b> Predict &nbsp; | &nbsp; <b>Ctrl+Backspace</b> Clear
            </span>
          </div>
          <AnimatePresence mode="wait">
            {predictions.length > 0 && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ type: "spring", stiffness: 180, damping: 22 }}
                className="mt-2 w-full"
                layout
              >
                <div className="bg-black border border-purple-700 rounded-lg p-3 font-mono shadow-inner mb-2 min-h-[110px] text-left">
                  <div className="mb-2 text-green-300 text-xs font-mono">
                    $ doodle predict ./drawing.png
                  </div>
                  <ul className="space-y-3">
                    {predictions.map((p, i) => (
                      <li key={p.className} className="flex items-center gap-2">
                        <span className="text-green-400 font-bold text-base w-5 text-right select-none">{i + 1}.</span>
                        <span className="font-mono text-sm text-white w-36 truncate">{p.className}</span>
                        <div className="flex-1 ml-2">
                          <div className="relative w-full h-3 bg-[#232139] rounded">
                            <motion.div
                              className="absolute top-0 left-0 h-3 rounded bg-gradient-to-r from-[var(--color-electric)] via-green-400 to-[var(--color-coral)]"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.round(p.score * 100)}%` }}
                              transition={{ duration: 0.6, delay: i * 0.1 }}
                              style={{
                                boxShadow: "0 1px 8px 1px rgba(22,255,170,0.12)",
                                minWidth: 8
                              }}
                            />
                          </div>
                        </div>
                        <span className="font-mono text-xs text-green-300 ml-3" style={{ minWidth: 32 }}>
                          {Math.round(p.score * 100)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {(error || modelError) && (
            <div className="mt-2 text-center text-[var(--color-coral)] font-mono">
              {error || modelError}
            </div>
          )}

          <div className="pt-2 text-xs text-white/50 text-center">
            {loading
              ? "Loading model..."
              : "Draw a quick sketch, then hit Predict!"}
          </div>
        </motion.div>
      </div>

      {/* How it works / Info modal trigger */}
      <div className="mt-5 text-xs text-white/40">
        <button
          className="underline text-[var(--color-electric)] hover:text-[var(--color-coral)]"
          tabIndex={0}
          onClick={handleHelp}
        >
          How does this work?
        </button>
      </div>

      <InfoModal open={modalOpen} onClose={() => setModalOpen(false)} title="How does this Demo Work?">
        <p>
          This demo uses a <span className="text-[var(--color-teal)] font-semibold">custom Convolutional Neural Network (CNN) </span>
          trained on <span className="text-[var(--color-electric)] font-semibold">50 Quick, Draw! categories</span>.
          <b> All inference runs 100% in your browser</b>—no server, no API calls.
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-1 text-sm">
          <li>
            <b>Drawing:</b> You sketch on a 280x280 pixel canvas (mouse or touch).
          </li>
          <li>
            <b>Preprocessing:</b> The app instantly scales your drawing down to <b>28x28</b> grayscale, just like the original QuickDraw dataset.
          </li>
          <li>
            <b>Model Inference:</b> The image is passed through a TensorFlow.js CNN—on your device, using your CPU/GPU.
          </li>
          <li>
            <b>Top-3 Guess:</b> The AI predicts the three most likely categories, showing confidence for each.
          </li>
        </ul>
        <p className="mt-4 text-sm text-white/70">
          <b>Tip:</b> Bold, centered sketches work best. Try drawing these <i>beard, broccoli, birthday cake, alarm clock</i>!
        </p>
        <p className="mt-4 text-xs text-white/70">
          <b>Tech Stack:</b> Next.js, React, Tailwind CSS, Framer Motion, TensorFlow.js, Python/Keras, QuickDraw Dataset.
        </p>
        <p className="mt-4">
          <b className="text-[var(--color-coral)]">Source code:</b>{" "}
          The Python training and export scripts for this CNN doodle model are open source.
          &nbsp;
          <a
            href="https://github.com/Anoop-Chandra-19/portfolio_models"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-[var(--color-electric)] font-semibold underline hover:text-[var(--color-coral)] transition"
          >
            <FaGithub className="inline mr-1" />
            View on GitHub
          </a>
        </p>
      </InfoModal>
    </motion.div>
  );
}
