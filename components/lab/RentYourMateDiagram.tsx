"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Check } from "lucide-react";
import { rymLayers, rymTrust } from "@/lib/content";
import { useCycle } from "./useCycle";

const ease = [0.16, 1, 0.3, 1] as const;

/** RentYourMate: an isometric architecture stack and a trust workflow. */
export function RentYourMateDiagram() {
  const [view, setView] = useState<"architecture" | "trust">("architecture");

  return (
    <div>
      <div role="tablist" aria-label="Diagram view" className="mb-8 inline-flex border border-hairline-strong p-1">
        {(["architecture", "trust"] as const).map((v) => (
          <button
            key={v}
            role="tab"
            aria-selected={view === v}
            onClick={() => setView(v)}
            className="relative px-4 py-2 font-mono text-[0.66rem] uppercase tracking-[0.2em]"
          >
            {view === v && (
              <motion.span layoutId="rym-tab" className="absolute inset-0 bg-titanium-50" transition={{ type: "spring", stiffness: 400, damping: 36 }} />
            )}
            <span className={`relative ${view === v ? "text-void" : "text-titanium-400"}`}>
              {v === "architecture" ? "Architecture" : "Trust flow"}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {view === "architecture" ? (
          <motion.div
            key="arch"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease }}
          >
            <Stack />
          </motion.div>
        ) : (
          <motion.div
            key="trust"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease }}
          >
            <Trust />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stack() {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="relative h-[360px] [perspective:1400px] sm:h-[400px]">
      <div className="absolute left-[36%] top-[46%] w-[min(62%,300px)] -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d] [transform:rotateX(58deg)_rotateZ(-38deg)]">
        {rymLayers.map((l, i) => {
          const lift = (rymLayers.length - 1 - i) * 70 + (hover === i ? 26 : 0);
          return (
            <div
              key={l.id}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="absolute inset-x-0 aspect-square border transition-[transform,background,border-color] duration-700 ease-[var(--ease-cinematic)]"
              style={{
                transform: `translateZ(${lift}px)`,
                background: hover === i ? "rgb(94 160 255 / 0.18)" : `rgb(198 205 216 / ${0.05 + i * 0.03})`,
                borderColor: hover === i ? "var(--color-volt-bright)" : "var(--color-hairline-strong)",
              }}
            >
              <div className="absolute inset-3 border border-dashed border-hairline" />
            </div>
          );
        })}
      </div>
      {/* Labels (kept flat for legibility) */}
      <ul className="absolute right-0 top-4 space-y-[70px] text-right sm:top-8">
        {rymLayers.map((l, i) => (
          <li
            key={l.id}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className="cursor-default"
          >
            <p className={`font-mono text-[0.6rem] uppercase tracking-[0.22em] transition-colors ${hover === i ? "text-volt-bright" : "text-titanium-500"}`}>
              {String(i + 1).padStart(2, "0")} {l.name}
            </p>
            <p className="font-display text-lg font-semibold tracking-tight text-titanium-50">{l.tech}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Trust() {
  const { ref, index, select } = useCycle(rymTrust.length + 1, 1400);
  return (
    <div ref={ref}>
      <ol className="relative grid gap-0 sm:grid-cols-5">
        {rymTrust.map((s, i) => {
          const passed = i < index;
          const current = i === index;
          return (
            <li key={s.id} className="relative">
              <button
                type="button"
                onClick={() => select(i + 1)}
                className="group flex w-full items-start gap-4 border-l border-hairline-strong py-4 pl-5 text-left sm:flex-col sm:gap-3 sm:border-l-0 sm:border-t sm:pl-0 sm:pr-3 sm:pt-6"
              >
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full border transition-colors duration-500 ${
                    passed ? "border-titanium-50 bg-titanium-50 text-void" : current ? "border-volt-bright text-volt-bright" : "border-hairline-strong text-titanium-500"
                  }`}
                >
                  {passed ? <Check className="size-4" /> : <span className="font-mono text-[0.62rem]">{i + 1}</span>}
                </span>
                <span>
                  <span className={`block font-display text-base font-semibold tracking-tight ${passed || current ? "text-titanium-50" : "text-titanium-400"}`}>
                    {s.name}
                  </span>
                  <span className="mt-1 block text-[0.8rem] leading-snug text-titanium-400">{s.does}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-6 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-titanium-500">
        Gate sequence · schematic — click a gate to replay
      </p>
    </div>
  );
}
