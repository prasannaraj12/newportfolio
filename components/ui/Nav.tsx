"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { nav, resumeUrl } from "@/lib/content";
import { useLenis } from "@/components/providers/SmoothScroll";
import { ArrowUpRight, MapPin } from "lucide-react";

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
  const [scrolled, setScrolled] = useState(false);

  // Once the page moves, the bar gains a quiet paper background and a rule.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      () => {
        // Whichever section holds the middle of the viewport is current —
        // robust to jumps that skip past several sections at once.
        const mid = window.innerHeight * 0.5;
        const hit = els.find((el) => {
          const r = el.getBoundingClientRect();
          return r.top <= mid && r.bottom > mid;
        });
        if (hit) setCurrent(hit.id);
      },
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

  
  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease, delay: 0.05 }}
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,color] duration-500 ${
          onBurgundy ? "text-ivory" : "text-burgundy"
        } ${
          scrolled && !open
            ? onBurgundy
              ? "border-ivory/15 bg-burgundy/95"
              : "border-line bg-ivory/95"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="container-wide flex items-center justify-between gap-6 py-4 lg:py-5">
          <div className="flex items-center gap-5">
            <a href="#top" onClick={go("top")} className="flex items-baseline gap-3">
              <span className="font-serif text-[1.55rem] font-bold leading-none tracking-[-0.03em]">PR.</span>
              <span className={`hidden text-[0.85rem] sm:inline ${onBurgundy ? "text-ivory/70" : "text-titanium-400"}`}>— Portfolio 2026</span>
            </a>
            <span aria-hidden className={`hidden h-7 w-px md:block ${onBurgundy ? "bg-ivory/25" : "bg-line"}`} />
            <span className={`hidden items-center gap-2 text-[0.85rem] md:flex ${onBurgundy ? "text-ivory/80" : "text-espresso/80"}`}>
              <MapPin aria-hidden className="size-4 stroke-[1.5]" />
              Bengaluru, India
            </span>
          </div>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-8 text-[0.9rem] font-medium xl:gap-10">
              {nav.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    onClick={go(n.id)}
                    aria-current={current === n.id ? "location" : undefined}
                    className={`group relative py-2 transition-colors duration-300 ${
                      current === n.id ? (onBurgundy ? "text-ivory" : "text-burgundy") : onBurgundy ? "text-ivory/75 hover:text-ivory" : "text-espresso/85 hover:text-burgundy"
                    }`}
                  >
                    {n.label}
                    {/* hover rule draws from the left */}
                    <span aria-hidden className="absolute -bottom-1 left-0 right-0 h-[2px] origin-left scale-x-0 bg-current opacity-40 transition-transform duration-500 ease-[var(--ease-cinematic)] group-hover:scale-x-100" />
                    {current === n.id && (
                      <motion.span layoutId="nav-mark" className="absolute -bottom-1 left-0 right-0 h-[2px] bg-current" transition={{ duration: 0.5, ease }} />
                    )}
                  </a>
                </li>
              ))}
              <li className="ml-2">
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex h-11 items-center gap-2 rounded-md px-6 font-semibold shadow-[0_10px_20px_-14px_rgba(77,16,37,0.8)] transition-[background-color,translate] duration-300 hover:-translate-y-0.5 ${
                    onBurgundy ? "bg-ivory text-burgundy" : "bg-burgundy text-ivory hover:bg-[#4d1025]"
                  }`}
                >
                  Résumé <ArrowUpRight aria-hidden className="size-4" />
                </a>
              </li>
            </ul>
          </nav>

          <button type="button" className="text-[0.9rem] font-medium lg:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </motion.header>

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
