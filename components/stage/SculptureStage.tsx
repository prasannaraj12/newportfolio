"use client";

import dynamic from "next/dynamic";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import type { Anchor, SculptureDriver } from "./IntelligencePrism";

const IntelligencePrism = dynamic(() => import("./IntelligencePrism"), { ssr: false });

type StageApi = { driver: SculptureDriver; scatter: () => void };
const StageContext = createContext<StageApi | null>(null);
export const useStage = () => useContext(StageContext);

// Where the sculpture sits: a corner of the hero, then the centre of "Ideas".
const ANCHORS: Record<"desktop" | "tablet" | "compact", { from: Anchor; to: Anchor }> = {
  desktop: { from: { x: 0.612, y: 0.74, s: 0.34 }, to: { x: 0.52, y: 0.5, s: 0.82 } },
  // 1024–1279px: the gutter is too narrow, so rest it in the left column's open space
  tablet: { from: { x: 0.45, y: 0.62, s: 0.3 }, to: { x: 0.52, y: 0.5, s: 0.78 } },
  // phones: the open space to the right of the name, clear of every control
  compact: { from: { x: 0.8, y: 0.215, s: 0.21 }, to: { x: 0.5, y: 0.5, s: 0.7 } },
};

/**
 * A sticky WebGL layer shared by the hero and the Ideas chapter, so the
 * Intelligence Prism can physically travel between them.
 */
export function SculptureStage({ children }: { children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [driver] = useState<SculptureDriver>(() => ({ intro: 0, order: 0, travel: 0, burst: 0 }));
  const [active, setActive] = useState(true);
  const [compact, setCompact] = useState(false);
  const [tablet, setTablet] = useState(false);

  useEffect(() => {
    const tq = window.matchMedia("(min-width: 1024px) and (max-width: 1279px)");
    const applyT = () => setTablet(tq.matches);
    applyT();
    tq.addEventListener("change", applyT);
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setCompact(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    if (wrap.current) io.observe(wrap.current);
    return () => {
      mq.removeEventListener("change", apply);
      tq.removeEventListener("change", applyT);
      io.disconnect();
    };
  }, []);

  const [api] = useState<StageApi>(() => ({
    driver,
    scatter: () => {
      gsap.killTweensOf(driver, "burst");
      gsap.fromTo(driver, { burst: 1 }, { burst: 0, duration: 2.2, ease: "power2.inOut", delay: 0.35 });
    },
  }));

  const a = ANCHORS[compact ? "compact" : tablet ? "tablet" : "desktop"];

  return (
    <StageContext.Provider value={api}>
      <div ref={wrap} className="relative">
        {/* Overlay spans exactly the hero + Ideas; the sticky child cannot overflow it. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[5]">
          <div className="sticky top-0 h-[100svh] w-full">
            <IntelligencePrism driver={driver} from={a.from} to={a.to} active={active} />
          </div>
        </div>
        {children}
      </div>
    </StageContext.Provider>
  );
}
