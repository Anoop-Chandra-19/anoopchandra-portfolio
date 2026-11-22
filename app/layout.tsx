import type { Metadata } from "next";
import { Caveat, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import "./animations.css";
import "./ink-transition.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import StructuredData from "@/components/StructuredData";
import InkTransitionProvider from "@/components/transition/InkTransitionProvider";

/* Source Serif 4, trimmed to the weights the site sets (scripts/trim-serif-font.py)
   and renamed Notebook Serif as its licence requires (app/fonts/OFL.txt).
   Italic exists only at 400; nothing sets bold italic.
   Keep the optical sizing automatic; pinning opsz also freezes weight. */
const notebookSerif = localFont({
  variable: "--font-display",
  src: [
    { path: "./fonts/NotebookSerif-Roman.woff2", weight: "400 700", style: "normal" },
    { path: "./fonts/NotebookSerif-Italic.woff2", weight: "400", style: "italic" },
  ],
  display: "swap",
  adjustFontFallback: "Times New Roman",
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
    "Portfolio of Anoopchandra Parampalli, an applied AI engineer at Panacea Financial with AI/ML projects from Northeastern and a Linux daily driver. React, NestJS, PyTorch, FastAPI.",
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
        className={`${notebookSerif.variable} ${jetbrainsMono.variable} ${caveat.variable} antialiased`}
      >
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <InkTransitionProvider>{children}</InkTransitionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
