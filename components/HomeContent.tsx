import Hero from "@/components/sections/Hero";
import Now from "@/components/sections/Now";
import Work from "@/components/sections/Work";
import Lab from "@/components/sections/Lab";
import Stack from "@/components/sections/Stack";
import Notes from "@/components/sections/Notes";
import Contact from "@/components/sections/Contact";
import type { JournalEntryMeta } from "@/lib/journal-meta";

// The home page's section stack.
export default function HomeContent({
  journalEntries,
}: {
  journalEntries: JournalEntryMeta[];
}) {
  return (
    <>
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
      <Notes entries={journalEntries} />
      <hr className="divider" />
      <Contact />
      <div style={{ marginTop: 40, textAlign: "center" }} className="font-mono text-[13px] tracking-[-0.2px] faint">
        — © 2026 Anoopchandra Parampalli —
      </div>
    </>
  );
}
