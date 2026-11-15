"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { skills } from "@/lib/content";

const ease = [0.16, 1, 0.3, 1] as const;

/** Each volume on the shelf gets its own height and binding. */
const VOLUMES: Record<string, { h: number; bind: string; ink: string }> = {
  genai: { h: 100, bind: "#702c40", ink: "#f5efe6" },
  finetune: { h: 88, bind: "#8a3c52", ink: "#f5efe6" },
  aiml: { h: 94, bind: "#e8d8d2", ink: "#702c40" },
  backend: { h: 84, bind: "#4c4140", ink: "#f5efe6" },
  lang: { h: 76, bind: "#c6a77b", ink: "#4c4140" },
  frontend: { h: 90, bind: "#a75b68", ink: "#f5efe6" },
  tools: { h: 80, bind: "#efe6da", ink: "#702c40" },
};

/**
 * 04 — Skills as a technical library. Seven volumes stand on a shelf; taking
 * one down opens its index page, where each skill is set as an entry.
 */
export function Intelligence() {
  const [activeId, setActiveId] = useState(skills[0].id);
  const active = skills.find((s) => s.id === activeId) ?? skills[0];
  const activeIndex = skills.indexOf(active);
  const total = skills.reduce((n, s) => n + s.items.length, 0);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    const next = skills[(activeIndex + dir + skills.length) % skills.length];
    setActiveId(next.id);
    document.getElementById(`vol-${next.id}`)?.focus();
  };

  return (
    <section id="intelligence" aria-label="Skills" className="relative overflow-hidden bg-void py-24 md:py-36">
      <div className="container-noir">
        <div className="mb-14 grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="label">Skills · The library</p>
            <h2 className="mt-5 font-display font-extrabold leading-[0.9] tracking-[-0.05em] text-titanium-50" style={{ fontSize: "clamp(2.6rem, 5.6vw, 6rem)" }}>
              A working library<span className="text-gold">.</span>
            </h2>
          </div>
          <p className="font-serif text-[1.3rem] leading-snug text-titanium-300 lg:col-span-4 lg:col-start-9">
            {total} skills in {skills.length} volumes. Take one from the shelf to open its index.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-12">
          {/* The shelf */}
          <div className="lg:col-span-6">
            <div role="tablist" aria-label="Skill categories" onKeyDown={onKey} className="flex h-[17rem] items-end gap-1.5 sm:h-[22rem] sm:gap-2.5">
              {skills.map((s, i) => {
                const on = s.id === activeId;
                const v = VOLUMES[s.id];
                return (
                  <motion.button
                    key={s.id}
                    id={`vol-${s.id}`}
                    role="tab"
                    type="button"
                    aria-selected={on}
                    aria-controls="skill-index"
                    tabIndex={on ? 0 : -1}
                    onClick={() => setActiveId(s.id)}
                    animate={{ y: on ? -26 : 0 }}
                    whileHover={{ y: on ? -26 : -8 }}
                    transition={{ duration: 0.6, ease }}
                    className="relative flex min-w-0 flex-1 flex-col items-center justify-between py-4 outline-offset-4"
                    style={{
                      height: `${v.h}%`,
                      background: v.bind,
                      color: v.ink,
                      boxShadow: on ? "0 30px 40px -24px rgba(76,65,64,0.55)" : "inset -6px 0 10px -6px rgba(76,65,64,0.25)",
                    }}
                  >
                    <span className="text-[0.62rem] font-semibold tabular-nums opacity-80">{String(i + 1).padStart(2, "0")}</span>
                    <span
                      className="whitespace-nowrap font-display text-[0.82rem] font-semibold uppercase tracking-[0.08em] sm:text-[0.95rem]"
                      style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                    >
                      {s.label}
                    </span>
                    {/* brass bands on the spine */}
                    <span aria-hidden className="flex w-full flex-col gap-1 px-2">
                      <span className="h-px w-full bg-current opacity-40" />
                      <span className="h-px w-full bg-current opacity-40" />
                    </span>
                  </motion.button>
                );
              })}
            </div>
            {/* shelf board */}
            <div aria-hidden className="h-3 bg-[#d9cfc3] shadow-[0_18px_30px_-18px_rgba(76,65,64,0.45)]" />
            <p className="mt-4 text-[0.72rem] text-titanium-500">Use ← → to move along the shelf.</p>
          </div>

          {/* The open index page */}
          <div className="lg:col-span-5 lg:col-start-8">
            <div id="skill-index" role="tabpanel" aria-labelledby={`vol-${active.id}`} className="relative min-h-[24rem] border border-hairline bg-[#fbf7f1] px-7 py-8 md:px-10 md:py-10">
              <AnimatePresence mode="wait">
                <motion.div key={active.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <div className="flex items-baseline justify-between gap-4 border-b border-hairline pb-5">
                    <motion.h3
                      initial={{ y: 18, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.7, ease }}
                      className="font-editorial text-[clamp(2rem,3.2vw,2.8rem)] leading-none text-burgundy"
                    >
                      {active.label}
                    </motion.h3>
                    <span className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-titanium-500">
                      Vol. {String(activeIndex + 1).padStart(2, "0")} · {active.items.length} entries
                    </span>
                  </div>
                  <ol className="mt-5 grid gap-x-8 sm:grid-cols-2">
                    {active.items.map((it, k) => (
                      <motion.li
                        key={it}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + k * 0.045, duration: 0.55, ease }}
                        className="flex items-baseline gap-3 border-b border-hairline/70 py-2.5"
                      >
                        <span className="w-5 shrink-0 text-[0.62rem] tabular-nums text-gold">{String(k + 1).padStart(2, "0")}</span>
                        <span className="text-[0.98rem] font-medium text-espresso">{it}</span>
                      </motion.li>
                    ))}
                  </ol>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
