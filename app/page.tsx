"use client";

import { useLenis } from "@/hooks/useLenis";
import SectionHero from "@/components/SectionHero";
import SectionProjects from "@/components/SectionProjects";
import SectionAbout from "@/components/SectionAbout";
import SectionDemos from "@/components/SectionDemos";
import SectionProgressBar from "@/components/SectionProgressBar";

export default function Home() {
  useLenis(); // No ref, window scroll only!

  return (
    <>
      <SectionProgressBar />
      <main>
        <SectionHero id="hero" />
        <SectionProjects id="projects" />
        <SectionAbout id="about" />
        <SectionDemos id="demos" />
      </main>
    </>
  );
}
