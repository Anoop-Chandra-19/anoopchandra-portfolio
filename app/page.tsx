"use client";

import { useRef } from "react";
import { useLenis } from "@/hooks/useLenis";
import SectionHero from "@/components/SectionHero";
import SectionProjects from "@/components/SectionProjects";
import SectionAbout from "@/components/SectionAbout";
import SectionDemos from "@/components/SectionDemos";


export default function Home() {
  const mainRef = useRef<HTMLElement | null>(null);
  useLenis(mainRef);

  return (
    <main
      ref={mainRef}
      className="snap-y snap-proximity h-screen overflow-y-scroll scroll-smooth"
    >
      <div>
        <SectionHero id = "hero"/>
        <SectionProjects id = "projects"/>
        <SectionAbout id = "about"/>
        <SectionDemos id = "demos"/>
      </div>
    </main>
  );
}
