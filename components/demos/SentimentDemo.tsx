import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// HuggingFace API endpoint for sentiment (DistilBERT SST-2)
const HF_API_URL = "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english";
const HF_API_HEADERS = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${process.env.NEXT_PUBLIC_HF_TOKEN}`,
};

export default function SentimentDemo() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ label: string; score: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyzeSentiment(input: string) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: HF_API_HEADERS,
        body: JSON.stringify({ inputs: input }),
      });

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data) && data.length > 0) {
          const sorted = [...data].sort((a, b) => b.score - a.score);
          setResult(sorted[0]);
        } else if (data.error) {
          throw new Error(data.error);
        } else {
          throw new Error("Invalid API response.");
        }
      } catch (err) {
        // If JSON.parse fails, show a helpful error message
        setError(
          "The Hugging Face API returned an unexpected response. If this is your first request, the model is likely spinning up (free endpoints can take 30s+). Please try again in a few seconds."
        );
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    }
    setLoading(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setText(e.target.value);
    if (e.target.value.trim().length > 2) {
      analyzeSentiment(e.target.value.trim());
    } else {
      setResult(null);
    }
  }

  // Color & emoji by label
  let label = "";
  let emoji = "";
  let barColor = "";
  if (result) {
    if (result.label === "POSITIVE") {
      label = "Positive";
      emoji = "😊";
      barColor = "bg-[var(--color-teal)]";
    } else if (result.label === "NEGATIVE") {
      label = "Negative";
      emoji = "😠";
      barColor = "bg-[var(--color-coral)]";
    } else {
      label = "Neutral";
      emoji = "😐";
      barColor = "bg-[var(--color-electric)]";
    }
  }

  return (
    <div className="flex flex-col items-center w-full">
      <label htmlFor="sentiment-input" className="mb-2 text-lg font-semibold text-[var(--color-navy)]">
        Type something and get real sentiment (Hugging Face API):
      </label>
      <input
        id="sentiment-input"
        type="text"
        value={text}
        onChange={handleChange}
        className="rounded-lg border border-[var(--color-electric)] px-4 py-2 mb-6 w-full max-w-sm focus:outline-none focus:border-[var(--color-teal)] text-[var(--color-navy)]"
        placeholder="Type your message here..."
        autoFocus
      />

      <AnimatePresence>
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[var(--color-electric)] text-lg mb-4 animate-pulse"
          >
            Analyzing...
          </motion.div>
        )}
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[var(--color-coral)] text-sm mb-4"
          >
            {error}
          </motion.div>
        )}
        {result && !loading && (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`flex flex-col items-center`}
          >
            <span className="text-5xl mb-2">{emoji}</span>
            <span
              className={`text-xl font-bold rounded-lg px-4 py-1
                ${barColor} text-white shadow transition`}
            >
              {label} ({(result.score * 100).toFixed(0)}%)
            </span>
            <div className="w-48 mt-4 h-3 rounded-full bg-[var(--color-white)]/40 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${barColor}`}
                style={{
                  width: `${Math.round(result.score * 100)}%`,
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        className="mt-6 text-sm underline text-[var(--color-teal)]"
        onClick={() =>
          window.open(
            "https://huggingface.co/distilbert-base-uncased-finetuned-sst-2-english",
            "_blank"
          )
        }
      >
        How does this work?
      </button>
    </div>
  );
}
