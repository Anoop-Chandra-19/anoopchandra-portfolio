import { useRef, useState, useCallback, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";

type SentimentResult = {
  sentiment: "Positive" | "Negative";
  confidence: number;
};

type UseSentimentModelReturn = {
  predict: (text: string) => Promise<SentimentResult | null>;
  loading: boolean;
  error: string | null;
  ready: boolean;
};

const MODEL_URL = "/models/sentiment/model.json";
const WORD_INDEX_URL = "/models/sentiment/word_index.json";  // <--- Use the new file!
const MAX_LEN = 64;
const OOV_TOKEN_INDEX = 1;
const VOCAB_SIZE = 10000; // Adjust to match your config

function cleanText(text: string) {
  return text.toLowerCase().replace(/[^\w\s]/g, "");
}

function tokenize(
  text: string,
  wordIndex: Record<string, number>,
  maxLen: number,
  oovTokenIdx: number = OOV_TOKEN_INDEX,
  vocabSize: number = VOCAB_SIZE
) {
  const words = cleanText(text).split(/\s+/);
  let seq = words.map((word) => {
    const idx = wordIndex[word] ?? oovTokenIdx;
    return (typeof idx === "number" && idx > 0 && idx < vocabSize) ? idx : oovTokenIdx;
  });
  if (seq.length > maxLen) seq = seq.slice(0, maxLen);
  while (seq.length < maxLen) seq.push(0);
  return seq;
}

export function useSentimentModel(): UseSentimentModelReturn {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const modelRef = useRef<tf.GraphModel | null>(null);
  const wordIndexRef = useRef<Record<string, number> | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        await tf.setBackend("webgl");
        await tf.ready();
        const model = await tf.loadGraphModel(MODEL_URL);

        // Just load the pure JSON dict!
        const wordIndexRes = await fetch(WORD_INDEX_URL);
        const wordIndex = await wordIndexRes.json();

        if (isMounted) {
          modelRef.current = model;
          wordIndexRef.current = wordIndex;
          setReady(true);
          console.log("Model and wordIndex loaded!");
          // (Optional) Show keys for debug
          console.log("wordIndex sample:", Object.keys(wordIndex).slice(0, 10));
        }
      } catch (err: any) {
        console.error("Model/wordIndex load failed:", err);
        if (isMounted) {
          setError("Failed to load model or word index. Please check your model files.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  // Predict function for GraphModel
  const predict = useCallback(
    async (text: string): Promise<SentimentResult | null> => {
      if (!modelRef.current || !wordIndexRef.current) {
        setError("Model not loaded.");
        return null;
      }
      if (!text.trim()) return null;

      try {
        const seq = tokenize(text, wordIndexRef.current, MAX_LEN, OOV_TOKEN_INDEX, VOCAB_SIZE);
        const inputTensor = tf.tensor([seq], [1, MAX_LEN]);
        const prediction = modelRef.current.predict(inputTensor) as tf.Tensor;
        const data = await prediction.data();
        inputTensor.dispose();
        prediction.dispose();

        const score = data[0];
        return {
          sentiment: score > 0.5 ? "Positive" : "Negative",
          confidence: score,
        };
      } catch (err: any) {
        setError("Prediction error.");
        return null;
      }
    },
    []
  );

  return { predict, loading, error, ready };
}
