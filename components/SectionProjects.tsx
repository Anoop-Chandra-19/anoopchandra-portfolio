"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const projects = [
  {
    title: "Audio Genre Classification",
    image: "/projects/audio-genres.png",
    description:
      "Built a PyTorch Transformer for music genre recognition, deployed as FastAPI microservice with React frontend. 85% test accuracy, live demo with 100+ daily requests.",
    tags: ["PyTorch", "React", "FastAPI", "AWS"],
    link: "https://github.com/Anoop-Chandra-19/audio_classifier",
    featured: true,
  },
  {
    title: "Stock Price Prediction LLM",
    image: "/projects/stock-pred.png",
    description:
      "Research Project on LLM performance in Stock Prediction. GenAI pipeline for stock movement prediction with chain-of-thought reasoning and MongoDB time-series data.",
    tags: ["GenAI", "LLM", "MongoDB", "Finance"],
    link: "https://github.com/b1f6c1c4/earnings-llm",
    featured: false,
  },
  {
    title: "LegalRescue.ai (Enterprise, NDA)",
    image: "/projects/legalrescue-nda.png",
    description:
      "Designed and shipped a scalable LLM-powered backend (FastAPI, Redis, Celery, AWS, Next.js) for a legal AI startup. Full-stack cloud infra & CI/CD. (Details confidential)",
    tags: ["LLM", "FastAPI", "AWS", "Enterprise"],
    link: undefined,
    featured: false,
    nda: true,
  },
];

export default function SectionProjects({ id }: { id: string }) {
  const [tooltip, setTooltip] = useState(false);

  return (
    <section
      id={id}
      className="min-h-screen snap-start flex flex-col items-center justify-center bg-[var(--color-navy)] pt-24 pb-16 relative"
    >
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -z-10 w-[700px] h-[420px] bg-[radial-gradient(ellipse_at_center,_var(--color-electric)_12%,_transparent_75%)] blur-3xl opacity-25 pointer-events-none" />
      <h2 className="text-4xl md:text-5xl font-bold text-center text-[var(--color-electric)] mb-10 drop-shadow-xl">
        Featured Projects
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-6xl px-4">
        {projects.map((project, i) => {
          const CardContent = (
            <>
              {/* Image & Badges */}
              <div className="w-full aspect-[4/2.2] bg-black/30 flex items-center justify-center relative overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  width={480}
                  height={240}
                  className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                  priority={project.featured}
                />
                {project.nda && (
                  <>
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none z-10"
                      // Note: No pointer events so hover passes through overlay
                      onMouseEnter={() => setTooltip(true)}
                      onMouseLeave={() => setTooltip(false)}
                    >
                      <svg width="48" height="48" fill="none">
                        <circle cx="24" cy="24" r="22" stroke="#cc00e6" strokeWidth="2" fill="none" />
                        <path d="M18 24v-4a6 6 0 1 1 12 0v4" stroke="#cc00e6" strokeWidth="2" />
                        <rect x="16" y="24" width="16" height="12" rx="3" stroke="#cc00e6" strokeWidth="2" fill="none" />
                      </svg>
                    </div>
                    <AnimatePresence>
                      {tooltip && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-4 py-2 rounded-lg z-30 shadow-lg pointer-events-none"
                        >
                          Sorry, this project is under NDA.<br />
                          (Ask me in person for details!)
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
                {project.nda && (
                  <span className="absolute top-4 right-4 bg-[var(--color-electric)]/90 text-white text-xs font-semibold px-3 py-1 rounded-full shadow z-20">
                    NDA
                  </span>
                )}
                {project.featured && (
                  <span className="absolute top-4 left-4 bg-[var(--color-coral)]/90 text-white text-xs font-semibold px-3 py-1 rounded-full shadow z-20">
                    ★ Featured
                  </span>
                )}
              </div>
              {/* Details & Tags */}
              <div className="p-6 pb-7 relative flex flex-col h-full">
                <h3 className="text-2xl font-semibold text-[var(--color-coral)] mb-2">
                  {project.title}
                </h3>
                <p className="text-white/80 mb-2">{project.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.tags.map((tag) => (
                    <motion.span
                      key={tag}
                      whileHover={{
                        backgroundColor: "var(--color-coral)",
                        color: "#fff",
                        scale: 1.1,
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="bg-[var(--color-teal)]/30 text-xs px-2 py-1 rounded-full text-white/80 border border-transparent hover:border-[var(--color-coral)] transition"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </div>
            </>
          );

          // --- Make entire card clickable if link exists ---
          const cardProps = {
            initial: { opacity: 0, y: 30, scale: 0.98 },
            whileInView: { opacity: 1, y: 0, scale: 1 },
            viewport: { once: true },
            transition: { duration: 0.7, delay: i * 0.08, type: "spring" as const, bounce: 0.21 },
            className:
              "group relative border border-white/10 rounded-2xl shadow-lg transition-all duration-300 overflow-hidden bg-[var(--color-navy)] hover:shadow-[0_4px_64px_0_rgba(204,0,230,0.11)] hover:scale-[1.04] hover:border-[var(--color-electric)] md:min-h-[360px]" +
              (project.link ? " cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-coral)] active:scale-95" : " opacity-80"),
            tabIndex: project.link ? 0 : -1,
            "aria-label": project.link
              ? `Open ${project.title} project`
              : `${project.title} project (not available online)`,
          };

          // If link exists, wrap with <a>
          return project.link ? (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={0}
              aria-label={`Open ${project.title} project`}
              key={project.title}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-coral)] rounded-2xl"
            >
              <motion.div {...cardProps}>{CardContent}</motion.div>
            </a>
          ) : (
            <motion.div key={project.title} {...cardProps}>
              {CardContent}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
