import SideNav from "@/components/nav/SideNav";
import MobileIndexNav from "@/components/nav/MobileIndexNav";
import HomeContent from "@/components/HomeContent";
import { getNotes } from "@/lib/journal";

export default function Home() {
  return (
    <div className="page">
      <HomeContent journalEntries={getNotes()} />
      <SideNav />
      <MobileIndexNav />
    </div>
  );
}
