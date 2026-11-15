"use client";

import { useRef } from "react";
import { Award, Trophy } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { achievements } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Achievements() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-big-3]", {
        yPercent: 40,
        opacity: 0,
        duration: 1.6,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-big-3]", start: "top 85%", once: true },
      });
      gsap.utils.toArray<HTMLElement>("[data-row]").forEach((row, i) => {
        gsap.from(row, {
          y: 30,
          opacity: 0,
          duration: 1,
          delay: (i % 4) * 0.06,
          scrollTrigger: { trigger: row, start: "top 90%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="achievements" className="relative py-28 md:py-40">
      <div className="container-noir">
        <SectionHeading
          index="04"
          kicker="Achievements"
          title={
            <>
              Under <span className="font-serif font-normal italic text-volt-gradient">pressure.</span>
            </>
          }
        />

        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="overflow-hidden">
              <p data-big-3 className="font-display text-[clamp(7rem,20vw,16rem)] font-semibold leading-[0.8] tracking-[-0.06em] text-titanium">
                3×
              </p>
            </div>
            <p className="mt-6 max-w-sm font-serif text-2xl italic leading-snug text-titanium-200">
              National Hackathon Finalist.
            </p>
          </div>

          <div className="lg:col-span-7">
            <p className="label mb-4 flex items-center gap-2">
              <Trophy className="size-3.5 text-volt-bright" /> Hackathons
            </p>
            <ul className="border-t border-hairline">
              {achievements.hackathons.map((h) => (
                <li
                  key={h.name}
                  data-row
                  className="group grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-hairline py-5 transition-colors duration-500 hover:bg-white/[0.015] md:grid-cols-[5rem_1fr_auto] md:px-2"
                >
                  <span className="hidden font-mono text-sm text-titanium-500 md:block">{h.year}</span>
                  <span className="font-display text-xl font-medium tracking-tight text-titanium-50 transition-transform duration-500 ease-[var(--ease-cinematic)] group-hover:translate-x-2 md:text-2xl">
                    {h.name}
                    <span className="ml-2 font-mono text-xs text-titanium-500 md:hidden">{h.year}</span>
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] ${
                      h.tag === "National Finalist"
                        ? "border-volt/40 text-volt-glow"
                        : "border-hairline-strong text-titanium-400"
                    }`}
                  >
                    {h.tag}
                  </span>
                </li>
              ))}
            </ul>

            <p className="label mb-4 mt-14 flex items-center gap-2">
              <Award className="size-3.5 text-volt-bright" /> Certifications
            </p>
            <ul className="grid gap-3 sm:grid-cols-3">
              {achievements.certifications.map((c) => (
                <li key={c.name} data-row className="panel flex flex-col rounded-xl p-5">
                  <span className="font-mono text-[0.65rem] text-titanium-500">{c.year}</span>
                  <span className="mt-3 text-[0.95rem] font-medium leading-snug text-titanium-50">{c.name}</span>
                  <span className="mt-auto pt-4 text-xs text-titanium-400">{c.issuer}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
