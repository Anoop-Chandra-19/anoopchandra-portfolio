import Image from "next/image";
import Chip from "@/components/ui/Chip";
import Annotation from "@/components/ui/Annotation";

export default function Hero() {
  return (
    <section id="sec-home" className="section min-h-[560px] pt-10">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-10 items-center">
        <div className="min-w-0">
          <div className="mono faint anim-rise d-hello text-xs tracking-[3px] uppercase">
            {"// hello.tsx — apr 29, 2026"}
          </div>
          <h1 className="mt-3.5 mb-1.5 leading-[0.95] text-[clamp(56px,8vw,96px)]">
            <span className="anim-swipe d-name1 inline-block">Anoop</span>
            <br />
            <span className="anim-swipe d-name2 inline-block text-electric">chandra.</span>
          </h1>
          <div className="hand anim-rise d-subtle mt-[18px] text-[26px]">
            full-stack dev <span className="faint">×</span> AI engineer{" "}
            <span className="faint">×</span> linux daily-driver
          </div>
          <div className="anim-rise d-body mt-[22px] max-w-[520px] text-[18px]">
            I build <span className="marker-highlight purple d-marker1">AI</span>,{" "}
            <span className="marker-highlight d-marker2">custom PCs</span>, and{" "}
            <span className="marker-highlight teal d-marker3">scalable backends</span> — always for the
            person, not just the specs.
          </div>
          <div className="mt-[26px] flex gap-2.5 flex-wrap">
            <a href="#sec-contact" className="no-underline anim-stamp d-chip1">
              <Chip kind="electric">say hi →</Chip>
            </a>
            <a href="#sec-lab" className="no-underline anim-stamp d-chip2">
              <Chip>see the lab ↓</Chip>
            </a>
            <a
              href="/Anoopchandra_resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline anim-stamp d-chip3"
            >
              <Chip>resume.pdf</Chip>
            </a>
          </div>
          <div className="mono faint anim-rise d-meta mt-7 text-xs">
            <span className="text-teal">●</span> open to interesting work · Boston, MA
          </div>
        </div>
        <div className="relative">
          <div className="relative mx-auto w-[min(360px,80vw)] aspect-square">
            <div className="anim-portrait-shadow absolute inset-0 top-2 left-2 rounded-full bg-electric z-0" />
            <div className="absolute inset-0 rounded-full overflow-hidden z-[1]">
              <Image
                className="anim-portrait-img w-full h-full object-cover block"
                src="/anoopchandra.webp"
                alt="Anoopchandra Parampalli"
                width={360}
                height={360}
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
          <div className="anim-stamp d-annot1 absolute -top-2.5 right-2.5">
            <Annotation color="coral">👋 hi!</Annotation>
          </div>
          <div className="anim-stamp d-annot2 absolute bottom-0 -left-2.5">
            <Annotation color="teal">↗ that&apos;s me</Annotation>
          </div>
        </div>
      </div>
    </section>
  );
}
