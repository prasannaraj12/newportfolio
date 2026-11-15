"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Refined desktop cursor: a burgundy point and a trailing ring that swells
 * over interactive elements. Only on fine pointers without reduced motion;
 * text fields keep the native caret.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<"idle" | "link" | "text" | "hidden">("idle");
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 380, damping: 32, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- enable only after the client capability check
    setEnabled(true);
    document.documentElement.classList.add("has-cursor");

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as Element | null;
      if (!t) return;
      if (t.closest("input, textarea, select, [contenteditable='true']")) setState("text");
      else if (t.closest("a, button, [role='button'], [role='tab'], label")) setState("link");
      else setState("idle");
    };
    const onLeave = () => setState("hidden");
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;
  const hidden = state === "hidden" || state === "text";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[80]">
      <motion.div
        style={{ x: rx, y: ry }}
        animate={{ scale: state === "link" ? 1.9 : 1, opacity: hidden ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="absolute -left-4 -top-4 size-8 rounded-full border border-burgundy/70 shadow-[0_0_0_1px_rgb(245_240_232/0.55)]"
      >
        <motion.span
          animate={{ opacity: state === "link" ? 1 : 0 }}
          className="absolute inset-0 rounded-full bg-rose-deep/20"
        />
      </motion.div>
      <motion.div
        style={{ x, y }}
        animate={{ opacity: hidden ? 0 : 1, scale: state === "link" ? 0 : 1 }}
        className="absolute -left-[3px] -top-[3px] size-1.5 rounded-full bg-burgundy shadow-[0_0_0_1.5px_rgb(245_240_232/0.8)]"
      />
    </div>
  );
}
