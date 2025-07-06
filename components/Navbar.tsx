"use client";
import { useRef, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useLenisInstance } from "./LenisProvider";
import ContactModal from "./ContactModal";
import HamburgerIcon from "./HamburgerIcon";

type NavLink = {
  label: string;
  id: string;
};


export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const controls = useAnimation();
  const lenis = useLenisInstance();
  const [hovered, setHovered] = useState<string | null>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // For contact modal
  const [modalOpen, setModalOpen] = useState(false);
  // For mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Only scroll with Lenis!
  function scrollToSection(id: string) {
    const target = document.getElementById(id);
    if (lenis && target) {
      lenis.scrollTo(target, { offset: -64, duration: 1.1, lerp: 0.1 });
    } else if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }

  useEffect(() => {
    function onScroll() {
      const hero = document.getElementById("hero");
      if (!hero) return;
      const threshold = hero.offsetHeight - 64; // 64 = nav height
      setScrolled(window.scrollY >= threshold);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    controls.start({
      backgroundColor: scrolled
        ? "rgba(24, 25, 45, 0.4)" // deep navy
        : "rgba(255,255,255,0)", // transparent
      boxShadow: scrolled
        ? "0 6px 32px 0 rgba(0,0,0,0.18), 0 1px 0 0 rgba(255,255,255,0.07)"
        : "0 0px 0px 0 rgba(0,0,0,0.00)",
      height: scrolled ? 80 : 88,
      transition: {
        duration: 0.44,
        ease: scrolled ? [0.33, 1, 0.68, 1] : [0.32, 0.72, 0, 1],
      },
    });
  }, [scrolled, controls]);

  const navLinks: NavLink[] = useMemo(() => [
    { label: "Projects", id: "projects" },
    { label: "About", id: "about" },
    { label: "Demos", id: "demos" },
    { label: "Resume", id: "resume" },
  ], []);

  function handleNavClick(link: NavLink) {
    if (link.id === "resume") {
      window.open("/Anoopchandra_resume.pdf", "_blank");
    } else {
      scrollToSection(link.id);
    }
  }

  const [underlineProps, setUnderlineProps] = useState({ left: 0, width: 0, visible: false });
  useEffect(() => {
    if (hovered !== null) {
      const idx = navLinks.findIndex(link => link.id === hovered);
      const btn = buttonRefs.current[idx];
      if (btn) {
        const { left, width } = btn.getBoundingClientRect();
        const parentLeft = navContainerRef.current?.getBoundingClientRect().left ?? 0;
        setUnderlineProps({ left: left - parentLeft, width, visible: true });
      }
    } else {
      setUnderlineProps(prev => ({ ...prev, visible: false }));
    }
  }, [hovered, navLinks]);

  // For ESC key to close menu
  useEffect(() => {
    if (!mobileMenuOpen) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileMenuOpen(false);
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [mobileMenuOpen]);

  return (
    <>
      <ContactModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Mobile menu popover w/ animation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            aria-modal="true"
            role="dialog"
          >
            <motion.div
              className="bg-[var(--color-navy)] rounded-2xl p-8 flex flex-col gap-6 items-center shadow-lg w-[90vw] max-w-xs relative"
              initial={{ opacity: 0, y: 80, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 80, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 320, damping: 26, delay: 0.04 }}
              tabIndex={-1}
            >
              {/* Nav links */}
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNavClick(link);
                  }}
                  className="text-xl text-white font-bold hover:text-[var(--color-coral)] w-full py-2 transition-colors duration-200"
                  aria-label={link.label}
                  tabIndex={0}
                  type="button"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setModalOpen(true);
                }}
                className="bg-[var(--color-electric)] px-6 py-2 rounded-xl text-white font-bold mt-4 w-full hover:bg-[var(--color-coral)] transition-all duration-200"
                aria-label="Contact Me"
                tabIndex={0}
                type="button"
              >
                Contact Me
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main navbar */}
      <motion.nav
        animate={controls}
        className={`
          fixed top-0 left-0 w-full z-[9999] transition-all duration-300
          px-0
          backdrop-blur
        `}
        role="navigation"
        aria-label="Main Navigation"
        style={{
          backgroundColor: scrolled
            ? "rgba(24, 25, 45, 0.97)"
            : "rgba(255,255,255,0)",
        }}
      >
        {/* KEY CHANGE: w-full on mobile, max-w-5xl centered ONLY on md+ */}
        <div className="flex items-center justify-between w-screen px-2 gap-2 h-full md:max-w-5xl md:mx-auto md:px-5 md:gap-10">
          {/* Logo */}
          <Link
            href="/"
            className={`font-bold text-2xl tracking-tight transition-colors duration-300 ${
              scrolled ? "text-[var(--color-electric)]" : "text-[var(--color-electric)]"
            }`}
            aria-label="Homepage"
          >
            AP
          </Link>

          {/* Hamburger menu on mobile only - animated */}
          <HamburgerIcon
            open={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((v) => !v)}
          />

          {/* Desktop nav links (hidden on mobile) */}
          <div ref={navContainerRef} className="hidden md:flex relative items-center gap-10">
            {navLinks.map((link, idx) => (
              <button
                key={link.id}
                ref={el => { buttonRefs.current[idx] = el; }}
                onClick={() => handleNavClick(link)}
                onMouseEnter={() => setHovered(link.id)}
                onMouseLeave={() => setHovered(null)}
                className={`relative text-lg font-semibold tracking-tight px-2 py-1 transition-colors duration-300 focus:outline-none
                  ${scrolled
                    ? "text-white hover:text-[var(--color-coral)]"
                    : "text-white hover:text-[var(--color-coral)]"
                  }
                `}
                style={{ background: "none", border: "none" }}
                aria-label={link.label}
                tabIndex={0}
                type="button"
              >
                {link.label}
              </button>
            ))}
            {underlineProps.visible && (
              <motion.div
                layout
                className="absolute bottom-0 h-0.5 rounded-full pointer-events-none"
                style={{
                  left: underlineProps.left,
                  width: underlineProps.width,
                  background: "linear-gradient(90deg, var(--color-electric), var(--color-coral))",
                }}
                initial={{ scaleX: 0.2, opacity: 0 }}
                animate={{ scaleX: underlineProps.visible ? 1 : 0.2, opacity: underlineProps.visible ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 24 }}
              />
            )}
          </div>

          {/* Desktop Contact Me button (hidden on mobile) */}
          <button
            onClick={() => setModalOpen(true)}
            className={`
              px-5 py-2 rounded-xl font-bold shadow transition-all duration-300 hidden md:block
              ${scrolled
                ? "bg-[var(--color-electric)] text-white hover:bg-[var(--color-coral)]"
                : "bg-[var(--color-electric)] text-white hover:bg-[var(--color-coral)]"
              }
            `}
            aria-label="Contact Me"
            tabIndex={0}
            type="button"
          >
            Contact Me
          </button>
        </div>
      </motion.nav>
    </>
  );
}
