"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ---- Lazy load demo components ----
const DoodleClassifierDemo = React.lazy(() => import("./DoodleClassifier"));
const SentimentDemo = React.lazy(() => import("./SentimentDemo"));
const PlaygroundDemo = React.lazy(() => import("./PlaygroundDemo"));

const DEMOS = [
  {
    key: "doodle",
    title: "Doodle Classifier",
    icon: "🖌️",
    desc: "Draw something—AI guesses your doodle.",
    DemoComponent: DoodleClassifierDemo,
  },
  {
    key: "sentiment",
    title: "Sentiment Analysis",
    icon: "😊",
    desc: "Type a sentence—AI reads your mood.",
    DemoComponent: SentimentDemo,
  },
  {
    key: "playground",
    title: "ML Playground",
    icon: "🔬",
    desc: "Add points, cluster live with K-Means.",
    DemoComponent: PlaygroundDemo,
  },
];

type TerminalState = "intro" | "boot" | "menu" | "demo" | "exit";

function useOnScreen(
  ref: React.RefObject<Element | null>,
  rootMargin: string = "0px"
): boolean {
  const [isIntersecting, setIntersecting] = useState<boolean>(false);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]: IntersectionObserverEntry[]) => setIntersecting(entry.isIntersecting),
      { rootMargin }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return isIntersecting;
}

export default function TerminalDemoSection() {
  const [termState, setTermState] = useState<TerminalState>("intro");
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [selection, setSelection] = useState(0);
  const [launchedDemo, setLaunchedDemo] = useState<number | null>(null);
  const [minLoading, setMinLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(terminalRef, "-20%");
  const [isFocused, setIsFocused] = useState(false);


  // Animate boot sequence when entering boot state
  useEffect(() => {
    if (termState !== "boot") return;

    let isCancelled = false;
    const lines = [
      "anoop@portfolio:~$ ./boot-demo-terminal",
      "Initializing AI Demo Subsystem...",
      "Loading ML models...",
      "Waking up virtual GPU...",
      "",
      "Ready.",
      "",
    ];
    const current: string[] = [];
    setBootLines([]);
    
    let idx = 0;
    const next = () => {
      if (isCancelled) return;
      current.push(lines[idx]);
      setBootLines([...current]);
      idx++;
      if (idx < lines.length) {
        setTimeout(next, 330);
      } else {
        setTimeout(() => {
          if (!isCancelled) setTermState("menu");
        }, 500);
      }
    };
    next();
    return () => {
      isCancelled = true; // Prevent further booting if effect is cleaned up (component unmounts or termState changes)
    };
  }, [termState]);

  // Keyboard navigation
  useEffect(() => {
    if (!isFocused) return;

    const onKey = (e: KeyboardEvent) => {
      if (termState === "intro") {
        if (e.key.toLowerCase() === "y") setTermState("boot");
        if (e.key.toLowerCase() === "n") setTermState("exit");
      } else if (termState === "menu") {
        if (e.key === "k") {
          setSelection((prev) => (prev + DEMOS.length - 1) % DEMOS.length);
        } else if (e.key === "j") {
          setSelection((prev) => (prev + 1) % DEMOS.length);
        } else if (e.key === "Enter") {
          setMinLoading(true);
          setLaunchedDemo(selection);
          setTermState("demo");
        }
      } else if (termState === "demo") {
        if (e.key === "Escape") {
          setTermState("menu");
          setLaunchedDemo(null);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFocused, termState, selection]);

  // Minimum loading animation for demos
  useEffect(() => {
    if (termState === "demo" && minLoading) {
      const timeout = setTimeout(() => setMinLoading(false), 700);
      return () => clearTimeout(timeout);
    } else if (termState !== "demo" && minLoading) {
      setMinLoading(false);
    }
  }, [termState, minLoading]);

  // Scroll to selected menu item
  useEffect(() => {
    if (termState !== "menu" || !containerRef.current) return;
    const sel = containerRef.current.querySelector("[data-selected='true']");
    if (sel) (sel as HTMLElement).scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selection, termState]);

  function handleDemoClick(idx: number) {
    setSelection(idx);
    setTimeout(() => {
      setMinLoading(true);
      setLaunchedDemo(idx);
      setTermState("demo");
    }, 120);
  }
  function reboot() {
    setTermState("intro");
    setSelection(0);
    setLaunchedDemo(null);
    setBootLines([]);
    setMinLoading(false);
  }

  useEffect(() => {
    if (isOnScreen && terminalRef.current) {
      terminalRef.current.focus();
    }
  }, [isOnScreen]);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[90vh] bg-gradient-to-tr from-black to-[var(--color-navy)] py-10">
      {/* Title */}
      <h2 className="text-4xl md:text-5xl font-bold mb-10
        text-[var(--color-electric)] drop-shadow-lg
        transition-colors duration-300
        text-center">
          AI Demos: Try Machine Learning Live!
      </h2>
      <motion.div
        ref={terminalRef}
        className="
          w-full max-w-6xl min-h-[42rem] rounded-md bg-black border-2
          shadow-2xl px-8 py-8
          font-mono text-[1.3rem] leading-relaxed
          text-white
          relative
        "
        style={{
          borderColor: "var(--color-navy)",
          boxShadow: "0 8px 40px var(--color-electric), 0 1.5px 0 var(--color-navy)",
        }}
        initial={{ opacity: 0, y: 44, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
        tabIndex={0}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {/* Titlebar */}
        <div className="absolute text-center left-0 top-0 px-4 py-3 font-bold text-base tracking-wider"
          style={{ color: "var(--color-electric)" }}>
          anoop@portfolio:~ <span className="text-[var(--color-coral)]">bash</span>
        </div>
        <div className="pt-12" ref={containerRef} style={{ minHeight: "38rem" }}>
          <AnimatePresence mode="wait">
            {/* ---- Boot Prompt (Y/N) ---- */}
            {termState === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pt-2 flex flex-col items-center justify-center min-h-[20rem]"
              >
                <div className="text-xl font-mono text-[var(--color-electric)] mb-6">
                  Boot demo terminal? (y/n)
                  <span className="inline-block animate-pulse text-[var(--color-coral)] ml-2">_</span>
                </div>
                <div className="mt-4 flex gap-4">
                  <button
                    className="px-5 py-1 rounded bg-[var(--color-electric)] text-white font-semibold border border-[var(--color-navy)]"
                    onClick={() => setTermState("boot")}
                  >
                    y
                  </button>
                  <button
                    className="px-5 py-1 rounded bg-black text-white font-semibold border border-[var(--color-navy)]"
                    onClick={() => setTermState("exit")}
                  >
                    n
                  </button>
                </div>
              </motion.div>
            )}

            {/* ---- Boot Animation ---- */}
            {termState === "boot" && (
              <motion.pre
                key="boot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-pre-wrap text-[var(--color-electric)] text-base min-h-[14rem] flex items-center justify-center select-none"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "20rem" }}
              >
                {bootLines.join("\n")}
              </motion.pre>
            )}

            {/* ---- Exit Message ---- */}
            {termState === "exit" && (
              <motion.div
                key="exit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pt-4 pb-6 text-[var(--color-coral)] flex flex-col items-center justify-center min-h-[20rem]"
              >
                <div>
                  User chose not to boot the demo terminal.
                </div>
                <button
                  className="mt-6 px-6 py-2 rounded bg-[var(--color-electric)] text-white font-semibold border border-[var(--color-navy)]"
                  onClick={reboot}
                >
                  Boot again
                </button>
              </motion.div>
            )}

            {/* ---- Demo Launcher Menu ---- */}
            {termState === "menu" && (
              <motion.div
                key="menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.23 }}
                className="mt-2"
              >
                <pre className="font-mono">
                  <span style={{ color: "var(--color-electric)" }}>anoop@portfolio</span>
                  <span className="text-white">:~$ </span>
                  <span className="text-white">./run-demos.sh</span>
                </pre>
                <div className="py-2 flex flex-col gap-1">
                  {DEMOS.map((demo, idx) => {
                    const selected = selection === idx;
                    return (
                      <button
                        key={demo.key}
                        data-selected={selected}
                        className={`
                          w-full text-left px-2 py-1 font-mono text-lg flex items-center gap-2 transition
                          outline-none
                          ${selected
                            ? "text-[var(--color-electric)] font-bold"
                            : "text-white hover:text-[var(--color-electric)]"}
                        `}
                        tabIndex={0}
                        onClick={() => handleDemoClick(idx)}
                        onMouseEnter={() => setSelection(idx)}
                      >
                        <span
                          className={`inline-block w-7 text-right mr-2 select-none ${selected ? "text-[var(--color-electric)] font-extrabold" : "text-[var(--color-navy)]"}`}
                        >
                          {selected ? "[>]" : "[]"}
                        </span>
                        <span className="text-2xl">{demo.icon}</span>
                        <span>{demo.title}</span>
                        <span className="ml-auto text-xs text-white/60">{demo.desc}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="pt-4 text-[var(--color-electric)] text-base opacity-80">
                  $ Use <kbd>j</kbd>/<kbd>k</kbd> to select, <kbd>Enter</kbd> to launch. <br />
                  $ <kbd>Esc</kbd> returns to menu from a demo.
                </div>
              </motion.div>
            )}

            {/* ---- Demo Window ---- */}
            {termState === "demo" && launchedDemo !== null && (
              <motion.div
                key="demorun"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.24 }}
                className="pt-2"
                style={{ minHeight: "25rem" }}
              >
                <pre className="font-mono">
                  <span style={{ color: "var(--color-electric)" }}>anoop@portfolio</span>
                  <span className="text-white">:~$ </span>
                  <span className="text-white">{DEMOS[launchedDemo].key}</span>
                </pre>
                <div className="py-3 px-2">
                  <span className="text-xl font-bold text-[var(--color-electric)]">
                    {DEMOS[launchedDemo].icon} {DEMOS[launchedDemo].title}
                  </span>
                  <div className="text-base text-white pb-3">{DEMOS[launchedDemo].desc}</div>
                  <Suspense fallback={
                    <div className="flex items-center justify-center min-h-[16rem]">
                      <div className="text-[var(--color-electric)] font-mono py-4 text-center text-lg w-full">
                        Loading {DEMOS[launchedDemo].title} model... <span className="animate-pulse text-[var(--color-coral)]">_</span>
                      </div>
                    </div>
                  }>
                    {/* Always show loading for minimum X ms */}
                    <div className="rounded bg-black border border-[var(--color-navy)]/30 p-4 mt-2 min-h-[14rem] flex items-center justify-center">
                      {minLoading ? (
                        <div className="text-[var(--color-electric)] font-mono py-4 text-center text-lg w-full">
                          Loading {DEMOS[launchedDemo].title} model... <span className="animate-pulse text-[var(--color-coral)]">_</span>
                        </div>
                      ) : (() => {
                        const DemoComp = DEMOS[launchedDemo].DemoComponent;
                        return <DemoComp />;
                      })()}
                    </div>
                  </Suspense>
                </div>
                <div className="pt-2 text-[var(--color-electric)] text-xs opacity-70">
                  Press <kbd>Esc</kbd> to return to menu.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
