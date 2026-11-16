"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { work } from "@/lib/work";
import { useLenis } from "@/components/providers/SmoothScroll";

/** SELECTED WORK. — the exhibition's title wall and room index. */
export function Opening() {
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=110%", pin: true, scrub: 0.6, anticipatePin: 1 },
        });
        tl.from("[data-o-word='1']", { yPercent: 105, duration: 0.5 }, 0)
          .from("[data-o-word='2']", { yPercent: 105, duration: 0.5 }, 0.12)
          .from("[data-o-sub]", { opacity: 0, y: 16, duration: 0.35 }, 0.3)
          .fromTo("[data-o-line]", { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power2.inOut" }, 0.35)
          .from("[data-o-item]", { opacity: 0, y: 20, duration: 0.3, stagger: 0.1 }, 0.6)
          .from("[data-o-depth]", { xPercent: 12, opacity: 0, duration: 0.9 }, 0.2)
          // hand over to the first room: the title wall steps back
          .to("[data-o-title]", { yPercent: -18, opacity: 0.15, duration: 0.6, ease: "power1.in" }, 1.55)
          .to("[data-o-index]", { opacity: 0.2, duration: 0.5 }, 1.6)
          .to("[data-o-line]", { scaleY: 6, duration: 0.5 }, 1.65)
          .set({}, {}, 2.2);
      });
      mm.add("(max-width: 1023px), (prefers-reduced-motion: reduce)", () => {
        gsap.from("[data-o-item]", {
          opacity: 0,
          y: 16,
          stagger: 0.08,
          duration: 0.6,
          scrollTrigger: { trigger: "[data-o-index]", start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (lenis) lenis.scrollTo(`#work-${id}`, { duration: 1.8 });
    else document.getElementById(`work-${id}`)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div ref={root} className="relative overflow-hidden bg-[#f7f1e9] lg:h-[100svh]">
      {/* Background depth: an outlined numeral range */}
      <span
        aria-hidden
        data-o-depth
        className="pointer-events-none absolute -right-[2vw] top-[8%] select-none font-editorial leading-none text-transparent"
        style={{ fontSize: "clamp(9rem, 30vw, 30rem)", WebkitTextStroke: "1px rgba(116,31,56,0.14)" }}
      >
        01–05
      </span>

      <div className="container-noir relative flex h-full flex-col justify-center gap-12 py-24 lg:py-0">
        <div data-o-title>
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-[#8a7f78]">Exhibition · Work</p>
          <h2 className="mt-5 text-[#741f38]" aria-label="Selected work">
            <span className="block overflow-hidden pb-[0.04em]">
              <span data-o-word="1" className="block font-editorial leading-[0.86] tracking-[-0.02em]" style={{ fontSize: "clamp(4rem, 11vw, 12rem)" }}>
                Selected
              </span>
            </span>
            <span className="block overflow-hidden pl-[0.6em]">
              <span data-o-word="2" className="block font-display font-extrabold leading-[0.9] tracking-[-0.05em] text-[#4d1025]" style={{ fontSize: "clamp(3.4rem, 8.6vw, 9.4rem)" }}>
                Work<span className="text-gold">.</span>
              </span>
            </span>
          </h2>
          <p data-o-sub className="mt-6 max-w-md font-serif text-[1.2rem] leading-snug text-[#625A56]">
            A collection of intelligent systems, experiments and engineering ideas built to solve real-world problems.
          </p>
        </div>

        {/* The line */}
        <span aria-hidden data-o-line className="block h-px w-full origin-left bg-[#741f38]" />

        {/* Room index */}
        <ol data-o-index className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-5">
          {work.map((p) => (
            <li key={p.id} data-o-item>
              <a href={`#work-${p.id}`} onClick={go(p.id)} className="group block">
                <span className="block font-editorial text-3xl leading-none text-[#741f38]">{p.number}</span>
                <span className="mt-2 block text-[0.95rem] font-semibold text-[#292322] transition-colors group-hover:text-[#741f38]">{p.name}</span>
                <span className="block text-[0.8rem] text-[#8a7f78]">{p.tagline}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
