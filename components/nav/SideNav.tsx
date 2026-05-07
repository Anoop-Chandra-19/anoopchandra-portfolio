"use client";
import { useEffect, useState } from "react";
import { useLenisInstance } from "@/components/LenisProvider";

const ITEMS: ReadonlyArray<readonly [string, string, string]> = [
  ["home", "00", "cover"],
  ["now", "01", "now"],
  ["work", "02", "work"],
  ["lab", "03", "the lab"],
  ["stack", "04", "stack"],
  ["notes", "05", "notes"],
  ["contact", "06", "say hi"],
];

export default function SideNav() {
  const [active, setActive] = useState("home");
  const lenis = useLenisInstance();

  useEffect(() => {
    const onScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 80;
      if (nearBottom) {
        setActive("contact");
        return;
      }
      const y = window.scrollY + window.innerHeight * 0.35;
      let cur = "home";
      for (const [id] of ITEMS) {
        const el = document.getElementById(`sec-${id}`);
        if (el && el.offsetTop <= y) cur = id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = document.querySelector<HTMLElement>(`.dock-item[data-id="${active}"]`);
    if (el && el.parentElement) {
      el.parentElement.scrollTo({ left: el.offsetLeft - 40, behavior: "smooth" });
    }
  }, [active]);

  function jumpTo(id: string) {
    const target = document.getElementById(`sec-${id}`);
    if (!target) return;
    if (lenis) {
      lenis.scrollTo(target, { offset: 0, duration: 1.1, lerp: 0.1 });
    } else {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <>
      {/* Desktop: vertical left rail */}
      <nav
        className="side-nav-desktop"
        style={{
          position: "fixed",
          left: 28,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          padding: "14px 10px 14px 14px",
        }}
        aria-label="Section navigation"
      >
        <div
          className="mono faint anim-rail d-rail-h"
          style={{
            fontSize: 9,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 10,
            paddingLeft: 2,
          }}
        >
          index
        </div>
        {ITEMS.map(([id, num, label], idx) => {
          const isActive = active === id;
          return (
            <a
              key={id}
              href={`#sec-${id}`}
              className={`anim-rail d-rail-${idx}`}
              onClick={(e) => {
                e.preventDefault();
                jumpTo(id);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                color: "var(--ink)",
                padding: "5px 6px",
                borderRadius: 4,
                transition: "opacity 0.18s",
                opacity: isActive ? 1 : 0.55,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = isActive ? "1" : "0.55";
              }}
            >
              <span
                className="mono"
                style={{
                  fontSize: 10,
                  color: isActive ? "var(--electric)" : "var(--ink-faint)",
                  minWidth: 18,
                }}
              >
                {num}
              </span>
              <span
                style={{
                  position: "relative",
                  width: isActive ? 28 : 10,
                  height: 2,
                  background: isActive ? "var(--electric)" : "var(--ink)",
                  transition: "width 0.2s",
                  overflow: "hidden",
                }}
              />
              <span
                className="hand"
                style={{
                  fontSize: 17,
                  color: isActive ? "var(--electric)" : "var(--ink)",
                  transform: isActive ? "translateX(0)" : "translateX(-2px)",
                  transition: "all 0.18s",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            </a>
          );
        })}
      </nav>

      {/* Mobile: bottom horizontal dock */}
      <nav
        className="side-nav-mobile"
        aria-label="Section navigation"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          background: "color-mix(in oklab, var(--paper) 92%, transparent)",
          backdropFilter: "blur(6px)",
          borderTop: "2px solid var(--ink)",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 4,
            overflowX: "auto",
            padding: "10px 14px 12px",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {ITEMS.map(([id, num, label]) => {
            const isActive = active === id;
            return (
              <a
                key={id}
                href={`#sec-${id}`}
                className="dock-item"
                data-id={id}
                onClick={(e) => {
                  e.preventDefault();
                  jumpTo(id);
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  padding: "4px 10px",
                  textDecoration: "none",
                  color: "var(--ink)",
                  borderRadius: 6,
                  background: isActive ? "var(--ink)" : "transparent",
                  flexShrink: 0,
                  transition: "background 0.15s",
                }}
              >
                <span
                  className="mono"
                  style={{
                    fontSize: 9,
                    color: isActive
                      ? "color-mix(in oklab, var(--electric) 60%, white)"
                      : "var(--ink-faint)",
                    letterSpacing: 1,
                  }}
                >
                  {num}
                </span>
                <span
                  className="hand"
                  style={{
                    fontSize: 18,
                    color: isActive ? "var(--paper)" : "var(--ink)",
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
