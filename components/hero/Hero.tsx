"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { hero, portraits, profile, resumeUrl } from "@/lib/content";
import { SplitChars } from "@/components/ui/SplitChars";
import { useLenis } from "@/components/providers/SmoothScroll";
import type { PortraitDriver } from "./PortraitStage";

const PortraitStage = dynamic(() => import("./PortraitStage"), { ssr: false });

// Stable shader parameters (module scope so the material is built once).
const FOCUS: [number, number] = [0.45, 0.62];
const FACE: [number, number, number] = [0.447, 0.66, 0.2];
const MASK_DESKTOP: [number, number, number, number] = [0.3, 0.12, 0.3, 0.1];
const MASK_MOBILE: [number, number, number, number] = [0.08, 0.08, 0.4, 0.1];

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const fallback = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const [driver] = useState<PortraitDriver>(() => ({ reveal: 0, exit: 0 }));
  const [active, setActive] = useState(true);
  const [mobile, setMobile] = useState(false);
  const reveal = useRef<gsap.core.Tween | null>(null);
  const ready = useRef(false);

  // Pointer parallax for the typographic layers (opposes the portrait).
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const typeX = useTransform(sx, (v) => v * -14);
  const typeY = useTransform(sy, (v) => v * -8);
  const metaX = useTransform(sx, (v) => v * 6);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "60px" });
    if (section.current) io.observe(section.current);

    // If WebGL is unavailable or slow, fall back to the graded still.
    const t = window.setTimeout(() => {
      if (!ready.current) gsap.to(fallback.current, { opacity: 1, duration: 1.2 });
    }, 4000);

    return () => {
      mq.removeEventListener("change", apply);
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
      window.clearTimeout(t);
    };
  }, [mx, my]);

  const onStageReady = () => {
    ready.current = true;
    reveal.current?.play();
  };

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      reveal.current = gsap.to(driver, {
        reveal: 1,
        duration: reduced ? 0.01 : 2.4,
        ease: "power2.out",
        paused: true,
      });

      const tl = gsap.timeline({ delay: 0.25 });
      tl.from("[data-meta]", { y: 10, opacity: 0, stagger: 0.07, duration: 0.9, ease: "power3.out" }, 0)
        .from("[data-line-one] [data-char]", { yPercent: 110, duration: 1.4, stagger: 0.028, ease: "expo.out" }, 0.9)
        .from(
          "[data-line-two]",
          { clipPath: "inset(0 100% 0 0)", x: -30, duration: 1.6, ease: "expo.inOut" },
          1.25,
        )
        .from("[data-signature-path]", { strokeDashoffset: 1, duration: 1.6, ease: "power2.inOut" }, 1.9)
        .from("[data-hero-fade]", { y: 18, opacity: 0, stagger: 0.08, duration: 1 }, 2.0);

      // Exit: portrait disperses into streaks; the two lines part horizontally.
      ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          driver.exit = self.progress;
        },
      });
      const exit = { trigger: section.current, start: "top top", end: "90% top", scrub: true };
      gsap.to("[data-line-one]", { xPercent: -14, opacity: 0.1, ease: "none", scrollTrigger: exit });
      gsap.to("[data-line-two]", { xPercent: 10, opacity: 0.1, ease: "none", scrollTrigger: exit });
      gsap.to("[data-hero-meta-row]", { opacity: 0, ease: "none", scrollTrigger: exit });
    },
    { scope: section },
  );

  const explore = (e: React.MouseEvent) => {
    e.preventDefault();
    if (lenis) lenis.scrollTo("#perspective", { duration: 2 });
    else document.getElementById("perspective")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={section}
      id="top"
      aria-label="Identity"
      className="relative h-[100svh] min-h-[680px] w-full overflow-hidden bg-void"
    >
      {/* Portrait stage */}
      <div className="absolute right-0 top-[7svh] h-[58svh] w-full lg:top-[9%] lg:h-[80%] lg:w-[52%] xl:right-[2%]">
        <div
          ref={fallback}
          className="absolute inset-0 opacity-0"
          style={{
            maskImage: mobile
              ? "linear-gradient(to bottom, black 55%, transparent)"
              : "linear-gradient(to right, transparent, black 38%), linear-gradient(to bottom, black 78%, transparent)",
            maskComposite: "intersect",
          }}
        >
          <Image
            src={portraits.hero.src}
            alt={`Portrait of ${profile.name}`}
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 60vw"
            className="object-cover grayscale-[0.86] contrast-[1.08]"
            style={{ objectPosition: "45% 30%" }}
          />
        </div>
        <PortraitStage
          src={portraits.hero.src}
          size={portraits.hero}
          focus={FOCUS}
          face={FACE}
          mask={mobile ? MASK_MOBILE : MASK_DESKTOP}
          driver={driver}
          active={active}
          onReady={onStageReady}
        />
      </div>

      {/* Low key light from the left, so type sits in shadow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 0% 100%, rgb(3 4 5 / 0.9), transparent 70%), linear-gradient(to top, var(--color-void), transparent 30%)",
        }}
      />

      <div className="container-noir relative z-10 flex h-full flex-col pb-7 pt-[5.5rem] lg:pb-10 lg:pt-24">
        {/* Meta row */}
        <motion.div data-hero-meta-row style={{ x: metaX }} className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <p data-meta className="label">
            Edition <span className="text-titanium-100">01</span> <span className="text-volt-bright">/</span> 06 chapters
          </p>
          <p data-meta className="label text-right lg:text-center">Portfolio — 2026</p>
          <p data-meta className="label hidden text-right lg:block">
            {hero.role} · Bengaluru
          </p>
        </motion.div>

        <motion.div style={{ x: typeX, y: typeY }} className="mt-auto">
          <p data-meta className="label mb-4 flex items-center gap-3 lg:mb-6">
            <span className="text-volt-bright">00</span>
            <span className="h-px w-8 bg-titanium-500" />
            Identity
          </p>

          <h1 className="leading-[0.84] text-titanium-50">
            <span
              data-line-one
              className="block font-display font-extrabold uppercase tracking-[-0.055em]"
              style={{ fontSize: "clamp(2.55rem, 8.6vw, 9.6rem)" }}
            >
              <SplitChars text={hero.lineOne} charClass="text-titanium" />
            </span>
            <span
              data-line-two
              className="block pl-[0.9em] font-serif italic tracking-[-0.035em] text-titanium-100 lg:pl-[1.6em]"
              style={{ fontSize: "clamp(3.1rem, 10.4vw, 11.6rem)" }}
            >
              {hero.lineTwo.replace(/\.$/, "")}
              <span className="text-volt-bright">.</span>
            </span>
          </h1>

          <div className="mt-7 grid gap-6 border-t border-hairline pt-6 lg:mt-10 lg:grid-cols-12 lg:items-end">
            {/* Name as signature */}
            <div className="lg:col-span-4">
              <p className="relative inline-block font-serif text-[1.7rem] italic leading-none text-titanium-50 lg:text-[2rem]">
                {profile.name}
                <svg
                  aria-hidden
                  viewBox="0 0 300 18"
                  preserveAspectRatio="none"
                  className="absolute -bottom-3 left-0 h-3 w-full overflow-visible"
                >
                  <path
                    data-signature-path
                    d="M2 12 C 60 2, 120 16, 180 8 S 270 4, 298 10"
                    fill="none"
                    stroke="var(--color-volt-bright)"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray="1"
                    strokeDashoffset="0"
                  />
                </svg>
              </p>
              <p data-hero-fade className="label mt-5">
                {hero.role} — Generative AI · Agentic Systems
              </p>
            </div>

            <p data-hero-fade className="max-w-sm text-[0.95rem] leading-relaxed text-titanium-300 lg:col-span-4">
              {hero.tagline}
            </p>

            <div data-hero-fade className="flex items-center gap-5 lg:col-span-4 lg:justify-end">
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-sm text-titanium-300 transition-colors hover:text-white"
              >
                Résumé
                <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <a href="#perspective" onClick={explore} className="group flex items-center gap-4" aria-label="Explore the experience">
                <span className="text-right leading-tight">
                  <span className="block text-sm text-titanium-50">Explore</span>
                  <span className="label block text-[0.6rem]">the experience</span>
                </span>
                <span className="relative grid size-14 place-items-center overflow-hidden rounded-full border border-hairline-strong transition-colors duration-500 group-hover:border-titanium-50">
                  <span className="absolute inset-0 origin-bottom scale-y-0 rounded-full bg-titanium-50 transition-transform duration-700 ease-[var(--ease-cinematic)] group-hover:scale-y-100" />
                  <ArrowDown className="relative size-4 text-titanium-100 transition-colors duration-500 group-hover:text-void [animation:nv-nudge_2.4s_var(--ease-titanium)_infinite]" />
                </span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
