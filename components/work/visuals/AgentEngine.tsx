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
      <div className="relative min-h-0 flex-1">{gl && <AgentEngineScene progress={progress} active={active} selected={selected} onSelect={setHover} />}</div>
      <div className="mx-auto w-full max-w-xl border-t border-[#d9cfc3] pt-3">
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
            <p className="text-[#542031]">
              <span className="text-[#702c40]">action ›</span> {tool.name}
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
