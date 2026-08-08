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

/* Keep Source Serif's optical sizing automatic; pinning opsz also freezes weight. */
const sourceSerif = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

/* Interface chrome uses mono. */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

/* Caveat's small x-height makes 20px the minimum aside size. */
const caveat = Caveat({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Anoopchandra Parampalli | Full-stack dev × AI engineer",
    template: "%s | Anoopchandra Parampalli",
  },
  description:
    "Portfolio of Anoopchandra Parampalli, a full-stack engineer at Panacea Financial with AI/ML projects from Northeastern and a Linux daily driver. React, NestJS, PyTorch, FastAPI.",
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
    title: "Anoopchandra Parampalli | Full-stack dev × AI engineer",
    description:
      "Portfolio showcasing AI/ML projects, full-stack work, and a notebook-aesthetic portfolio site.",
    siteName: "Anoopchandra Parampalli Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The anoopchandra.dev cover: the name Anoopchandra set in large serif type beside a portrait, over notebook paper",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anoopchandra Parampalli | Full-stack dev × AI engineer",
    description:
      "Portfolio showcasing AI/ML projects, full-stack work, and a notebook-aesthetic portfolio site.",
    images: ["/og-image.png"],
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
      {/* Extensions can mutate body attributes before hydration; suppression stays scoped here. */}
      <body
        suppressHydrationWarning
        className={`${sourceSerif.variable} ${jetbrainsMono.variable} ${caveat.variable} antialiased`}
      >
        <a className="skip-link mono" href="#main-content">
          Skip to main content
        </a>
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
