import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdjacent, getEntries, getEntryBySlug, getRelated, getSections } from "@/lib/journal";
import ArticleEntry from "@/components/journal/ArticleEntry";
import { imageDims } from "@/lib/image-dims";
import { socialCard } from "@/lib/social-card";

// Every valid slug is known at build time (slug = filename in content/journal),
// so unknown URLs 404 at the routing layer without invoking any server code.
export const dynamicParams = false;

export function generateStaticParams() {
  return getEntries().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntryBySlug(slug);
  if (!entry) return {};
  // An entry without a hero falls through to the site cover rather than to no
  // image at all — an card with no art is worse than a generic one.
  const heroDims = entry.hero ? imageDims(entry.hero) : null;
  const hero =
    entry.hero && heroDims
      ? {
          url: entry.hero,
          width: heroDims.w,
          height: heroDims.h,
          alt: entry.heroAlt ?? entry.title,
        }
      : null;
  return {
    title: entry.title,
    description: entry.dek,
    alternates: { canonical: `/journal/${entry.slug}` },
    ...socialCard({
      path: `/journal/${entry.slug}`,
      title: entry.title,
      description: entry.dek,
      type: "article",
      image: hero,
    }),
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEntryBySlug(slug);
  if (!entry) notFound();

  const { prev, next } = getAdjacent(slug);
  return (
    <div data-journal-root>
      <ArticleEntry
        entry={entry}
        prev={prev}
        next={next}
        sections={getSections(entry)}
        related={getRelated(entry)}
      />
    </div>
  );
}
