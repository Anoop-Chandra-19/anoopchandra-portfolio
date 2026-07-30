import Image from "next/image";
import Chip from "@/components/ui/Chip";
import Annotation from "@/components/ui/Annotation";
import ScrollLink from "@/components/ui/ScrollLink";

export default function Hero() {
  return (
    <section id="sec-home" className="section hero-section min-h-[560px] pt-10">
      <div className="hero-grid grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-10 items-center">
        <div className="hero-text min-w-0">
          <div className="mono faint anim-rise d-hello hero-kicker text-xs tracking-[3px] uppercase">
            {"// hello.tsx — apr 29, 2026"}
          </div>
          {/* The only fluid type on the site. opsz rides font-size, so the top
              of the clamp gets the display cut for free. */}
          <h1 className="hero-title mt-3.5 mb-1.5 leading-[1.02] text-[clamp(44px,5.8vw,72px)]">
            <span className="anim-swipe d-name1 inline-block">Anoop</span>
            <br />
            <span className="anim-swipe d-name2 inline-block text-electric">chandra.</span>
          </h1>
          {/* A line of text, not a second headline. Deks are regular italic —
              never bold. Size is not a licence to go bold. */}
          <div className="anim-rise d-subtle hero-tagline mt-[18px] text-[19px] leading-[1.65] italic font-normal text-ink-soft">
            full-stack dev <span className="faint">×</span> AI engineer{" "}
            <span className="faint">×</span> linux daily-driver
          </div>
          <div className="anim-rise d-body hero-lede mt-[22px] max-w-[520px] text-[18px]">
            I build <span className="marker-highlight purple d-marker1">AI</span>,{" "}
            <span className="marker-highlight d-marker2">custom PCs</span>, and{" "}
            <span className="marker-highlight teal d-marker3">scalable backends</span> — always for the
            person, not just the specs.
          </div>
          <div className="hero-chips mt-[26px] flex gap-2.5 flex-wrap">
            <ScrollLink href="#sec-contact" className="no-underline anim-stamp d-chip1">
              <Chip kind="electric">say hi →</Chip>
            </ScrollLink>
            <ScrollLink href="#sec-lab" className="no-underline anim-stamp d-chip2">
              <Chip>see the lab ↓</Chip>
            </ScrollLink>
            <a
              href="/Anoopchandra_resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline anim-stamp d-chip3"
            >
              <Chip>resume.pdf</Chip>
            </a>
          </div>
          <div className="mono faint anim-rise d-meta hero-status mt-7 text-xs">
            <span className="text-teal">●</span> open to interesting work · Boston, MA
          </div>
        </div>
        {/* The wrapper shrink-wraps the portrait so the annotations anchor to the
            image's corners rather than to the full grid column. */}
        <div className="hero-portrait relative mx-auto w-[min(460px,38vw)]">
          <div className="hero-portrait-box relative w-full aspect-square">
            <div className="anim-portrait-shadow absolute inset-0 top-2 left-2 rounded-full bg-electric z-0" />
            <div className="absolute inset-0 rounded-full overflow-hidden z-[1]">
              <Image
                className="anim-portrait-img w-full h-full object-cover block"
                src="/anoopchandra.webp"
                alt="Anoopchandra Parampalli"
                width={460}
                height={460}
                priority
              />
            </div>
            <svg
              viewBox="0 0 360 360"
              preserveAspectRatio="xMidYMid meet"
              className="absolute inset-0 w-full h-full z-[2] pointer-events-none"
            >
              <circle
                cx="180"
                cy="180"
                r="178"
                fill="none"
                stroke="var(--color-ink)"
                strokeWidth="4"
                strokeDasharray="1131"
                className="anim-portrait-outline"
              />
            </svg>
          </div>
          <div className="anim-stamp d-annot1 hero-note-a absolute -top-2.5 right-2.5">
            <Annotation color="coral">👋 hi!</Annotation>
          </div>
          <div className="anim-stamp d-annot2 hero-note-b absolute bottom-[7%] left-[3%]">
            <Annotation color="teal">↗ that&apos;s me</Annotation>
          </div>
        </div>
      </div>
    </section>
  );
}
