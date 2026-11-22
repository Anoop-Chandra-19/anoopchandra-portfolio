import type { ReactNode } from "react";

// Pieces every experiment shares. Lab pages set --lxa to the experiment's
// accent (LabShell).

/** Two columns, input then output; one column on phones. `field` gives the
    point field the wider column. */
export function LabBody({ field = false, children }: { field?: boolean; children: ReactNode }) {
  return (
    <div
      className={`grid [align-items:start] gap-7.5 max-wide:grid-cols-1 max-wide:gap-6 ${
        field ? "grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]" : "grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
      }`}
    >
      {children}
    </div>
  );
}

/** A column. The output column is set off by a dashed rule: left on desktop,
    top on phones. */
export function LabPanel({ out = false, children }: { out?: boolean; children: ReactNode }) {
  return (
    <div
      className={
        out
          ? "min-w-0 pl-7 [border-left:1.5px_dashed_color-mix(in_oklab,var(--color-ink)_22%,transparent)] max-wide:pl-0 max-wide:pt-5 max-wide:[border-left:none] max-wide:[border-top:1.5px_dashed_color-mix(in_oklab,var(--color-ink)_22%,transparent)]"
          : "min-w-0"
      }
    >
      {children}
    </div>
  );
}

// The drawing surfaces: paper with a faint grid.
const GRID_PAPER =
  "border-2 border-ink rounded-[4px] bg-[#fdfaf2] bg-[linear-gradient(color-mix(in_oklab,var(--color-ink)_6%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklab,var(--color-ink)_6%,transparent)_1px,transparent_1px)] cursor-crosshair touch-none";
const FOCUS_RING =
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--lxa,var(--color-electric))]";

export const CANVAS = `${GRID_PAPER} block max-w-full [background-size:20px_20px]`;

/** The k-means / perceptron point field and what sits on it. */
export const FIELD = `${GRID_PAPER} ${FOCUS_RING} relative w-full aspect-square overflow-hidden [container-type:inline-size] [background-size:24px_24px]`;
export const POINT =
  "absolute size-3 rounded-full border-[1.5px] border-ink [transform:translate(-50%,-50%)] [transition:background_0.3s] motion-reduce:transition-none";
/** A point you can click: a larger invisible hit area. */
export const POINT_BUTTON = `${POINT} p-0 cursor-pointer after:content-[''] after:absolute after:-inset-2.5 after:rounded-full ${FOCUS_RING}`;
/** Centroids (✕) and the keyboard cursor (+). */
export const MARK =
  "absolute pointer-events-none font-mono text-[22px] font-bold [transform:translate(-50%,-52%)] [transition:left_0.55s_cubic-bezier(0.3,0.7,0.3,1),top_0.55s_cubic-bezier(0.3,0.7,0.3,1)] [text-shadow:0_1px_0_var(--color-paper),0_0_3px_var(--color-paper)] motion-reduce:transition-none";
/** Centred over an empty surface. */
export const CENTER_HINT =
  "absolute left-1/2 top-1/2 [transform:translate(-50%,-50%)] font-mono text-ink-faint pointer-events-none";
export const FIELD_HINT = `${CENTER_HINT} w-[calc(100%-32px)] text-[clamp(10px,2.5cqw,13px)] leading-[1.5] text-center text-balance whitespace-normal max-wide:max-w-[calc(100%-32px)] max-wide:text-[12.5px] max-wide:leading-[1.55]`;

export const CONTROL_ROW = "flex flex-wrap items-center gap-[9px] mt-4";
export const STATUS = "mt-1.5 mb-[18px] font-mono text-[14px] leading-[1.6] text-ink-soft";
export const LEGEND = "flex flex-col gap-2.5";
export const LEGEND_ROW = "flex items-center gap-2 font-mono text-[13px] tracking-[-0.2px] text-ink-soft";
export const LEGEND_DOT = "size-3 rounded-full border-[1.5px] border-ink";
/** Small mono note under a control: hints and the weight readout. */
export const NOTE = "mt-2.5 max-w-[42ch] font-mono text-[12.5px] leading-[1.55] text-ink-soft";
