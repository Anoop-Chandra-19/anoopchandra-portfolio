// Both transitions use a full home copy; neither constructs a partial destination.
import type { JournalEntryMeta } from "@/lib/journal-meta";
import HomeContent from "@/components/HomeContent";
import SideNav from "@/components/nav/SideNav";
import MobileIndexNav from "@/components/nav/MobileIndexNav";

/** Inert full-document copy of home.
    scrollY: the origin scroll offset at navigate time (bleed leaves home from
    wherever the user was; peel lands home at the top, so 0). The paper
    background lives on the offset document (.ink-doc), not the viewport, so
    the ruled lines stay aligned with the content exactly like the real body. */
export default function HomeLayer({
  entries,
  scrollY = 0,
}: {
  entries: JournalEntryMeta[];
  scrollY?: number;
}) {
  const notes = entries.filter((e) => e.kind === "note");
  return (
    <div className="ink-layer-paper" aria-hidden="true" inert>
      <div
        className="ink-doc ink-layer-home"
        style={{ transform: `translateY(${-scrollY}px)` }}
      >
        <div className="page">
          <HomeContent journalEntries={notes} />
        </div>
      </div>
      {/* outside the transformed doc — stays viewport-fixed like the real chrome */}
      <SideNav frozenAt={scrollY} />
      <MobileIndexNav frozenAt={scrollY} />
    </div>
  );
}
