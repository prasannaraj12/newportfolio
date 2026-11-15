"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { nav, resumeUrl } from "@/lib/content";
import { useLenis } from "@/components/providers/SmoothScroll";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Plain-word navigation. Drawn in ivory with difference blending so it reads
 * as ink on paper sections and as paper on graphite ones — it changes with
 * the page instead of sitting on a bar.
 */
export function Nav() {
  const lenis = useLenis();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const [onBurgundy, setOnBurgundy] = useState(false);

  // Switch to ivory ink while a burgundy room sits under the header.
  useEffect(() => {
    const rooms = Array.from(document.querySelectorAll<HTMLElement>(".theme-burgundy"));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setOnBurgundy(e.isIntersecting)),
      { rootMargin: "0px 0px -94% 0px" },
    );
    rooms.forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const els = nav.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setCurrent(e.target.id);
        }),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    const onTop = () => {
      if (window.scrollY < window.innerHeight * 0.5) setCurrent(null);
    };
    window.addEventListener("scroll", onTop, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onTop);
    };
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

  const currentLabel = nav.find((n) => n.id === current)?.label;

  return (
    <>
      <header className={`pointer-events-none fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${onBurgundy ? "text-ivory" : "text-burgundy"}`}>
        <div className="container-noir flex items-start justify-between gap-6 pt-5">
          <a href="#top" onClick={go("top")} className="pointer-events-auto flex items-baseline gap-3">
            <span className="font-display text-[1.05rem] font-bold tracking-[-0.02em]">PR.</span>
            <span className="relative hidden h-5 min-w-[9rem] overflow-hidden text-[0.85rem] sm:block">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={currentLabel ?? "home"}
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 0.45, ease }}
                  className="absolute left-0 top-0 whitespace-nowrap opacity-70"
                >
                  {currentLabel ? `— ${currentLabel}` : "— Portfolio, 2026"}
                </motion.span>
              </AnimatePresence>
            </span>
          </a>

          <nav aria-label="Primary" className="pointer-events-auto hidden lg:block">
            <ul className="flex items-center gap-7 text-[0.9rem]">
              {nav.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    onClick={go(n.id)}
                    className={`relative transition-opacity duration-300 ${current === n.id ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
                  >
                    {n.label}
                    {current === n.id && (
                      <motion.span layoutId="nav-mark" className="absolute -bottom-1.5 left-0 right-0 h-px bg-current" transition={{ duration: 0.5, ease }} />
                    )}
                  </a>
                </li>
              ))}
              <li>
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="opacity-60 transition-opacity hover:opacity-100">
                  Résumé ↗
                </a>
              </li>
            </ul>
          </nav>

          <button type="button" className="pointer-events-auto text-[0.9rem] lg:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.7, ease }}
            className="fixed inset-0 z-40 bg-rose text-burgundy lg:hidden"
          >
            <ul className="container-noir flex h-full flex-col justify-center gap-1">
              {nav.map((n, i) => (
                <motion.li
                  key={n.id}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + 0.05 * i, duration: 0.6, ease }}
                >
                  <a href={`#${n.id}`} onClick={go(n.id)} className="block py-1.5 font-display text-5xl font-bold tracking-[-0.04em]">
                    {n.label}
                  </a>
                </motion.li>
              ))}
              <li className="mt-6">
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-lg underline decoration-gold underline-offset-4">
                  Résumé ↗
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
