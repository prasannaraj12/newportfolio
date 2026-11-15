"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { perspective } from "@/lib/content";
import { useStage } from "@/components/stage/SculptureStage";

/**
 * 01 — Ideas into intelligence.
 * The sculpture arrives from the hero; scrolling locks its plates from a
 * loose spiral into a monolith while the sentence assembles around it.
 */
export function Ideas() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const stage = useStage();

  useGSAP(
    () => {
      const driver = stage?.driver;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        if (driver) gsap.set(driver, { order: 1 });
        return;
      }
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: pin.current, start: "top top", end: "+=230%", pin: true, scrub: 0.8 },
      });
      if (driver) tl.fromTo(driver, { order: 0.5 }, { order: 1, duration: 2.2, ease: "power1.inOut" }, 0.2);

      tl.from("[data-w-ideas]", { xPercent: -20, opacity: 0, duration: 0.5 }, 0)
        .from("[data-w-into]", { opacity: 0, y: 30, duration: 0.4 }, 0.7)
        .from("[data-w-intel]", { xPercent: 18, opacity: 0, duration: 0.6 }, 1.6)
        .to("[data-w-ideas]", { opacity: 0.18, duration: 0.6 }, 1.7);

      gsap.utils.toArray<HTMLElement>("[data-caption]").forEach((el, i) => {
        tl.from(el, { opacity: 0, y: 24, duration: 0.35 }, 0.5 + i * 0.6);
      });

      // Hand over to the graphite chapter that follows.
      tl.to("[data-dusk]", { opacity: 1, duration: 0.5 }, 2.6).to("[data-ideas-text]", { opacity: 0, duration: 0.4 }, 2.65);
    },
    { scope: root },
  );

  return (
    <section ref={root} id="ideas" aria-label="Ideas into intelligence" className="theme-ivory relative">
      <div ref={pin} className="relative z-10 h-[100svh] overflow-hidden">
        <div data-dusk aria-hidden className="absolute inset-0 bg-rose opacity-0" />

        <div data-ideas-text className="container-noir relative z-10 h-full">
          <h2 className="sr-only">Ideas into intelligence</h2>

          <p
            data-w-ideas
            aria-hidden
            className="absolute left-[var(--gutter)] top-[13%] font-display font-extralight leading-none tracking-[-0.06em] text-titanium-50"
            style={{ fontSize: "clamp(4rem, 15vw, 16rem)" }}
          >
            Ideas
          </p>
          <p
            data-w-into
            aria-hidden
            className="absolute left-[34%] top-[44%] font-serif text-titanium-400"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.8rem)" }}
          >
            into
          </p>
          <p
            data-w-intel
            aria-hidden
            className="absolute bottom-[10%] right-[var(--gutter)] font-display font-extrabold leading-none tracking-[-0.055em] text-titanium-50"
            style={{ fontSize: "clamp(2.6rem, 9vw, 10rem)" }}
          >
            intelligence<span className="text-gold">.</span>
          </p>

          <ol className="absolute bottom-[11%] left-[var(--gutter)] hidden max-w-[19rem] space-y-5 md:block">
            {perspective.map((s) => (
              <li key={s.lead} data-caption>
                <p className="font-serif text-[1.15rem] leading-snug text-titanium-100">
                  {s.lead} {s.rest}
                </p>
                <p className="mt-1 text-[0.72rem] text-titanium-500">{s.ref}</p>
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={() => stage?.scatter()}
            className="absolute left-1/2 top-[50%] h-[36%] w-[26%] -translate-x-1/2 -translate-y-1/2"
            aria-label="Scatter the sculpture and watch it reassemble"
          />
        </div>
      </div>
    </section>
  );
}
