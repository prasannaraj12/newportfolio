import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono, Newsreader } from "next/font/google";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prasanna Raj R — AI Engineer",
  description:
    "Prasanna Raj R — AI Engineer. Ideas into intelligence: agentic AI, LLM fine-tuning and real-world AI systems.",
  openGraph: {
    title: "Prasanna Raj R — AI Engineer",
    description: "Ideas into intelligence: agentic AI, LLM fine-tuning and real-world AI systems.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f0e8",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${bodoni.variable} ${instrument.variable} ${newsreader.variable} ${jetbrains.variable}`}
    >
      <body>
        <SmoothScroll>{children}</SmoothScroll>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
