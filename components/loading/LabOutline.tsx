import CurrentPath from "@/components/ui/CurrentPath";
import RouteLoader, { Sketch } from "./RouteLoader";

/* The experiment's header blocked in over dashed outlines of the input and
   output columns (components/lab/LabShell.tsx and lab-ui.tsx). The output
   column starts the boot log with the one step that is really happening. */
const LINE = "inline-block align-middle";
const OUTLINE = "border-2 border-dashed border-[color-mix(in_oklab,var(--color-ink)_35%,transparent)] rounded-[4px]";
/** The line box of each column's `<Label kind="caption" className="mb-2">`. */
const CAPTION = "mb-2 font-mono text-caption";

export default function LabOutline() {
  return (
    <RouteLoader
      label="Loading experiment"
      className="max-w-[920px] mx-auto pt-9.5 px-10 pb-20 max-wide:pt-6.5 max-wide:px-5 max-wide:pb-[70px]"
    >
      <div aria-hidden="true">
        <div className="flex justify-between items-center gap-3.5 mb-6.5">
          <span className="font-mono text-[13px]">
            <Sketch className={`${LINE} w-[196px] py-[7px] border-[1.5px] border-transparent`}>&nbsp;</Sketch>
          </span>
          <span className="flex gap-2 font-mono text-caption">
            {[0, 1, 2].map((i) => (
              <Sketch key={i} className={`${LINE} w-[70px] py-[5px] border-[1.5px] border-transparent`}>&nbsp;</Sketch>
            ))}
          </span>
        </div>

        <div className="pb-4 mb-[22px] [border-bottom:2px_dashed_color-mix(in_oklab,var(--color-ink)_30%,transparent)]">
          <div className="font-mono text-caption">
            <Sketch className={`${LINE} w-[150px] py-1 border-[1.5px] border-transparent`}>&nbsp;</Sketch>
          </div>
          <div className="mt-3.5 mb-1.5 text-[44px] leading-none max-wide:text-[34px] max-wide:leading-[1.04]">
            <Sketch isStrong className={`${LINE} w-[min(340px,80%)] h-[0.62em] after:[animation-delay:.1s]`} />
          </div>
          <div className="max-w-[640px] text-[19px] leading-[1.5] max-wide:text-[17px]">
            <Sketch className={`${LINE} w-[86%] h-[0.45em] after:[animation-delay:.2s]`} />
          </div>
        </div>

        <div className="grid [align-items:start] gap-7.5 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] max-wide:grid-cols-1 max-wide:gap-6">
          <div className="min-w-0">
            <div className={CAPTION}>
              <Sketch className={`${LINE} w-[150px] h-[9px]`} />
            </div>
            <div className={`${OUTLINE} w-[360px] max-w-full aspect-square`} />
          </div>
          <div className="min-w-0 pl-7 [border-left:1.5px_dashed_color-mix(in_oklab,var(--color-ink)_22%,transparent)] max-wide:pl-0 max-wide:pt-5 max-wide:[border-left:none] max-wide:[border-top:1.5px_dashed_color-mix(in_oklab,var(--color-ink)_22%,transparent)]">
            <div className={CAPTION}>
              <Sketch className={`${LINE} w-[110px] h-[9px]`} />
            </div>
            {/* Set like BenchBoot's lines, which carry this log on. */}
            <div className="flex flex-col gap-[9px] mt-3 font-mono text-[12.5px] tracking-[-0.2px] text-ink-soft">
              <div>
                $ open <CurrentPath />
              </div>
              <div>
                fetching page{" "}
                {/* Never claims an amount: the first bar that fills is
                    BenchBoot's real weights download. */}
                <span className="relative inline-block text-[color-mix(in_oklab,var(--color-ink)_35%,transparent)] motion-reduce:hidden">
                  ░░░░░░░░░░
                  <span className="absolute left-0 top-0 w-[1ch] text-center bg-paper text-electric-ink animate-loop-head">▸</span>
                </span>
                <span className="hidden motion-reduce:inline">
                  …
                  <span className="inline-block w-2 h-[13px] ml-[3px] align-[-2px] bg-ink-soft" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RouteLoader>
  );
}
