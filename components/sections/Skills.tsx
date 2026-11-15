"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { skills } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";

const ease = [0.16, 1, 0.3, 1] as const;

export function Skills() {
  const [activeId, setActiveId] = useState(skills[0].id);
  const active = skills.find((s) => s.id === activeId) ?? skills[0];
  const total = skills.reduce((n, s) => n + s.items.length, 0);
  const all = skills.flatMap((s) => s.items);

  return (
    <section id="skills" className="relative overflow-hidden py-28 md:py-40">
      <div className="container-noir">
        <SectionHeading
          index="03"
          kicker="Interactive skills"
          title={
            <>
              The <span className="font-serif font-normal italic text-volt-gradient">toolchain.</span>
            </>
          }
          aside="Select a domain to load its modules. Every entry is drawn directly from my résumé."
        />

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Domain selector */}
          <div role="tablist" aria-label="Skill domains" className="flex gap-2 overflow-x-auto pb-2 lg:col-span-4 lg:flex-col lg:overflow-visible lg:pb-0">
            {skills.map((s, i) => {
              const selected = s.id === activeId;
              return (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={selected}
                  aria-controls="skill-panel"
                  onClick={() => setActiveId(s.id)}
                  onMouseEnter={() => setActiveId(s.id)}
                  className={`group relative flex shrink-0 items-center justify-between gap-6 rounded-xl px-4 py-3.5 text-left transition-colors duration-300 lg:px-5 ${
                    selected ? "text-white" : "text-titanium-400 hover:text-titanium-100"
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="skill-active"
                      className="panel absolute inset-0 -z-0 rounded-xl ring-1 ring-volt/30"
                      transition={{ type: "spring", stiffness: 360, damping: 34 }}
                    />
                  )}
                  <span className="relative flex items-center gap-3">
                    <span className={`font-mono text-[0.65rem] ${selected ? "text-volt-bright" : "text-titanium-500"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="whitespace-nowrap font-display text-[0.98rem] font-medium tracking-tight">{s.label}</span>
                  </span>
                  <span className="relative hidden font-mono text-[0.65rem] text-titanium-500 lg:block">
                    {s.items.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Module panel */}
          <div
            id="skill-panel"
            role="tabpanel"
            className="panel relative min-h-[360px] overflow-hidden rounded-2xl p-6 md:p-10 lg:col-span-8"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  "linear-gradient(var(--color-hairline) 1px, transparent 1px), linear-gradient(90deg, var(--color-hairline) 1px, transparent 1px)",
                backgroundSize: "44px 44px",
                maskImage: "radial-gradient(80% 80% at 70% 20%, black, transparent)",
              }}
            />
            <div className="relative mb-10 flex items-end justify-between gap-4">
              <AnimatePresence mode="wait">
                <motion.h3
                  key={active.id}
                  initial={{ y: 24, opacity: 0, filter: "blur(6px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: -16, opacity: 0, filter: "blur(6px)" }}
                  transition={{ duration: 0.55, ease }}
                  className="font-display text-3xl font-semibold tracking-[-0.03em] text-titanium-50 md:text-5xl"
                >
                  {active.label}
                </motion.h3>
              </AnimatePresence>
              <p className="label shrink-0">
                <span className="text-volt-bright">{active.items.length}</span> / {total} modules
              </p>
            </div>

            <AnimatePresence mode="popLayout">
              <motion.ul key={active.id} className="relative flex flex-wrap gap-2.5">
                {active.items.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, y: 18, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                    transition={{ delay: i * 0.035, duration: 0.5, ease }}
                    whileHover={{ y: -3 }}
                    className="group/chip cursor-default rounded-full border border-hairline-strong bg-white/[0.025] px-4 py-2.5 text-sm text-titanium-100 transition-colors duration-300 hover:border-volt/70 hover:bg-volt/10 hover:text-white hover:shadow-[0_0_24px_-6px_rgb(47_123_255/0.7)]"
                  >
                    <span className="mr-2 inline-block size-1.5 rounded-full bg-titanium-500 align-middle transition-colors group-hover/chip:bg-volt-bright" />
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Ambient marquee of the full stack */}
      <div aria-hidden className="mt-24 flex select-none overflow-hidden border-y border-hairline py-6 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 animate-[marquee_70s_linear_infinite] items-center gap-10 pr-10">
            {all.map((s, i) => (
              <span key={`${k}-${i}`} className="flex items-center gap-10 whitespace-nowrap font-display text-2xl font-medium tracking-tight text-titanium-600 md:text-4xl">
                {s}
                <span className="size-1.5 rounded-full bg-volt/60" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
