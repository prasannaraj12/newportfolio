"use client";

import { useMotionValueEvent, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { crawlStages } from "@/lib/content";

const N = 31; // RSS sources (résumé)
const GATES = [0.24, 0.36, 0.48, 0.6, 0.72, 0.84];
const MOUTH = 0.16;
const OUT = 0.93;
const LANES = [0.33, 0.5, 0.67];

const BURGUNDY = "#782D40";
const DEEP = "#542031";
const ROSE = "#B78385";
const GOLD = "#B99265";
const LINE = "#d6c8b9";

type P = { i: number; phase: number; sy: number; pre: number; lane: number; dup: boolean; drop: boolean; from: "top" | "left" | "bottom" };

const particles: P[] = Array.from({ length: N }, (_, i) => {
  const n = Math.sin(i * 12.9898) * 43758.5453;
  const r = n - Math.floor(n);
  const from = i % 3 === 0 ? "top" : i % 3 === 1 ? "left" : "bottom";
  return {
    i,
    phase: r,
    sy: (i + 0.5) / N,
    pre: 0.24 + ((i * 7) % N) / N * 0.52,
    lane: i % 3,
    dup: i % 7 === 3,
    drop: i % 5 === 2,
    from,
  };
});

/** CrawlNews: a scroll-gated news-processing line (canvas 2D, cheap). */
export function NewsFactory({ progress, active }: { progress: MotionValue<number>; active: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const prog = useRef(0);
  const [stagesOn, setStagesOn] = useState(0);

  useMotionValueEvent(progress, "change", (p) => {
    prog.current = p;
    const on = Math.round(Math.min(1, Math.max(0, (p - 0.1) / 0.6)) * 6);
    setStagesOn((c) => (c === on ? c : on));
  });

  useEffect(() => {
    const c = canvas.current;
    const w = wrap.current;
    if (!c || !w) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = w.clientWidth;
      H = w.clientHeight;
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
      c.style.width = `${W}px`;
      c.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(w);

    let raf = 0;
    const draw = (now: number) => {
      const t = reduced ? 0.5 : now / 1000;
      const p = prog.current;
      const on = Math.round(Math.min(1, Math.max(0, (p - 0.1) / 0.6)) * 6);
      ctx.clearRect(0, 0, W, H);

      // gates
      GATES.forEach((g, k) => {
        ctx.strokeStyle = k < on ? BURGUNDY : LINE;
        ctx.lineWidth = k < on ? 1.4 : 1;
        ctx.setLineDash(k < on ? [] : [3, 5]);
        ctx.beginPath();
        ctx.moveTo(g * W, H * 0.14);
        ctx.lineTo(g * W, H * 0.86);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // event lanes after clustering
      if (on >= 3) {
        LANES.forEach((l) => {
          ctx.strokeStyle = "rgba(120,45,64,0.12)";
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.moveTo(GATES[2] * W, l * H);
          ctx.lineTo(OUT * W, l * H);
          ctx.stroke();
        });
      }

      // output briefs
      const briefs = on >= 6 ? Math.min(1, (p - 0.7) / 0.15 + 0.2) : 0;
      LANES.forEach((l, k) => {
        const bw = 0.06 * W * briefs * (1 - k * 0.15);
        ctx.fillStyle = DEEP;
        ctx.fillRect(OUT * W - 2, l * H - 9, bw, 4);
        ctx.fillStyle = "rgba(84,32,49,0.45)";
        ctx.fillRect(OUT * W - 2, l * H - 1, bw * 0.75, 3);
        ctx.fillRect(OUT * W - 2, l * H + 5, bw * 0.55, 3);
      });

      // signals
      const cap = on === 0 ? MOUTH : on >= 6 ? OUT : GATES[on];
      particles.forEach((pt) => {
        const travel = ((t * 0.07 + pt.phase) % 1.25) / 1.25;
        let x = travel * (OUT + 0.03);
        const queued = x > cap - 0.012;
        if (queued) x = cap - 0.012 - (pt.i % 6) * 0.006;

        let y: number;
        let alpha = 1;
        // Entering from three directions toward the mouth
        if (x < MOUTH) {
          const k = x / MOUTH;
          const sx = pt.from === "left" ? pt.sy : pt.from === "top" ? 0.04 : 0.96;
          y = sx + (pt.pre - sx) * (1 - (1 - k) * (1 - k));
          alpha = 0.35 + 0.65 * k;
        } else {
          y = pt.pre;
          // Deduplication: duplicates converge on their twin and vanish
          if (pt.dup && on >= 2 && x > GATES[0]) {
            const k = Math.min(1, (x - GATES[0]) / (GATES[1] - GATES[0]));
            y = pt.pre + (particles[pt.i - 1].pre - pt.pre) * k;
            alpha = 1 - k;
          }
          // Event clustering: settle into three lanes
          if (on >= 3 && x > GATES[2]) {
            const k = Math.min(1, (x - GATES[2]) / 0.08);
            y = y + (LANES[pt.lane] - y) * k;
          }
          // Relevance filtering: dropped items fall away
          if (pt.drop && on >= 4 && x > GATES[3]) {
            const k = Math.min(1, (x - GATES[3]) / 0.06);
            y += k * 0.18;
            alpha *= 1 - k;
          }
          // Summarization: absorbed into the briefs
          if (on >= 6 && x > GATES[5]) alpha *= 1 - Math.min(1, (x - GATES[5]) / (OUT - GATES[5]));
        }
        if (alpha <= 0.02) return;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = pt.dup ? ROSE : BURGUNDY;
        ctx.beginPath();
        ctx.arc(x * W, y * H, 3.2, 0, Math.PI * 2);
        ctx.fill();
        // Fact verification: a gold ring once past the verify gate
        if (on >= 5 && x > GATES[4] && !pt.drop) {
          ctx.strokeStyle = GOLD;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(x * W, y * H, 6, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      });

      if (active && !reduced) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [active]);

  return (
    <div className="flex h-full flex-col">
      <div ref={wrap} className="relative min-h-0 flex-1">
        <canvas ref={canvas} className="absolute inset-0" aria-label="CrawlNews pipeline animation" role="img" />
        {/* stage labels */}
        {crawlStages.map((s, k) => (
          <div
            key={s.id}
            className="absolute top-0 -translate-x-1/2 text-center transition-colors duration-500"
            style={{ left: `${GATES[k] * 100}%` }}
          >
            <p className={`text-[0.62rem] font-semibold tabular-nums ${k < stagesOn ? "text-[#782D40]" : "text-[#b3a59a]"}`}>{String(k + 1).padStart(2, "0")}</p>
            <p className={`whitespace-nowrap text-[0.64rem] font-semibold uppercase tracking-[0.12em] ${k < stagesOn ? "text-[#542031]" : "text-[#b3a59a]"}`}>
              {s.name}
            </p>
          </div>
        ))}
        <p className="absolute left-0 top-0 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-[#8a7f78]">31 RSS sources</p>
        <p className="absolute right-0 top-0 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-[#8a7f78]">Briefs</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#d6c8b9] pt-3 text-[0.74rem] text-[#625A56]">
        <span>
          <span className="font-semibold text-[#782D40]">{stagesOn}/6</span> stages running —{" "}
          {stagesOn === 0 ? "scroll to switch the line on" : crawlStages[Math.min(5, stagesOn - 1)].does}
        </span>
        <span className="text-[#8a7f78]">Runs on a 15-minute schedule · schematic</span>
      </div>
    </div>
  );
}
