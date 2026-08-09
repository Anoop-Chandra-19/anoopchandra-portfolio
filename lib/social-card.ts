import type { Metadata } from "next";

// Next shallow-merges metadata per top-level key: a route that declares
// `openGraph` at all REPLACES the root layout's object outright rather than
// filling in around it. Every field the parent set — siteName, locale, images —
// vanishes from that route unless it is repeated. Nothing errors; the tags are
// simply missing from the built HTML.
//
// So social metadata is built here rather than authored per route. A route that
// wants a card calls this and spreads the result; one that omits it inherits
// the homepage card, which is only ever correct for the homepage itself.

export const SITE_URL = "https://anoopchandra.dev";
const SITE_NAME = "Anoopchandra Parampalli Portfolio";

const DEFAULT_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "The anoopchandra.dev cover: the name Anoopchandra set in large serif type beside a portrait, over notebook paper",
};

export type CardImage = { url: string; width?: number; height?: number; alt: string };

/** `openGraph` + `twitter` for one route. `path` is root-relative ("/journal"),
 *  `image` falls back to the site cover when a page has no art of its own. */
export function socialCard({
  path,
  title,
  description,
  type = "website",
  image,
}: {
  path: string;
  title: string;
  description: string;
  type?: "website" | "article";
  image?: CardImage | null;
}): Pick<Metadata, "openGraph" | "twitter"> {
  const images = [image ?? DEFAULT_IMAGE];
  return {
    openGraph: {
      type,
      locale: "en_US",
      url: `${SITE_URL}${path}`,
      title,
      description,
      siteName: SITE_NAME,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((i) => i.url),
    },
  };
}
