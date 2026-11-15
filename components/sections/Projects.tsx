"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { projects } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectCard } from "./ProjectCard";

const HUES = [214, 222, 205, 230];

/**
 * Project universe. Desktop: the section pins and the card track travels
 * horizontally with scroll. Mobile / reduced motion: a vertical stack.
 */
export function Projects() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - window.innerWidth;

        const tween = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pin.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        gsap.to("[data-progress]", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: pin.current,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: true,
          },
        });

        // Cards drift in depth as they cross the viewport.
        gsap.utils.toArray<HTMLElement>("[data-card-wrap]").forEach((card) => {
          gsap.fromTo(
            card,
            { scale: 0.9, opacity: 0.45 },
            {
              scale: 1,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                containerAnimation: tween,
                start: "left 95%",
                end: "left 45%",
                scrub: true,
              },
            },
          );
        });
      });

      mm.add("(max-width: 1023px), (prefers-reduced-motion: reduce)", () => {
        gsap.utils.toArray<HTMLElement>("[data-card-wrap]").forEach((card) => {
          gsap.from(card, {
            y: 60,
            opacity: 0,
            duration: 1.2,
            scrollTrigger: { trigger: card, start: "top 88%", once: true },
          });
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="work" className="relative pt-28 md:pt-40">
      <div className="container-noir">
        <SectionHeading
          index="02"
          kicker="Project universe"
          title={
            <>
              Systems in <span className="font-serif font-normal italic text-volt-gradient">orbit.</span>
            </>
          }
          aside="Agentic pipelines, fine-tuned language models and production platforms — each engineered end-to-end."
        />
      </div>

      <div ref={pin} className="relative lg:flex lg:h-screen lg:flex-col lg:justify-center lg:overflow-hidden">
        <div
          ref={track}
          className="container-noir flex flex-col gap-6 pb-28 lg:w-max lg:max-w-none lg:flex-row lg:gap-8 lg:pb-0 lg:pr-[12vw] will-change-transform"
        >
          {projects.map((p, i) => (
            <div
              key={p.id}
              data-card-wrap
              className="lg:h-[min(78vh,720px)] lg:w-[min(62vw,860px)] lg:shrink-0"
            >
              <ProjectCard project={p} hue={HUES[i % HUES.length]} />
            </div>
          ))}
        </div>

        <div className="container-noir mt-10 hidden items-center gap-4 lg:flex">
          <span className="label">Traverse</span>
          <div className="h-px flex-1 bg-hairline">
            <div data-progress className="h-full origin-left scale-x-0 bg-volt-bright" />
          </div>
          <span className="label">{String(projects.length).padStart(2, "0")} systems</span>
        </div>
      </div>
    </section>
  );
}
