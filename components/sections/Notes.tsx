"use client";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import { pad, tabColors, type JournalEntryMeta } from "@/lib/journal-meta";
import { useInkTransition } from "@/components/transition/InkTransitionProvider";

export default function Notes({ entries }: { entries: JournalEntryMeta[] }) {
  const { navigate } = useInkTransition();
  const pages = entries.map((e) => e.page);

  return (
    <section id="sec-notes" className="section">
      <SectionHeader num="05" title="Notes & Stories" meta={`${entries.length} entries · index`} />
      <p className="faint max-w-[720px] mb-6 max-wide:mb-[16px]">
        A working journal for bug stories, personal projects, opinions, and things I figured out
        the hard way.
      </p>

      <div className="relative">
        <div className="bg-paper border-2 border-ink rounded-md pt-7 pr-6 pb-[18px] pl-16 relative overflow-hidden max-wide:pt-[14px] max-wide:pr-[14px] max-wide:pb-[12px] max-wide:pl-[42px] max-xs:pr-[12px] max-xs:pl-[34px]">
          <span
            aria-hidden="true"
            className="absolute left-12 max-wide:left-[30px] max-xs:left-[24px] top-0 bottom-0 w-[1.2px] opacity-60"
            style={{ background: "color-mix(in oklab, var(--color-coral) 70%, transparent)" }}
          />
          <div
            className="mono faint max-wide:hidden absolute left-2 top-7 text-stamp uppercase whitespace-nowrap"
            style={{ transform: "rotate(-90deg)", transformOrigin: "left top" }}
          >
            ✎ index — pp. {pad(Math.min(...pages))}–{pad(Math.max(...pages))}
          </div>

          <div
            className="mono faint max-wide:hidden grid grid-cols-[44px_1fr_90px_64px] gap-3.5 pt-0 pr-[90px] pb-3 pl-1.5 text-stamp uppercase mb-1.5"
            style={{ borderBottom: "1px dashed var(--color-ink-faint)" }}
          >
            <span className="text-right">pg.</span>
            <span>title</span>
            <span className="text-right">read</span>
            <span className="text-right">date</span>
          </div>

          <ul className="list-none p-0 m-0">
            {entries.map((e) => (
              <li key={e.slug}>
                <Link
                  href={`/journal/${e.slug}`}
                  className="grid grid-cols-[44px_1fr_90px_64px] gap-3.5 items-baseline py-3 pr-[90px] pl-1.5 relative max-wide:grid-cols-[40px_auto_auto_1fr] max-wide:gap-x-[8px] max-wide:gap-y-[3px] max-wide:py-[11px] max-wide:px-[2px] max-wide:[border-bottom:1px_dashed_color-mix(in_oklab,var(--color-ink)_12%,transparent)] max-xs:grid-cols-[36px_auto_1fr] max-xs:gap-x-[7px] no-underline transition-colors duration-150 hover:bg-[color-mix(in_oklab,var(--color-paper-2)_60%,transparent)]"
                  /* No aria-label: on a link it replaces the whole subtree, so it
                     was hiding the page number, read time and date. */
                  onClick={(ev) => {
                    // keep native behavior for new-tab/window clicks
                    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
                    ev.preventDefault();
                    // the row spans the page — bleed from the click point, not the
                    // row center (ev.detail === 0 → keyboard activation, no coords)
                    const originRect =
                      ev.detail === 0
                        ? ev.currentTarget.getBoundingClientRect()
                        : new DOMRect(ev.clientX, ev.clientY, 0, 0);
                    navigate(`/journal/${e.slug}`, { effect: "bleed", originRect });
                  }}
                >
                  <span className="mono faint text-meta text-right text-ink-soft max-wide:[grid-area:1/1/3/2] max-wide:self-start max-wide:pt-[3px] max-wide:text-[10.5px]">
                    p.{pad(e.page)}
                  </span>

                  <span className="flex items-center min-w-0 gap-2 overflow-hidden max-wide:[grid-area:1/2/2/5] max-xs:[grid-area:1/2/2/4]">
                    <span className="text-[17px] font-semibold leading-[1.4] whitespace-nowrap overflow-hidden text-ellipsis flex-[0_1_auto] text-ink max-wide:whitespace-normal max-wide:text-[18px] max-wide:leading-[1.25] max-wide:tracking-[-0.01em]">
                      {e.title}
                    </span>
                    <span
                      aria-hidden="true"
                      className="max-wide:hidden flex-1 h-0 min-w-6 -translate-y-1"
                      style={{ borderBottom: "1.5px dotted var(--color-ink-faint)" }}
                    />
                  </span>

                  <span className="mono faint text-meta text-right text-ink-soft max-wide:[grid-area:2/2/3/3] max-wide:text-left max-wide:text-[9.5px] max-wide:tracking-[0.5px] max-xs:hidden">
                    {e.read}
                  </span>

                  <span className="mono text-meta text-right text-ink-soft max-wide:[grid-area:2/3/3/4] max-wide:text-left max-wide:text-[9.5px] max-wide:tracking-[0.5px] max-xs:[grid-area:2/2/3/3]">
                    {e.dateDisplay}
                  </span>

                  <span
                    className="notes-edge-tab absolute -right-0.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-[10px] tracking-[1px] text-center min-w-[70px] py-[3px] pl-2.5 pr-2 max-wide:static max-wide:[grid-area:2/4/3/5] max-wide:justify-self-end max-wide:self-center max-wide:min-w-0 max-wide:py-[1px] max-wide:px-[7px] max-wide:text-[9px] max-xs:[grid-area:2/3/3/4]"
                    // only the tab colour is dynamic — border/radius live in CSS
                    // so the mobile pass can turn the edge tab into a pill
                    style={tabColors(e.kind)}
                  >
                    {e.tag}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div
            className="flex justify-between items-center gap-3 flex-wrap mt-3.5 pt-3 max-wide:mt-[10px] max-wide:pt-[10px]"
            style={{ borderTop: "1px dashed var(--color-ink-faint)" }}
          >
            <span className="mono faint text-meta">
              {entries.length} entries · pp. {pad(Math.min(...pages))}–{pad(Math.max(...pages))}
            </span>
            <Link
              href="/journal"
              className="text-[16px] text-electric no-underline"
              onClick={(e) => {
                // keep native behavior for new-tab/window clicks
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                e.preventDefault();
                navigate("/journal", {
                  effect: "bleed",
                  originRect: e.currentTarget.getBoundingClientRect(),
                });
              }}
            >
              see all notes &amp; case studies →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
