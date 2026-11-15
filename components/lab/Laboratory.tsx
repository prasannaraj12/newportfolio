"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { projects } from "@/lib/content";
import { mulberry32 } from "@/lib/random";
import { ExhibitText } from "./ExhibitText";
import { AgentDBDiagram } from "./AgentDBDiagram";
import { QwenDiagram } from "./QwenDiagram";
import { CrawlNewsDiagram } from "./CrawlNewsDiagram";
import { RentYourMateDiagram } from "./RentYourMateDiagram";
import { Archive } from "./Archive";
import { HashChainExhibit } from "./HashChainExhibit";

const byId = Object.fromEntries(projects.map((p) => [p.id, p]));
const WORD = "LABORATORY";
const rand = mulberry32(3);
const scatter = Array.from(WORD, () => ({
  z: -900 + rand() * 1300,
  x: (rand() - 0.5) * 60,
  y: (rand() - 0.5) * 140,
  r: (rand() - 0.5) * 80,
}));

/** 03 — The Laboratory: a spatial type intro, then four exhibition rooms. */
export function Laboratory() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduced) {
        const letters = gsap.utils.toArray<HTMLElement>("[data-lab-letter]");
        const tl = gsap.timeline({
          scrollTrigger: { trigger: "[data-lab-intro]", start: "top top", end: "+=110%", pin: true, scrub: 0.7 },
        });
        letters.forEach((el, i) => {
          const s = scatter[i];
          tl.fromTo(
            el,
            { z: s.z, xPercent: s.x, yPercent: s.y, rotateY: s.r, opacity: 0.08 },
            { z: 0, xPercent: 0, yPercent: 0, rotateY: 0, opacity: 1, ease: "power2.out", duration: 1 },
            0,
          );
        });
        tl.from("[data-lab-sub]", { opacity: 0, y: 20, duration: 0.4 }, 0.7);
      }

      gsap.utils.toArray<HTMLElement>("[data-exhibit]").forEach((ex) => {
        gsap.from(ex.querySelectorAll("[data-exhibit-reveal]"), {
          y: 60,
          opacity: 0,
          duration: 1.3,
          stagger: 0.12,
          ease: "expo.out",
          scrollTrigger: { trigger: ex, start: "top 72%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="laboratory" aria-label="The Laboratory" className="relative bg-void">
      {/* Spatial typography intro */}
      <div data-lab-intro className="relative flex h-[100svh] flex-col items-center justify-center overflow-hidden">
        <p className="label absolute left-[var(--gutter)] top-[12svh] flex items-center gap-3">
          The Laboratory
        </p>
        <h2
          aria-label="Laboratory"
          className="flex font-display font-extrabold leading-none tracking-[-0.06em] text-titanium-50 [perspective:900px] [transform-style:preserve-3d]"
          style={{ fontSize: "clamp(2.6rem, 11.5vw, 13rem)" }}
        >
          {Array.from(WORD).map((ch, i) => (
            <span key={i} aria-hidden data-lab-letter className="inline-block text-titanium will-change-transform">
              {ch}
            </span>
          ))}
        </h2>
        <p data-lab-sub className="mt-6 max-w-md px-6 text-center font-serif text-xl text-titanium-300 md:text-2xl">
          Eleven systems. Five exhibited as they work, six more in the archive.
        </p>
      </div>

      {/* Exhibit A — AgentDB */}
      <article data-exhibit className="relative overflow-hidden border-t border-hairline py-24 md:py-36">
        <span
          aria-hidden
          className="pointer-events-none absolute -left-[4vw] top-10 select-none font-serif leading-none text-transparent"
          style={{ fontSize: "clamp(16rem, 38vw, 40rem)", WebkitTextStroke: "1px var(--color-hairline-strong)" }}
        >
          A
        </span>
        <div className="container-noir relative grid gap-14 lg:grid-cols-12 lg:items-center">
          <div data-exhibit-reveal className="lg:col-span-5">
            <ExhibitText project={byId.agentdb} letter="A" />
          </div>
          <div data-exhibit-reveal className="lg:col-span-7">
            <AgentDBDiagram />
          </div>
        </div>
      </article>

      {/* Exhibit B — Qwen (light room) */}
      <article data-exhibit className="theme-rose relative py-24 md:py-36">
        <div className="container-noir grid gap-14 lg:grid-cols-12 lg:items-center">
          <div data-exhibit-reveal className="order-2 lg:order-1 lg:col-span-7">
            <QwenDiagram />
          </div>
          <div data-exhibit-reveal className="order-1 lg:order-2 lg:col-span-4 lg:col-start-9">
            <ExhibitText project={byId.qwen} letter="B" />
          </div>
        </div>
      </article>

      {/* Exhibit C — CrawlNews (wide room) */}
      <article data-exhibit className="relative py-24 md:py-36">
        <div className="container-noir">
          <div data-exhibit-reveal className="grid gap-10 lg:grid-cols-12">
            <ExhibitText project={byId.crawlnews} letter="C" className="lg:col-span-6" />
            <p className="self-end font-serif text-2xl leading-snug text-titanium-400 lg:col-span-5 lg:col-start-8">
              Hover a stage to follow the signal from source to summary.
            </p>
          </div>
          <div data-exhibit-reveal className="mt-14">
            <CrawlNewsDiagram />
          </div>
        </div>
      </article>

      {/* Exhibit D — RentYourMate (graphite room) */}
      <article data-exhibit className="theme-rose relative py-24 md:py-36">
        <div className="container-noir grid gap-14 lg:grid-cols-12 lg:items-center">
          <div data-exhibit-reveal className="lg:col-span-6">
            <RentYourMateDiagram />
          </div>
          <div data-exhibit-reveal className="lg:col-span-5 lg:col-start-8">
            <ExhibitText project={byId.rentyourmate} letter="D" />
          </div>
        </div>
      </article>

      <HashChainExhibit />

      <Archive />

      <p className="container-noir py-8 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-titanium-500">
        Diagrams are schematic illustrations of each system — not screenshots.
      </p>
    </section>
  );
}
