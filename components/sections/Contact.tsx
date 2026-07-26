import { SectionHeaderStamp } from "@/components/ui/SectionHeader";
import Chip from "@/components/ui/Chip";

export default function Contact() {
  return (
    <section id="sec-contact" className="section">
      <SectionHeaderStamp num="06" title="Say Hi" meta="postcard from the workshop" />

      <div className="relative pt-5 pb-10">
        {/* washi-tape strips */}
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
          className="postcard contact-grid relative border-2 border-ink rounded grid min-h-[380px] overflow-hidden grid-cols-[1.05fr_1fr]"
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

          {/* LEFT — message side */}
          <div className="contact-message pt-11 px-9 pb-9 relative z-[2]">
            <div className="mono faint text-[10px] tracking-[3px] uppercase">
              ✎ message side
            </div>
            <h2 className="text-[46px] mt-2 mb-3.5 leading-[1.08] tracking-[-0.016em]">
              Let&apos;s
              <br />
              talk.
            </h2>
            <p className="hand mt-0 max-w-[360px] text-[22px] leading-[1.35] text-ink">
              Open to{" "}
              <span className="marker-highlight purple">interesting full-stack + AI roles</span>,
              freelance gigs, and PC build advice over coffee.
            </p>
            <div className="mt-[22px] flex gap-2.5 flex-wrap">
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
              className="accent mt-7 text-2xl text-ink-soft inline-block"
              style={{ transform: "rotate(-1.5deg)" }}
            >
              — Anoop ✎
            </div>
          </div>

          <span
            aria-hidden="true"
            className="postcard-divider absolute top-4 bottom-4 left-[51.2%] w-[1.5px] bg-ink opacity-85 z-[2]"
          />

          {/* RIGHT — address side */}
          <div className="contact-colophon postcard-address pt-[30px] px-9 pb-9 relative z-[2] flex flex-col">
            <div className="contact-stamps flex justify-between items-start mb-7 gap-5">
              {/* Postmark */}
              <svg
                viewBox="0 0 130 130"
                width="110"
                height="110"
                className="contact-postmark shrink-0 opacity-[0.78]"
                style={{ transform: "rotate(-9deg)" }}
              >
                <circle cx="65" cy="65" r="58" fill="none" stroke="var(--color-electric)" strokeWidth="1.6" />
                <circle cx="65" cy="65" r="48" fill="none" stroke="var(--color-electric)" strokeWidth="1.2" />
                <defs>
                  <path id="pm-top" d="M 17 65 A 48 48 0 0 1 113 65" />
                  <path id="pm-bot" d="M 17 65 A 48 48 0 0 0 113 65" />
                </defs>
                <text fill="var(--color-electric)" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="2">
                  <textPath href="#pm-top" startOffset="50%" textAnchor="middle">
                    BOSTON · MA
                  </textPath>
                </text>
                <text fill="var(--color-electric)" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="2">
                  <textPath href="#pm-bot" startOffset="50%" textAnchor="middle">
                    02115 · USA
                  </textPath>
                </text>
                <text x="65" y="62" textAnchor="middle" fill="var(--color-electric)" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="500">
                  APR 29
                </text>
                <text x="65" y="76" textAnchor="middle" fill="var(--color-electric)" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="500">
                  2026
                </text>
                <line x1="113" y1="58" x2="170" y2="58" stroke="var(--color-electric)" strokeWidth="1.2" />
                <line x1="113" y1="65" x2="170" y2="65" stroke="var(--color-electric)" strokeWidth="1.2" />
                <line x1="113" y1="72" x2="170" y2="72" stroke="var(--color-electric)" strokeWidth="1.2" />
              </svg>

              {/* Stamp */}
              <div
                className="contact-stamp w-[92px] h-[110px] border-[1.5px] border-ink rounded-sm relative shrink-0 p-1.5 flex flex-col items-center justify-center text-center"
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
                <div className="accent text-[26px] leading-none text-teal">★</div>
                <div className="mono text-[9px] tracking-[1px] mt-1.5 text-ink-soft">
                  HAND
                  <br />
                  BUILT
                </div>
                <div className="mono text-[11px] font-medium mt-2 text-ink">$0.42</div>
              </div>
            </div>

            <div className="mono faint text-[10px] tracking-[3px] uppercase mb-2.5">to —</div>
            <div className="flex flex-col gap-2.5 mb-[18px]">
              <div className="accent text-[22px] text-ink pb-1 border-b-[1.2px] border-ink-faint">
                whoever&apos;s reading this
              </div>
              <div className="accent text-xl text-ink-soft pb-1 border-b-[1.2px] border-ink-faint">
                ⌂ a hiring manager · a friend · a stranger
              </div>
              <div className="accent text-xl text-ink-soft pb-1 border-b-[1.2px] border-ink-faint">
                the internet, somewhere
              </div>
            </div>

            <div className="mt-auto pt-3" style={{ borderTop: "1px dashed var(--color-ink-faint)" }}>
              <div className="mono faint text-[10px] tracking-[2px] uppercase mb-1.5">from —</div>
              <div className="mono text-[11px] leading-[1.7] text-ink-soft">
                Anoopchandra Parampalli
                <br />
                Boston, MA
                <br />
                Source Serif 4 / JetBrains Mono / Caveat · Next.js + Vercel
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
