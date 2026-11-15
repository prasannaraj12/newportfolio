"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { perspective, portraits, profile } from "@/lib/content";

/**
 * 01 — Perspective.
 * Pinned scene: the double-exposure portrait opens out of a horizontal slit,
 * three statements drift across in opposing directions, weights swelling
 * as each one reaches the centre.
 */
export function Perspective() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage.current,
          start: "top top",
          end: "+=240%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
        },
      });

      tl.fromTo(
        "[data-aperture]",
        { clipPath: "inset(49.5% 24% 49.5% 24%)" },
        { clipPath: "inset(9% 6% 9% 6%)", duration: 1.1, ease: "power2.inOut" },
        0,
      )
        .fromTo("[data-aperture-img]", { scale: 1.35 }, { scale: 1, duration: 1.4 }, 0)
        .from("[data-persp-kicker]", { opacity: 0, y: 20, duration: 0.3 }, 0.1);

      gsap.utils.toArray<HTMLElement>("[data-statement]").forEach((el, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        const at = 0.55 + i * 0.5;
        tl.fromTo(el, { xPercent: 28 * dir, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.6 }, at)
          .fromTo(
            el.querySelector("[data-lead]"),
            { fontWeight: 200 },
            { fontWeight: 800, duration: 0.6 },
            at,
          )
          .to(el, { xPercent: -2.5 * dir, duration: 1.2 }, at + 0.6);
      });

      tl.to("[data-aperture]", { clipPath: "inset(0% 0% 0% 0%)", opacity: 0.18, duration: 0.6 }, 2.4)
        .to("[data-statement]", { opacity: 0.12, duration: 0.5 }, 2.6);
    },
    { scope: root },
  );

  return (
    <section ref={root} id="perspective" aria-label="Perspective" className="relative bg-void">
      <div ref={stage} className="relative h-[100svh] w-full overflow-hidden">
        {/* Aperture */}
        <div data-aperture className="absolute inset-0" style={{ clipPath: "inset(9% 6% 9% 6%)" }}>
          <div data-aperture-img className="absolute inset-0">
            <Image
              src={portraits.doubleExposure.src}
              alt={`${profile.name}, double-exposure portrait`}
              fill
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: "52% 22%" }}
            />
          </div>
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgb(3 4 5 / 0.92), rgb(3 4 5 / 0.25) 45%, transparent 70%)" }}
          />
        </div>

        <div className="container-noir relative flex h-full flex-col justify-between pb-[11svh] pt-[12svh]">
          <p data-persp-kicker className="label flex items-center gap-3">
            <span className="text-volt-bright">01</span>
            <span className="h-px w-8 bg-titanium-500" />
            Perspective
          </p>

          <ul className="space-y-1 md:space-y-0">
            {perspective.map((s, i) => (
              <li
                key={s.lead}
                data-statement
                className={`flex flex-col ${i === 1 ? "md:items-end md:pr-[4vw]" : i === 2 ? "md:pl-[10vw]" : ""}`}
              >
                <span className="label mb-1 hidden text-[0.58rem] text-titanium-400 md:block">↳ {s.ref}</span>
                <span
                  className="flex flex-wrap items-baseline gap-x-[0.25em] leading-[0.98]"
                  style={{ fontSize: "clamp(2rem, 5.4vw, 6rem)" }}
                >
                  <span data-lead className="font-display font-extrabold uppercase tracking-[-0.05em] text-titanium-50">
                    {s.lead}
                  </span>
                  <span className="font-serif italic tracking-[-0.03em] text-titanium-200">{s.rest}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
