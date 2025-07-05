"use client";
import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type InfoModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
};

export default function InfoModal({ open, onClose, children, title }: InfoModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Trap focus on open & allow ESC to close
  useEffect(() => {
    if (open && closeBtnRef.current) closeBtnRef.current.focus();

    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-modal="true"
        role="dialog"
      >
        <motion.div
          className="bg-navy text-white rounded-xl shadow-xl max-w-xl w-full p-8 relative border-2 border-[var(--color-electric)]"
          initial={{ scale: 0.96, opacity: 0, y: 44 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 24 }}
          transition={{ type: "spring", bounce: 0.22, duration: 0.32 }}
        >
          <button
            ref={closeBtnRef}
            className="absolute top-3 right-3 text-electric hover:text-coral text-2xl font-bold outline-none"
            onClick={onClose}
            aria-label="Close info modal"
          >
            ×
          </button>
          {title && <h3 className="text-2xl font-bold text-electric mb-4">{title}</h3>}
          <div className="text-base text-white">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
