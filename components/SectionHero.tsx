import { useState } from "react";
import { motion, spring, easeInOut } from "framer-motion";
import Image from "next/image";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.17, delayChildren: 0.13 } } };
const headlineLine = { hidden: { opacity: 0, x: -60 }, show: { opacity: 1, x: 0, transition: { type: spring, stiffness: 120, damping: 13 } } };
const fadeRight = { hidden: { opacity: 0, x: 48 }, show: { opacity: 1, x: 0, transition: { type: spring, stiffness: 100, damping: 15 } } };
const fadeUp = { hidden: { opacity: 0, y: 34, scale: 0.96 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: spring, stiffness: 120, damping: 16 } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.86, rotate: -8 }, show: { opacity: 1, scale: 1, rotate: 0, transition: { type: spring, stiffness: 135, damping: 13, delay: 0.33 } } };

export default function SectionHero({ id }: { id: string }) {
  const [isHover, setIsHover] = useState(false);

  return (
    <section
      id={id}
      className="relative min-h-screen snap-start flex items-center bg-gradient-to-br from-black to-[var(--color-navy)] px-8 py-10 overflow-hidden md:pt-24 pt-20"
    >
      {/* Top accent bar ONLY */}
      <motion.div
        className="absolute top-0 left-0 h-3 md:h-4 bg-gradient-to-r from-[var(--color-electric)] via-[var(--color-teal)] to-[var(--color-coral)] z-20 "
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "100%", opacity: 1 }}
        transition={{ duration: 1, ease: easeInOut, delay: 0.1 }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-center gap-14">
        {/* Left: Text Block */}
        <motion.div
          className="flex-1 flex flex-col items-start md:pr-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.span
            variants={headlineLine}
            className="block text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-electric)] leading-tight"
          >
            Hi, I&apos;m Anoopchandra
          </motion.span>
          <motion.span
            variants={headlineLine}
            className="block text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-3"
          >
            Parampalli
          </motion.span>
          <motion.span
            variants={fadeRight}
            className="block text-lg font-normal text-white/70 mb-4"
            style={{ letterSpacing: 0.1 }}
          >
            (but friends call me Anoop)
          </motion.span>
          <motion.p
            className="mt-2 text-xl sm:text-2xl font-bold text-[var(--color-coral)] text-left"
            variants={fadeUp}
            whileHover={{
              color: "#fff",
              textShadow: "0 0 12px #ff715b",
              transition: { duration: 0.4 }
            }}
            transition={{ type: spring, stiffness: 80 }}
          >
            AI/ML Engineer
          </motion.p>
          <motion.div
            className="h-1 w-24 bg-[var(--color-electric)] rounded-lg mt-1 mb-1"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ type: spring, stiffness: 120, delay: 1.1 }}
            style={{ originX: 0 }}
          />
          <motion.p
            className="mt-4 text-base md:text-lg text-white/85 font-light max-w-md text-left"
            variants={fadeUp}
          >
            I build AI, custom PCs, and anything else that can be torn down and rebuilt - always for the person, not just the specs.
          </motion.p>
          <motion.div
            className="mt-12 flex flex-col items-start gap-2 group"
            variants={fadeUp}
          >
            <span className="text-sm text-white/70">Scroll</span>
            <motion.div
              variants={scaleIn}
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: easeInOut }}
              whileHover={{ scale: 1.19, rotate: 7 }}
              className="cursor-pointer"
            >
              <svg width="24" height="24" fill="none">
                <path d="M12 5v14M12 19l6-6M12 19l-6-6" stroke="#cc00e6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
        {/* Right: Photo Block */}
        <motion.div
          className="relative flex-shrink-0"
          variants={scaleIn}
          initial="hidden"
          animate="show"
          whileHover={{ scale: 1.065, rotate: 2, boxShadow: "0 0 0 8px #cc00e644" }}
          whileFocus={{ scale: 1.065, rotate: 2, boxShadow: "0 0 0 8px #cc00e644" }}
          tabIndex={0}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          onFocus={() => setIsHover(true)}
          onBlur={() => setIsHover(false)}
          style={{ outline: "none" }}
        >
          {/* Hover tooltip */}
          <motion.div
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-sm px-3 py-1 rounded-lg pointer-events-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHover ? 1 : 0, y: isHover ? 0 : 10 }}
            transition={{ duration: 0.2 }}
          >
            👋 Hi!
          </motion.div>
          <Image
            src="/anoopchandra.webp"
            alt="Anoopchandra Parampalli portrait"
            width={360}
            height={360}
            className="rounded-full border-4 border-[var(--color-electric)] shadow-xl object-cover transition-all duration-300"
            priority
            placeholder="blur"
          />
        </motion.div>
      </div>
    </section>
  );
}
