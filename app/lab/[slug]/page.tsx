import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LAB_EXPS, getLabExp } from "@/lib/lab-meta";
import { socialCard } from "@/lib/social-card";
import LabShell from "@/components/lab/LabShell";

// The three experiments are a fixed set — unknown URLs 404 at the routing
// layer without invoking any server code.
export const dynamicParams = false;

export function generateStaticParams() {
  return LAB_EXPS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const exp = getLabExp(slug);
  if (!exp) return {};
  const title = `${exp.title} | The Lab`;
  return {
    title,
    description: exp.blurb,
    alternates: { canonical: `/lab/${exp.slug}` },
    ...socialCard({ path: `/lab/${exp.slug}`, title, description: exp.blurb }),
  };
}

export default async function LabPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exp = getLabExp(slug);
  if (!exp) notFound();

  return (
    <div data-lab-root>
      <LabShell exp={exp} />
    </div>
  );
}
