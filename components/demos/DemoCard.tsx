import { useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import SentimentDemo from "./SentimentDemo";

// Placeholder for future demo components
function ComingSoon() {
  return (
    <div className="p-8 text-[var(--color-navy)] font-semibold text-center">
      Coming soon!
    </div>
  );
}

const demoInfo = {
  doodle: {
    title: "Doodle Classifier",
    desc: "Draw something—let AI guess your doodle!",
    DemoComponent: ComingSoon,
  },
  sentiment: {
    title: "Sentiment Analysis",
    desc: "Type anything—AI reads your mood.",
    DemoComponent: SentimentDemo,
  },
  playground: {
    title: "ML Playground",
    desc: "Add points, run clustering, see live ML in action.",
    DemoComponent: ComingSoon,
  },
};

export default function DemoCard({ demo }: { demo: keyof typeof demoInfo }) {
  const [open, setOpen] = useState(false);
  const { title, desc, DemoComponent } = demoInfo[demo];

  // This ensures we only render on the client (avoids SSR hydration issues)
  const isBrowser = typeof window !== "undefined";

  return (
    <div className="
      bg-[var(--color-navy)] 
      border border-[var(--color-electric)] 
      rounded-2xl shadow-lg p-8 
      flex flex-col items-center text-center 
      hover:scale-105 transition-transform duration-200 cursor-pointer group
    ">
      <h3 className="text-2xl font-bold text-[var(--color-electric)] mb-2">
        {title}
      </h3>
      <p className="mb-6 text-[var(--color-white)]/80">
        {desc}
      </p>
      <button
        className="
          bg-[var(--color-electric)] text-[var(--color-white)]
          rounded-xl px-6 py-2 font-semibold shadow
          hover:bg-[var(--color-coral)] hover:text-[var(--color-white)]
          transition
        "
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label={`Try ${title} demo`}
      >
        Try Now
      </button>
      {open && isBrowser &&
        createPortal(
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-navy)]/80 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <motion.div
              className="
                relative bg-[var(--color-white)] rounded-2xl p-8 w-[95vw] max-w-2xl shadow-2xl 
                border-2 border-[var(--color-electric)]
                transition-colors duration-300
              "
              initial={{ scale: 0.96, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
            >
              <button
                className="
                  absolute top-4 right-4 text-[var(--color-electric)] 
                  hover:text-[var(--color-coral)] text-2xl font-bold
                "
                onClick={() => setOpen(false)}
                aria-label="Close demo"
              >
                ×
              </button>
              <DemoComponent />
            </motion.div>
          </motion.div>,
          document.body
        )}
    </div>
  );
}
