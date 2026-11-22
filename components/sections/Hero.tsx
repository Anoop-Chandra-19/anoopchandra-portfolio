import Image from "next/image";
import Chip from "@/components/ui/Chip";
import Label from "@/components/ui/Label";
import Annotation from "@/components/ui/Annotation";
import ScrollLink from "@/components/ui/ScrollLink";

export default function Hero() {
  return (
    <section id="sec-home" className="section min-h-[560px] pt-10.5 max-wide:min-h-[calc(100svh-26px)] max-wide:mt-0 max-wide:pt-0 max-wide:flex max-wide:flex-col max-wide:justify-center">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-10.5 items-center max-wide:flex max-wide:flex-col max-wide:items-stretch max-wide:gap-0">
        <div className="min-w-0 max-wide:contents">
          <Label kind="eyebrow" className="anim-rise d-hello max-wide:order-1 max-wide:pr-[116px] max-wide:text-[10px]">
            {"// hello.tsx"}
          </Label>
          {/* The only fluid type on the site. opsz rides font-size, so the top
              of the clamp gets the display cut for free. */}
          <h1 className="mt-[15px] mb-1.5 leading-[1.02] text-[clamp(44px,5.8vw,72px)] max-wide:order-3 max-wide:mt-0 max-wide:mb-[4px] max-wide:text-[42px] max-wide:leading-[1.03]">
            <span className="anim-swipe d-name1 inline-block">Anoop</span>
            <br />
            <span className="anim-swipe d-name2 inline-block text-electric">chandra.</span>
          </h1>
          {/* A line of text, not a second headline. Deks are regular italic —
              never bold. Size is not a licence to go bold. */}
          <div className="anim-rise d-subtle mt-[18px] text-summary italic font-normal text-ink-soft max-wide:order-4 max-wide:mt-[12px] max-xs:mt-[10px]">
            full-stack dev <span className="faint">×</span> AI engineer{" "}
            <span className="faint">×</span> linux daily-driver
          </div>
          <div className="anim-rise d-body mt-[22px] max-w-[520px] text-[18px] max-wide:order-5 max-wide:mt-[16px] max-wide:text-[16px] max-wide:leading-[1.62] max-xs:mt-[12px]">
            I build <span className="marker-highlight purple d-marker1">AI tools</span>,{" "}
            <span className="marker-highlight d-marker2">custom PCs</span>, and{" "}
            <span className="marker-highlight teal d-marker3">scalable backends</span> around the people
            who use them.
          </div>
          <div className="mt-[26px] flex gap-[11px] flex-wrap max-wide:order-6 max-wide:mt-[18px] max-wide:gap-[8px] max-xs:mt-[14px]">
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
          <div className="font-mono tracking-[-0.2px] faint anim-rise d-meta mt-7.5 text-[12px] leading-[17px] max-wide:order-7 max-wide:mt-[20px] max-wide:text-[10.5px] max-wide:tracking-[0.5px] max-xs:mt-[14px]">
            open to interesting work · Cleveland, OH
          </div>
        </div>
        {/* The wrapper shrink-wraps the portrait so the annotations anchor to the
            image's corners rather than to the full grid column. */}
        <div className="relative mx-auto w-[min(460px,38vw)] max-wide:order-2 max-wide:w-[min(300px,74vw,34svh)] max-wide:mt-[18px] max-wide:mb-[22px] max-xs:mt-[12px] max-xs:mb-[16px]">
          <div className="relative w-full aspect-square">
            <div className="anim-portrait-shadow absolute inset-0 top-2 left-2 rounded-full bg-electric z-0" />
            <div className="absolute inset-0 rounded-full overflow-hidden z-[1]">
              <Image
                className="anim-portrait-img w-full h-full object-cover block"
                src="/anoopchandra.webp"
                alt="Anoopchandra Parampalli"
                width={460}
                height={460}
                sizes="(max-width: 720px) min(300px, 74vw), 460px"
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
          <div className="anim-stamp d-annot1 absolute -top-[11px] right-[11px] max-wide:-top-[10px] max-wide:-left-[10px] max-wide:right-auto">
            <Annotation color="coral">👋 hi!</Annotation>
          </div>
          <div className="anim-stamp d-annot2 absolute bottom-[7%] left-[3%] max-wide:hidden">
            <Annotation color="teal">↗ that&apos;s me</Annotation>
          </div>
        </div>
      </div>
    </section>
  );
}
