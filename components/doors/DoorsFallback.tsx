"use client";

import { motion } from "motion/react";
import { doors } from "@/lib/content";

const ease = [0.65, 0, 0.35, 1] as const;

/**
 * Lightweight version (phones, reduced motion, no WebGL): CSS double doors
 * that swing open in perspective as each experience scrolls into view.
 */
export function DoorsFallback() {
  return (
    <div className="container-noir py-24 md:py-32">
      <p className="label">Experience</p>
      <h2 className="mt-5 font-display font-bold leading-[0.92] tracking-[-0.045em] text-burgundy" style={{ fontSize: "clamp(2.6rem, 9vw, 6rem)" }}>
        Every experience
        <br />
        <span className="font-extralight">opens a new door.</span>
      </h2>
      <p className="mt-5 max-w-md font-serif text-[1.2rem] leading-snug text-espresso">
        Three experiences. Three different environments. One continuous journey of learning and building.
      </p>

      <ol className="mt-16 space-y-20">
        {doors.map((d) => (
          <li key={d.id}>
            <motion.div initial="closed" whileInView="open" viewport={{ once: true, amount: 0.45 }} className="grid gap-8 md:grid-cols-2 md:items-center">
              {/* The door */}
              <div className="relative mx-auto aspect-[3/4.6] w-full max-w-[19rem] [perspective:1100px]">
                {/* what is behind the door */}
                <div className={`absolute inset-0 flex flex-col justify-end p-6 ${d.id === "1m1b" ? "bg-[#a7b39b]" : "bg-rose"}`}>
                  <p className="text-[0.72rem] font-medium uppercase tracking-[0.12em] text-burgundy">{d.environment}</p>
                </div>
                {/* stone frame */}
                <div className="pointer-events-none absolute -inset-3 border-[12px] border-[#f6f2ea] shadow-[inset_0_0_0_1px_rgb(64_54_56/0.12)]" />
                {(["left", "right"] as const).map((side) => (
                  <motion.div
                    key={side}
                    variants={{ closed: { rotateY: 0 }, open: { rotateY: side === "left" ? -100 : 100 } }}
                    transition={{ duration: 1.6, ease, delay: 0.35 }}
                    style={{ transformOrigin: side === "left" ? "left center" : "right center" }}
                    className={`absolute inset-y-0 w-1/2 ${side === "left" ? "left-0" : "right-0"} ${d.id === "1m1b" ? "bg-[#7d4250]" : "bg-burgundy"} [backface-visibility:hidden]`}
                  >
                    <div className="absolute inset-x-4 top-[10%] h-[36%] border border-ivory/15" />
                    <div className="absolute inset-x-4 bottom-[8%] h-[40%] border border-ivory/15" />
                    <span className={`absolute top-1/2 h-1 w-6 rounded-full bg-gold ${side === "left" ? "right-3" : "left-3"}`} />
                  </motion.div>
                ))}
                {/* nameplate */}
                <p className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gold px-3 py-1 font-serif text-[0.85rem] text-espresso">{d.plate}</p>
              </div>

              {/* The story */}
              <motion.div
                variants={{ closed: { opacity: 0, y: 24 }, open: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.9, ease, delay: 0.9 }}
              >
                <p className="font-display text-5xl font-extralight leading-none text-burgundy">{d.number}</p>
                <h3 className="mt-3 font-display text-2xl font-bold leading-tight tracking-[-0.02em] text-burgundy">{d.company}</h3>
                <p className="mt-1 text-espresso">{d.role}</p>
                <p className="text-[0.8rem] text-titanium-400">{d.period}</p>
                <p className="mt-4 font-serif text-[1.1rem] leading-snug text-espresso">{d.summary}</p>
                <ul className="mt-5 space-y-4 border-t border-hairline pt-5">
                  {d.panels.map((p) => (
                    <li key={p.id}>
                      <p className="text-[0.72rem] font-medium uppercase tracking-[0.12em] text-gold">{p.kicker}</p>
                      <p className="mt-1 text-[0.92rem] text-espresso">{p.body}</p>
                      {p.points && <p className="mt-1 text-[0.85rem] text-titanium-400">{p.points.join(" · ")}</p>}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          </li>
        ))}
      </ol>
    </div>
  );
}
