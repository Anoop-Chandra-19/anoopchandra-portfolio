// The phone's stand-in for the ledger's filter row and column headings, both of
// which are display:none below the breakpoint — which left sort unreachable and
// subject filterable only from rows already on screen.
//
// Selections are pending until "show N entries": committing per tap would
// re-sort the list under the sheet while the reader is still choosing.
"use client";
import { useState } from "react";
import BottomSheet from "@/components/ui/BottomSheet";
import { PHONE_QUERY } from "@/lib/breakpoints";
import {
  TAGS,
  matchesEntry,
  type Filter,
  type JournalEntryMeta,
  type JournalQuery,
} from "@/lib/journal-meta";

export type SortKey = "title" | "read" | "date";
export type Sort = { key: SortKey; dir: "asc" | "desc" };
export type FilterValue = JournalQuery & { sort: Sort };

const KINDS: ReadonlyArray<[Filter, string]> = [
  ["all", "all"],
  ["case", "case studies"],
  ["note", "notes"],
];

const SORTS: ReadonlyArray<[SortKey, string]> = [
  ["date", "date"],
  ["read", "read time"],
  ["title", "title"],
];

const DIR_LABEL = { asc: "ascending", desc: "descending" } as const;

function Chip({
  on,
  disabled,
  onSelect,
  className,
  children,
  srSuffix,
}: {
  on: boolean;
  disabled?: boolean;
  onSelect: () => void;
  className?: string;
  children: React.ReactNode;
  srSuffix?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      disabled={disabled}
      className={`journal-chip ${className ?? ""} ${on ? "is-on" : ""}`}
      onClick={onSelect}
    >
      {children}
      {srSuffix && <span className="sr-only">{srSuffix}</span>}
    </button>
  );
}

export default function JournalFilterSheet({
  open,
  id,
  entries,
  years,
  value,
  opener,
  onApplyAction,
  onCloseAction,
}: {
  open: boolean;
  id?: string;
  entries: JournalEntryMeta[];
  years: string[];
  value: FilterValue;
  opener?: HTMLElement | null;
  onApplyAction: (next: FilterValue) => void;
  onCloseAction: () => void;
}) {
  const [draft, setDraft] = useState(value);

  // Re-opening shows what is applied, not what was abandoned last time.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(value);
  }

  const count = (q: Partial<JournalQuery>) =>
    entries.filter((e) => matchesEntry(e, { ...draft, ...q })).length;
  const resultCount = entries.filter((e) => matchesEntry(e, draft)).length;

  const set = (patch: Partial<FilterValue>) => setDraft((d) => ({ ...d, ...patch }));

  // Re-tapping the active sort flips it; a new key starts at its natural end.
  const pickSort = (key: SortKey) =>
    set({
      sort:
        draft.sort.key === key
          ? { key, dir: draft.sort.dir === "asc" ? "desc" : "asc" }
          : { key, dir: key === "title" ? "asc" : "desc" },
    });

  return (
    <BottomSheet
      open={open}
      id={id}
      classPrefix="je-filtersheet"
      label="✎ filter the book"
      ariaLabel="filter the book"
      closeLabel="close filters"
      opener={opener}
      onCloseAction={onCloseAction}
      dismissQuery={PHONE_QUERY}
      footer={
        <div className="journal-sheet-foot">
          <button
            type="button"
            className="journal-sheet-clear"
            onClick={() => set({ filter: "all", tag: null, year: null })}
          >
            clear all
          </button>
          <button
            type="button"
            className="journal-sheet-apply"
            aria-live="polite"
            onClick={() => {
              onApplyAction(draft);
              onCloseAction();
            }}
          >
            show {resultCount} {resultCount === 1 ? "entry" : "entries"}
          </button>
        </div>
      }
    >
      <div className="journal-chipgrp" role="radiogroup" aria-label="kind">
        <div className="journal-chipgrp-lbl">kind</div>
        <div className="journal-chips">
          {KINDS.map(([k, label]) => (
            <Chip key={k} on={draft.filter === k} onSelect={() => set({ filter: k })}>
              {label} <span className="journal-chip-n">{count({ filter: k })}</span>
            </Chip>
          ))}
        </div>
      </div>

      <div className="journal-chipgrp" role="radiogroup" aria-label="subject">
        <div className="journal-chipgrp-lbl">subject</div>
        <div className="journal-chips">
          <Chip on={draft.tag === null} onSelect={() => set({ tag: null })}>
            all
          </Chip>
          {/* The allowlist, not what happens to be on screen — a subject with
              nothing filed should read as filed-but-empty, not absent. */}
          {TAGS.map((t) => {
            const n = count({ tag: t });
            return (
              <Chip
                key={t}
                className="is-tag"
                on={draft.tag === t}
                /* Never the current pick: narrowing kind can zero out the subject
                   you already chose, and a checked-but-disabled chip is a trap. */
                disabled={n === 0 && draft.tag !== t}
                onSelect={() => set({ tag: t })}
                srSuffix={n === 0 ? ", nothing filed" : undefined}
              >
                {t}
              </Chip>
            );
          })}
        </div>
      </div>

      {years.length > 1 && (
        <div className="journal-chipgrp" role="radiogroup" aria-label="year">
          <div className="journal-chipgrp-lbl">year</div>
          <div className="journal-chips">
            <Chip on={draft.year === null} onSelect={() => set({ year: null })}>
              all
            </Chip>
            {years.map((y) => (
              <Chip key={y} on={draft.year === y} onSelect={() => set({ year: y })}>
                {y} <span className="journal-chip-n">{count({ year: y })}</span>
              </Chip>
            ))}
          </div>
        </div>
      )}

      <div className="journal-chipgrp" role="radiogroup" aria-label="sort">
        <div className="journal-chipgrp-lbl">sort</div>
        <div className="journal-chips">
          {SORTS.map(([k, label]) => {
            const on = draft.sort.key === k;
            return (
              <Chip
                key={k}
                on={on}
                onSelect={() => pickSort(k)}
                srSuffix={on ? `, sorted ${DIR_LABEL[draft.sort.dir]}` : undefined}
              >
                {label}
                {on && (
                  <span aria-hidden="true" className="journal-chip-dir">
                    {draft.sort.dir === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </Chip>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}
