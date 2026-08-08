import type { Metadata } from "next";
import { BOOK, getEntryMetas } from "@/lib/journal";
import JournalIndex from "@/components/journal/JournalIndex";

export const metadata: Metadata = {
  title: "The Journal",
  description:
    "A working notebook for bug stories, personal projects, opinions, and things I figured out the hard way.",
  alternates: { canonical: "/journal" },
  openGraph: {
    type: "website",
    url: "https://anoopchandra.dev/journal",
    title: "The Journal | Anoopchandra Parampalli",
    description:
      "Bug stories, personal projects, opinions, and things I figured out the hard way.",
  },
};

export default function JournalPage() {
  // BOOK is populated as a side effect of loading the entries, so read it
  // after the call rather than relying on JSX prop evaluation order.
  const entries = getEntryMetas();
  return (
    <div data-journal-root>
      <JournalIndex entries={entries} book={{ ...BOOK }} />
    </div>
  );
}
