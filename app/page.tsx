import { LenisProvider } from "@/components/LenisProvider";
import SideNav from "@/components/nav/SideNav";
import Hero from "@/components/sections/Hero";
import Now from "@/components/sections/Now";
import Work from "@/components/sections/Work";
import Lab from "@/components/sections/Lab";
import Stack from "@/components/sections/Stack";
import Notes from "@/components/sections/Notes";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <LenisProvider>
      <div className="page">
        <Hero />
        <hr className="divider" />
        <Now />
        <hr className="divider" />
        <Work />
        <hr className="divider" />
        <Lab />
        <hr className="divider" />
        <Stack />
        <hr className="divider" />
        <Notes />
        <hr className="divider" />
        <Contact />
        <SideNav />
        <div style={{ marginTop: 40, textAlign: "center" }} className="mono faint">
          — © 2026 Anoopchandra Parampalli · made by hand —
        </div>
      </div>
    </LenisProvider>
  );
}
