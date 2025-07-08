// components/SocialFooter.tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

const socials = [
  {
    label: "GitHub",
    href: "https://github.com/Anoop-Chandra-19",
    icon: <FaGithub className="w-6 h-6" />,
    color: "hover:text-electric",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/anoopchandra-parampalli/",
    icon: <FaLinkedin className="w-6 h-6" />,
    color: "hover:text-teal",
  },
  {
    label: "Email",
    href: "mailto:anoopchandraparampalli@gmail.com",
    icon: <FaEnvelope className="w-6 h-6" />,
    color: "hover:text-coral",
  },
];

export default function SocialFooter({ show = true }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.footer
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 250, damping: 28 }}
          className="
            fixed left-0 right-0 bottom-0 z-50
            flex justify-center items-center gap-10
            bg-gradient-to-t from-black/80 via-navy/70 to-transparent
            px-6 py-4 md:py-3
            rounded-t-2xl shadow-xl
            backdrop-blur-md
            pointer-events-auto
          "
          aria-label="Social links footer"
        >
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className={`transition-colors duration-200 text-white/80 ${s.color} focus-visible:outline-none focus-visible:ring-2 focus:ring-[var(--color-electric)] rounded-full`}
              tabIndex={0}
            >
              {s.icon}
            </a>
          ))}
        </motion.footer>
      )}
    </AnimatePresence>
  );
}
