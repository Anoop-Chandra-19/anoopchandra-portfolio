"use client";

import { useRef } from "react";
import { useLenis } from "@/hooks/useLenis";
import SectionHero from "@/components/SectionHero";
import SectionProjects from "@/components/SectionProjects";
import SectionAbout from "@/components/SectionAbout";
import SectionDemos from "@/components/SectionDemos";
import SectionProgressBar from "@/components/SectionProgressBar";


export default function Home() {
  const mainRef = useRef<HTMLElement | null>(null);
  useLenis(mainRef);

  return (
    <>
      <SectionProgressBar scrollContainerRef={mainRef} />
      <main
        ref={mainRef}
        className="h-screen overflow-y-scroll scroll-smooth"
      >
        <div>
          <SectionHero id = "hero"/>
          <SectionProjects id = "projects"/>
          <SectionAbout id = "about"/>
          <SectionDemos id = "demos"/>
        </div>
      </main>
    </>
  );
}
