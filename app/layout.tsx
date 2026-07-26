import type { Metadata } from "next";
import { Caveat, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import "./animations.css";
import "./journal.css";
import "./lab.css";
import "./ink-transition.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import StructuredData from "@/components/StructuredData";
import HydrationTrigger from "@/components/HydrationTrigger";
import { LenisProvider } from "@/components/LenisProvider";
import InkTransitionProvider from "@/components/transition/InkTransitionProvider";
import { getEntryMetas } from "@/lib/journal";

/* v3 type system — three families, three jobs.
   reading → Source Serif 4 · chrome → JetBrains Mono · aside → Caveat.
   Hierarchy is carried by weight and size, not by swapping typefaces: a face
   change means a change of role. See docs/typography-v3-plan.md. */

/* Reading: everything you read — headings, body, deks, lists, article text.
   The opsz axis rides font-size (`font-optical-sizing: auto`), so a 72px
   heading gets the display cut for free. Never pin it with
   font-variation-settings — that freezes wght and breaks the weight rules. */
const sourceSerif = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

/* Chrome: anything a machine produced, or the interface talking about itself —
   nav, chips, labels, timestamps, code, captions, lab output. */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

/* Aside: decoration and marginalia only — margin notes, § markers, pull
   quotes, the lab verdict, the postcard signature. One weight, and never
   below 20px: Caveat's x-height runs ~25% small. */
const caveat = Caveat({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Anoopchandra Parampalli — Full-stack dev × AI engineer",
    template: "%s | Anoopchandra Parampalli",
  },
  description:
    "Portfolio of Anoopchandra Parampalli — full-stack engineer at Panacea Financial, AI/ML projects from Northeastern, and Linux daily-driver. React, NestJS, PyTorch, FastAPI.",
  keywords: [
    "AI Engineer",
    "ML Engineer",
    "Full Stack Developer",
    "PyTorch",
    "React",
    "NestJS",
    "FastAPI",
    "Portfolio",
  ],
  authors: [{ name: "Anoopchandra Parampalli" }],
  creator: "Anoopchandra Parampalli",
  metadataBase: new URL("https://anoopchandra.dev"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://anoopchandra.dev",
    title: "Anoopchandra Parampalli — Full-stack dev × AI engineer",
    description:
      "Portfolio showcasing AI/ML projects, full-stack work, and a notebook-aesthetic portfolio site.",
    siteName: "Anoopchandra Parampalli Portfolio",
    images: [
      {
        url: "/anoopchandra.webp",
        width: 1200,
        height: 630,
        alt: "Anoopchandra Parampalli",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <StructuredData />
      </head>
      {/* Extensions (Grammarly, password managers) stamp attributes onto <body>
          before React hydrates, which React reports as a mismatch. This
          suppresses only this element's own attributes — mismatches in the tree
          below still surface. */}
      <body
        suppressHydrationWarning
        className={`${sourceSerif.variable} ${jetbrainsMono.variable} ${caveat.variable} antialiased`}
      >
        <HydrationTrigger />
        <LenisProvider>
          <InkTransitionProvider entries={getEntryMetas()}>{children}</InkTransitionProvider>
        </LenisProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
