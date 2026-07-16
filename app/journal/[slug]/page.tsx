import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdjacent, getEntries, getEntryBySlug, getRelated } from "@/lib/journal";
import ArticleSpread from "@/components/journal/ArticleSpread";

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
  return {
    title: entry.title,
    description: entry.dek,
    alternates: { canonical: `/journal/${entry.slug}` },
    openGraph: {
      type: "article",
      url: `https://anoopchandra.dev/journal/${entry.slug}`,
      title: entry.title,
      description: entry.dek,
      ...(entry.hero ? { images: [{ url: entry.hero, alt: entry.heroAlt ?? entry.title }] } : {}),
    },
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
      <ArticleSpread entry={entry} related={getRelated(entry)} prev={prev} next={next} />
    </div>
  );
}
