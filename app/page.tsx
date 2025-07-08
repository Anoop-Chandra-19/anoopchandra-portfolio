"use client";

import { useEffect, useState, useCallback } from "react";
import { useLenis } from "@/hooks/useLenis";
import SectionHero from "@/components/SectionHero";
import SectionProjects from "@/components/SectionProjects";
import SectionAbout from "@/components/SectionAbout";
import SectionDemos from "@/components/SectionDemos";
import SectionProgressBar from "@/components/SectionProgressBar";
import SocialFooter from "@/components/SocialFooter";

export default function Home() {
  useLenis(); 
  const [showFooter, setShowFooter] = useState(true);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY || window.pageYOffset;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    if (scrollY + windowHeight >= docHeight - 200) {
      setShowFooter(true);
    } else {
      setShowFooter(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Call once on mount
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <>
      <SectionProgressBar />
      <main>
        <div className="flex-grow bg-gradient-to-br from-black to-[var(--color-navy)]">
          <SectionHero id="hero" />
          <SectionProjects id="projects" />
          <SectionAbout id="about" />
          <SectionDemos id="demos" />
        </div>
      </main>
      {showFooter && <SocialFooter />}
    </>
  );
}

