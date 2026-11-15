"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { nav } from "@/lib/content";
import { useLenis } from "@/components/providers/SmoothScroll";

export function Nav() {
  const lenis = useLenis();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string>("");

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    setHidden(y > prev && y > 400 && !open);
  });

  // Active-section tracking.
  useEffect(() => {
    const els = nav.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setCurrent(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
  }, [open, lenis]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    if (lenis) lenis.scrollTo(`#${id}`, { duration: 1.6 });
    else document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden ? -90 : 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: hidden ? 0 : 0.4 }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div className="container-noir pt-4">
          <nav
            className={`flex items-center justify-between rounded-full border px-4 py-2.5 transition-[background,border-color,backdrop-filter] duration-500 md:px-5 ${
              scrolled
                ? "border-hairline bg-obsidian/70 backdrop-blur-xl"
                : "border-transparent bg-transparent"
            }`}
            aria-label="Primary"
          >
            <a href="#top" onClick={go("top")} className="group flex items-center gap-2.5">
              <span className="relative grid size-7 place-items-center rounded-full border border-hairline-strong">
                <span className="size-2 rounded-full bg-volt shadow-[0_0_12px_2px_rgb(47_123_255/0.8)]" />
              </span>
              <span className="font-mono text-[0.72rem] tracking-[0.3em] text-titanium-100">NEURALVERSE</span>
            </a>

            <ul className="hidden items-center gap-1 md:flex">
              {nav.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    onClick={go(n.id)}
                    className={`relative rounded-full px-3.5 py-1.5 text-[0.82rem] transition-colors ${
                      current === n.id ? "text-white" : "text-titanium-400 hover:text-titanium-100"
                    }`}
                  >
                    {current === n.id && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-white/[0.06] ring-1 ring-hairline-strong"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="grid size-9 place-items-center rounded-full border border-hairline-strong text-titanium-100 md:hidden"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 bg-void/95 backdrop-blur-xl md:hidden"
          >
            <ul className="container-noir flex h-full flex-col justify-center gap-2">
              {nav.map((n, i) => (
                <motion.li
                  key={n.id}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.05 * i + 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <a
                    href={`#${n.id}`}
                    onClick={go(n.id)}
                    className="flex items-baseline gap-4 py-2 font-display text-5xl font-semibold tracking-tight text-titanium-100"
                  >
                    <span className="font-mono text-xs text-volt-bright">0{i + 1}</span>
                    {n.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
