"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { skills } from "@/lib/content";
import type { Form } from "@/components/three/LiquidMetal";

const LiquidMetal = dynamic(() => import("@/components/three/LiquidMetal"), { ssr: false });

/** Each domain gives the sculpture its own temperament. */
const FORMS: Record<string, Form> = {
  genai: { freq: 1.6, amp: 0.26, twist: 1.4, speed: 1.0 },
  finetune: { freq: 2.6, amp: 0.12, twist: 0.2, speed: 0.7 },
  aiml: { freq: 1.1, amp: 0.32, twist: 0.0, speed: 0.6 },
  backend: { freq: 3.4, amp: 0.08, twist: 2.4, speed: 0.5 },
  lang: { freq: 0.8, amp: 0.18, twist: 0.6, speed: 0.9 },
  frontend: { freq: 2.0, amp: 0.2, twist: -1.6, speed: 1.2 },
  tools: { freq: 1.3, amp: 0.1, twist: 0.0, speed: 0.4 },
};

const ease = [0.16, 1, 0.3, 1] as const;

/** 04 — The Intelligence: an oversized type index that reshapes a liquid-metal form. */
export function Intelligence() {
  const [activeId, setActiveId] = useState(skills[0].id);
  const [visible, setVisible] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const total = skills.reduce((n, s) => n + s.items.length, 0);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="intelligence" aria-label="The Intelligence" className="relative overflow-hidden bg-void py-24 md:py-36">
      <div className="container-noir grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="label mb-6 flex items-center gap-3">
            <span className="text-volt-bright">04</span>
            <span className="h-px w-8 bg-titanium-500" />
            The Intelligence
          </p>
          <h2 className="mb-12 max-w-md font-serif text-[clamp(2rem,3.6vw,3.2rem)] italic leading-[1.05] text-titanium-100">
            {total} modules across {skills.length} domains — select one to reshape the form.
          </h2>

          <ul role="tablist" aria-label="Skill domains" className="border-t border-hairline">
            {skills.map((s, i) => {
              const on = s.id === activeId;
              return (
                <li key={s.id} className="border-b border-hairline">
                  <button
                    role="tab"
                    aria-selected={on}
                    aria-controls={`domain-${s.id}`}
                    onClick={() => setActiveId(s.id)}
                    onMouseEnter={() => setActiveId(s.id)}
                    className="group flex w-full items-baseline gap-4 py-3 text-left md:py-4"
                  >
                    <span className={`font-mono text-[0.62rem] transition-colors ${on ? "text-volt-bright" : "text-titanium-500"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`font-display uppercase leading-none tracking-[-0.04em] transition-[font-weight,color,letter-spacing] duration-500 ${
                        on ? "text-titanium-50" : "text-titanium-500 group-hover:text-titanium-300"
                      }`}
                      style={{ fontSize: "clamp(1.55rem, 3.4vw, 3.2rem)", fontWeight: on ? 800 : 250 }}
                    >
                      {s.label}
                    </span>
                    <span className="ml-auto font-mono text-[0.62rem] text-titanium-500">{s.items.length}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div
                        id={`domain-${s.id}`}
                        role="tabpanel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.6, ease }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 pl-8 font-mono text-[0.78rem] leading-[1.9] text-titanium-300">
                          {s.items.map((it, k) => (
                            <span key={it}>
                              {it}
                              {k < s.items.length - 1 && <span className="mx-2 text-titanium-600">/</span>}
                            </span>
                          ))}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sculpture — deliberately bleeds off the right edge */}
        <div className="relative -order-1 h-[46svh] lg:order-none lg:col-span-6 lg:h-auto">
          <div ref={stage} className="h-full w-full lg:sticky lg:top-0 lg:h-[100svh]">
            <LiquidMetal form={FORMS[activeId]} active={visible} />
          </div>
          <p className="label absolute bottom-0 right-0 hidden lg:block">Form · {skills.find((s) => s.id === activeId)?.label}</p>
        </div>
      </div>
    </section>
  );
}
