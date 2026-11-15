"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { achievements } from "@/lib/content";

/** 05 — Recognition. Purely typographic: one numeral, two ledgers. */
export function Recognition() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-numeral]",
        { yPercent: 30, fontWeight: 100 },
        {
          yPercent: 0,
          fontWeight: 800,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 80%", end: "top 15%", scrub: true },
        },
      );
      gsap.utils.toArray<HTMLElement>("[data-row]").forEach((row, i) => {
        gsap.from(row, {
          y: 24,
          opacity: 0,
          duration: 1,
          delay: (i % 4) * 0.06,
          scrollTrigger: { trigger: row, start: "top 92%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="recognition" aria-label="Recognition" className="relative overflow-hidden bg-void py-24 md:py-36">
      <div className="container-noir">
        <p className="label mb-6 flex items-center gap-3">
          <span className="text-volt-bright">05</span>
          <span className="h-px w-8 bg-titanium-500" />
          Recognition
        </p>

        <div className="grid gap-14 lg:grid-cols-12 lg:items-end">
          <div className="relative lg:col-span-5">
            <p
              data-numeral
              aria-label="Three times"
              className="font-display leading-[0.78] tracking-[-0.07em] text-titanium"
              style={{ fontSize: "clamp(9rem, 26vw, 24rem)" }}
            >
              3×
            </p>
            <p className="mt-4 max-w-xs font-serif text-[1.7rem] italic leading-tight text-titanium-100">
              National Hackathon Finalist.
            </p>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <p className="label mb-3">Hackathons</p>
            <ul className="border-t border-titanium-500/40">
              {achievements.hackathons.map((h) => (
                <li
                  key={h.name}
                  data-row
                  className="group grid grid-cols-[3.5rem_1fr] items-baseline gap-3 border-b border-hairline py-5 sm:grid-cols-[4rem_1fr_auto]"
                >
                  <span className="font-mono text-xs text-titanium-500">{h.year}</span>
                  <span className="font-display text-xl font-medium tracking-tight text-titanium-50 transition-transform duration-500 ease-[var(--ease-cinematic)] group-hover:translate-x-2 md:text-2xl">
                    {h.name}
                  </span>
                  <span
                    className={`col-start-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] sm:col-start-auto ${
                      h.tag === "National Finalist" ? "text-volt-bright" : "text-titanium-500"
                    }`}
                  >
                    {h.tag}
                  </span>
                </li>
              ))}
            </ul>

            <p className="label mb-3 mt-14">Certifications</p>
            <ul className="border-t border-titanium-500/40">
              {achievements.certifications.map((c) => (
                <li key={c.name} data-row className="grid grid-cols-[3.5rem_1fr] gap-3 border-b border-hairline py-4 sm:grid-cols-[4rem_1fr_auto]">
                  <span className="font-mono text-xs text-titanium-500">{c.year}</span>
                  <span className="text-[0.98rem] leading-snug text-titanium-100">{c.name}</span>
                  <span className="col-start-2 font-serif italic text-titanium-400 sm:col-start-auto">{c.issuer}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
