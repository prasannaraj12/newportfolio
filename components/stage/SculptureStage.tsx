"use client";

import dynamic from "next/dynamic";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import type { Anchor, SculptureDriver } from "./KineticSculpture";

const KineticSculpture = dynamic(() => import("./KineticSculpture"), { ssr: false });

type StageApi = { driver: SculptureDriver; scatter: () => void };
const StageContext = createContext<StageApi | null>(null);
export const useStage = () => useContext(StageContext);

// Where the sculpture sits: a corner of the hero, then the centre of "Ideas".
const ANCHORS: Record<"desktop" | "compact", { from: Anchor; to: Anchor }> = {
  desktop: { from: { x: 0.45, y: 0.44, s: 0.5 }, to: { x: 0.52, y: 0.46, s: 0.74 } },
  compact: { from: { x: 0.8, y: 0.41, s: 0.32 }, to: { x: 0.5, y: 0.47, s: 0.66 } },
};

/**
 * A sticky WebGL layer shared by the hero and the Ideas chapter, so the
 * sculpture can physically travel between them.
 */
export function SculptureStage({ children }: { children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [driver] = useState<SculptureDriver>(() => ({ intro: 0, order: 0, travel: 0, burst: 0 }));
  const [active, setActive] = useState(true);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setCompact(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    if (wrap.current) io.observe(wrap.current);
    return () => {
      mq.removeEventListener("change", apply);
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

  const a = ANCHORS[compact ? "compact" : "desktop"];

  return (
    <StageContext.Provider value={api}>
      <div ref={wrap} className="relative">
        {/* Overlay spans exactly the hero + Ideas; the sticky child cannot overflow it. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[5]">
          <div className="sticky top-0 h-[100svh] w-full">
            <KineticSculpture driver={driver} from={a.from} to={a.to} plates={compact ? 12 : 16} active={active} />
          </div>
        </div>
        {children}
      </div>
    </StageContext.Provider>
  );
}
