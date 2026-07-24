"use client";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import { pad, tagColor, type JournalEntryMeta } from "@/lib/journal-meta";
import { useInkTransition } from "@/components/transition/InkTransitionProvider";

export default function Notes({ entries }: { entries: JournalEntryMeta[] }) {
  const { navigate } = useInkTransition();
  const pages = entries.map((e) => e.page);

  return (
    <section id="sec-notes" className="section">
      <SectionHeader num="05" title="Notes & Stories" meta={`${entries.length} entries · index`} />
      <p className="faint max-w-[720px] mb-6 text-base">
        Working journal — bug stories, hot takes, things I figured out the hard way.
      </p>

      <div className="relative">
        <div className="bg-paper border-2 border-ink rounded-md pt-7 pr-6 pb-[18px] pl-16 relative overflow-hidden">
          {/* Red margin rule */}
          <span
            aria-hidden="true"
            className="absolute left-12 top-0 bottom-0 w-[1.2px] opacity-60"
            style={{ background: "color-mix(in oklab, var(--color-coral) 70%, transparent)" }}
          />
          {/* Rotated INDEX label */}
          <div
            className="mono faint absolute left-2 top-7 text-[9px] tracking-[3px] uppercase whitespace-nowrap"
            style={{ transform: "rotate(-90deg)", transformOrigin: "left top" }}
          >
            ✎ index — pp. {pad(Math.min(...pages))} — {pad(Math.max(...pages))}
          </div>

          <div
            className="mono faint notes-header grid gap-3.5 pt-0 pr-[90px] pb-3 pl-1.5 text-[9px] tracking-[2px] uppercase mb-1.5"
            style={{
              gridTemplateColumns: "44px 1fr 90px 64px",
              borderBottom: "1px dashed var(--color-ink-faint)",
            }}
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
                  className="notes-row grid gap-3.5 items-baseline py-3 pr-[90px] pl-1.5 relative no-underline transition-colors duration-150 hover:bg-[color-mix(in_oklab,var(--color-paper-2)_60%,transparent)]"
                  style={{ gridTemplateColumns: "44px 1fr 90px 64px" }}
                  aria-label={`Open note: ${e.title}`}
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
                  <span className="mono faint notes-date text-[11px] text-right text-ink-soft">
                    p.{pad(e.page)}
                  </span>

                  <span className="notes-title flex items-baseline min-w-0 gap-2 overflow-hidden">
                    <span className="hand text-[22px] leading-[1.1] whitespace-nowrap overflow-hidden text-ellipsis flex-[0_1_auto] text-ink">
                      {e.title}
                    </span>
                    <span
                      aria-hidden="true"
                      className="flex-1 h-0 min-w-6 -translate-y-1"
                      style={{ borderBottom: "1.5px dotted var(--color-ink-faint)" }}
                    />
                  </span>

                  <span className="mono faint notes-meta text-[11px] text-right text-ink-soft">
                    {e.read}
                  </span>

                  <span className="mono notes-meta text-[11px] text-right text-ink-soft">
                    {e.dateDisplay}
                  </span>

                  <span
                    aria-hidden="true"
                    className="notes-edge-tab absolute -right-0.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-[10px] tracking-[1px] text-center min-w-[70px] py-[3px] pl-2.5 pr-2"
                    style={{
                      fontFamily: "var(--font-mono)",
                      background: `color-mix(in oklab, ${tagColor(e.color)} 18%, var(--color-paper))`,
                      border: `1.2px solid ${tagColor(e.color)}`,
                      borderRight: "none",
                      borderRadius: "3px 0 0 3px",
                      color: tagColor(e.color),
                    }}
                  >
                    {e.tag}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div
            className="flex justify-between items-center gap-3 flex-wrap mt-3.5 pt-3"
            style={{ borderTop: "1px dashed var(--color-ink-faint)" }}
          >
            <span className="mono faint text-[11px]">
              {entries.length} entries · pp. {pad(Math.min(...pages))}–{pad(Math.max(...pages))}
            </span>
            <Link
              href="/journal"
              className="hand text-xl text-electric no-underline"
              onClick={(e) => {
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
