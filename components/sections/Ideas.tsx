"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useLenis } from "@/components/providers/SmoothScroll";

const ease = [0.16, 1, 0.3, 1] as const;

const HEADLINES = [
  { lead: "Agents", rest: "That Reason.", indent: "lg:pl-0" },
  { lead: "Models", rest: "That Adapt.", indent: "lg:pl-[16%]" },
  { lead: "Pipelines", rest: "That Keep Watch.", indent: "lg:pl-[6%]" },
];

/**
 * 01 — Ideas. Only type: a masthead, the heading, one line, three
 * standalone headlines and a closing statement.
 */
export function Ideas() {
  const lenis = useLenis();
  const reduced = useReducedMotion();

  const toWork = (e: React.MouseEvent) => {
    e.preventDefault();
    if (lenis) lenis.scrollTo("#laboratory", { duration: 1.8 });
    else document.getElementById("laboratory")?.scrollIntoView({ behavior: "smooth" });
  };

  // Lines are masked; the block (not the hidden line) watches the viewport.
  const watch = reduced ? {} : { initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.5 } };
  const line = (i: number) =>
    reduced ? {} : { variants: { hidden: { y: "105%" }, show: { y: "0%", transition: { duration: 1.3, ease, delay: i * 0.12 } } } };
  const fade = (delay: number) =>
    reduced ? {} : { variants: { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 1, ease, delay } } } };
  const rule = reduced ? {} : { variants: { hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.4, ease } } } };

  return (
    <section id="ideas" aria-label="Ideas" className="theme-ivory relative overflow-hidden">
      <div className="container-wide">
        {/* Masthead */}
        <motion.div {...watch} className="pt-28 md:pt-36">
          <div className="flex items-baseline justify-between text-[0.72rem] uppercase tracking-[0.24em] text-titanium-400">
            <span className="font-serif text-[1.2rem] font-bold normal-case tracking-[-0.02em] text-burgundy">PR.</span>
            <span>Ideas — 2026</span>
          </div>
          <motion.span aria-hidden {...rule} className="mt-4 block h-px origin-left bg-line" />
        </motion.div>

        {/* Introduction */}
        <motion.div {...watch} className="pb-32 pt-20 md:pb-48 md:pt-28">
          <motion.p {...fade(0)} className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-burgundy">
            Research · Experiments · Innovation
          </motion.p>
          <h2 className="mt-8 font-journal font-medium leading-[0.92] tracking-[-0.02em] text-espresso" style={{ fontSize: "clamp(3.4rem, 8.6vw, 9.8rem)" }}>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span className="block" {...line(0)}>
                Where Ideas
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em] lg:pl-[1.1em]">
              <motion.span className="block" {...line(1)}>
                Become <span className="text-burgundy">Intelligence.</span>
              </motion.span>
            </span>
          </h2>
          <motion.p {...fade(0.4)} className="mt-10 max-w-xl text-[1.1rem] leading-relaxed text-titanium-400">
            Exploring intelligent systems, adaptive models and autonomous AI.
          </motion.p>
        </motion.div>

        {/* The three headlines — the centrepiece */}
        <ul className="border-t border-line">
          {HEADLINES.map((h) => (
            <motion.li key={h.lead} {...watch} className="group border-b border-line">
              <p
                className={`overflow-hidden py-10 font-journal font-medium leading-[1.02] tracking-[-0.02em] text-espresso md:py-14 ${h.indent}`}
                style={{ fontSize: "clamp(2.9rem, 7.4vw, 8.4rem)" }}
              >
                <motion.span className="block" {...line(0)}>
                  <span className="inline-block transition-transform duration-700 ease-[var(--ease-cinematic)] group-hover:translate-x-3">
                    <span className="text-burgundy">{h.lead}</span> {h.rest}
                  </span>
                </motion.span>
              </p>
            </motion.li>
          ))}
        </ul>

        {/* Closing */}
        <motion.div {...watch} className="grid gap-12 py-32 md:py-48 lg:grid-cols-12 lg:items-end">
          <h2 className="font-journal font-medium leading-[1] tracking-[-0.015em] text-espresso lg:col-span-8" style={{ fontSize: "clamp(2.6rem, 5.6vw, 6rem)" }}>
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span className="block" {...line(0)}>
                Curiosity builds.
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span className="block text-burgundy" {...line(1)}>
                Intelligence follows.
              </motion.span>
            </span>
          </h2>
          <motion.div {...fade(0.4)} className="lg:col-span-4 lg:pb-3 lg:text-right">
            <a
              href="#laboratory"
              onClick={toWork}
              className="group inline-flex items-center gap-3 border-b border-burgundy/40 pb-2 font-journal text-[1.7rem] font-medium text-burgundy transition-colors hover:border-burgundy"
            >
              Explore My Work
              <ArrowUpRight aria-hidden className="size-5 transition-transform duration-500 ease-[var(--ease-cinematic)] group-hover:-translate-y-1 group-hover:translate-x-1" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
