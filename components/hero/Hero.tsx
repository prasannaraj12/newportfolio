"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { hero, portraits, profile, resumeUrl } from "@/lib/content";
import { useLenis } from "@/components/providers/SmoothScroll";
import { useStage } from "@/components/stage/SculptureStage";

const FIGURES = [
  { src: portraits.hero.src, position: portraits.hero.position, caption: "Fig. 1 — In the studio" },
  { src: portraits.monochrome.src, position: "60% 30%", caption: "Fig. 2 — Light study" },
] as const;

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const stage = useStage();
  const [figure, setFigure] = useState(0);
  const [curtain, setCurtain] = useState(true);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const driver = stage?.driver;

      if (reduced) {
        setCurtain(false);
        if (driver) gsap.set(driver, { intro: 1 });
      } else {
        const tl = gsap.timeline();
        // A burgundy title card lifts like a cover page.
        tl.from("[data-card-line]", { yPercent: 110, duration: 1, ease: "expo.out" }, 0.1)
          .to("[data-curtain]", { clipPath: "inset(0% 0% 100% 0%)", duration: 1.15, ease: "expo.inOut" }, 1.05)
          .add(() => setCurtain(false))
          .fromTo(
            "[data-photo]",
            { clipPath: "inset(0% 0% 100% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut" },
            1.3,
          )
          .from("[data-photo-img]", { scale: 1.1, duration: 2, ease: "expo.out" }, 1.3)
          .from("[data-h-word]", { yPercent: 105, duration: 1.4, stagger: 0.1, ease: "expo.out" }, 1.55)
          .from("[data-h-fade]", { y: 14, opacity: 0, duration: 1, stagger: 0.07, ease: "power3.out" }, 1.9);
        if (driver) tl.to(driver, { intro: 1, duration: 2.6, ease: "power3.out" }, 1.5);
      }

      if (driver) {
        ScrollTrigger.create({
          trigger: section.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => gsap.set(driver, { travel: self.progress }),
        });
      }
      gsap.to("[data-h-drift]", {
        yPercent: -18,
        ease: "none",
        scrollTrigger: { trigger: section.current, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope: section },
  );

  const goWork = (e: React.MouseEvent) => {
    e.preventDefault();
    if (lenis) lenis.scrollTo("#laboratory", { duration: 2 });
    else document.getElementById("laboratory")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={section} id="top" aria-label="Introduction" className="theme-ivory relative min-h-[100svh] overflow-hidden lg:h-[100svh] lg:min-h-[740px]">
      {curtain && (
        <div data-curtain className="fixed inset-0 z-[70] flex items-center justify-center bg-burgundy text-ivory" style={{ clipPath: "inset(0% 0% 0% 0%)" }}>
          <p className="overflow-hidden text-center font-display text-[clamp(1.6rem,4vw,3rem)] font-semibold leading-none tracking-[-0.03em]">
            <span data-card-line className="block">Prasanna Raj R.</span>
          </p>
        </div>
      )}

      <div className="container-noir relative flex min-h-[100svh] flex-col pb-8 pt-24 lg:h-full lg:min-h-0 lg:pt-28">
        {/* Left column beside the photograph */}
        <div data-h-drift className="relative z-10 order-1 lg:w-[38%]">
          <div data-h-fade>
            <p className="font-display text-[1.35rem] font-bold leading-none tracking-[-0.02em] text-burgundy">{profile.name}.</p>
            <p className="mt-1.5 text-sm font-medium text-titanium-400">{hero.role}.</p>
          </div>
          <span data-h-fade aria-hidden className="mt-8 block h-px w-14 bg-gold" />
          <p data-h-fade className="mt-8 hidden max-w-[24rem] font-serif text-[1.4rem] leading-[1.35] text-espresso lg:block">
            I build intelligent systems that connect artificial intelligence with real-world problems.
          </p>
          <div data-h-fade className="mt-8 hidden flex-wrap items-center gap-x-7 gap-y-3 text-[0.95rem] font-medium lg:flex">
            <a href="#laboratory" onClick={goWork} className="group inline-flex items-center gap-2 text-burgundy">
              <span className="border-b-2 border-burgundy pb-0.5">Selected work</span>
              <ArrowDownRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </a>
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1.5 text-titanium-400 transition-colors hover:text-burgundy">
              Résumé
              <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        {/* Photograph — natural colour, native resolution, upper right */}
        <figure className="relative order-2 -mr-[var(--gutter)] mt-8 lg:absolute lg:right-0 lg:top-[10%] lg:mr-0 lg:mt-0 lg:w-[min(814px,53vw)]">
          <button
            type="button"
            data-photo
            onClick={() => setFigure((f) => (f + 1) % FIGURES.length)}
            className="relative block aspect-[814/451] w-full cursor-pointer overflow-hidden bg-espresso outline-none focus-visible:ring-2 focus-visible:ring-burgundy"
            aria-label={`Show the other photograph (currently ${FIGURES[figure].caption})`}
          >
            <div data-photo-img className="absolute inset-0">
              {FIGURES.map((f, i) => (
                <motion.div
                  key={f.src}
                  className="absolute inset-0"
                  initial={false}
                  animate={{ clipPath: figure === i ? "inset(0% 0% 0% 0%)" : i === 0 ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)" }}
                  transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
                >
                  <Image
                    src={f.src}
                    alt={`${profile.name} — ${f.caption}`}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 1023px) 100vw, 814px"
                    className="object-cover"
                    style={{ objectPosition: f.position }}
                  />
                </motion.div>
              ))}
            </div>
          </button>
          <figcaption data-h-fade className="mt-3 flex items-baseline justify-between gap-4 pr-[var(--gutter)] text-[0.78rem] text-titanium-400">
            <AnimatePresence mode="wait">
              <motion.span key={figure} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }} className="text-espresso">
                {FIGURES[figure].caption}
              </motion.span>
            </AnimatePresence>
            <span>Click the photograph</span>
          </figcaption>
        </figure>

        {/* Headline — full width beneath the photograph */}
        <h1 className="relative z-10 order-3 mt-10 text-burgundy lg:absolute lg:bottom-[5%] lg:left-[var(--gutter)] lg:right-[var(--gutter)] lg:mt-0">
          <span className="sr-only">{profile.name}, {hero.role}. </span>
          <span className="flex flex-wrap items-baseline gap-x-[0.18em] overflow-hidden" style={{ fontSize: "clamp(3.2rem, 9.4vw, 10.5rem)" }}>
            <span data-h-word className="block font-display font-extralight leading-[0.95] tracking-[-0.055em]">Ideas</span>
            <span data-h-word className="block font-serif text-[0.42em] leading-none text-espresso">into</span>
          </span>
          <span className="block overflow-hidden" style={{ fontSize: "clamp(3.2rem, 9.4vw, 10.5rem)" }}>
            <span data-h-word className="block font-display font-extrabold leading-[0.92] tracking-[-0.05em]">
              Intelligence<span className="text-gold">.</span>
            </span>
          </span>
        </h1>

        {/* Mobile standfirst */}
        <div className="order-4 mt-8 lg:hidden">
          <p className="font-serif text-[1.25rem] leading-[1.35] text-espresso">
            I build intelligent systems that connect artificial intelligence with real-world problems.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 text-[0.95rem] font-medium">
            <a href="#laboratory" onClick={goWork} className="inline-flex items-center gap-2 text-burgundy">
              <span className="border-b-2 border-burgundy pb-0.5">Selected work</span>
              <ArrowDownRight className="size-4" />
            </a>
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-titanium-400">
              Résumé <ArrowUpRight className="size-4" />
            </a>
          </div>
        </div>

        {/* Hotspot over the sculpture */}
        <button
          type="button"
          onClick={() => stage?.scatter()}
          aria-label="Scatter the sculpture"
          className="group absolute left-[38%] top-[34%] z-10 hidden h-[26%] w-[14%] items-end justify-center lg:flex"
        >
          <span data-h-fade className="translate-y-6 text-[0.72rem] text-titanium-400 transition-colors group-hover:text-burgundy">
            Click to rearrange
          </span>
        </button>
      </div>
    </section>
  );
}
