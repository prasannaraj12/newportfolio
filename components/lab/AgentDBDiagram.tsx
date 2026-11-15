"use client";

import { AnimatePresence, motion } from "motion/react";
import { agentdbTools } from "@/lib/content";
import { useCycle } from "./useCycle";

const C = 300;
const R = 205;
const nodes = agentdbTools.map((t, i) => {
  const a = (-90 + i * 72) * (Math.PI / 180);
  return { ...t, x: C + Math.cos(a) * R, y: C + Math.sin(a) * R };
});

const ease = [0.16, 1, 0.3, 1] as const;

/** AgentDB: a ReAct agent orchestrating five tools. Hover/click a tool to route the loop. */
export function AgentDBDiagram() {
  const { ref, index, select } = useCycle(nodes.length, 2800);
  const active = nodes[index];

  return (
    <div ref={ref} className="relative">
      <svg viewBox="0 0 600 600" className="mx-auto w-full max-w-[620px]" role="img" aria-label="AgentDB orchestration diagram">
        <defs>
          <radialGradient id="adb-core" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#a5566a" />
            <stop offset="55%" stopColor="#702c3b" />
            <stop offset="100%" stopColor="#4a1c27" />
          </radialGradient>
        </defs>

        {/* Orbit guides */}
        <circle cx={C} cy={C} r={R} fill="none" stroke="var(--color-hairline-strong)" strokeDasharray="2 6" />
        <circle cx={C} cy={C} r={R + 48} fill="none" stroke="var(--color-hairline)" />

        {/* Edges */}
        {nodes.map((n, i) => (
          <line
            key={n.id}
            x1={C}
            y1={C}
            x2={n.x}
            y2={n.y}
            stroke={i === index ? "var(--color-volt-bright)" : "var(--color-hairline-strong)"}
            strokeWidth={i === index ? 1.6 : 1}
            style={{ transition: "stroke 0.5s" }}
          />
        ))}

        {/* Request travelling out to the tool and the observation coming back */}
        <motion.circle
          key={`out-${index}`}
          r={4}
          fill="var(--color-volt-bright)"
          initial={{ cx: C, cy: C, opacity: 0 }}
          animate={{ cx: [C, active.x, C], cy: [C, active.y, C], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.2, times: [0, 0.5, 1], ease: "easeInOut" }}
        />

        {/* Agent core */}
        <motion.circle
          cx={C}
          cy={C}
          r={86}
          fill="none"
          stroke="var(--color-titanium-500)"
          strokeDasharray="1 7"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{ originX: "300px", originY: "300px" }}
        />
        <circle cx={C} cy={C} r={62} fill="url(#adb-core)" />
        <text x={C} y={C - 4} textAnchor="middle" className="fill-void font-display text-[17px] font-bold">
          ReAct agent
        </text>
        <text x={C} y={C + 16} textAnchor="middle" className="fill-void/70 font-mono text-[10px] tracking-[0.2em]">
          LANGGRAPH
        </text>

        {/* Tools */}
        {nodes.map((n, i) => {
          const on = i === index;
          const below = n.y > C;
          return (
            <g
              key={n.id}
              role="button"
              tabIndex={0}
              aria-pressed={on}
              aria-label={`${n.name}: ${n.does}`}
              onMouseEnter={() => select(i)}
              onFocus={() => select(i)}
              onClick={() => select(i)}
              className="cursor-pointer outline-none"
            >
              <circle cx={n.x} cy={n.y} r={34} fill="transparent" />
              <rect
                x={n.x - 13}
                y={n.y - 13}
                width={26}
                height={26}
                transform={`rotate(45 ${n.x} ${n.y})`}
                fill={on ? "var(--color-volt-bright)" : "var(--color-void)"}
                stroke={on ? "var(--color-volt-bright)" : "var(--color-titanium-400)"}
                style={{ transition: "fill 0.4s, stroke 0.4s" }}
              />
              <text
                x={n.x}
                y={below ? n.y + 40 : n.y - 28}
                textAnchor="middle"
                className={`font-display text-[14px] font-medium ${on ? "fill-titanium-50" : "fill-titanium-400"}`}
                style={{ transition: "fill 0.4s" }}
              >
                {n.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* ReAct trace */}
      <div className="mx-auto mt-2 max-w-[520px] border-t border-hairline pt-4 font-mono text-[0.72rem] leading-relaxed">
        <p className="mb-2 text-[0.6rem] uppercase tracking-[0.22em] text-titanium-500">ReAct trace · schematic</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease }}
          >
            <p className="text-titanium-400">
              <span className="text-titanium-500">thought ›</span> choose the next tool
            </p>
            <p className="text-titanium-100">
              <span className="text-volt-bright">action ›</span> {active.name}
            </p>
            <p className="text-titanium-400">
              <span className="text-titanium-500">observe ›</span> {active.does}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
