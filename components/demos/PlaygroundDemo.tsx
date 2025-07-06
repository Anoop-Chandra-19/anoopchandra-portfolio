"use client";
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import InfoModal from "../InfoModal";
import { FaGithub } from "react-icons/fa";

const INIT_K = 3;
const COLORS = [
  "#cc00e6", "#ff715b", "#1ea896", "#25283d", "#fad000", "#5cdb95", "#17bebb", "#f8de22"
];

type Point = { x: number, y: number, class?: number };

export default function PlaygroundDemo() {
  // Modes: 'kmeans' or 'classifier'
  const [mode, setMode] = useState<'kmeans' | 'classifier'>('kmeans');

  // Shared state
  const [points, setPoints] = useState<Point[]>([]);
  const [running, setRunning] = useState(false);

  // K-Means state
  const [k, setK] = useState(INIT_K);
  const [clusters, setClusters] = useState<number[]>([]);
  const [centroids, setCentroids] = useState<{ x: number, y: number }[]>([]);

  // Classifier state
  const [currentClass, setCurrentClass] = useState(0); // for assigning points
  const [perceptronWeights, setPerceptronWeights] = useState<[number, number, number] | null>(null);

  // InfoModal state
  const [modalOpen, setModalOpen] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);

  // Add point (mode-aware)
  function handleAddPoint(e: React.MouseEvent) {
    if (running) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    if (mode === "kmeans") {
      setPoints([...points, { x, y }]);
      setClusters([]);
    } else {
      setPoints([...points, { x, y, class: currentClass }]);
      setPerceptronWeights(null);
    }
  }

  // Animated centroid movement for K-Means
  interface Centroid {
    x: number;
    y: number;
  }

  function lerpCentroids(
    oldC: Centroid[],
    newC: (Centroid & { n?: number })[],
    steps: number = 8
  ): Centroid[][] {
    let frames: Centroid[][] = [];
    for (let s = 1; s <= steps; ++s) {
      frames.push(
        newC.map((c, i) => ({
          x: oldC[i]?.x + (c.x - (oldC[i]?.x ?? c.x)) * (s / steps),
          y: oldC[i]?.y + (c.y - (oldC[i]?.y ?? c.y)) * (s / steps),
        }))
      );
    }
    return frames;
  }

  // K-means clustering logic
  async function runKMeans() {
    setRunning(true);
    let c = Array.from({ length: k }, () => ({
      x: Math.random(), y: Math.random()
    }));
    let assigns = new Array(points.length).fill(0);
    let changed = true, steps = 0;

    setCentroids(c);

    while (changed && steps < 20) {
      // Assign points to nearest centroid
      let newAssigns = points.map(p => {
        let best = 0, bestDist = Infinity;
        for (let i = 0; i < c.length; ++i) {
          let dx = p.x - c[i].x, dy = p.y - c[i].y;
          let d = dx * dx + dy * dy;
          if (d < bestDist) { bestDist = d; best = i; }
        }
        return best;
      });

      // Update centroids
      let newCentroids = Array.from({ length: k }, () => ({ x: 0, y: 0, n: 0 }));
      newAssigns.forEach((cluster, i) => {
        newCentroids[cluster].x += points[i].x;
        newCentroids[cluster].y += points[i].y;
        newCentroids[cluster].n += 1;
      });
      newCentroids.forEach(cen => {
        if (cen.n > 0) {
          cen.x /= cen.n;
          cen.y /= cen.n;
        }
      });

      // Animate assignments and lerp centroids
      setClusters([...newAssigns]);
      const lerpFrames = lerpCentroids(c, newCentroids, 8);
      for (const frame of lerpFrames) {
        setCentroids(frame);
        await new Promise(res => setTimeout(res, 32));
      }

      changed = newAssigns.some((v, i) => v !== assigns[i]);
      assigns = newAssigns;
      c = newCentroids;
      steps += 1;
      await new Promise(res => setTimeout(res, 180));
    }
    setCentroids(c);
    setRunning(false);
  }

  function handleReset() {
    setPoints([]);
    setClusters([]);
    setCentroids([]);
    setPerceptronWeights(null);
  }

  // -------- Classifier Explorer --------

  function handleNextClass() {
    setCurrentClass((prev) => (prev + 1) % 2); // binary by default (expand to 3+ if needed)
  }

  function handlePointClassChange(idx: number) {
    if (running) return;
    setPoints(points =>
      points.map((p, i) =>
        i === idx ? { ...p, class: (p.class ?? 0) === 0 ? 1 : 0 } : p
      )
    );
    setPerceptronWeights(null);
  }

  // Simple Perceptron Trainer (binary)
  function trainPerceptron(points: Point[]) {
    let w = [0, 0, 0]; // bias, w1, w2
    for (let epoch = 0; epoch < 24; ++epoch) {
      for (let pt of points) {
        let yhat = w[0] + w[1] * pt.x + w[2] * pt.y > 0 ? 1 : 0;
        let err = (pt.class ?? 0) - yhat;
        w[0] += 0.13 * err;
        w[1] += 0.13 * err * pt.x;
        w[2] += 0.13 * err * pt.y;
      }
    }
    return w as [number, number, number];
  }

  function runClassifier() {
    if (points.length < 2) return;
    setRunning(true);
    setTimeout(() => {
      const w = trainPerceptron(points);
      setPerceptronWeights(w);
      setRunning(false);
    }, 300);
  }

  // Draw perceptron decision boundary (SVG line)
  function DecisionBoundary({ w }: { w: [number, number, number] }) {
    // w[0] + w[1] * x + w[2] * y = 0  -->  y = -(w[0] + w[1] * x)/w[2]
    let y0 = - (w[0] + w[1] * 0) / (w[2] || 1e-8);
    let y1 = - (w[0] + w[1] * 1) / (w[2] || 1e-8);
    return (
      <line
        x1={0} y1={y0}
        x2={1} y2={y1}
        stroke="#fad000"
        strokeWidth={0.013}
        strokeDasharray="0.04 0.04"
        opacity={0.7}
      />
    );
  }

  // ----------- UI -----------

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[22rem]">
      <motion.div
        className="flex flex-col gap-3 w-full max-w-2xl"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* --- Mode Switch --- */}
        <div className="flex gap-2 mb-2">
          <button
            className={`px-4 py-1.5 rounded-full font-semibold border transition
              ${mode === 'kmeans'
                ? 'bg-[var(--color-electric)] text-white border-[var(--color-electric)] shadow'
                : 'bg-black text-[var(--color-electric)] border-[var(--color-electric)] hover:bg-[var(--color-electric)]/10'}
            `}
            style={{ outline: 'none' }}
            onClick={() => { if (!running) setMode('kmeans'); handleReset(); }}
            disabled={running}
            aria-label="Switch to K-Means"
          >K-Means</button>
          <button
            className={`px-4 py-1.5 rounded-full font-semibold border transition
              ${mode === 'classifier'
                ? 'bg-[var(--color-electric)] text-white border-[var(--color-electric)] shadow'
                : 'bg-black text-[var(--color-electric)] border-[var(--color-electric)] hover:bg-[var(--color-electric)]/10'}
            `}
            style={{ outline: 'none' }}
            onClick={() => { if (!running) setMode('classifier'); handleReset(); }}
            disabled={running}
            aria-label="Switch to Classifier Explorer"
          >Classifier</button>
        </div>
        {/* --- Controls --- */}
        <div className="flex gap-3 items-center justify-between mb-1">
          {mode === "kmeans" ? (
            <>
              <div className="flex gap-2 items-center">
                <label className="font-semibold text-white">Clusters:</label>
                <input
                  type="range" min={2} max={8} value={k}
                  onChange={e => setK(Number(e.target.value))}
                  className="accent-[var(--color-electric)]"
                  disabled={running}
                  aria-label="Number of clusters"
                />
                <span className="font-mono text-electric text-lg">{k}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={handleReset}
                  className="px-3 py-1 rounded bg-[var(--color-navy)] text-white text-sm border border-[var(--color-electric)] hover:bg-[var(--color-electric)]/10 transition"
                  disabled={running || points.length === 0}
                >Reset</button>
                <button onClick={runKMeans}
                  className="px-3 py-1 rounded bg-[var(--color-electric)] text-white text-sm font-semibold shadow-lg hover:bg-[var(--color-coral)] transition"
                  disabled={running || points.length < k}
                >Run K-Means</button>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-2 items-center">
                <label className="font-semibold text-white">Point class:</label>
                <button
                  onClick={handleNextClass}
                  className={`w-7 h-7 rounded-full border-2 shadow ${currentClass === 0 ? 'border-[var(--color-electric)]' : 'border-[var(--color-coral)]'}`}
                  style={{ background: COLORS[currentClass % COLORS.length] }}
                  aria-label="Switch point class"
                  disabled={running}
                ></button>
                <span className="text-white/60 text-xs">Click to change</span>
              </div>
              <div className="flex gap-2">
                <button onClick={handleReset}
                  className="px-3 py-1 rounded bg-[var(--color-navy)] text-white text-sm border border-[var(--color-electric)] hover:bg-[var(--color-electric)]/10 transition"
                  disabled={running || points.length === 0}
                >Reset</button>
                <button onClick={runClassifier}
                  className="px-3 py-1 rounded bg-[var(--color-electric)] text-white text-sm font-semibold shadow-lg hover:bg-[var(--color-coral)] transition"
                  disabled={running || points.length < 2}
                >Run Classifier</button>
              </div>
            </>
          )}
        </div>
        {/* --- Plot --- */}
        <div className="w-full aspect-square bg-navy rounded-lg border-2 border-electric relative shadow-xl overflow-hidden">
          <svg
            ref={svgRef}
            width="100%" height="100%" viewBox="0 0 1 1"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
            style={{ touchAction: "manipulation", cursor: running ? "not-allowed" : "crosshair" }}
            onClick={handleAddPoint}
            aria-label="Scatterplot"
          >
            {/* Axis grid */}
            <line x1={0} y1={0.5} x2={1} y2={0.5} stroke="#4447" strokeWidth={0.002} />
            <line x1={0.5} y1={0} x2={0.5} y2={1} stroke="#4447" strokeWidth={0.002} />
            {/* --- K-Means Points --- */}
            {mode === "kmeans" && points.map((pt, i) => (
              <motion.circle
                key={i}
                cx={pt.x} cy={pt.y} r={0.018}
                fill={clusters.length ? COLORS[clusters[i] % COLORS.length] : "#fff"}
                stroke="#fff"
                strokeWidth={0.006}
                initial={false}
                animate={{
                  scale: running ? [1, 1.25, 1] : 1,
                  opacity: 1,
                }}
                transition={{
                  duration: running ? 0.42 : 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
            {/* K-Means Centroids */}
            {mode === "kmeans" && centroids.map((c, i) => (
              <motion.circle
                key={i}
                cx={c.x} cy={c.y} r={0.028}
                fill={COLORS[i % COLORS.length]}
                stroke="#fff"
                strokeWidth={0.009}
                initial={{ scale: 0.5, opacity: 0.6 }}
                animate={{ scale: 1.13, opacity: 1 }}
                transition={{ type: "spring", stiffness: 180, damping: 16 }}
              />
            ))}
            {/* --- Classifier Points --- */}
            {mode === "classifier" && points.map((pt, i) => (
              <motion.circle
                key={i}
                cx={pt.x} cy={pt.y} r={0.018}
                fill={COLORS[(pt.class ?? 0) % COLORS.length]}
                stroke="#fff"
                strokeWidth={0.006}
                initial={false}
                animate={{
                  scale: running ? [1, 1.2, 1] : 1,
                  opacity: 1,
                }}
                transition={{
                  duration: running ? 0.36 : 0.1,
                  ease: "easeInOut"
                }}
                onClick={e => { e.stopPropagation(); handlePointClassChange(i); }}
                style={{ cursor: 'pointer' }}
              />
            ))}
            {/* --- Classifier Boundary --- */}
            {mode === "classifier" && perceptronWeights &&
              <DecisionBoundary w={perceptronWeights} />
            }
          </svg>
        </div>
        {/* --- Footer / Instructions --- */}
        <div className="mt-2 text-xs text-white/60 text-center">
          {mode === "kmeans" ? (
            <>
              Click to add points. Select clusters.{" "}
              <span className="text-electric font-semibold">Run K-Means</span> to see clusters animate!
            </>
          ) : (
            <>
              Click to add points for each class (toggle color above).
              <br />
              Click existing points to switch class. <span className="text-electric font-semibold">Run Classifier</span> to fit boundary!
            </>
          )}
          <br />
          <button
            className="underline text-teal hover:text-coral ml-1"
            onClick={() => setModalOpen(true)}
          >
            How does this work?
          </button>
        </div>
      </motion.div>
      {/* ---- Info Modal ---- */}
      <InfoModal open={modalOpen} onClose={() => setModalOpen(false)} title="How does this Demo Work?">
        {mode === "kmeans" ? (
          <>
            <p>
              <b className="text-[var(--color-electric)]">K-Means mode:</b> Add points to the plot and cluster them using the classic <b>K-Means algorithm</b>—all running 100% in your browser.
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-1 text-sm">
              <li>
                <b>Add points:</b> Click to add 2D data points.
              </li>
              <li>
                <b>Select clusters (K):</b> Pick how many clusters to find.
              </li>
              <li>
                <b>Run K-Means:</b> Watch the centroids move and groups form—everything is animated and interactive!
              </li>
            </ul>
            <p className="mt-4 text-xs text-white/70">
              <b>Tech Stack:</b> Next.js, React, Tailwind CSS, Framer Motion, pure JS logic.
            </p>
          </>
        ) : (
          <>
            <p>
              <b className="text-[var(--color-electric)]">Classifier Explorer mode:</b> Add points for two classes and watch a simple perceptron learn to draw a separating boundary, in real time!
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-1 text-sm">
              <li>
                <b>Add points:</b> Click to add labeled points (switch class using the colored button).
              </li>
              <li>
                <b>Toggle class:</b> Click a point to flip its class (color).
              </li>
              <li>
                <b>Run Classifier:</b> See the decision boundary animate to separate your two classes—live perceptron training!
              </li>
            </ul>
            <p className="mt-4 text-xs text-white/70">
              <b>Tip:</b> Try non-linear patterns to see the limits of a linear classifier!
            </p>
            <p className="mt-4 text-xs text-white/70">
              <b>Tech Stack:</b> Next.js, React, Tailwind CSS, Framer Motion, pure JS logic.
            </p>
          </>
        )}
        <p className="mt-4">
          <b className="text-[var(--color-coral)]">Source code:</b>{" "}
          <a
            href="https://github.com/Anoop-Chandra-19/anoopchandra-portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-[var(--color-electric)] font-semibold underline hover:text-[var(--color-coral)] transition"
          >
            <FaGithub className="inline mr-1" />
            View on GitHub
          </a>
        </p>
      </InfoModal>
    </div>
  );
}
