"use client";

import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useState } from "react";

/** A quiet editorial gauge: hairline + page percentage, bottom-right. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const [pct, setPct] = useState(0);
  const [onBurgundy, setOnBurgundy] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setPct(Math.round(v * 100));
    // Read the room under the gauge so it stays legible on the burgundy section.
    const el = document.elementFromPoint(window.innerWidth - 40, window.innerHeight - 24);
    setOnBurgundy(!!el?.closest(".theme-burgundy"));
  });

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed bottom-5 right-[var(--gutter)] z-40 hidden items-center gap-3 transition-colors duration-500 md:flex ${
        onBurgundy ? "text-ivory" : "text-burgundy"
      }`}
    >
      <span className="w-8 text-right text-[0.68rem] font-medium tabular-nums tracking-[0.12em]">{String(pct).padStart(3, "0")}</span>
      <span className="relative block h-px w-24 bg-current/25">
        <motion.span style={{ scaleX }} className="absolute inset-0 origin-left bg-current" />
      </span>
    </div>
  );
}
