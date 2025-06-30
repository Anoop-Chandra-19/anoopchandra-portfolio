"use client";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useAnimation, LayoutGroup } from "framer-motion";
import { useLenisInstance } from "./LenisProvider";
import ContactModal from "./ContactModal";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const controls = useAnimation();
  const lenis = useLenisInstance();
  const [hovered, setHovered] = useState<string | null>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // For contact modal
  const [modalOpen, setModalOpen] = useState(false);

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
        ? "rgba(24, 25, 45, 0.97)" // deep navy
        : "rgba(255,255,255,0)", // transparent
      boxShadow: scrolled
        ? "0 6px 32px 0 rgba(0,0,0,0.18), 0 1px 0 0 rgba(255,255,255,0.07)"
        : "0 0px 0px 0 rgba(0,0,0,0.00)",
      height: scrolled ? 64 : 88,
      transition: {
        duration: 0.44,
        ease: scrolled ? [0.33, 1, 0.68, 1] : [0.32, 0.72, 0, 1],
      },
    });
  }, [scrolled, controls]);

  const navLinks = [
    { label: "Projects", id: "projects" },
    { label: "About", id: "about" },
    { label: "Demos", id: "demos" },
    { label: "Resume", id: "resume" },
  ];

  function handleNavClick(link: any) {
    if (link.id === "resume") {
      window.open("/resume.pdf", "_blank");
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
  }, [hovered]);

  return (
    <>
      <ContactModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <motion.nav
        animate={controls}
        className={`
          fixed top-0 left-0 w-full z-40 transition-all duration-300
          px-2
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
        <div className="max-w-5xl mx-auto flex items-center justify-between px-5 h-full">
          <Link
            href="/"
            className={`font-bold text-2xl tracking-tight transition-colors duration-300 ${
              scrolled ? "text-[var(--color-electric)]" : "text-[var(--color-electric)]"
            }`}
            aria-label="Homepage"
          >
            AP
          </Link>
            <div 
              ref={navContainerRef} 
              className=" relative flex gap-10 items-center">
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
                    >
                    {link.label}
                    </button>
              ))}
              {/* Underline animation on hover */}
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
          <button
            onClick={() => setModalOpen(true)}
            className={`px-5 py-2 rounded-xl font-bold shadow transition-all duration-300
              ${scrolled
                ? "bg-[var(--color-electric)] text-white hover:bg-[var(--color-coral)]"
                : "bg-[var(--color-electric)] text-white hover:bg-[var(--color-coral)]"
              }
            `}
            aria-label="Contact Me"
          >
            Contact Me
          </button>
        </div>
      </motion.nav>
    </>
  );
}
