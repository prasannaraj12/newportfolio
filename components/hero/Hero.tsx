"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { hero, portraits, profile, resumeUrl } from "@/lib/content";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { useStage } from "@/components/stage/SculptureStage";

/**
 * Editorial cover. Left: identity, introduction and a layered headline.
 * Right: the studio photograph on three depth planes (rose ground, photo,
 * gold hairline frame) that move at different rates; scrolling locks the
 * frame onto the photograph, and the whole object tilts toward the pointer.
 * The Intelligence Prism sits in the gutter between headline and photograph.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const stage = useStage();
  const [curtain, setCurtain] = useState(true);

  // Pointer parallax — each plane moves at its own depth.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const groundX = useTransform(sx, (v) => v * -16);
  const groundY = useTransform(sy, (v) => v * -12);
  const photoX = useTransform(sx, (v) => v * -5);
  const photoY = useTransform(sy, (v) => v * -4);
  const frameX = useTransform(sx, (v) => v * 10);
  const frameY = useTransform(sy, (v) => v * 8);
  const typeX = useTransform(sx, (v) => v * 6);
  // the whole photographic object tilts a few degrees toward the pointer
  const tiltX = useTransform(sy, (v) => v * -4);
  const tiltY = useTransform(sx, (v) => v * 5);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const driver = stage?.driver;

      if (reduced) {
        setCurtain(false);
        if (driver) gsap.set(driver, { intro: 1 });
      } else {
        const tl = gsap.timeline();
        tl.from("[data-card-line]", { yPercent: 110, duration: 0.9, ease: "expo.out" }, 0.1)
          .to("[data-curtain]", { clipPath: "inset(0% 0% 100% 0%)", duration: 1.1, ease: "expo.inOut" }, 0.9)
          .add(() => setCurtain(false))
          // photograph: ground slides in, photo is uncovered, frame draws on
          .from("[data-ground]", { xPercent: -14, opacity: 0, duration: 1.4, ease: "expo.out" }, 1.15)
          .fromTo("[data-photo]", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut" }, 1.25)
          .from("[data-photo-img]", { scale: 1.08, duration: 2, ease: "expo.out" }, 1.25)
          .from("[data-frame]", { opacity: 0, scale: 1.06, duration: 1.4, ease: "expo.out" }, 1.75)
          .from("[data-mark]", { opacity: 0, duration: 0.6, stagger: 0.05 }, 2.1)
          // typography: the serif rises, the rule draws, the sans slides under it
          .from("[data-lead]", { yPercent: 105, duration: 1, ease: "expo.out" }, 1.35)
          .from("[data-ideas]", { yPercent: 100, duration: 1.4, ease: "expo.out" }, 1.45)
          .from("[data-rule]", { scaleX: 0, transformOrigin: "left", duration: 0.9, ease: "expo.inOut" }, 1.85)
          .from("[data-into]", { opacity: 0, x: -10, duration: 0.7 }, 2.05)
          .from("[data-intel]", { yPercent: 100, duration: 1.3, ease: "expo.out" }, 1.95)
          .from("[data-fade]", { y: 14, opacity: 0, duration: 0.9, stagger: 0.06, ease: "power3.out" }, 2.1)
          // the signature is written left to right
          .fromTo("[data-sign]", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "power2.inOut" }, 2.6);
        if (driver) tl.to(driver, { intro: 1, duration: 2.6, ease: "power3.out" }, 1.6);
      }

      // Scroll: the gold frame locks onto the photograph; sculpture travels on.
      const st = { trigger: section.current, start: "top top", end: "bottom top", scrub: true };
      gsap.fromTo("[data-frame-lock]", { xPercent: 5, yPercent: -4 }, { xPercent: 0, yPercent: 0, ease: "none", scrollTrigger: st });
      gsap.fromTo("[data-ground-lock]", { xPercent: -9, yPercent: 7 }, { xPercent: -15, yPercent: 11, ease: "none", scrollTrigger: st });
      gsap.to("[data-copy]", { yPercent: -10, opacity: 0.2, ease: "none", scrollTrigger: { ...st, end: "75% top" } });
      if (driver) {
        ScrollTrigger.create({ ...st, onUpdate: (self) => gsap.set(driver, { travel: self.progress }) });
      }
    },
    { scope: section },
  );

  return (
    <section ref={section} id="top" aria-label="Introduction" className="theme-ivory relative overflow-hidden lg:h-[100svh] lg:min-h-[760px]">
      {curtain && (
        <div data-curtain className="fixed inset-0 z-[70] flex items-center justify-center bg-burgundy text-ivory" style={{ clipPath: "inset(0% 0% 0% 0%)" }}>
          <p className="overflow-hidden text-center font-editorial text-[clamp(1.8rem,4.4vw,3.4rem)] leading-none">
            <span data-card-line className="block">Prasanna Raj R.</span>
          </p>
        </div>
      )}

      <div className="container-noir relative grid min-h-[100svh] gap-x-8 pb-10 pt-24 lg:h-full lg:min-h-0 lg:grid-cols-12 lg:pt-28">
        {/* ───── Left column ───── */}
        <div data-copy className="relative z-10 flex flex-col lg:col-span-7">
          <div data-fade className="flex items-center gap-3 whitespace-nowrap text-[0.62rem] font-medium uppercase tracking-[0.14em] text-titanium-400 sm:gap-4 sm:text-[0.7rem] sm:tracking-[0.22em]">
            <span>Portfolio · 2026</span>
            <span className="h-px w-6 bg-line sm:w-10" />
            <span>{profile.location.split(",")[0]}, India</span>
          </div>

          <div data-fade className="mt-9">
            <p className="font-display text-[1.5rem] font-bold leading-none tracking-[-0.02em] text-burgundy">{profile.name}.</p>
            <p className="mt-2 text-[0.95rem] font-medium text-espresso">{hero.role}.</p>
          </div>

          <div className="mt-8 max-w-[29rem]">
            <p data-fade className="text-[1.02rem] font-semibold leading-snug text-espresso">{hero.tagline}</p>
            <p data-fade className="mt-3 font-serif text-[1.22rem] leading-[1.4] text-titanium-300">
              {hero.intro}
            </p>
          </div>

          <div data-fade className="mt-8 flex flex-wrap items-center gap-3">
            <MagneticLink href="#laboratory" variant="primary" className="rounded-none px-6">
              Selected work <ArrowDownRight className="size-4" />
            </MagneticLink>
            <MagneticLink href={resumeUrl} external className="rounded-none px-6">
              Résumé <ArrowUpRight className="size-4" />
            </MagneticLink>
          </div>

          {/* Layered headline */}
          <motion.h1 style={{ x: typeX }} className="relative mt-14 text-burgundy lg:mt-auto">
            <span className="sr-only">
              {profile.name}, {hero.role}. {hero.headline}
            </span>
            <span aria-hidden className="block overflow-hidden">
              <span data-lead className="block font-display text-[clamp(1.25rem,2vw,1.9rem)] font-medium leading-none tracking-[-0.02em] text-espresso">
                I turn ambitious
              </span>
            </span>
            <span aria-hidden className="mt-1 flex items-end gap-5">
              <span className="block overflow-hidden pb-[0.06em]">
                <span data-ideas className="block font-editorial leading-[0.82] tracking-[-0.025em]" style={{ fontSize: "clamp(4.6rem, 11.6vw, 12.8rem)" }}>
                  ideas
                </span>
              </span>
              <span className="mb-[1.6vw] flex items-center gap-3">
                <span data-rule className="block h-px w-[clamp(2.5rem,5vw,5rem)] bg-gold" />
                <span data-into className="text-[clamp(0.75rem,1vw,0.95rem)] font-medium uppercase tracking-[0.42em] text-espresso">into</span>
              </span>
            </span>
            <span aria-hidden className="-mt-[0.28em] block overflow-hidden pb-[0.08em] pl-[0.6em]" style={{ fontSize: "clamp(2.2rem, 4.3vw, 4.9rem)" }}>
              <span data-intel className="block font-display font-extrabold leading-[0.98] tracking-[-0.05em] text-espresso">
                intelligent systems<span className="text-gold">.</span>
              </span>
            </span>
          </motion.h1>
        </div>

        {/* ───── Right column: the photograph on three planes ───── */}
        <div className="relative mt-16 flex items-start justify-end lg:col-span-5 lg:mt-0 lg:items-center">
          <motion.figure style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1100 }} className="relative w-[min(400px,82vw)]">
            {/* plane 1 — dusty-rose ground */}
            <motion.div style={{ x: groundX, y: groundY }} className="absolute inset-0" aria-hidden>
              <div data-ground-lock className="absolute inset-0">
                <div data-ground className="h-full w-full bg-rose-deep/80" />
              </div>
            </motion.div>

            {/* plane 2 — the photograph (native 400 × 451) */}
            <motion.div style={{ x: photoX, y: photoY }} className="relative">
              <div data-photo className="relative aspect-[400/451] w-full overflow-hidden bg-espresso">
                <div data-photo-img className="absolute inset-0">
                  <Image
                    src={portraits.hero.src}
                    alt={`${profile.name}, ${hero.role}`}
                    fill
                    priority
                    sizes="(max-width: 1023px) 82vw, 400px"
                    className="object-cover"
                    style={{ objectPosition: portraits.hero.position }}
                  />
                </div>
              </div>
            </motion.div>

            {/* plane 3 — gold hairline frame; scrolling locks it onto the photo */}
            <motion.div style={{ x: frameX, y: frameY }} className="pointer-events-none absolute inset-0" aria-hidden>
              <div data-frame-lock className="absolute inset-0">
                <div data-frame className="absolute inset-0 border border-gold" />
              </div>
            </motion.div>

            {/* registration marks */}
            {[
              "-left-4 -top-4 border-l border-t",
              "-right-4 -top-4 border-r border-t",
              "-bottom-4 -left-4 border-b border-l",
              "-bottom-4 -right-4 border-b border-r",
            ].map((c) => (
              <span key={c} data-mark aria-hidden className={`absolute size-3 border-espresso/50 ${c}`} />
            ))}

            <figcaption className="mt-6 flex items-end justify-between gap-4 text-[0.75rem] text-espresso">
              <span data-fade>
                Fig. 1 — In the studio, Bengaluru
              </span>
              {/* signature, written on after the intro */}
              <span aria-hidden data-sign className="-mb-2 -rotate-6 font-signature text-[clamp(2.8rem,4.4vw,3.8rem)] leading-none text-burgundy">
                Prasanna
              </span>
            </figcaption>

            <span
              aria-hidden
              data-fade
              className="absolute -right-10 top-0 hidden h-[451px] max-h-full rotate-180 items-center whitespace-nowrap text-[0.65rem] font-medium uppercase tracking-[0.3em] text-titanium-500 [writing-mode:vertical-rl] xl:flex"
            >
              Prasanna Raj R. — Portrait
            </span>
          </motion.figure>
        </div>

        {/* Click target over the sculpture (gutter between headline and photo) */}
        <button
          type="button"
          onClick={() => stage?.scatter()}
          aria-label="Replay the prism: watch the idea refract again"
          className="group absolute bottom-[8%] left-[57%] z-10 hidden h-[26%] w-[8%] items-end justify-center xl:flex"
        >
          <span data-fade className="translate-y-5 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-titanium-500 transition-colors group-hover:text-burgundy">
            Idea → Intelligence
          </span>
        </button>
      </div>
    </section>
  );
}
