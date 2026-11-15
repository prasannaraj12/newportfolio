"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { achievements } from "@/lib/content";

type Entry = { title: string; meta: string; kind: "Hackathon" | "Certification"; highlight?: boolean };

// Group hackathons and certifications into one chronological ledger.
const byYear = new Map<string, Entry[]>();
for (const h of achievements.hackathons) {
  const list = byYear.get(h.year) ?? [];
  list.push({ title: h.name, meta: h.tag, kind: "Hackathon", highlight: h.tag === "National Finalist" });
  byYear.set(h.year, list);
}
for (const c of achievements.certifications) {
  const list = byYear.get(c.year) ?? [];
  list.push({ title: c.name, meta: c.issuer, kind: "Certification" });
  byYear.set(c.year, list);
}
const years = [...byYear.entries()].sort(([a], [b]) => Number(a) - Number(b));

/** 05 — Recognition: one numeral, then an editorial timeline by year. */
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
      gsap.fromTo(
        "[data-rail]",
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-timeline]", start: "top 75%", end: "bottom 60%", scrub: true } },
      );
      gsap.utils.toArray<HTMLElement>("[data-year]").forEach((el) => {
        gsap.from(el.querySelectorAll("[data-y-reveal]"), {
          y: 30,
          opacity: 0,
          stagger: 0.08,
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 82%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="recognition" aria-label="Recognition" className="theme-rose relative overflow-hidden py-24 md:py-36">
      <div className="container-noir">
        <p className="label mb-6 flex items-center gap-3">
          Recognition
        </p>

        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:sticky lg:top-24 lg:col-span-5 lg:self-start">
            <p
              data-numeral
              aria-label="Three times"
              className="font-display leading-[0.78] tracking-[-0.07em] text-titanium"
              style={{ fontSize: "clamp(9rem, 24vw, 22rem)" }}
            >
              3×
            </p>
            <p className="mt-4 max-w-xs font-serif text-[1.7rem] leading-tight text-titanium-100">
              National Hackathon Finalist.
            </p>
          </div>

          <ol data-timeline className="relative lg:col-span-6 lg:col-start-7">
            <span aria-hidden className="absolute bottom-0 left-0 top-0 w-px bg-hairline-strong">
              <span data-rail className="block h-full w-full origin-top bg-titanium-100" />
            </span>
            {years.map(([year, entries]) => (
              <li key={year} data-year className="relative pb-16 pl-8 last:pb-0 md:pl-12">
                <span aria-hidden className="absolute left-[-4px] top-5 size-[9px] rotate-45 bg-titanium-50" />
                <p
                  data-y-reveal
                  className="font-display font-extrabold leading-none tracking-[-0.05em] text-transparent"
                  style={{ fontSize: "clamp(3.4rem, 7vw, 6rem)", WebkitTextStroke: "1px var(--color-titanium-400)" }}
                >
                  {year}
                </p>
                <ul className="mt-5 border-t border-hairline">
                  {entries.map((e) => (
                    <li key={e.title} data-y-reveal className="group grid gap-1 border-b border-hairline py-4 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-6">
                      <span className="font-display text-lg font-medium leading-snug tracking-tight text-titanium-50 transition-transform duration-500 ease-[var(--ease-cinematic)] group-hover:translate-x-1.5 md:text-xl">
                        {e.title}
                      </span>
                      <span className={`text-[0.7rem] uppercase tracking-[0.1em] ${e.highlight ? "text-volt-bright" : "text-titanium-500"}`}>
                        {e.kind === "Certification" ? `Certification · ${e.meta}` : e.meta}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
