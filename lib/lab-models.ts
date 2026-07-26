/* TF.js model loading for the Lab: dynamic-import tfjs (kept out of every
   page bundle), load each model once per session into a module-level cache
   (survives route changes — the "keep-alive" the design asked for), persist
   to IndexedDB so repeat visits skip the network, and report real progress
   so the bench-boot transcript never has to fake it. */

import type * as tfType from "@tensorflow/tfjs";

export type LabModelId = "doodle" | "sentiment";
export type ModelPhase = "idle" | "fetching" | "wordindex" | "warmup" | "ready" | "error";

export type ModelProgress = {
  phase: ModelPhase;
  /** weights fetch progress 0..1 (jumps to 1 on IndexedDB hits) */
  fraction: number;
  fromCache: boolean;
};

export type LoadedModel = {
  tf: typeof tfType;
  model: tfType.GraphModel;
  wordIndex: Record<string, number> | null;
};

const CONFIG: Record<
  LabModelId,
  { url: string; idb: string; wordIndexUrl: string | null; warmShape: number[] }
> = {
  doodle: {
    url: "/models/doodle/model.json",
    idb: "indexeddb://lab-doodle-v1",
    wordIndexUrl: null,
    warmShape: [1, 28, 28, 1],
  },
  sentiment: {
    url: "/models/sentiment/model.json",
    idb: "indexeddb://lab-sentiment-v1",
    // pruned to vocab indices < 10,000 (all the tokenizer ever uses) by
    // scripts/prune-word-index.mjs — ~2.1MB down to ~200KB, lossless
    wordIndexUrl: "/models/sentiment/word_index.min.json",
    warmShape: [1, 64],
  },
};

type Listener = (p: ModelProgress) => void;

type Entry = {
  promise: Promise<LoadedModel> | null;
  progress: ModelProgress;
  listeners: Set<Listener>;
};

const entries: Record<LabModelId, Entry> = {
  doodle: { promise: null, progress: { phase: "idle", fraction: 0, fromCache: false }, listeners: new Set() },
  sentiment: { promise: null, progress: { phase: "idle", fraction: 0, fromCache: false }, listeners: new Set() },
};

let tfPromise: Promise<typeof tfType> | null = null;
function loadTf(): Promise<typeof tfType> {
  return (tfPromise ??= import("@tensorflow/tfjs").then(async (tf) => {
    await tf.ready();
    return tf;
  }));
}

function report(id: LabModelId, progress: Partial<ModelProgress>) {
  const e = entries[id];
  e.progress = { ...e.progress, ...progress };
  e.listeners.forEach((fn) => fn(e.progress));
}

/** Subscribe to load progress; fires immediately with the current state. */
export function subscribeModel(id: LabModelId, fn: Listener): () => void {
  const e = entries[id];
  e.listeners.add(fn);
  fn(e.progress);
  return () => {
    e.listeners.delete(fn);
  };
}

async function doLoad(id: LabModelId): Promise<LoadedModel> {
  const cfg = CONFIG[id];
  const tf = await loadTf();
  report(id, { phase: "fetching", fraction: 0 });

  let model: tfType.GraphModel;
  try {
    model = await tf.loadGraphModel(cfg.idb);
    report(id, { fraction: 1, fromCache: true });
  } catch {
    model = await tf.loadGraphModel(cfg.url, {
      onProgress: (fraction) => report(id, { fraction }),
    });
    // best-effort persist — private browsing / quota failures just mean a
    // network load next visit
    model.save(cfg.idb).catch(() => {});
  }

  let wordIndex: Record<string, number> | null = null;
  if (cfg.wordIndexUrl) {
    report(id, { phase: "wordindex" });
    let res = await fetch(cfg.wordIndexUrl);
    if (!res.ok) res = await fetch("/models/sentiment/word_index.json");
    if (!res.ok) throw new Error(`word index fetch failed (${res.status})`);
    wordIndex = await res.json();
  }

  // dummy predict compiles the WebGL shaders now instead of on the user's
  // first real classify
  report(id, { phase: "warmup" });
  const input = tf.zeros(cfg.warmShape);
  const out = model.predict(input) as tfType.Tensor;
  await out.data();
  input.dispose();
  out.dispose();

  report(id, { phase: "ready", fraction: 1 });
  return { tf, model, wordIndex };
}

/** Idempotent: the first call starts the load, later calls share it. */
export function loadModel(id: LabModelId): Promise<LoadedModel> {
  const e = entries[id];
  if (!e.promise) {
    e.promise = doLoad(id).catch((err) => {
      e.promise = null; // allow a retry after a failure
      report(id, { phase: "error" });
      throw err;
    });
  }
  return e.promise;
}

