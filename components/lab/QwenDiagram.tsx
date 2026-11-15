"use client";

import { AnimatePresence, motion } from "motion/react";
import { Lock } from "lucide-react";
import { qwenStages } from "@/lib/content";
import { useCycle } from "./useCycle";

const N = 10;
// Deterministic pseudo-weights in [0, 1].
const W = Array.from({ length: N * N }, (_, i) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
});
const quant = (v: number) => Math.round(v * 15) / 15; // 16 levels = 4-bit

function shade(v: number) {
  const l = Math.round(18 + v * 62);
  return `hsl(215 12% ${l}%)`;
}

const ease = [0.16, 1, 0.3, 1] as const;

/** Qwen QLoRA: frozen (quantized) weights + trainable low-rank adapters. */
export function QwenDiagram() {
  const { ref, index: stage, select } = useCycle(qwenStages.length, 3200);
  const quantized = stage >= 1;
  const adapters = stage >= 2;
  const training = stage === 3;
  const deployed = stage === 4;
  const s = qwenStages[stage];

  return (
    <div ref={ref}>
      <div className="relative flex items-center justify-center gap-3 py-6 sm:gap-5">
        {/* W — frozen */}
        <div>
          <div className="mb-2 flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.2em] text-titanium-600">
            <span>W {quantized ? "· 4-bit" : "· fp16"}</span>
            <Lock className="size-3" aria-label="frozen" />
          </div>
          <div className="grid grid-cols-10 gap-[2px] bg-void/10 p-[2px]" aria-hidden>
            {W.map((v, i) => (
              <span
                key={i}
                className="block size-[clamp(14px,2.2vw,26px)]"
                style={{ background: shade(quantized ? quant(v) : v), transition: `background 0.6s ${(i % N) * 25}ms` }}
              />
            ))}
          </div>
        </div>

        {/* + B·A */}
        <AnimatePresence>
          {adapters && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.7, ease }}
              className="flex items-center gap-2 sm:gap-3"
              aria-hidden
            >
              <span className="font-serif text-3xl italic text-void">+</span>
              <div>
                <p className="mb-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-volt-deep">B</p>
                <div className="grid grid-cols-2 gap-[2px]">
                  {Array.from({ length: N * 2 }, (_, i) => (
                    <motion.span
                      key={i}
                      className="block size-[clamp(10px,1.6vw,18px)] bg-volt"
                      animate={{ opacity: training ? [0.35, 1, 0.35] : 0.85 }}
                      transition={training ? { duration: 1.4, repeat: Infinity, delay: (i % 7) * 0.12 } : { duration: 0.4 }}
                    />
                  ))}
                </div>
              </div>
              <span className="font-mono text-sm text-titanium-600">×</span>
              <div>
                <p className="mb-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-volt-deep">A</p>
                <div className="grid grid-cols-10 gap-[2px]">
                  {Array.from({ length: N * 2 }, (_, i) => (
                    <motion.span
                      key={i}
                      className="block size-[clamp(10px,1.6vw,18px)] bg-volt"
                      animate={{ opacity: training ? [0.35, 1, 0.35] : 0.85 }}
                      transition={training ? { duration: 1.4, repeat: Infinity, delay: (i % 5) * 0.15 } : { duration: 0.4 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {deployed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease }}
              className="absolute -bottom-2 right-0 bg-void px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-titanium-50"
            >
              → optimized inference
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stage rail */}
      <ol className="mt-6 grid grid-cols-5 border-t border-void/20">
        {qwenStages.map((st, i) => (
          <li key={st.id}>
            <button
              type="button"
              onClick={() => select(i)}
              aria-pressed={i === stage}
              className="group relative w-full pt-4 text-left"
            >
              <span
                className="absolute inset-x-0 -top-px h-[2px] origin-left bg-void transition-transform duration-700"
                style={{ transform: `scaleX(${i <= stage ? 1 : 0})` }}
              />
              <span className="block font-mono text-[0.6rem] text-titanium-600">{String(i + 1).padStart(2, "0")}</span>
              <span
                className={`mt-1 block pr-2 text-[0.72rem] leading-tight transition-colors sm:text-[0.82rem] ${
                  i === stage ? "font-semibold text-void" : "text-titanium-600 group-hover:text-void"
                }`}
              >
                {st.name}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        <motion.p
          key={s.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease }}
          className="mt-6 max-w-md text-[0.92rem] leading-relaxed text-titanium-600"
        >
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-volt-deep">{s.tool} — </span>
          {s.does}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
