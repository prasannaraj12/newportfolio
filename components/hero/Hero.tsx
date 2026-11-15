"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { profile } from "@/lib/content";
import { SplitChars } from "@/components/ui/SplitChars";
import { MagneticLink } from "@/components/ui/MagneticLink";
import type { SceneDriver } from "./NeuralCore";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const [driver] = useState<SceneDriver>(() => ({ intro: 0, scroll: 0 }));
  const [active, setActive] = useState(true);
  const intro = useRef<gsap.core.Tween | null>(null);
  const canvasWrap = useRef<HTMLDivElement>(null);

  const onSceneReady = () => {
    gsap.to(canvasWrap.current, { opacity: 1, duration: 1.4, ease: "power2.out" });
    intro.current?.play();
  };

  // Pause the WebGL loop entirely when the hero is off-screen.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // 3D camera intro waits for the WebGL scene's first frame (see onSceneReady).
      intro.current = gsap.to(driver, {
        intro: 1,
        duration: reduced ? 0.6 : 3.2,
        ease: "power3.inOut",
        paused: true,
      });

      const tl = gsap.timeline({ delay: 0.2 });
      tl.from("[data-hero-veil]", { opacity: 1, duration: 1.6, ease: "power2.out" }, 0)
        .from("[data-hero-label]", { y: 14, opacity: 0, stagger: 0.08, duration: 1 }, 0.6)
        .from(
          "[data-hero-name] [data-char]",
          { yPercent: 115, rotate: 6, duration: 1.5, stagger: 0.035, ease: "expo.out" },
          0.9,
        )
        .from("[data-hero-rule]", { scaleX: 0, transformOrigin: "left", duration: 1.4, ease: "expo.inOut" }, 1.2)
        .from("[data-hero-fade]", { y: 22, opacity: 0, stagger: 0.1, duration: 1.2 }, 1.5);

      // Scroll: feed progress into the 3D camera and drift the typography away.
      ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          driver.scroll = self.progress;
        },
      });

      gsap.to("[data-hero-copy]", {
        yPercent: -18,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: section.current, start: "top top", end: "80% top", scrub: true },
      });
    },
    { scope: section },
  );

  return (
    <section
      ref={section}
      id="top"
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-void"
      aria-label="Introduction"
    >
      {/* Light falloff behind the object */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 42%, rgb(47 123 255 / 0.10), transparent 70%), radial-gradient(90% 70% at 50% 120%, rgb(198 205 216 / 0.05), transparent 60%)",
        }}
      />

      <div ref={canvasWrap} className="absolute inset-0 opacity-0">
        <HeroCanvas driver={driver} active={active} onReady={onSceneReady} />
      </div>

      {/* Edge vignette for cinematic framing */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgb(3 4 5 / 0.85) 100%), linear-gradient(to bottom, transparent 70%, var(--color-void))",
        }}
      />
      <div data-hero-veil aria-hidden className="pointer-events-none absolute inset-0 bg-void opacity-0" />

      <div data-hero-copy className="container-noir relative z-10 flex h-full flex-col justify-between pb-8 pt-28 md:pb-10">
        <div className="flex items-start justify-between gap-6">
          <p data-hero-label className="label max-w-[14rem]">
            Neuralverse <span className="text-volt-bright">/</span> 00
            <br />
            {profile.role}
          </p>
          <p data-hero-label className="label hidden text-right sm:block">
            {profile.location}
          </p>
        </div>

        <div>
          <h1
            data-hero-name
            className="font-display font-semibold uppercase leading-[0.86] tracking-[-0.045em] text-titanium-50"
            style={{ fontSize: "clamp(3.2rem, 12.5vw, 12.5rem)" }}
          >
            <SplitChars text={profile.firstName} charClass="text-titanium" />
            <span className="flex items-end gap-[0.18em]">
              <SplitChars text={profile.lastName} charClass="text-titanium" />
              <span className="mb-[0.18em] hidden font-serif text-[0.16em] normal-case italic leading-tight tracking-normal text-titanium-300 lg:block">
                <span data-hero-fade className="block">
                  {profile.focus.join(" · ")}
                </span>
              </span>
            </span>
          </h1>

          <div data-hero-rule className="mt-6 h-px w-full bg-gradient-to-r from-titanium-300/40 via-volt/50 to-transparent md:mt-8" />

          <div className="mt-5 grid gap-6 md:mt-7 md:grid-cols-12 md:items-end">
            <p data-hero-fade className="max-w-xl text-[0.95rem] leading-relaxed text-titanium-300 md:col-span-6">
              {profile.summary}
            </p>
            <div data-hero-fade className="flex flex-wrap items-center gap-3 md:col-span-6 md:justify-end">
              <MagneticLink href="#work" variant="primary">
                Enter the project universe <ArrowDownRight className="size-4" />
              </MagneticLink>
              <MagneticLink href="#contact" variant="ghost">
                Contact <ArrowUpRight className="size-4" />
              </MagneticLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
