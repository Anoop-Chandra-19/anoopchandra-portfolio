"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const projects = [
  {
    title: "Audio Genre Classification",
    image: "/projects/audio-genres.png",
    description:
      "Built a PyTorch Transformer for music genre recognition, deployed as FastAPI microservice with React frontend. 85% test accuracy, live demo with 100+ daily requests.",
    tags: ["PyTorch", "React", "FastAPI", "AWS"],
    link: "https://github.com/Anoop-Chandra-19/audio_classifier",
    category: "ML Project",
    featured: true,
  },
  {
    title: "Stock Price Prediction LLM",
    image: "/projects/stock-pred.png",
    description:
      "Research Project on LLM performance in Stock Prediction. GenAI pipeline for stock movement prediction with chain-of-thought reasoning and MongoDB time-series data.",
    tags: ["GenAI", "LLM", "MongoDB", "Finance"],
    link: "https://github.com/b1f6c1c4/earnings-llm",
    category: "Research",
    featured: false,
  },
  {
    title: "LegalRescue.ai (Enterprise, NDA)",
    image: "/projects/legalrescue-nda.png",
    description:
      "Designed and shipped a scalable LLM-powered backend (FastAPI, Redis, Celery, AWS, Next.js) for a legal AI startup. Full-stack cloud infra & CI/CD. (Details confidential)",
    tags: ["LLM", "FastAPI", "AWS", "Enterprise"],
    link: undefined,
    category: "Enterprise",
    featured: false,
    nda: true,
  },
];

export default function SectionProjects({ id }: { id: string }) {
  return (
    <section
      id={id}
      className="relative min-h-screen snap-start flex flex-col justify-center bg-gradient-to-tr from-black to-[var(--color-navy)] px-4 py-24"
    >
      <div className="w-full max-w-5xl mx-auto px-2">
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-electric)] mb-14">
          Featured Projects
        </h2>

        <div className="flex flex-col gap-14">
          {projects.map((project, i) => (
            <motion.a
              href={project.link || "#"}
              key={project.title}
              target={project.link ? "_blank" : undefined}
              rel={project.link ? "noopener noreferrer" : undefined}
              tabIndex={project.link ? 0 : -1}
              initial={{ opacity: 0, x: -64 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.90,
                delay: i * 0.20,
                type: "spring",
                bounce: 0.12,
              }}
              className={`flex flex-col md:flex-row bg-[#23263A] rounded-2xl overflow-hidden shadow-lg group transition-transform duration-300 
                ${project.link ? "hover:scale-[1.018] cursor-pointer" : "opacity-70 cursor-not-allowed"}
              `}
              aria-label={
                project.link
                  ? `Open ${project.title} project`
                  : `${project.title} project (not available online)`
              }
            >
              {/* Image */}
              <div className="md:w-2/5 w-full h-56 md:h-auto relative">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover w-full h-full"
                  priority={project.featured}
                />
                {/* Badges */}
                {project.nda && (
                  <span className="absolute top-3 right-3 bg-[var(--color-electric)]/90 text-white text-xs font-semibold px-3 py-1 rounded-full shadow z-20">
                    NDA
                  </span>
                )}
                {project.featured && (
                  <span className="absolute top-3 left-3 bg-[var(--color-coral)]/90 text-white text-xs font-semibold px-3 py-1 rounded-full shadow z-20">
                    ★ Featured
                  </span>
                )}
              </div>
              {/* Details */}
              <div className="flex-1 flex flex-col justify-center p-8">
                <div className="uppercase tracking-wide text-xs text-[var(--color-coral)] font-semibold mb-2">
                  {project.category || "Project"}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {project.title}
                </h3>
                <p className="text-white/80 mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-[var(--color-teal)]/30 text-xs px-2 py-1 rounded-full text-white/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
