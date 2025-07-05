import React, { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { useSentimentModel } from "@/hooks/useSentimentModel";
import InfoModal from "../InfoModal";

export default function SentimentDemo() {
  const { predict, loading, error, ready } = useSentimentModel();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ sentiment: string; confidence: number } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [history, setHistory] = useState<{ prompt: string; output: React.ReactNode }[]>([]);

  // Only use "$" as CLI prompt; no user@host
  const prompt = <span className="text-[var(--color-electric)] font-bold">$</span>;

  const handlePredict = async () => {
    setPredicting(true);
    const r = await predict(input);
    setHistory([
      ...history,
      {
        prompt: input,
        output: (
          <span className={`ml-4 ${r?.sentiment === "Positive" ? "text-[var(--color-teal)]" : "text-[var(--color-coral)]"} font-bold`}>
            {r
              ? `${r.sentiment} (${(r.confidence * 100).toFixed(1)}%)`
              : "Unknown"}
          </span>
        ),
      },
    ]);
    setResult(r);
    setInput("");
    setPredicting(false);
  };

  const handleInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && ready && !predicting) {
      if (input.trim().toLowerCase() === "help") {
        setModalOpen(true);
        setHistory([
          ...history,
          {
            prompt: input,
            output: <span className="ml-4 text-[var(--color-electric)]">[info modal opened]</span>,
          },
        ]);
        setInput("");
      } else {
        handlePredict();
      }
    }
  };

  return (
    <div
      className="w-full font-mono text-base text-white bg-transparent"
      style={{
        fontFamily:
          "'JetBrains Mono', 'Fira Mono', 'ui-monospace', SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
      }}
    >
      {/* CLI scrollback/history */}
      <div>
        {history.map((h, i) => (
          <div key={i} className="flex items-start">
            {prompt}
            <span className="ml-2">{h.prompt}</span>
            {h.output}
          </div>
        ))}
        {/* CLI input line */}
        <div className="flex items-center mt-2">
          {prompt}
          <input
            className="flex-1 bg-transparent text-white border-0 outline-none px-2 py-0 font-mono placeholder-white/50 text-base"
            type="text"
            placeholder="Type a sentence or 'help'..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading || predicting}
            aria-label="Input text for sentiment analysis"
            onKeyDown={handleInputKey}
            autoFocus
            spellCheck={false}
          />
        </div>
        {/* CLI Output: loading/error/result */}
        {loading && (
          <div className="flex items-center mt-1">
            <span className="text-[var(--color-teal)]">[model]</span>
            <span className="ml-2 text-[var(--color-teal)] animate-pulse">Loading AI model...</span>
          </div>
        )}
        {error && (
          <div className="flex items-center mt-1">
            <span className="text-[var(--color-coral)]">[error]</span>
            <span className="ml-2 text-[var(--color-coral)]">{error}</span>
          </div>
        )}
        {predicting && !loading && (
          <div className="flex items-center mt-1">
            <span className="text-[var(--color-teal)]">[ai]</span>
            <span className="ml-2">Analyzing...</span>
          </div>
        )}
        {/* Help link */}
        <div className="flex items-center mt-4">
          <span className="text-[var(--color-electric)]">[info]</span>
          <button
            className="ml-2 font-mono underline hover:text-[var(--color-teal)] text-[var(--color-electric)] focus:outline-none"
            onClick={() => setModalOpen(true)}
          >
            Type 'help' or click here for info
          </button>
        </div>
      </div>
      {/* Info modal */}
      <InfoModal open={modalOpen} onClose={() => setModalOpen(false)} title="How does this Demo Work?">
        <p>
          This demo uses a <span className="text-[var(--color-teal)] font-semibold">quantized LSTM neural network </span>
          trained on thousands of real-world reviews to predict sentiment—
          <b> right in your browser</b>, with no server or API calls.
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-1 text-sm">
          <li>
            <b>Tokenization:</b> Your sentence is split into words and mapped to unique numbers using the original training word index.
          </li>
          <li>
            <b>Padded Sequence:</b> The input is padded/truncated to 64 tokens, matching model training.
          </li>
          <li>
            <b>Model Inference:</b> The encoded sequence is run through a <span className="text-[var(--color-teal)] font-semibold">TensorFlow.js LSTM model</span> client-side, using your device's GPU.
          </li>
          <li>
            <b>Output:</b> The model predicts a confidence score (0–1) mapped to positive or negative sentiment.
          </li>
        </ul>
        <p className="mt-4 text-sm text-white/70">
          <b>Tip:</b> This demo works best with longer sentences and real-world phrases (just like the reviews it was trained on).
          For short statements like <i>'i love this'</i> or <i>'worst movie'</i>, results can be less reliable.
          For the most accurate reading, type out a full opinion - just like you'd write a review!
        </p>
        <p className="mt-4 text-xs text-white/70">
          <b>Tech Stack:</b> Next.js, React, Tailwind CSS, Framer Motion, TensorFlow.js, Python/Keras, Quantized LSTM.
        </p>
        <p className="mt-4">
          <b className="text-[var(--color-coral)]">Source code:</b>{" "}
          The Python training and model export code for this LSTM sentiment model is open source.
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
    </div>
  );
}
