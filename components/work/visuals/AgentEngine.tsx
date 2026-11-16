"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion, useMotionValueEvent, type MotionValue } from "motion/react";
import { useEffect, useState } from "react";
import { agentdbTools } from "@/lib/content";
import { AgentDBDiagram } from "@/components/lab/AgentDBDiagram";

const AgentEngineScene = dynamic(() => import("./AgentEngineScene"), { ssr: false });

const ease = [0.16, 1, 0.3, 1] as const;

/** AgentDB room visual: 3D engine (or SVG fallback) + live ReAct trace. */
export function AgentEngine({ progress, active }: { progress: MotionValue<number>; active: boolean }) {
  const [gl, setGl] = useState<boolean | null>(null);
  const [auto, setAuto] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const selected = hover ?? auto;

  // DOM labels positioned by the scene each frame (no portals inside the canvas).
  const [labels] = useState(() => {
    const els: (HTMLElement | null)[] = [];
    return {
      ref: (i: number) => (el: HTMLElement | null) => {
        els[i] = el;
      },
      place(i: number, x: number, y: number, show: boolean) {
        const el = els[i];
        if (!el) return;
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        el.style.opacity = show ? "1" : "0";
        el.style.visibility = show ? "visible" : "hidden";
      },
    };
  });

  useEffect(() => {
    let ok = false;
    try {
      const c = document.createElement("canvas");
      ok = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      ok = false;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client capability probe
    setGl(ok);
  }, []);

  // Scrolling walks the agent through its five tools in order.
  useMotionValueEvent(progress, "change", (p) => {
    const i = Math.min(4, Math.max(0, Math.floor((p - 0.2) / 0.11)));
    setAuto((cur) => (cur === i ? cur : i));
  });

  const tool = agentdbTools[selected];

  if (gl === false) return <AgentDBDiagram />;

  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1">
        {gl && <AgentEngineScene progress={progress} active={active} selected={selected} labels={labels} />}
        {gl && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <span
              ref={labels.ref(0)}
              aria-hidden
              className="invisible absolute left-0 top-0 select-none whitespace-nowrap text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[#741f38] opacity-0 transition-opacity duration-300"
            >
              ReAct agent · LangGraph
            </span>
            {agentdbTools.map((t, i) => (
              <button
                key={t.id}
                ref={labels.ref(i + 1)}
                type="button"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                onClick={() => setHover(i)}
                className={`pointer-events-auto invisible absolute left-0 top-0 whitespace-nowrap border px-2.5 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.14em] opacity-0 transition-[opacity,background-color,color,border-color] duration-300 ${
                  selected === i ? "border-[#741f38] bg-[#741f38] text-[#f7f1e9]" : "border-[#e4d5ca] bg-[#f7f1e9]/90 text-[#4d1025]"
                }`}
              >
                {String(i + 1).padStart(2, "0")} {t.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="mx-auto w-full max-w-xl border-t border-[#e4d5ca] pt-3">
        <p className="mb-1 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#8a7f78]">ReAct trace · schematic</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease }}
            className="grid gap-0.5 font-mono text-[0.74rem] leading-relaxed text-[#625A56]"
          >
            <p>
              <span className="text-[#8a7f78]">thought ›</span> choose the next tool
            </p>
            <p className="text-[#4d1025]">
              <span className="text-[#741f38]">action ›</span> {tool.name}
            </p>
            <p>
              <span className="text-[#8a7f78]">observe ›</span> {tool.does}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
