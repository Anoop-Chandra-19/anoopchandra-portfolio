import RouteLoader, { Sketch } from "./RouteLoader";

/* Ruled notebook paper with only the entry's header blocked in. Each block
   sits in a box set like the text it stands for (components/journal/
   ArticleEntry.tsx), so the header lands on its blocks. Nothing is drawn
   below: the loader can't know whether this entry has a hero plate. */
const RULED =
  "bg-paper bg-[repeating-linear-gradient(to_bottom,transparent_0_25px,color-mix(in_oklab,var(--color-teal)_10%,transparent)_25px_26px)]";

/** One line of text's box, holding a block in its middle. */
const LINE = "inline-block align-middle";

export default function JournalEntryOutline() {
  return (
    <RouteLoader label="Loading entry" className={`relative min-h-dvh ${RULED}`}>
      <div aria-hidden="true">
        <span className="absolute inset-y-0 left-6 w-px bg-[color-mix(in_oklab,var(--color-coral)_35%,transparent)] max-wide:left-2" />
        <div className="relative w-[1280px] max-w-full mx-auto pt-11 px-10 pb-25 max-mid:w-full max-mid:pt-8 max-mid:px-6.5 max-mid:pb-20 max-wide:pt-6 max-wide:px-[18px] max-wide:pb-18">
          <div className="flex items-center justify-between flex-wrap gap-2.5 pb-4 mb-9.5 border-b-[1.5px] border-dashed border-ink-faint font-mono text-control">
            <Sketch className={`${LINE} w-[168px] py-1.5 border-[1.5px] border-transparent rounded-full`}>&nbsp;</Sketch>
            <Sketch className={`${LINE} w-[220px] h-[9px]`} />
          </div>

          <div className="max-w-[860px] mb-9">
            <div className="py-2 mb-[22px] border-t-2 border-b border-ink font-mono text-tag max-wide:text-stamp">
              <Sketch className={`${LINE} w-[230px] h-[9px]`} />
            </div>
            <div className="flex items-center flex-wrap gap-[9px] mb-[18px] font-mono text-control max-wide:text-control-sm">
              <Sketch className={`${LINE} w-[104px] py-1 border-[1.4px] border-transparent rounded-full`}>&nbsp;</Sketch>
              <Sketch className={`${LINE} w-[84px] py-1 border-[1.4px] border-transparent rounded-full`}>&nbsp;</Sketch>
            </div>
            <div className="mb-[18px] font-display font-semibold text-display">
              <Sketch isStrong className={`${LINE} w-[min(560px,80%)] h-[0.62em] after:[animation-delay:.05s]`} />
            </div>
            <div className="max-w-[680px] mb-6 font-display italic text-dek">
              <Sketch className={`${LINE} w-[92%] h-[0.42em] after:[animation-delay:.1s]`} />
              <br />
              <Sketch className={`${LINE} w-[54%] h-[0.42em] after:[animation-delay:.15s]`} />
            </div>
            <div className="flex items-center gap-[11px] py-[13px] border-y border-ink-faint">
              <Sketch className="size-[22px] rounded-full" />
              <Sketch className="w-[150px] h-2 after:[animation-delay:.2s]" />
            </div>
          </div>
        </div>
      </div>
    </RouteLoader>
  );
}
