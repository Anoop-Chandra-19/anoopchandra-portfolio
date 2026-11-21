import { Fragment, type CSSProperties, type ReactNode } from "react";
import ZoomableImage from "@/components/ui/ZoomableImage";
import { SectionHeaderArrow } from "@/components/ui/SectionHeader";
import Chip from "@/components/ui/Chip";
import { ROLE, PLATFORM, FLAGSHIP, PARTS, ALSO, PROJECTS, MINOR } from "@/lib/work-data";
import type { Diagram, Minor, Part, Project, WorkStatus } from "@/lib/work-data";

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

function TagRow({ tags, short, className = "mt-4" }: { tags: string[]; short?: string[]; className?: string }) {
  const row = (xs: string[], variant: string) => (
    <div className={`flex gap-1.5 flex-wrap ${className} ${variant}`.trim()}>
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
        <div>
          <div className="mono faint text-[11px] tracking-[2px] uppercase">
            {ROLE.role} · {ROLE.period}
          </div>
          {ROLE.note && (
            <div className="mono faint text-[11px] tracking-[1px] mt-[4px]">{ROLE.note}</div>
          )}
        </div>
      </div>
      <p className="m-0 text-[16.5px] leading-[1.62] max-w-[760px]">
        <Copy long={ROLE.blurb} short={ROLE.shortBlurb} />
      </p>
    </div>
  );
}

const STATUS_DOT: Record<WorkStatus, string> = {
  "closed beta": "var(--color-coral)",
  "in production": "var(--color-teal)",
  "user testing": "var(--color-ink-faint)",
};

function StatusDot({ status, className = "" }: { status: WorkStatus; className?: string }) {
  return (
    <span
      className={`mono inline-flex items-center gap-[7px] text-[10.5px] tracking-[1.5px] uppercase text-ink-soft ${className}`.trim()}
    >
      <span
        aria-hidden="true"
        className="w-[7px] h-[7px] rounded-full shrink-0"
        style={{ background: STATUS_DOT[status] }}
      />
      {status}
    </span>
  );
}

// Native <details> keeps every card a Server Component and gets keyboard and
// screen-reader support for free. The open/close motion is CSS only
// (::details-content); browsers without it open instantly.
function Details({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <details className="more">
      <summary>{label}</summary>
      {children}
    </details>
  );
}

function DiagramImg({
  d,
  caption,
  sizes,
  className = "",
}: {
  d: Diagram;
  caption: string;
  sizes: string;
  className?: string;
}) {
  return (
    <ZoomableImage
      src={d.src}
      alt={d.alt}
      caption={caption}
      width={d.w}
      height={d.h}
      sizes={sizes}
      className={`diagram ${className}`.trim()}
    />
  );
}

const DETAIL_LIST = "mt-[12px] pl-[18px] text-[15px] leading-[1.66] grid gap-[8px]";

function FlagshipPart() {
  const f = FLAGSHIP;
  const accent = `var(--color-${f.k})`;
  return (
    <section className="part" aria-label={`Part ${f.n}, ${f.t}`}>
      <div className="flagship-band">
        <div className="diagram-cap mono faint text-[10.5px] tracking-[1.5px] uppercase">
          <span>
            <Copy long={f.bandCap} short={f.shortBandCap} />
          </span>
        </div>
        <DiagramImg d={f.diagram} caption={f.bandCap} sizes="720px" className="wide-only max-w-[720px] mx-auto" />
        <DiagramImg d={f.shortDiagram} caption={f.bandCap} sizes="100vw" className="narrow-only" />
        <div className="wide-only mono faint text-[10.5px] tracking-[1px] text-center mt-[8px]">
          {f.bandFoot}
        </div>
      </div>

      <div className="flagship-body">
        <div className="wide-only">
          <div className="hand text-[58px] leading-[0.9]" style={{ color: accent }}>
            {f.n}
          </div>
          <div className="mono faint text-[11px] tracking-[2px] uppercase mt-[10px] mb-[12px] leading-[1.6]">
            {f.kind.map((line, i) => (
              <Fragment key={line}>
                {i > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </div>
          <StatusDot status={f.status} />
        </div>

        <div className="min-w-0">
          <div className="narrow-only flex items-center gap-[12px] mb-[6px]">
            <span className="hand text-[40px] leading-[0.9]" style={{ color: accent }}>
              {f.n}
            </span>
            <span className="mono faint text-[10px] tracking-[1.5px] uppercase">{f.shortKind}</span>
            <StatusDot status={f.status} className="ml-auto" />
          </div>
          <h3 className="flagship-title mt-0 mb-[12px] text-[31px] leading-[1.1]">{f.t}</h3>
          <p className="flagship-lead mt-0 mb-[10px] text-[19px] leading-[1.55] max-w-[640px]">
            <Copy long={f.lead} short={f.shortLead} />
          </p>
          <p className="flagship-role mt-0 mb-[12px] text-[15.5px] text-ink-soft max-w-[640px]">
            <Copy long={f.role} short={f.shortRole} />
          </p>
          <Details label={<Copy long={f.detailsLabel} short="details" />}>
            <Bullets items={f.bullets} short={f.shortBullets} className={DETAIL_LIST} />
            <p className="wide-only mt-[14px] mb-0 text-[15px]">
              <span
                className="mono text-[10.5px] tracking-[2px] uppercase mr-[8px]"
                style={{ color: `var(--color-${f.k}-ink)` }}
              >
                ↳ impact
              </span>
              {f.impact}
            </p>
            <TagRow tags={f.tags} short={f.shortTags} className="mt-[14px]" />
          </Details>
        </div>
      </div>
    </section>
  );
}

function CompactPart({ p }: { p: Part }) {
  return (
    <section className="part compact-part" aria-label={`Part ${p.n}, ${p.t}`}>
      <div className="part-pic wide-only">
        {p.sketches.map((s) => (
          <Fragment key={s.src}>
            <div className="pic-cap diagram-cap mono faint text-[10px] tracking-[1.5px] uppercase">
              <span>{s.caption}</span>
            </div>
            <DiagramImg d={s} caption={s.caption} sizes="284px" />
          </Fragment>
        ))}
      </div>
      <div className="part-inner">
        <div className="flex items-baseline gap-[12px] mb-[6px]">
          <span className="hand text-[36px] leading-[0.9]" style={{ color: `var(--color-${p.k})` }}>
            {p.n}
          </span>
          <span className="mono faint text-[10.5px] tracking-[2px] uppercase">
            <Copy long={p.kind} short={p.shortKind} />
          </span>
          <StatusDot status={p.status} className="ml-auto" />
        </div>
        <h3 className="part-title mt-[4px] mb-[8px] text-[22px] leading-[1.2]">{p.t}</h3>
        <p className="part-lead mt-0 mb-[12px] text-[16.5px] max-w-[600px]">
          <Copy long={p.lead} short={p.shortLead} />
        </p>
        {p.xref && (
          <p className="mt-[-4px] mb-0 text-[14.5px] text-ink-soft">
            <span
              className="mono text-[10.5px] tracking-[2px] uppercase mr-[8px]"
              style={{ color: `var(--color-${p.xref.tone}-ink)` }}
            >
              {p.xref.label}
            </span>
            <Copy long={p.xref.text} short={p.xref.shortText} />
          </p>
        )}
        <Details label="details">
          <Bullets items={p.bullets} short={p.shortBullets} className={DETAIL_LIST} />
          <TagRow tags={p.tags} className="mt-[14px] wide-only" />
        </Details>
      </div>
    </section>
  );
}

// The design's platform card: a header with the map, then the advisor as the
// lead part and the rest as compact rows, divided by dashed rules.
function PlatformCard() {
  return (
    <article className="sketch-box platform-card overflow-hidden">
      <header className="plat-head">
        <div className="mono faint text-[11px] tracking-[2px] uppercase">
          <Copy long={PLATFORM.kicker} short={PLATFORM.shortKicker} />
        </div>
        <h3 className="plat-title mt-[6px] mb-[10px] text-[30px] leading-[1.12]">{PLATFORM.title}</h3>
        <p className="plat-lead mt-0 mb-[12px] text-[17.5px] leading-[1.58] max-w-[720px]">
          <Copy long={PLATFORM.lead} short={PLATFORM.shortLead} />
        </p>
        <div className="max-w-[680px] mx-auto mt-[8px]">
          <DiagramImg d={PLATFORM.map} caption={PLATFORM.title} sizes="680px" className="wide-only" />
          <DiagramImg d={PLATFORM.shortMap} caption={PLATFORM.title} sizes="100vw" className="narrow-only" />
        </div>
      </header>
      <FlagshipPart />
      {PARTS.map((p) => (
        <CompactPart key={p.n} p={p} />
      ))}
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
          <a
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${p.t} on GitHub`}
            className="inline-flex no-underline"
          >
            <Chip kind={p.k}>{p.cta}</Chip>
          </a>
        </div>
      </div>
      {flip && <ProjectMedia p={p} />}
    </article>
  );
}

function GroupRule({ label, count }: { label: string; count: ReactNode }) {
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
        meta={`${1 + PARTS.length + PROJECTS.length + MINOR.length} entries · 2025 to present`}
      />
      <p className="faint max-w-[740px] mb-7 text-[16px]">
        <span className="marker-highlight">Panacea Financial</span>: selected work from my current
        role, alongside projects I build on my own time.
      </p>

      <RoleBlock />

      <div className="mb-5">
        <GroupRule
          label="selected work"
          count={<Copy long={`1 platform · ${1 + PARTS.length} parts`} short="1 platform" />}
        />
      </div>
      <PlatformCard />

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
