"use client";

import { AnimatePresence, motion } from "motion/react";
import { crawlStages } from "@/lib/content";
import { useCycle } from "./useCycle";

const SOURCES = 31; // from the résumé
const STAGE_X = [210, 380, 550, 720, 890, 1060];
const LANES = [120, 190, 260, 330];
const OUT_Y = 225;

const sources = Array.from({ length: SOURCES }, (_, i) => {
  const col = i < 16 ? 0 : 1;
  const row = col === 0 ? i : i - 16;
  const rows = col === 0 ? 16 : 15;
  const y = 50 + (row + (col ? 0.5 : 0)) * (350 / (rows - (col ? 0 : 1)));
  // Deterministic fates: some are duplicates, some are filtered out.
  const drop = i % 7 === 3 ? 1 : i % 5 === 2 ? 3 : -1;
  return { x: 40 + col * 26, y: Math.min(y, 400), lane: LANES[i % LANES.length], drop };
});

export function CrawlNewsDiagram() {
  const { ref, index, select, visible: animate } = useCycle(crawlStages.length, 2600);
  const active = crawlStages[index];

  return (
    <div ref={ref}>
      <div className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] [scrollbar-width:none]">
        <svg viewBox="0 0 1200 440" className="w-full min-w-[760px]" role="img" aria-label="CrawlNews pipeline diagram">
          {/* Sources */}
          {sources.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={3} fill="var(--color-titanium-400)" />
          ))}
          <text x={52} y={430} textAnchor="middle" className="fill-titanium-400 font-mono text-[11px] tracking-[0.15em]">
            31 RSS
          </text>

          {/* Stage columns */}
          {crawlStages.map((st, i) => {
            const on = i === index;
            return (
              <g
                key={st.id}
                role="button"
                tabIndex={0}
                aria-pressed={on}
                aria-label={`${st.name}: ${st.does}`}
                onMouseEnter={() => select(i)}
                onFocus={() => select(i)}
                onClick={() => select(i)}
                className="cursor-pointer outline-none"
              >
                <rect x={STAGE_X[i] - 60} y={0} width={120} height={440} fill={on ? "rgb(112 44 59 / 0.07)" : "transparent"} style={{ transition: "fill 0.4s" }} />
                <line
                  x1={STAGE_X[i]}
                  x2={STAGE_X[i]}
                  y1={46}
                  y2={404}
                  stroke={on ? "var(--color-volt-bright)" : "var(--color-hairline-strong)"}
                  strokeDasharray={on ? "0" : "2 6"}
                />
                <text x={STAGE_X[i]} y={28} textAnchor="middle" className={`font-mono text-[11px] tracking-[0.12em] ${on ? "fill-titanium-50" : "fill-titanium-500"}`}>
                  {String(i + 1).padStart(2, "0")} {st.name.toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* Signals */}
          {animate &&
            sources.map((s, i) => {
              const ys = [s.y, s.y * 0.6 + 90, s.y * 0.6 + 90, s.lane, s.lane, s.lane, OUT_Y];
              const xs = [s.x, ...STAGE_X];
              const op: number[] = xs.map((_, k) => (k === 0 ? 0 : s.drop > 0 && k > s.drop + 1 ? 0 : 1));
              if (s.drop > 0) op[s.drop + 1] = 0.15;
              return (
                <motion.circle
                  key={i}
                  r={s.drop > 0 ? 2.5 : 3.2}
                  fill={s.drop > 0 ? "var(--color-titanium-400)" : "var(--color-volt-bright)"}
                  initial={{ cx: s.x, cy: s.y, opacity: 0 }}
                  animate={{ cx: xs, cy: ys, opacity: op }}
                  transition={{ duration: 7, repeat: Infinity, delay: i * 0.22, ease: "linear", repeatDelay: 0.6 }}
                />
              );
            })}

          {/* Output: summaries */}
          {[0, 1, 2].map((k) => (
            <rect key={k} x={1110} y={OUT_Y - 26 + k * 18} width={70 - k * 16} height={6} fill="var(--color-titanium-200)" opacity={0.75 - k * 0.2} />
          ))}
          <text x={1145} y={OUT_Y + 50} textAnchor="middle" className="fill-titanium-400 font-mono text-[11px] tracking-[0.15em]">
            BRIEFS
          </text>
        </svg>
      </div>

      <div className="mt-6 grid gap-6 border-t border-hairline pt-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={active.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="font-mono text-[0.75rem] text-titanium-300"
          >
            <span className="text-volt-bright">{String(index + 1).padStart(2, "0")} {active.name}</span> — {active.does}
          </motion.p>
        </AnimatePresence>

        {/* 15-minute cycle (shown compressed) */}
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 40 40" className="size-10 -rotate-90" aria-hidden>
            <circle cx="20" cy="20" r="16" fill="none" stroke="var(--color-hairline-strong)" strokeWidth="2" />
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="var(--color-volt-bright)"
              strokeWidth="2"
              pathLength={1}
              strokeDasharray="1"
              className={animate ? "[animation:nv-cycle_15s_linear_infinite]" : ""}
            />
          </svg>
          <p className="font-mono text-[0.62rem] uppercase leading-tight tracking-[0.18em] text-titanium-400">
            Scheduled cycle
            <br />
            <span className="text-titanium-100">every 15 min</span> · shown compressed
          </p>
        </div>
      </div>
    </div>
  );
}
