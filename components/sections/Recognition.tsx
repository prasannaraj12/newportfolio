"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { achievements } from "@/lib/content";

const finals = achievements.hackathons.filter((h) => h.tag === "National Finalist");
const others = achievements.hackathons.filter((h) => h.tag !== "National Finalist");

/**
 * 05 — Recognition as an exhibition wall: the three national finals hang as
 * framed exhibits under a gallery light; the rest is a catalogue below.
 */
export function Recognition() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;
      gsap.fromTo(
        "[data-numeral]",
        { yPercent: 30, fontWeight: 100 },
        { yPercent: 0, fontWeight: 800, ease: "none", scrollTrigger: { trigger: root.current, start: "top 80%", end: "top 15%", scrub: true } },
      );
      // the frames are hung one by one, then the gallery light comes up
      gsap.from("[data-frame]", {
        y: -40,
        opacity: 0,
        rotate: (i) => [-2, 1.5, -1][i] ?? 0,
        stagger: 0.18,
        duration: 1.4,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-wall]", start: "top 75%", once: true },
      });
      gsap.from("[data-light]", { opacity: 0, duration: 1.8, ease: "power2.out", scrollTrigger: { trigger: "[data-wall]", start: "top 60%", once: true } });
      gsap.from("[data-cat]", { y: 24, opacity: 0, stagger: 0.07, duration: 1, ease: "expo.out", scrollTrigger: { trigger: "[data-catalogue]", start: "top 82%", once: true } });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="recognition" aria-label="Recognition" className="theme-rose relative overflow-hidden py-24 md:py-36">
      <div className="container-noir">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-5">
            <p className="label mb-6">Recognition</p>
            <p data-numeral aria-label="Three times" className="font-display leading-[0.78] tracking-[-0.07em] text-titanium-50" style={{ fontSize: "clamp(8rem, 20vw, 18rem)" }}>
              3×
            </p>
          </div>
          <h2 className="font-serif text-[clamp(1.8rem,3vw,2.6rem)] leading-tight text-titanium-100 lg:col-span-6 lg:col-start-7">
            National Hackathon Finalist — three national finals in two years.
          </h2>
        </div>

        {/* The wall */}
        <div data-wall className="relative mt-16 md:mt-24">
          <div data-light aria-hidden className="pointer-events-none absolute -inset-x-10 -top-24 bottom-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_0%,rgba(255,250,242,0.75),transparent_70%)]" />
          <ul className="relative grid gap-10 sm:grid-cols-3 sm:gap-6 lg:gap-12">
            {finals.map((h, i) => (
              <li key={h.name} data-frame className={`${i === 1 ? "sm:mt-12" : ""}`}>
                {/* hanging wire */}
                <span aria-hidden className="mx-auto block h-8 w-px bg-[#4c4140]/40" />
                {/* frame → mount → citation */}
                <div className="bg-burgundy p-2 shadow-[0_40px_60px_-34px_rgba(76,65,64,0.6)]">
                  <div className="border border-[#c6a77b]/60 bg-[#fbf7f1] px-6 pb-7 pt-9 text-center">
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-gold">Exhibit · {String(i + 1).padStart(2, "0")}</p>
                    <p className="mt-6 font-editorial text-[clamp(1.7rem,2.4vw,2.3rem)] leading-[1.05] text-burgundy">{h.name}</p>
                    <span aria-hidden className="mx-auto mt-5 block h-px w-10 bg-gold" />
                    <p className="mt-5 font-display text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-espresso">{h.tag}</p>
                    <p className="mt-1 font-serif text-[1.05rem] text-titanium-400">{h.year}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Catalogue */}
        <div data-catalogue className="mt-24 grid gap-12 border-t border-hairline-strong pt-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="label">Also in the catalogue</p>
            <ul className="mt-5">
              {others.map((h) => (
                <li key={h.name} data-cat className="border-b border-hairline py-4">
                  <p className="font-display text-lg font-medium text-titanium-50">{h.name}</p>
                  <p className="text-[0.72rem] uppercase tracking-[0.1em] text-titanium-500">
                    {h.tag} · {h.year}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <p className="label">Certifications</p>
            <ul className="mt-5">
              {achievements.certifications.map((c) => (
                <li key={c.name} data-cat className="grid gap-1 border-b border-hairline py-4 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-6">
                  <span className="font-display text-lg font-medium leading-snug text-titanium-50">{c.name}</span>
                  <span className="text-[0.72rem] uppercase tracking-[0.1em] text-titanium-500">
                    {c.issuer} · {c.year}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
