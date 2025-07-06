"use client";
import { motion } from "framer-motion";
import React from "react";

type HamburgerIconProps = {
  open: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
};

const HamburgerIcon: React.FC<HamburgerIconProps> = ({ open, onClick, className = "" }) => (
  <button
    aria-label={open ? "Close menu" : "Open menu"}
    className={`md:hidden flex flex-col justify-center items-center w-10 h-10 p-2 relative z-[10000] focus:outline-none ${className}`}
    tabIndex={0}
    type="button"
    onClick={onClick}
  >
    <motion.span
      className="block h-0.5 w-7 bg-[var(--color-electric)] rounded transition-all"
      animate={{
        rotate: open ? 45 : 0,
        y: open ? 8 : 0,
      }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
    />
    <motion.span
      className="block h-0.5 w-7 bg-[var(--color-electric)] rounded my-1 transition-all"
      animate={{
        opacity: open ? 0 : 1,
      }}
      transition={{ duration: 0.18 }}
    />
    <motion.span
      className="block h-0.5 w-7 bg-[var(--color-electric)] rounded transition-all"
      animate={{
        rotate: open ? -45 : 0,
        y: open ? -8 : 0,
      }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
    />
  </button>
);

export default HamburgerIcon;
