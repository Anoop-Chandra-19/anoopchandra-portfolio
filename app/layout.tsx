import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import StructuredData from "@/components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Anoopchandra Parampalli - AI/ML Engineer & Full-Stack Developer",
    template: "%s | Anoopchandra Parampalli"
  },
  description: "Portfolio of Anoopchandra Parampalli - AI/ML engineer, full-stack developer, and creator. Specializing in PyTorch, React, FastAPI, and AWS cloud solutions.",
  keywords: [
    "AI Engineer",
    "ML Engineer", 
    "Full Stack Developer",
    "PyTorch",
    "React",
    "FastAPI",
    "AWS",
    "Machine Learning",
    "Artificial Intelligence",
    "Portfolio"
  ],
  authors: [{ name: "Anoopchandra Parampalli" }],
  creator: "Anoopchandra Parampalli",
  metadataBase: new URL('https://anoopchandra.dev'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://anoopchandra.dev',
    title: 'Anoopchandra Parampalli - AI/ML Engineer & Full-Stack Developer',
    description: 'Portfolio showcasing AI/ML projects, full-stack development, and innovative solutions.',
    siteName: 'Anoopchandra Parampalli Portfolio',
    images: [
      {
        url: '/anoopchandra.jpg',
        width: 1200,
        height: 630,
        alt: 'Anoopchandra Parampalli - AI/ML Engineer',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="canonical" href="https://anoopchandra.dev" />
        <StructuredData />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        <ThemeProvider>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
