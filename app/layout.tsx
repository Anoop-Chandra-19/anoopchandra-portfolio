import type { Metadata } from "next";
import { Caveat, Kalam, JetBrains_Mono, Newsreader } from "next/font/google";
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

const caveat = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const kalam = Kalam({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
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
        className={`${caveat.variable} ${kalam.variable} ${jetbrainsMono.variable} ${newsreader.variable} antialiased`}
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
