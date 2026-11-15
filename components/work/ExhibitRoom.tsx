"use client";

import { useMotionValue, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { WorkProject } from "@/lib/work";

export type Layout = "visual-right" | "visual-left" | "visual-top";
export type Tone = "ivory" | "cream" | "wine";

type Props = {
  project: WorkProject;
  layout: Layout;
  tone: Tone;
  /** Renders the project's visual; `progress` runs 0 → 1 through the room. */
  visual: (progress: MotionValue<number>, active: boolean) => React.ReactNode;
  /** Optional element shown under the visual (e.g. a reasoning trace). */
  caption?: React.ReactNode;
};

const toneClass: Record<Tone, string> = {
  ivory: "bg-[#f5efe6]",
  cream: "bg-[#EDE3D8]",
  wine: "theme-burgundy bg-[#542031]",
};

/**
 * One exhibition room. On desktop it pins and scrubs a progress value that
 * both the visual and the editorial copy follow; on phones and with reduced
 * motion nothing is pinned and all copy is shown.
 */
export function ExhibitRoom({ project: p, layout, tone, visual, caption }: Props) {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  const [active, setActive] = useState(false);
  const wine = tone === "wine";

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            trigger: pin.current,
            start: "top top",
            end: "+=170%",
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            onUpdate: (self) => progress.set(self.progress),
          },
        });
        // Entrance: title rises, then three editorial stages reveal.
        tl.from("[data-r-title]", { yPercent: 105, duration: 0.5 }, 0)
          .from("[data-r-meta]", { opacity: 0, y: 12, duration: 0.3 }, 0.15)
          .from("[data-stage='1']", { opacity: 0, y: 24, duration: 0.4 }, 0.35)
          .from("[data-stage='2']", { opacity: 0, y: 24, duration: 0.4 }, 1.1)
          .from("[data-stage='3']", { opacity: 0, y: 24, duration: 0.4 }, 1.85)
          // Exit: the visual recedes as the next room approaches.
          .to("[data-r-visual]", { scale: 0.94, opacity: 0.55, duration: 0.5, ease: "power1.in" }, 2.6)
          .to("[data-r-copy]", { opacity: 0.4, duration: 0.4 }, 2.65)
          .set({}, {}, 3.1);
        return () => progress.set(0);
      });

      mm.add("(max-width: 1023px), (prefers-reduced-motion: reduce)", () => {
        // No pin: progress follows natural scroll through the room.
        ScrollTrigger.create({
          trigger: root.current,
          start: "top 80%",
          end: "bottom 45%",
          scrub: true,
          onUpdate: (self) => progress.set(self.progress),
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  const visualBlock = (
    <div data-r-visual className="relative h-full min-h-[340px] w-full">
      {visual(progress, active)}
    </div>
  );

  const ink = wine ? "text-titanium-200" : "text-[#625A56]";

  const header = (
    <>
      <div data-r-meta className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.68rem] font-medium uppercase tracking-[0.22em] ${wine ? "text-titanium-400" : "text-[#8a7f78]"}`}>
        <span className={wine ? "text-gold" : "text-burgundy"}>{p.number}</span>
        <span className="h-px w-8 bg-current opacity-40" />
        <span>{p.context ?? "Independent project"}</span>
      </div>
      <h3 className="mt-4 overflow-hidden">
        <span data-r-title className={`block font-editorial leading-[0.92] tracking-[-0.02em] ${wine ? "text-ivory" : "text-burgundy"}`} style={{ fontSize: "clamp(2.8rem, 5vw, 5.4rem)" }}>
          {p.name}
        </span>
      </h3>
      <p data-r-meta className={`mt-2 text-[0.95rem] font-semibold ${wine ? "text-gold" : "text-[#4c4140]"}`}>{p.tagline}</p>
    </>
  );

  const stage1 = (
    <div data-stage="1" className="grid gap-4 border-t border-current/15 pt-5">
      <Field label="The problem" wine={wine}>
        <p className="font-serif text-[1.04rem] leading-snug">{p.problem}</p>
      </Field>
    </div>
  );

  const stage2 = (
    <div data-stage="2" className="grid gap-4">
      <Field label="What I built" wine={wine}>
        <p className="font-serif text-[1.04rem] leading-snug">{p.built}</p>
      </Field>
      <Field label="Architecture" wine={wine}>
        <p className="text-[0.84rem] leading-relaxed">
          {p.architecture.map((s, i) => (
            <span key={s}>
              {s}
              {i < p.architecture.length - 1 && <span className={`mx-1.5 ${wine ? "text-gold" : "text-burgundy"}`}>→</span>}
            </span>
          ))}
        </p>
      </Field>
    </div>
  );

  const stage3 = (
    <div data-stage="3" className="grid gap-4 sm:grid-cols-2">
      <Field label="Key features" wine={wine}>
        <ul className="space-y-1 text-[0.84rem] leading-snug">
          {p.features.map((f) => (
            <li key={f} className="flex gap-2">
              <span className={`mt-[0.45em] size-1 shrink-0 rotate-45 ${wine ? "bg-gold" : "bg-burgundy"}`} />
              {f}
            </li>
          ))}
        </ul>
      </Field>
      <div className="grid content-start gap-4">
        <Field label="Technologies" wine={wine}>
          <p className="text-[0.82rem] leading-relaxed">{p.tech.join(" · ")}</p>
        </Field>
        {p.contribution && (
          <Field label="My contribution" wine={wine}>
            <p className="text-[0.84rem] leading-snug">{p.contribution}</p>
          </Field>
        )}
        {p.link && (
          <a
            href={p.link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`group inline-flex w-fit items-center gap-2 border-b pb-0.5 text-[0.88rem] font-medium ${
              wine ? "border-gold text-ivory" : "border-burgundy text-burgundy"
            }`}
          >
            {p.link.label}
            <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        )}
      </div>
    </div>
  );

  const copy = (
    <div data-r-copy className={`relative z-10 ${ink}`}>
      {header}
      <div className="mt-6">{stage1}</div>
      <div className="mt-5">{stage2}</div>
      <div className="mt-5">{stage3}</div>
    </div>
  );

  /** Wide layout: visual across the top, copy in three editorial columns. */
  const copyWide = (
    <div data-r-copy className={`relative z-10 grid gap-8 lg:grid-cols-12 lg:gap-10 ${ink}`}>
      <div className="lg:col-span-4">
        {header}
        <div className="mt-5">{stage1}</div>
      </div>
      <div className="lg:col-span-4 lg:pt-2">{stage2}</div>
      <div className="lg:col-span-4 lg:pt-2">{stage3}</div>
    </div>
  );

  return (
    <section ref={root} id={`work-${p.id}`} aria-label={p.name} className={`relative ${toneClass[tone]}`}>
      <div ref={pin} className="relative overflow-hidden lg:h-[100svh]">
        {/* Oversized room number — architectural signage */}
        <span
          aria-hidden
          className={`pointer-events-none absolute -bottom-[0.18em] select-none font-editorial leading-none ${
            layout === "visual-left" ? "left-[var(--gutter)]" : "right-[var(--gutter)]"
          } ${wine ? "text-ivory/[0.05]" : "text-burgundy/[0.06]"}`}
          style={{ fontSize: "clamp(10rem, 26vw, 28rem)" }}
        >
          {p.number}
        </span>

        <div className="container-noir relative grid h-full gap-10 py-20 lg:py-[9svh]">
          {layout === "visual-top" ? (
            <div className="grid h-full gap-8 lg:grid-rows-[1fr_auto]">
              <div className="h-[46svh] min-h-[320px] lg:h-auto lg:min-h-0">{visualBlock}</div>
              {copyWide}
            </div>
          ) : (
            <div className="grid h-full items-center gap-10 lg:grid-cols-12">
              <div className={`lg:col-span-5 ${layout === "visual-left" ? "lg:order-2 lg:col-start-8" : ""}`}>{copy}</div>
              <div className={`h-[52svh] lg:h-[78svh] ${layout === "visual-left" ? "lg:order-1 lg:col-span-7 lg:col-start-1" : "lg:col-span-7"}`}>
                {visualBlock}
                {caption}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({ label, wine, children }: { label: string; wine: boolean; children: React.ReactNode }) {
  return (
    <div>
      <p className={`mb-1.5 text-[0.64rem] font-semibold uppercase tracking-[0.2em] ${wine ? "text-gold" : "text-burgundy"}`}>{label}</p>
      {children}
    </div>
  );
}
