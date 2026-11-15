import type { Metadata, Viewport } from "next";
import { Inter_Tight, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NEURALVERSE — Prasanna Raj R",
  description:
    "Prasanna Raj R — AI/ML Engineer specializing in Generative AI, LLM applications and Agentic AI systems.",
};

export const viewport: Viewport = {
  themeColor: "#030405",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${instrumentSerif.variable} ${jetbrains.variable}`}
    >
      <body>
        <SmoothScroll>{children}</SmoothScroll>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
