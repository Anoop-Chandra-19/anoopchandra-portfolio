import SideNav from "@/components/nav/SideNav";
import MobileIndexNav from "@/components/nav/MobileIndexNav";
import HomeContent from "@/components/HomeContent";
import { getEntryMetas } from "@/lib/journal";
import { selectHomeJournalEntries } from "@/lib/journal-meta";

export default function Home() {
  return (
    <main id="main-content" className="page page-in:animate-page-in">
      <HomeContent journalEntries={selectHomeJournalEntries(getEntryMetas())} />
      <SideNav />
      <MobileIndexNav />
    </main>
  );
}
