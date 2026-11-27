"use client";
import { useState } from "react";
import type { JournalEntryMeta } from "@/lib/journal-meta";
import Label from "@/components/ui/Label";
import JournalFilterSheet, { type FilterValue } from "./JournalFilterSheet";

/**
 * The phone filter pill and the sheet it opens. The sheet's open state lives
 * here rather than in JournalIndex, so opening and closing it re-renders the
 * pill and the sheet, not every row of the index.
 */
export default function JournalFilterPill({
  text,
  count,
  isFiltered,
  entries,
  years,
  value,
  onApplyAction,
}: {
  text: string;
  /** How many entries the current filters show. */
  count: number;
  isFiltered: boolean;
  entries: JournalEntryMeta[];
  years: string[];
  value: FilterValue;
  onApplyAction: (next: FilterValue) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  /* The element, not a ref: useModalLifecycle returns focus here on close. */
  const [opener, setOpener] = useState<HTMLElement | null>(null);

  return (
    <>
      <button
        type="button"
        className={`flex items-center gap-[7px] flex-1 min-w-0 min-h-11 box-border px-3.5 font-mono text-control-sm text-ink bg-paper border-[1.5px] rounded-full cursor-pointer ${
          isFiltered
            ? "border-coral [box-shadow:2px_2px_0_color-mix(in_oklab,var(--color-coral)_30%,transparent)]"
            : "border-ink [box-shadow:2px_2px_0_color-mix(in_oklab,var(--color-ink)_16%,transparent)]"
        }`}
        aria-expanded={isOpen}
        aria-controls="journal-filter-sheet"
        onClick={(e) => {
          setOpener(e.currentTarget);
          setIsOpen(true);
        }}
      >
        <Label kind="stamp" as="span">filter</Label>
        <span className={`min-w-0 truncate ${isFiltered ? "text-coral-ink" : ""}`}>{text}</span>
        <span className="ml-auto text-ink-faint">{count}</span>
      </button>
      <JournalFilterSheet
        open={isOpen}
        id="journal-filter-sheet"
        entries={entries}
        years={years}
        value={value}
        opener={opener}
        onApplyAction={onApplyAction}
        onCloseAction={() => setIsOpen(false)}
      />
    </>
  );
}
