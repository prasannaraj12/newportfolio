"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { archive as all, type ArchiveProject } from "@/lib/content";

// TRUST-CV has its own exhibit; the archive holds the rest.
const archive = all.filter((p) => p.id !== "trust-cv");

const ease = [0.16, 1, 0.3, 1] as const;

/** The Archive: an index of further systems with a live technical preview. */
export function Archive() {
  const [activeId, setActiveId] = useState(archive[0].id);
  const active = archive.find((p) => p.id === activeId) ?? archive[0];

  return (
    <article data-exhibit className="theme-rose relative py-24 md:py-36">
      <div className="container-noir">
        <div data-exhibit-reveal className="mb-14 grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.12em] text-titanium-400">
              <span className="text-volt-bright">The Archive</span> / {String(archive.length).padStart(2, "0")} further systems
            </p>
            <h3
              className="mt-5 font-display font-extrabold leading-[0.9] tracking-[-0.05em] text-titanium-50"
              style={{ fontSize: "clamp(2.6rem, 5.2vw, 5.6rem)" }}
            >
              More from the lab.
            </h3>
          </div>
          <p className="font-serif text-2xl leading-snug text-titanium-400 lg:col-span-4 lg:col-start-9">
            Hover a title to open its pipeline.
          </p>
        </div>

        <div data-exhibit-reveal className="grid gap-12 lg:grid-cols-12">
          <ol className="border-t border-hairline lg:col-span-6" aria-label="Archive projects">
            {archive.map((p, i) => {
              const on = p.id === activeId;
              return (
                <li key={p.id} className="border-b border-hairline">
                  <button
                    type="button"
                    onMouseEnter={() => setActiveId(p.id)}
                    onFocus={() => setActiveId(p.id)}
                    onClick={() => setActiveId(p.id)}
                    aria-expanded={on}
                    className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-3 py-5 text-left"
                  >
                    <span className={`font-mono text-[0.62rem] transition-colors ${on ? "text-volt-bright" : "text-titanium-500"}`}>
                      {String(i + 6).padStart(2, "0")}
                    </span>
                    <span>
                      <span
                        className={`block font-display text-[clamp(1.4rem,2.6vw,2.3rem)] leading-[1.05] tracking-[-0.035em] transition-[color,transform] duration-500 ease-[var(--ease-cinematic)] ${
                          on ? "translate-x-2 font-semibold text-titanium-50" : "font-light text-titanium-400 group-hover:text-titanium-200"
                        }`}
                      >
                        {p.title}
                      </span>
                      <span className="mt-1 block text-[0.7rem] uppercase tracking-[0.1em] text-titanium-500">{p.domain}</span>
                    </span>
                    <span className={`size-2 rotate-45 border transition-colors ${on ? "border-volt-bright bg-volt-bright" : "border-titanium-600"}`} />
                  </button>

                  {/* Inline preview on small screens */}
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease }}
                        className="overflow-hidden lg:hidden"
                      >
                        <div className="pb-8 pl-10">
                          <Preview project={p} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ol>

          {/* Sticky preview on large screens */}
          <div className="hidden lg:col-span-5 lg:col-start-8 lg:block">
            <div className="sticky top-28">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 24, clipPath: "inset(0 0 100% 0)" }}
                  animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.6, ease }}
                >
                  <Preview project={active} large />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function Preview({ project: p, large }: { project: ArchiveProject; large?: boolean }) {
  return (
    <div>
      {large && (
        <>
          <p className="font-serif text-[1.6rem] leading-snug text-titanium-100">{p.subtitle}</p>
          {p.context && <p className="label mt-2 text-[0.6rem]">{p.context}</p>}
        </>
      )}
      {!large && <p className="font-serif text-lg text-titanium-200">{p.subtitle}</p>}
      <p className="mt-5 max-w-lg text-[0.93rem] leading-relaxed text-titanium-400">{p.overview}</p>

      {/* Pipeline */}
      <ol className="relative mt-7">
        <motion.span
          aria-hidden
          className="absolute bottom-3 left-[5px] top-3 w-px origin-top bg-titanium-500"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.9, ease }}
        />
        {p.pipeline.map((step, i) => (
          <motion.li
            key={step}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 + i * 0.07, duration: 0.5, ease }}
            className="relative flex items-baseline gap-4 py-1.5"
          >
            <span className="relative z-10 size-[11px] shrink-0 translate-y-[1px] rounded-full border border-titanium-400 bg-void" />
            <span className="font-mono text-[0.6rem] text-titanium-500">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-[0.88rem] text-titanium-100">{step}</span>
          </motion.li>
        ))}
      </ol>

      <p className="mt-6 text-[0.78rem] leading-relaxed text-titanium-500">
        <span className="font-medium">Built with — </span>
        {p.stack.join(" / ")}
      </p>

      {p.link && (
        <a
          href={p.link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-6 inline-flex items-center gap-2 border-b border-titanium-500 pb-1 text-sm text-titanium-100 transition-colors hover:border-titanium-50 hover:text-white"
        >
          {p.link.label}
          <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      )}
    </div>
  );
}
