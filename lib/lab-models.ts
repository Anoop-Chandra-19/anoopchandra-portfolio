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

export type ModelOutput = tfType.Tensor | tfType.Tensor[] | tfType.NamedTensorMap;

export function getModelOutputTensors(output: ModelOutput): tfType.Tensor[] {
  if (Array.isArray(output)) return output;
  if (typeof (output as tfType.Tensor).data === "function") return [output as tfType.Tensor];
  return Object.values(output);
}

export function disposeModelOutput(output: ModelOutput | null): void {
  if (!output) return;
  new Set(getModelOutputTensors(output)).forEach((tensor) => tensor.dispose());
}

const CONFIG: Record<
  LabModelId,
  { url: string; idb: string; wordIndexUrl: string | null; warmShape: number[] }
> = {
  doodle: {
    // the /vN/ segment is what makes these URLs safe to serve `immutable`
    // (next.config.ts) — shard names are not content-hashed, so a re-export
    // means a new directory here plus a matching bump of the idb key
    url: "/models/doodle/v1/model.json",
    idb: "indexeddb://lab-doodle-v1",
    wordIndexUrl: null,
    warmShape: [1, 28, 28, 1],
  },
  sentiment: {
    url: "/models/sentiment/v1/model.json",
    idb: "indexeddb://lab-sentiment-v1",
    // pruned to vocab indices < 10,000 (all the tokenizer ever uses) by
    // scripts/prune-word-index.mjs — ~2.1MB down to ~200KB, lossless
    wordIndexUrl: "/models/sentiment/v1/word_index.min.json",
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
  if (!tfPromise) {
    tfPromise = import("@tensorflow/tfjs")
      .then(async (tf) => {
        await tf.ready();
        return tf;
      })
      .catch((error: unknown) => {
        tfPromise = null;
        throw error;
      });
  }
  return tfPromise;
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
  report(id, { phase: "fetching", fraction: 0, fromCache: false });

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

  try {
    let wordIndex: Record<string, number> | null = null;
    if (cfg.wordIndexUrl) {
      report(id, { phase: "wordindex" });
      let res = await fetch(cfg.wordIndexUrl);
      if (!res.ok) res = await fetch("/models/sentiment/v1/word_index.json");
      if (!res.ok) throw new Error(`word index fetch failed (${res.status})`);
      wordIndex = await res.json();
    }

    // Dummy predict compiles the WebGL shaders now instead of on the user's
    // first real classify.
    report(id, { phase: "warmup" });
    let input: tfType.Tensor | null = null;
    let output: ModelOutput | null = null;
    try {
      input = tf.zeros(cfg.warmShape);
      output = model.predict(input) as ModelOutput;
      const [firstOutput] = getModelOutputTensors(output);
      if (!firstOutput) throw new Error("model warm-up returned no output tensors");
      await firstOutput.data();
    } finally {
      input?.dispose();
      disposeModelOutput(output);
    }

    report(id, { phase: "ready", fraction: 1 });
    return { tf, model, wordIndex };
  } catch (error: unknown) {
    model.dispose();
    throw error;
  }
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

