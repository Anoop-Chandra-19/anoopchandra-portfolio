import type { CSSProperties } from "react";
import ZoomableImage from "@/components/ui/ZoomableImage";
import { SectionHeaderArrow } from "@/components/ui/SectionHeader";
import Chip from "@/components/ui/Chip";
import { ROLE, WORK, ALSO, PROJECTS, MINOR } from "@/lib/work-data";
import type { Minor, Project, System } from "@/lib/work-data";

function TagPill({ t }: { t: string }) {
  return (
    <span
      className="mono text-[11px] py-[3px] px-2.5 rounded-full text-ink-soft"
      style={{ border: "1.2px solid var(--color-ink-soft)" }}
    >
      {t}
    </span>
  );
}

// The phone runs condensed variants of these sentences (design: mobile-parts.jsx).
// Both strings ship and CSS hides one, which keeps §02 a Server Component — a
// width hook would cost a client boundary and flash the wrong copy on first
// paint. The three helpers below are the only places that duplication lives.

function Copy({ long, short }: { long: string; short?: string }) {
  if (!short) return <>{long}</>;
  return (
    <>
      <span className="wide-only">{long}</span>
      <span className="narrow-only">{short}</span>
    </>
  );
}

function Bullets({ items, short, className }: { items: string[]; short?: string[]; className: string }) {
  const list = (xs: string[], variant: string) => (
    <ul className={`${className} ${variant}`.trim()}>
      {xs.map((b) => (
        <li key={b}>{b}</li>
      ))}
    </ul>
  );
  if (!short) return list(items, "");
  return (
    <>
      {list(items, "wide-only")}
      {list(short, "narrow-only")}
    </>
  );
}

function TagRow({ tags, short }: { tags: string[]; short?: string[] }) {
  const row = (xs: string[], variant: string) => (
    <div className={`flex gap-1.5 flex-wrap mt-4 ${variant}`.trim()}>
      {xs.map((t) => (
        <TagPill key={t} t={t} />
      ))}
    </div>
  );
  if (!short) return row(tags, "");
  return (
    <>
      {row(tags, "wide-only")}
      {row(short, "narrow-only")}
    </>
  );
}

function RoleBlock() {
  return (
    <div
      className="sketch-box role-block p-7 mb-[26px]"
      style={{ background: "color-mix(in oklab, var(--color-electric) 5%, var(--color-paper))" }}
    >
      <div className="flex items-baseline gap-4 flex-wrap mb-3">
        <span className="hand role-org text-[34px] leading-none text-electric">{ROLE.org}</span>
        <span className="mono faint text-[11px] tracking-[2px] uppercase">
          {ROLE.role} · {ROLE.period}
        </span>
      </div>
      <p className="m-0 text-[16.5px] leading-[1.62] max-w-[760px]">
        <Copy long={ROLE.blurb} short={ROLE.shortBlurb} />
      </p>
    </div>
  );
}

// No tilt here, unlike the design. A sub-degree rotation composites the card and
// drops subpixel antialiasing, which softens 14.5px body copy at 1x. The other
// sketch-boxes keep theirs — they carry short copy.
function WorkCard({ p }: { p: System }) {
  return (
    <article className="sketch-box work-card p-[26px] grid gap-6 items-start">
      <div className="work-rail">
        <div
          className="hand work-num text-[46px] leading-[0.9]"
          style={{ color: `var(--color-${p.k})` }}
        >
          {p.n}
        </div>
        <div className="mono faint work-kind text-[11px] tracking-[2px] uppercase mt-2.5 leading-[1.6]">
          {p.kind}
        </div>
        <div
          className="mono work-status inline-block mt-3 text-[10px] tracking-[1.5px] uppercase py-[3px] px-2 rounded-[3px]"
          style={{ border: `1.5px solid var(--color-${p.k})`, color: `var(--color-${p.k})` }}
        >
          {p.status}
        </div>
      </div>
      <div className="min-w-0">
        <h3 className="mt-0 mb-2.5 text-[27px] leading-[1.12]">{p.t}</h3>
        <p className="mt-0 mb-3.5 text-[15.5px] leading-[1.62]">
          <Copy long={p.d} short={p.shortD} />
        </p>
        <Bullets
          items={p.bullets}
          short={p.shortBullets}
          className="pl-[18px] m-0 text-[14.5px] leading-[1.68] grid gap-2"
        />
        <p className="work-impact mt-4 mb-0 text-[15px] leading-[1.6]">
          <span
            className="mono text-[10.5px] tracking-[2px] uppercase mr-2"
            style={{ color: `var(--color-${p.k})` }}
          >
            ↳ impact
          </span>
          <Copy long={p.impact} short={p.shortImpact} />
        </p>
        <TagRow tags={p.tags} short={p.shortTags} />
      </div>
    </article>
  );
}

function AlsoList() {
  return (
    <ul className="also-list list-none p-0 m-0 grid gap-3">
      {ALSO.map((a) => (
        <li key={a.d} className="grid gap-3 items-start">
          <span className="mono text-[13px] leading-[1.6] text-ink-faint">•</span>
          <span className="text-[15px] leading-[1.6]">
            <Copy long={a.d} short={a.shortD} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function MinorRow({ m }: { m: Minor }) {
  return (
    <div
      className="minor-row grid gap-6 items-baseline py-3.5"
      style={{ borderTop: "1.5px dashed var(--color-ink-faint)" }}
    >
      <div className="minor-head">
        <div className="text-[16px] font-semibold leading-[1.3]">{m.t}</div>
        <div className="mono faint minor-year text-[11px] mt-[3px]">{m.y}</div>
      </div>
      <p className="m-0 text-[14.5px] leading-[1.6]">{m.d}</p>
    </div>
  );
}

function ProjectMedia({ p }: { p: Project }) {
  return (
    <ZoomableImage
      src={p.img}
      alt={p.imgAlt}
      caption={p.t}
      width={p.imgW}
      height={p.imgH}
      sizes="(max-width: 1000px) 100vw, 45vw"
      className="project-media"
      fit={p.imgFit}
    />
  );
}

function ProjectSlab({ p, i }: { p: Project; i: number }) {
  const flip = i % 2 === 1;
  return (
    <article
      className="sketch-box project-slab p-0 overflow-hidden grid"
      data-flip={flip ? "1" : "0"}
      // column track rides a custom property so the mobile collapse is a plain
      // CSS override rather than an !important fight with the inline style
      style={{ "--slab-cols": flip ? "1fr 1.4fr" : "1.4fr 1fr" } as CSSProperties}
    >
      {!flip && <ProjectMedia p={p} />}
      <div className="project-content p-8">
        <div className="mono faint text-[11px] tracking-[2px] uppercase">
          {p.cat} · <span style={{ color: `var(--color-${p.k})` }}>{p.org}</span>
        </div>
        <h3 className="mt-2 mb-3.5 text-[25px] leading-[1.18] tracking-[-0.012em]">{p.t}</h3>
        <p className="mt-0 text-[17px] max-w-[520px] mb-4">
          <Copy long={p.d} short={p.shortD} />
        </p>
        <Bullets
          items={p.bullets}
          short={p.shortBullets}
          className="pl-[18px] mt-0 text-[17px] leading-[1.7]"
        />
        <TagRow tags={p.tags} short={p.shortTags} />
        <div className="mt-[18px]">
          <Chip kind={p.k}>{p.cta}</Chip>
        </div>
      </div>
      {flip && <ProjectMedia p={p} />}
    </article>
  );
}

function GroupRule({ label, count }: { label: string; count: string }) {
  return (
    <div className="group-rule flex items-center gap-[18px]">
      <span className="mono faint text-[11px] tracking-[3px] uppercase">{label}</span>
      <span
        className="group-rule-line flex-1 h-px"
        style={{ borderTop: "1.5px dashed var(--color-ink-faint)" }}
      />
      <span className="mono faint group-rule-count text-[11px]">{count}</span>
    </div>
  );
}

export default function Work() {
  return (
    <section id="sec-work" className="section">
      <SectionHeaderArrow
        num="02"
        title="Work"
        meta={`${WORK.length + PROJECTS.length + MINOR.length} entries · 2025 to present`}
      />
      <p className="faint max-w-[740px] mb-7 text-[16px]">
        <span className="marker-highlight">Panacea Financial</span>: selected work from my current
        role, alongside projects I build on my own time.
      </p>

      <RoleBlock />

      <div className="mb-5">
        <GroupRule label="selected work" count={`${WORK.length} systems`} />
      </div>
      <div className="col gap-[18px]">
        {WORK.map((p) => (
          <WorkCard key={p.t} p={p} />
        ))}
      </div>

      <div className="mt-9 mb-5">
        <GroupRule label="across the platform" count={`${ALSO.length} areas`} />
      </div>
      <AlsoList />

      <div className="mt-12 mb-6">
        <GroupRule label="on my own time" count={`${PROJECTS.length} projects`} />
      </div>
      <div className="col gap-[22px]">
        {PROJECTS.map((p, i) => (
          <ProjectSlab key={p.t} p={p} i={i} />
        ))}
      </div>

      <div className="mt-9 mb-1">
        <GroupRule label="earlier" count={`${MINOR.length} more`} />
      </div>
      <div>
        {MINOR.map((m) => (
          <MinorRow key={m.t} m={m} />
        ))}
      </div>
    </section>
  );
}
