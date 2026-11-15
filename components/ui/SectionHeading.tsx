"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type Props = {
  index: string;
  kicker: string;
  title: React.ReactNode;
  aside?: React.ReactNode;
};

/** Numbered section header with a ScrollTrigger-driven masked reveal. */
export function SectionHeading({ index, kicker, title, aside }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top 82%", once: true },
      });
      tl.from("[data-sh-rule]", { scaleX: 0, transformOrigin: "left", duration: 1.4, ease: "expo.inOut" })
        .from("[data-sh-meta]", { y: 12, opacity: 0, stagger: 0.08, duration: 0.9 }, 0.2)
        .from("[data-sh-title]", { yPercent: 110, duration: 1.3, ease: "expo.out" }, 0.25);
      if (aside) tl.from("[data-sh-aside]", { y: 16, opacity: 0, duration: 1 }, 0.5);
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="mb-14 md:mb-20">
      <div data-sh-rule className="mb-6 h-px w-full bg-hairline-strong" />
      <div className="grid gap-6 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <p className="label mb-5 flex items-center gap-3">
            <span data-sh-meta className="text-volt-bright">
              {index}
            </span>
            <span data-sh-meta>{kicker}</span>
          </p>
          <h2 className="split-line font-display text-[clamp(2.3rem,6vw,5.2rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-titanium-50">
            <span data-sh-title className="split-inner">
              {title}
            </span>
          </h2>
        </div>
        {aside && (
          <div data-sh-aside className="text-[0.95rem] leading-relaxed text-titanium-400 md:col-span-5">
            {aside}
          </div>
        )}
      </div>
    </div>
  );
}
