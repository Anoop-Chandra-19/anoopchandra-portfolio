import { useState, useEffect, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";

const MODEL_PATH = "/models/doodle/model.json";

export function useDoodleModel() {
  const [model, setModel] = useState<tf.GraphModel | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tf.loadGraphModel(MODEL_PATH)
      .then(m => {
        setModel(m);
        setReady(true);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load doodle model.");
        setLoading(false);
      });
  }, []);

  const predict = useCallback(
    async (input: tf.Tensor4D): Promise<number[]> => {
      if (!model) throw new Error("Model not loaded");
      const output = model.predict(input) as tf.Tensor;
      const data = await output.data();
      input.dispose();
      output.dispose();
      return Array.from(data); // probabilities
    },
    [model]
  );

  return { predict, ready, loading, error };
}
