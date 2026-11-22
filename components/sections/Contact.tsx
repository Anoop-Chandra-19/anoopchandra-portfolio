import { SectionHeaderStamp } from "@/components/ui/SectionHeader";
import Chip from "@/components/ui/Chip";
import Label from "@/components/ui/Label";
import Marker from "@/components/ui/Marker";
import Postmark from "./Postmark";

export default function Contact() {
  return (
    <section id="sec-contact" className="section">
      <SectionHeaderStamp num="06" title="Say Hi" meta="postcard from the workshop" />

      <div className="relative pt-[21px] pb-10.5">
        <span
          aria-hidden="true"
          className="absolute top-0 left-[12%] w-[90px] h-[22px] opacity-70 z-[2]"
          style={{
            background: "color-mix(in oklab, var(--color-teal) 28%, white)",
            transform: "rotate(-8deg)",
            borderLeft: "1px dashed color-mix(in oklab, var(--color-ink) 30%, transparent)",
            borderRight: "1px dashed color-mix(in oklab, var(--color-ink) 30%, transparent)",
          }}
        />
        <span
          aria-hidden="true"
          className="absolute top-0 right-[8%] w-[78px] h-[22px] opacity-70 z-[2]"
          style={{
            background: "color-mix(in oklab, var(--color-coral) 30%, white)",
            transform: "rotate(6deg)",
            borderLeft: "1px dashed color-mix(in oklab, var(--color-ink) 30%, transparent)",
            borderRight: "1px dashed color-mix(in oklab, var(--color-ink) 30%, transparent)",
          }}
        />

        <article
          className="postcard relative border-2 border-ink rounded-sm grid min-h-[380px] overflow-hidden grid-cols-[1.05fr_1fr] max-wide:grid-cols-1 max-wide:min-h-0"
          style={{
            background: "color-mix(in oklab, var(--color-coral) 6%, var(--color-paper))",
            boxShadow: "6px 6px 0 color-mix(in oklab, var(--color-ink) 12%, transparent)",
          }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-2 rounded-sm pointer-events-none z-[1]"
            style={{ border: "1px solid color-mix(in oklab, var(--color-ink) 50%, transparent)" }}
          />

          <div className="pt-[47px] px-9.5 pb-9.5 relative z-[2] max-wide:pt-[26px] max-wide:px-[20px] max-wide:pb-[20px]">
            <Label kind="tag">
              ✎ message side
            </Label>
            <h2 className="text-[46px] mt-2 mb-[15px] leading-[1.08] tracking-[-0.016em] max-wide:text-[34px] max-wide:leading-[1.03] max-wide:tracking-[-0.018em]">
              Let&apos;s
              <br />
              talk.
            </h2>
            <p className="mt-0 max-w-[360px] text-intro text-ink">
              Open to{" "}
              <Marker tone="purple">interesting full-stack + AI roles</Marker>,
              freelance gigs, and PC build advice over coffee.
            </p>
            <div className="mt-[22px] flex gap-[11px] flex-wrap">
              <a href="mailto:anoopchandraparampalli@gmail.com" className="no-underline">
                <Chip kind="electric">email →</Chip>
              </a>
              <a
                href="https://www.linkedin.com/in/anoopchandra-parampalli/"
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline"
              >
                <Chip>linkedin</Chip>
              </a>
              <a
                href="https://github.com/Anoop-Chandra-19"
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline"
              >
                <Chip>github</Chip>
              </a>
              <a
                href="/Anoopchandra_resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline"
              >
                <Chip>resume.pdf</Chip>
              </a>
            </div>
            <div
              className="accent mt-7.5 text-[25.5px] leading-[calc(2/1.5)] text-ink-soft inline-block"
              style={{ transform: "rotate(-1.5deg)" }}
            >
              — Anoop ✎
            </div>
          </div>

          <span
            aria-hidden="true"
            className="max-wide:hidden absolute top-[17px] bottom-[17px] left-[51.2%] w-[1.5px] bg-ink opacity-85 z-[2]"
          />

          <div className="pt-[30px] px-9.5 pb-9.5 relative z-[2] flex flex-col max-wide:border-t-2 max-wide:border-dashed max-wide:border-ink max-wide:p-[20px]">
            <div className="flex justify-between items-start mb-7.5 gap-[21px] max-wide:mb-[16px] max-wide:gap-[12px]">
              <Postmark />

              <div
                className="w-[92px] h-[110px] border-[1.5px] border-ink rounded-sm relative shrink-0 p-1.5 flex flex-col items-center justify-center text-center max-wide:w-[74px] max-wide:h-[90px] max-wide:p-[4px]"
                style={{
                  background: "color-mix(in oklab, var(--color-teal) 14%, var(--color-paper))",
                  transform: "rotate(2.5deg)",
                }}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-1 rounded-[1px] pointer-events-none"
                  style={{ border: "1px dashed color-mix(in oklab, var(--color-ink) 50%, transparent)" }}
                />
                <div className="accent text-[26px] leading-none text-teal max-wide:text-[20px]">★</div>
                <Label kind="caption" tone="soft" className="mt-1.5 max-wide:mt-[4px] max-wide:leading-[1.3]">
                  HAND
                  <br />
                  BUILT
                </Label>
                <Label kind="meta" tone="ink" className="font-medium mt-2 max-wide:mt-[4px] max-wide:leading-[1.3] max-wide:text-[10px]">$0.42</Label>
              </div>
            </div>

            <Label kind="tag" className="mb-[11px]">to —</Label>
            <div className="flex flex-col gap-[11px] mb-[18px] max-wide:*:text-[20px]">
              <div className="accent text-[22px] text-ink pb-1 border-b-[1.2px] border-ink-faint">
                whoever&apos;s reading this
              </div>
              <div className="accent text-[21.25px] leading-[calc(1.75/1.25)] text-ink-soft pb-1 border-b-[1.2px] border-ink-faint">
                ⌂ a hiring manager · a friend · a stranger
              </div>
              <div className="accent text-[21.25px] leading-[calc(1.75/1.25)] text-ink-soft pb-1 border-b-[1.2px] border-ink-faint">
                the internet, somewhere
              </div>
            </div>

            <div className="mt-auto pt-[13px]" style={{ borderTop: "1px dashed var(--color-ink-faint)" }}>
              <Label kind="tag" className="mb-1.5">from —</Label>
              <Label kind="meta" tone="soft" className="leading-[1.7]">
                Anoopchandra Parampalli
                <br />
                Cleveland, OH
                <br />
                Source Serif 4 / JetBrains Mono / Caveat · Next.js + Vercel
              </Label>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
