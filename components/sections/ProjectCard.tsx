"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { Project } from "@/lib/content";

/** A project rendered as a celestial body: orb + orbits + data panel. Tilts toward the cursor. */
export function ProjectCard({ project, hue }: { project: Project; hue: number }) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 150, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 150, damping: 20 });
  const light = useTransform(
    [mx, my],
    ([x, y]: number[]) =>
      `radial-gradient(420px circle at ${x * 100}% ${y * 100}%, rgb(94 160 255 / 0.12), transparent 60%)`,
  );

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.article
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      className="panel group relative flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] p-6 md:p-9"
      data-project
    >
      {/* Cursor light */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: light }}
      />

      {/* Celestial body */}
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[22rem] md:-right-16 md:-top-16 md:size-[26rem]">
        <div className="absolute inset-[22%] rounded-full border border-hairline-strong [animation:nv-spin_38s_linear_infinite]" />
        <div className="absolute inset-[8%] rounded-full border border-dashed border-hairline [animation:nv-spin_60s_linear_infinite_reverse]" />
        <div
          className="absolute inset-[34%] rounded-full transition-transform duration-700 ease-[var(--ease-cinematic)] group-hover:scale-110"
          style={{
            background: `radial-gradient(circle at 32% 28%, #f4f6f9 0%, #a2abb9 18%, hsl(${hue} 70% 32%) 55%, #030405 82%)`,
            boxShadow: `0 0 80px 10px hsl(${hue} 90% 55% / 0.22), inset -18px -24px 40px rgb(0 0 0 / 0.7)`,
          }}
        />
        <div className="absolute inset-[22%] [animation:nv-spin_14s_linear_infinite]">
          <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-volt-bright shadow-[0_0_14px_3px_rgb(94_160_255/0.8)]" />
        </div>
      </div>

      <div className="relative flex items-center gap-3">
        <span className="font-mono text-xs text-volt-bright">{project.index}</span>
        <span className="h-px w-8 bg-hairline-strong" />
        <span className="label">{project.org ?? "Independent"}</span>
      </div>

      <div className="relative mt-auto pt-40">
        <h3 className="font-display text-[clamp(2.2rem,4.4vw,4rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-titanium-50">
          {project.title}
        </h3>
        <p className="mt-2 font-serif text-xl italic text-titanium-300">{project.subtitle}</p>
        <p className="mt-5 max-w-xl text-[0.92rem] leading-relaxed text-titanium-400">{project.description}</p>

        <ul className="mt-6 grid gap-2 border-t border-hairline pt-5 sm:grid-cols-3">
          {project.facts.map((f) => (
            <li key={f} className="flex items-start gap-2 text-[0.8rem] leading-snug text-titanium-200">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-volt-bright" />
              {f}
            </li>
          ))}
        </ul>

        <ul className="mt-5 flex flex-wrap gap-1.5">
          {project.stack.map((s) => (
            <li
              key={s}
              className="rounded-full border border-hairline px-2.5 py-1 font-mono text-[0.65rem] tracking-wide text-titanium-300"
            >
              {s}
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}
