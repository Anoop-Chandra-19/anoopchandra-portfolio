import { Fragment, type ReactNode } from "react";
import ZoomableImage from "@/components/ui/ZoomableImage";
import { SectionHeaderArrow } from "@/components/ui/SectionHeader";
import Chip from "@/components/ui/Chip";
import Label from "@/components/ui/Label";
import { ROLE, PLATFORM, FLAGSHIP, PARTS, ALSO, PROJECTS, MINOR } from "@/lib/work-data";
import type { Diagram, Minor, Part, Project, WorkStatus } from "@/lib/work-data";

function TagPill({ t }: { t: string }) {
  return (
    <Label
      kind="meta"
      tone="soft"
      as="span"
      className="py-[3px] px-2.5 rounded-full"
      style={{ border: "1.2px solid var(--color-ink-soft)" }}
    >
      {t}
    </Label>
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
      <span className="max-wide:hidden">{long}</span>
      <span className="wide:hidden">{short}</span>
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
      {list(items, "max-wide:hidden")}
      {list(short, "wide:hidden")}
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
      {row(tags, "max-wide:hidden")}
      {row(short, "wide:hidden")}
    </>
  );
}

function RoleBlock() {
  return (
    <div
      className="sketch-box mb-[26px]"
      style={{ background: "color-mix(in oklab, var(--color-electric) 5%, var(--color-paper))" }}
    >
      <div className="flex items-baseline gap-4 flex-wrap mb-3">
        <span className="hand text-[34px] leading-none text-electric max-wide:text-[26px]">{ROLE.org}</span>
        <div>
          <Label kind="eyebrow">
            {ROLE.role} · {ROLE.period}
          </Label>
          {ROLE.note && (
            <Label kind="meta" className="mt-[4px]">{ROLE.note}</Label>
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
    <Label kind="tag" tone="soft" as="span" className={`inline-flex items-center gap-[7px] ${className}`.trim()}>
      <span
        aria-hidden="true"
        className="w-[7px] h-[7px] rounded-full shrink-0"
        style={{ background: STATUS_DOT[status] }}
      />
      {status}
    </Label>
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

const DETAIL_LIST = "mt-[12px] pl-[18px] text-small grid gap-[8px]";

function FlagshipPart() {
  const f = FLAGSHIP;
  const accent = `var(--color-${f.k})`;
  return (
    <section className="part" aria-label={`Part ${f.n}, ${f.t}`}>
      <div className="pt-[18px] px-[22px] pb-[12px] border-b-2 border-ink max-wide:pt-[12px] max-wide:px-[14px] max-wide:pb-[8px]">
        <Label kind="tag" className="diagram-cap">
          <span>
            <Copy long={f.bandCap} short={f.shortBandCap} />
          </span>
        </Label>
        <DiagramImg d={f.diagram} caption={f.bandCap} sizes="720px" className="max-wide:hidden max-w-[720px] mx-auto" />
        <DiagramImg d={f.shortDiagram} caption={f.bandCap} sizes="100vw" className="wide:hidden" />
        <Label kind="caption" className="max-wide:hidden text-center mt-[8px]">
          {f.bandFoot}
        </Label>
      </div>

      <div className="grid grid-cols-[170px_minmax(0,1fr)] gap-[28px] pt-[28px] px-[30px] pb-[26px] max-wide:block max-wide:py-[18px] max-wide:px-[16px]">
        <div className="max-wide:hidden">
          <div className="hand text-[58px] leading-[0.9]" style={{ color: accent }}>
            {f.n}
          </div>
          <Label kind="eyebrow" className="mt-[10px] mb-[12px] leading-[1.6]">
            {f.kind.map((line, i) => (
              <Fragment key={line}>
                {i > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </Label>
          <StatusDot status={f.status} />
        </div>

        <div className="min-w-0">
          <div className="wide:hidden flex items-center gap-[12px] mb-[6px]">
            <span className="hand text-[40px] leading-[0.9]" style={{ color: accent }}>
              {f.n}
            </span>
            <Label kind="tag" as="span">{f.shortKind}</Label>
            <StatusDot status={f.status} className="ml-auto" />
          </div>
          <h3 className="mt-0 mb-[12px] text-[31px] leading-[1.1] max-wide:text-[23px]">{f.t}</h3>
          <p className="mt-0 mb-[10px] text-[19px] leading-[1.55] max-w-[640px] max-wide:text-[16.5px]">
            <Copy long={f.lead} short={f.shortLead} />
          </p>
          <p className="mt-0 mb-[12px] text-small text-ink-soft max-w-[640px]">
            <Copy long={f.role} short={f.shortRole} />
          </p>
          <Details label={<Copy long={f.detailsLabel} short="details" />}>
            <Bullets items={f.bullets} short={f.shortBullets} className={DETAIL_LIST} />
            <p className="max-wide:hidden mt-[14px] mb-0 text-small">
              <Label
                kind="tag"
                tone="inherit"
                as="span"
                className="mr-[8px]"
                style={{ color: `var(--color-${f.k}-ink)` }}
              >
                ↳ impact
              </Label>
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
    <section className="part flex items-stretch max-wide:block" aria-label={`Part ${p.n}, ${p.t}`}>
      <div className="part-pic max-wide:hidden flex-[0_0_320px] flex flex-col justify-center gap-[4px] py-[16px] px-[18px] border-r-2 border-ink">
        {p.sketches.map((s) => (
          <Fragment key={s.src}>
            <Label kind="tag" className="pic-cap diagram-cap">
              <span>{s.caption}</span>
            </Label>
            <DiagramImg d={s} caption={s.caption} sizes="284px" />
          </Fragment>
        ))}
      </div>
      <div className="flex-1 min-w-0 pt-[22px] px-[26px] pb-[20px] max-wide:p-[16px]">
        <div className="flex items-baseline gap-[12px] mb-[6px]">
          <span className="hand text-[36px] leading-[0.9]" style={{ color: `var(--color-${p.k})` }}>
            {p.n}
          </span>
          <Label kind="tag" as="span">
            <Copy long={p.kind} short={p.shortKind} />
          </Label>
          <StatusDot status={p.status} className="ml-auto" />
        </div>
        <h3 className="mt-[4px] mb-[8px] text-[22px] leading-[1.2] max-wide:text-[19px]">{p.t}</h3>
        <p className="mt-0 mb-[12px] text-[16.5px] max-w-[600px] max-wide:text-[15.5px]">
          <Copy long={p.lead} short={p.shortLead} />
        </p>
        {p.xref && (
          <p className="mt-[-4px] mb-0 text-small text-ink-soft">
            <Label
              kind="tag"
              tone="inherit"
              as="span"
              className="mr-[8px]"
              style={{ color: `var(--color-${p.xref.tone}-ink)` }}
            >
              {p.xref.label}
            </Label>
            <Copy long={p.xref.text} short={p.xref.shortText} />
          </p>
        )}
        <Details label="details">
          <Bullets items={p.bullets} short={p.shortBullets} className={DETAIL_LIST} />
          <TagRow tags={p.tags} className="mt-[14px] max-wide:hidden" />
        </Details>
      </div>
    </section>
  );
}

// The design's platform card: a header with the map, then the advisor as the
// lead part and the rest as compact rows, divided by dashed rules.
function PlatformCard() {
  return (
    <article className="sketch-box p-0 overflow-hidden">
      <header className="pt-[26px] px-[30px] pb-[18px] border-b-2 border-ink max-wide:pt-[16px] max-wide:px-[14px] max-wide:pb-[12px]">
        <Label kind="eyebrow">
          <Copy long={PLATFORM.kicker} short={PLATFORM.shortKicker} />
        </Label>
        <h3 className="mt-[6px] mb-[10px] text-[30px] leading-[1.12] max-wide:text-[22px]">{PLATFORM.title}</h3>
        <p className="mt-0 mb-[12px] text-intro max-w-[720px]">
          <Copy long={PLATFORM.lead} short={PLATFORM.shortLead} />
        </p>
        <div className="max-w-[680px] mx-auto mt-[8px]">
          <DiagramImg d={PLATFORM.map} caption={PLATFORM.title} sizes="680px" className="max-wide:hidden" />
          <DiagramImg d={PLATFORM.shortMap} caption={PLATFORM.title} sizes="100vw" className="wide:hidden" />
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
    <ul className="list-none p-0 m-0 grid gap-3">
      {ALSO.map((a) => (
        <li key={a.d} className="grid grid-cols-[20px_1fr] gap-3 items-start max-wide:grid-cols-[14px_1fr]">
          <span className="mono text-[13px] leading-[1.6] text-ink-faint">•</span>
          <span className="text-small">
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
      className="grid grid-cols-[minmax(150px,190px)_1fr] gap-6 items-baseline py-3.5 max-wide:grid-cols-1 max-wide:gap-[6px] max-wide:py-[12px]"
      style={{ borderTop: "1.5px dashed var(--color-ink-faint)" }}
    >
      <div className="max-wide:flex max-wide:items-baseline max-wide:justify-between max-wide:gap-[10px]">
        <div className="text-[16px] font-semibold leading-[1.3]">{m.t}</div>
        <Label kind="meta" className="mt-[3px] max-wide:shrink-0 max-wide:mt-0">{m.y}</Label>
      </div>
      <p className="m-0 text-small">{m.d}</p>
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
      className={`sketch-box overflow-hidden grid max-mid:grid-cols-1 max-wide:p-0 ${
        flip ? "grid-cols-[1fr_1.4fr]" : "grid-cols-[1.4fr_1fr]"
      }`}
    >
      {!flip && <ProjectMedia p={p} />}
      <div className="p-8 max-mid:order-2 max-mid:p-[24px] max-wide:p-[18px]">
        <Label kind="eyebrow">
          {p.cat} · <span style={{ color: `var(--color-${p.k})` }}>{p.org}</span>
        </Label>
        <h3 className="mt-2 mb-3.5 text-[25px] leading-[1.18] tracking-[-0.012em] max-mid:text-[24px] max-wide:text-[20px] max-wide:leading-[1.2]">{p.t}</h3>
        <p className="mt-0 text-intro max-w-[520px] mb-4">
          <Copy long={p.d} short={p.shortD} />
        </p>
        <Bullets
          items={p.bullets}
          short={p.shortBullets}
          className="list-disc pl-[18px] mt-0 text-[17px] leading-[1.7]"
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
    <div className="flex items-center gap-[18px] max-wide:gap-[10px]">
      <Label kind="eyebrow" as="span">{label}</Label>
      <span
        className="flex-1 h-px max-wide:shrink-0 max-wide:min-w-[20px]"
        style={{ borderTop: "1.5px dashed var(--color-ink-faint)" }}
      />
      <Label kind="meta" as="span">{count}</Label>
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
      <p className="faint max-w-[740px] mb-7 text-[16px] max-wide:mb-[16px]">
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
      <div className="col">
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
