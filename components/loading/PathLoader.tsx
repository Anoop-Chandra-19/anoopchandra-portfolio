"use client";
import { usePathname } from "next/navigation";
import JournalEntryOutline from "./JournalEntryOutline";
import LabOutline from "./LabOutline";
import MonogramLoader from "./MonogramLoader";

/**
 * The root loader (app/loading.tsx). It wraps every route, and it is the one
 * the router shows when it hasn't fetched a route yet and so doesn't know that
 * route has a loader of its own. Picking by URL means a journal entry or lab
 * page opens straight on its own outline, and the hand-off to that route's
 * loader, which draws the same thing, can't be seen.
 */
export default function PathLoader() {
  const pathname = usePathname();
  if (/^\/journal\/[^/]+\/?$/.test(pathname)) return <JournalEntryOutline />;
  if (/^\/lab\/[^/]+\/?$/.test(pathname)) return <LabOutline />;
  return <MonogramLoader />;
}
