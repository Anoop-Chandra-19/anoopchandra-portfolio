// The phone's stand-in for the ledger's filter row and column headings, both of
// which are display:none below the breakpoint — which left sort unreachable and
// subject filterable only from rows already on screen.
//
// Selections are pending until "show N entries": committing per tap would
// re-sort the list under the sheet while the reader is still choosing.
"use client";
import { useState } from "react";
import BottomSheet from "@/components/ui/BottomSheet";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import Pill from "@/components/ui/Pill";
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
  tone,
  children,
  srSuffix,
}: {
  on: boolean;
  disabled?: boolean;
  onSelect: () => void;
  tone?: "teal";
  children: React.ReactNode;
  srSuffix?: string;
}) {
  return (
    <Pill
      kind="choice"
      tone={tone}
      on={on}
      role="radio"
      aria-checked={on}
      disabled={disabled}
      onClick={onSelect}
    >
      {children}
      {srSuffix && <span className="sr-only">{srSuffix}</span>}
    </Pill>
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
      bodyClassName="font-mono"
      label="✎ filter the book"
      ariaLabel="filter the book"
      closeLabel="close filters"
      opener={opener}
      onCloseAction={onCloseAction}
      dismissQuery={PHONE_QUERY}
      footer={
        <div className="flex items-center gap-2.5 mt-[9px] pt-[9px] border-t border-dashed border-ink-faint">
          <button
            type="button"
            className="inline-flex items-center min-h-11 -my-1 p-0 bg-transparent font-mono text-control-sm text-ink-soft cursor-pointer"
            onClick={() => set({ filter: "all", tag: null, year: null })}
          >
            clear all
          </button>
          <Button
            kind="pill"
            filled
            className="ml-auto"
            aria-live="polite"
            onClick={() => {
              onApplyAction(draft);
              onCloseAction();
            }}
          >
            show {resultCount} {resultCount === 1 ? "entry" : "entries"}
          </Button>
        </div>
      }
    >
      <div className="mb-[15px]" role="radiogroup" aria-label="kind">
        <Label kind="stamp" className="mb-2">kind</Label>
        <div className="flex flex-wrap gap-[7px]">
          {KINDS.map(([k, label]) => (
            <Chip key={k} on={draft.filter === k} onSelect={() => set({ filter: k })}>
              {label} <span className="text-[11px] opacity-70">{count({ filter: k })}</span>
            </Chip>
          ))}
        </div>
      </div>

      <div className="mb-[15px]" role="radiogroup" aria-label="subject">
        <Label kind="stamp" className="mb-2">subject</Label>
        <div className="flex flex-wrap gap-[7px]">
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
                tone="teal"
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
        <div className="mb-[15px]" role="radiogroup" aria-label="year">
          <Label kind="stamp" className="mb-2">year</Label>
          <div className="flex flex-wrap gap-[7px]">
            <Chip on={draft.year === null} onSelect={() => set({ year: null })}>
              all
            </Chip>
            {years.map((y) => (
              <Chip key={y} on={draft.year === y} onSelect={() => set({ year: y })}>
                {y} <span className="text-[11px] opacity-70">{count({ year: y })}</span>
              </Chip>
            ))}
          </div>
        </div>
      )}

      <div className="mb-[15px]" role="radiogroup" aria-label="sort">
        <Label kind="stamp" className="mb-2">sort</Label>
        <div className="flex flex-wrap gap-[7px]">
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
                  <span aria-hidden="true" className="opacity-80">
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
