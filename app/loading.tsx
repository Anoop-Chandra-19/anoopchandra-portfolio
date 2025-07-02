"use client";
import { motion } from "framer-motion";

// SVG filter for wavy effect (Option A)
function WavyText({ children }: { children: React.ReactNode }) {
  return (
    <svg width="100%" height="100" viewBox="0 0 360 100" className="overflow-visible">
      <defs>
        <filter id="wave">
          <feTurbulence id="turb" baseFrequency="0.03 0.04" numOctaves="2" seed="2" type="turbulence" result="turb"/>
          <feDisplacementMap in2="turb" in="SourceGraphic" scale="12" xChannelSelector="R" yChannelSelector="G"/>
          <animate xlinkHref="#turb" attributeName="seed" values="2;20;2" dur="2.2s" repeatCount="indefinite"/>
        </filter>
      </defs>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="64"
        fontWeight="bold"
        fill="#cc00e6"
        style={{ filter: "url(#wave)", fontFamily: "inherit" }}
      >
        {children}
      </text>
    </svg>
  );
}

export default function Loading() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-[var(--color-navy)] flex flex-col items-center justify-center"
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: "-100%", opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{
        y: { duration: 1.15, ease: [0.8, 0, 0.2, 1] },
        opacity: { duration: 0.85, delay: 0.7 },
      }}
      style={{ willChange: "transform, opacity" }}
    >
      {/* Option A: SVG Windy Initials */}
      <div className="mb-8" style={{ width: "360px", height: "100px" }}>
        <WavyText>AP</WavyText>
      </div>
      {/* Optionally add a gradient shimmer bar or logo here */}
      <motion.div
        className="h-2 w-28 rounded-full bg-gradient-to-r from-[var(--color-electric)] via-[var(--color-teal)] to-[var(--color-coral)]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.35, duration: 0.7, ease: "circOut" }}
        style={{ originX: 0 }}
      />
    </motion.div>
  );
}