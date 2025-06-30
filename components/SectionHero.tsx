"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function SectionHero({ id } : { id: string }) {
  const [isHover, setIsHover] = useState(false);

  return (
    <section
      id={id}
      className="min-h-screen snap-start flex flex-col items-center justify-center bg-[var(--color-navy)] relative overflow-hidden"
    >
      {/* TOP ACCENT BAR */}
      <div className="absolute top-0 left-0 w-full h-3 md:h-4 bg-gradient-to-r from-[var(--color-electric)] via-[var(--color-teal)] to-[var(--color-coral)] z-20" />
      
      {/* Animated Gradient Glow (grows on hover) */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[430px] h-[270px] bg-[radial-gradient(ellipse_at_center,_var(--color-electric)_50%,_var(--color-coral)_90%)] blur-3xl z-0 pointer-events-none"
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{
          opacity: isHover ? 0.48 : 0.25,
          scale: isHover ? 1.22 : 1,
        }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      />
      {/* Photo with Shadow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: "backOut" }}
        className="relative z-10"
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        tabIndex={0}
        onFocus={() => setIsHover(true)}
        onBlur={() => setIsHover(false)}
        style={{ outline: "none" }}
      >
        <Image
          src="/anoopchandra.jpg"
          alt="Anoopchandra Parampalli portrait"
          width={400}
          height={400}
          className="rounded-full border-4 border-[var(--color-electric)] shadow-xl object-cover shadow-[0_8px_40px_rgba(204,0,230,0.18)]"
          priority
        />
        {/* Accent Blob Divider */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 mt-[-16px] w-24 h-6 z-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: "backOut" }}
        >
          <div className="w-24 h-6 bg-[var(--color-coral)] blur-md opacity-90 rounded-full" />
        </motion.div>
      </motion.div>
      {/* Headline */}
      <motion.h1
        className="relative z-10 mt-10 text-5xl md:text-4xl font-bold text-center text-[var(--color-electric)] drop-shadow-[0_2px_16px_rgba(204,0,230,0.20)]"
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.25, ease: "backOut" }}
      >
        Hi, I'm Anoopchandra Parampalli (but friends call me Anoop).
      </motion.h1>
      {/* Subtext */}
      <motion.p
        className="relative z-10 mt-4 text-lg md:text-xl text-white/85 max-w-xl text-center font-light"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.65, ease: "easeOut" }}
      >
        I build AI, custom PCs, and anything else that can be torn down and rebuilt—always for the person, not just the specs.
      </motion.p>
      {/* Scroll Down Cue */}
      <motion.div
        className="relative z-10 mt-16 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.6, y: 0 }}
        transition={{ duration: 1.2, delay: 1.1 }}
      >
        <span className="text-sm text-white/70">Scroll</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{
            repeat: Infinity,
            duration: 1.1,
            ease: "easeInOut",
          }}
        >
          <svg width="24" height="24" fill="none">
            <path d="M12 5v14M12 19l6-6M12 19l-6-6" stroke="#cc00e6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
