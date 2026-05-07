import { SectionHeaderStamp } from "@/components/ui/SectionHeader";
import Chip from "@/components/ui/Chip";

export default function Contact() {
  return (
    <section id="sec-contact" className="section">
      <SectionHeaderStamp num="06" title="Say Hi" meta="postcard from the workshop" />

      <div style={{ position: "relative", padding: "20px 0 40px" }}>
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: "12%",
            width: 90,
            height: 22,
            background: "color-mix(in oklab, var(--teal) 28%, white)",
            opacity: 0.7,
            transform: "rotate(-8deg)",
            borderLeft: "1px dashed color-mix(in oklab, var(--ink) 30%, transparent)",
            borderRight: "1px dashed color-mix(in oklab, var(--ink) 30%, transparent)",
            zIndex: 2,
          }}
        />
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            right: "8%",
            width: 78,
            height: 22,
            background: "color-mix(in oklab, var(--coral) 30%, white)",
            opacity: 0.7,
            transform: "rotate(6deg)",
            borderLeft: "1px dashed color-mix(in oklab, var(--ink) 30%, transparent)",
            borderRight: "1px dashed color-mix(in oklab, var(--ink) 30%, transparent)",
            zIndex: 2,
          }}
        />

        <article
          className="postcard contact-grid"
          style={{
            position: "relative",
            background: "color-mix(in oklab, var(--coral) 6%, var(--paper))",
            border: "2px solid var(--ink)",
            borderRadius: 4,
            boxShadow: "6px 6px 0 color-mix(in oklab, var(--ink) 12%, transparent)",
            transform: "rotate(-0.6deg)",
            display: "grid",
            gridTemplateColumns: "1.05fr 1fr",
            minHeight: 380,
            overflow: "hidden",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 8,
              border: "1px solid color-mix(in oklab, var(--ink) 50%, transparent)",
              borderRadius: 2,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          <div style={{ padding: "44px 36px 36px", position: "relative", zIndex: 2 }}>
            <div
              className="mono faint"
              style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase" }}
            >
              ✎ message side
            </div>
            <h2 style={{ fontSize: 64, marginTop: 8, marginBottom: 14, lineHeight: 0.95 }}>
              Let&apos;s
              <br />
              talk.
            </h2>
            <p
              className="hand"
              style={{
                marginTop: 0,
                maxWidth: 360,
                fontSize: 22,
                lineHeight: 1.35,
                color: "var(--ink)",
              }}
            >
              Open to{" "}
              <span className="marker-highlight purple">interesting full-stack + AI roles</span>,
              freelance gigs, and PC build advice over coffee.
            </p>
            <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                href="mailto:anoopchandraparampalli@gmail.com"
                style={{ textDecoration: "none" }}
              >
                <Chip kind="electric">email →</Chip>
              </a>
              <a
                href="https://www.linkedin.com/in/anoopchandra-parampalli/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <Chip>linkedin</Chip>
              </a>
              <a
                href="https://github.com/Anoop-Chandra-19"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <Chip>github</Chip>
              </a>
              <a
                href="/Anoopchandra_resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <Chip>resume.pdf</Chip>
              </a>
            </div>
            <div
              className="hand"
              style={{
                marginTop: 28,
                fontSize: 24,
                color: "var(--ink-soft)",
                transform: "rotate(-1.5deg)",
                display: "inline-block",
              }}
            >
              — Anoop ✎
            </div>
          </div>

          <span
            aria-hidden="true"
            className="postcard-divider"
            style={{
              position: "absolute",
              top: 16,
              bottom: 16,
              left: "calc(51.2%)",
              width: 1.5,
              background: "var(--ink)",
              opacity: 0.85,
              zIndex: 2,
            }}
          />

          <div
            className="contact-colophon postcard-address"
            style={{
              padding: "30px 36px 36px",
              position: "relative",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 28,
                gap: 20,
              }}
            >
              <svg
                viewBox="0 0 130 130"
                width="110"
                height="110"
                style={{ flexShrink: 0, transform: "rotate(-9deg)", opacity: 0.78 }}
              >
                <circle cx="65" cy="65" r="58" fill="none" stroke="var(--electric)" strokeWidth="1.6" />
                <circle cx="65" cy="65" r="48" fill="none" stroke="var(--electric)" strokeWidth="1.2" />
                <defs>
                  <path id="pm-top" d="M 17 65 A 48 48 0 0 1 113 65" />
                  <path id="pm-bot" d="M 17 65 A 48 48 0 0 0 113 65" />
                </defs>
                <text fill="var(--electric)" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="2">
                  <textPath href="#pm-top" startOffset="50%" textAnchor="middle">
                    BOSTON · MA
                  </textPath>
                </text>
                <text fill="var(--electric)" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="2">
                  <textPath href="#pm-bot" startOffset="50%" textAnchor="middle">
                    02115 · USA
                  </textPath>
                </text>
                <text
                  x="65"
                  y="62"
                  textAnchor="middle"
                  fill="var(--electric)"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="11"
                  fontWeight="500"
                >
                  APR 29
                </text>
                <text
                  x="65"
                  y="76"
                  textAnchor="middle"
                  fill="var(--electric)"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="11"
                  fontWeight="500"
                >
                  2026
                </text>
                <line x1="113" y1="58" x2="170" y2="58" stroke="var(--electric)" strokeWidth="1.2" />
                <line x1="113" y1="65" x2="170" y2="65" stroke="var(--electric)" strokeWidth="1.2" />
                <line x1="113" y1="72" x2="170" y2="72" stroke="var(--electric)" strokeWidth="1.2" />
              </svg>

              <div
                style={{
                  width: 92,
                  height: 110,
                  background: "color-mix(in oklab, var(--teal) 14%, var(--paper))",
                  border: "1.5px solid var(--ink)",
                  borderRadius: 2,
                  position: "relative",
                  flexShrink: 0,
                  transform: "rotate(2.5deg)",
                  padding: 6,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 4,
                    border: "1px dashed color-mix(in oklab, var(--ink) 50%, transparent)",
                    borderRadius: 1,
                    pointerEvents: "none",
                  }}
                />
                <div className="hand" style={{ fontSize: 26, lineHeight: 1, color: "var(--teal)" }}>
                  ★
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 9, letterSpacing: 1, marginTop: 6, color: "var(--ink-soft)" }}
                >
                  HAND
                  <br />
                  BUILT
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 11, fontWeight: 500, marginTop: 8, color: "var(--ink)" }}
                >
                  $0.42
                </div>
              </div>
            </div>

            <div
              className="mono faint"
              style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}
            >
              to —
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              <div
                className="hand"
                style={{
                  fontSize: 22,
                  color: "var(--ink)",
                  borderBottom: "1.2px solid var(--ink-faint)",
                  paddingBottom: 4,
                }}
              >
                whoever&apos;s reading this
              </div>
              <div
                className="hand"
                style={{
                  fontSize: 20,
                  color: "var(--ink-soft)",
                  borderBottom: "1.2px solid var(--ink-faint)",
                  paddingBottom: 4,
                }}
              >
                ⌂ a hiring manager · a friend · a stranger
              </div>
              <div
                className="hand"
                style={{
                  fontSize: 20,
                  color: "var(--ink-soft)",
                  borderBottom: "1.2px solid var(--ink-faint)",
                  paddingBottom: 4,
                }}
              >
                the internet, somewhere
              </div>
            </div>

            <div
              style={{
                marginTop: "auto",
                borderTop: "1px dashed var(--ink-faint)",
                paddingTop: 12,
              }}
            >
              <div
                className="mono faint"
                style={{
                  fontSize: 10,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                from —
              </div>
              <div
                className="mono"
                style={{ fontSize: 11, lineHeight: 1.7, color: "var(--ink-soft)" }}
              >
                Anoopchandra Parampalli
                <br />
                Boston, MA
                <br />
                Caveat / Kalam / JetBrains Mono · Next.js + Vercel
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
