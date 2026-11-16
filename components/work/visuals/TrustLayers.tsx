"use client";

import { AnimatePresence, motion, useMotionValueEvent, type MotionValue } from "motion/react";
import { useState } from "react";

/** Layers and responsibilities from the RentYourMate README. */
const LAYERS = [
  {
    id: "apps",
    name: "Apps",
    tech: "Flutter · Flutter Web",
    roles: [
      { who: "Customer app", does: "Service discovery, companion booking, location picking, emergency SOS, disputes" },
      { who: "Companion app", does: "KYC, availability, scheduling, earnings, payouts" },
      { who: "Admin panel", does: "Analytics, KYC approvals, dispute resolution, safety monitoring" },
    ],
  },
  { id: "api", name: "API", tech: "Node.js · Express", roles: [{ who: "REST API", does: "Booking workflow, safety dispatch, dispute escalation" }] },
  { id: "trust", name: "Auth & payments", tech: "Firebase Auth · Razorpay", roles: [{ who: "Trust services", does: "Authentication and payment processing" }] },
  { id: "data", name: "Data", tech: "PostgreSQL", roles: [{ who: "Repository layer", does: "Repository pattern over PostgreSQL" }] },
] as const;

/** Core workflow (RentYourMate product blueprint). */
const FLOW = ["Choose service", "Browse companions", "Booking request", "Companion accepts", "Payment"];

const ease = [0.16, 1, 0.3, 1] as const;

export function TrustLayers({ progress }: { progress: MotionValue<number>; active: boolean }) {
  const [p, setP] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  useMotionValueEvent(progress, "change", (v) => setP(Math.round(v * 100) / 100));

  const explode = Math.min(1, Math.max(0, (p - 0.08) / 0.45));
  const gap = 14 + explode * 58;
  const autoLayer = Math.min(3, Math.max(0, Math.floor((p - 0.3) / 0.12)));
  const focus = hover ?? autoLayer;
  const flowOn = Math.round(Math.min(1, Math.max(0, (p - 0.55) / 0.3)) * FLOW.length);

  return (
    <div className="flex h-full flex-col">
      <div className="relative grid min-h-0 flex-1 grid-cols-[1fr_auto] items-center gap-6">
        {/* Isometric stack */}
        <div className="relative h-full [perspective:1600px]">
          <div className="absolute left-[46%] top-[58%] w-[min(50%,250px)] [transform-style:preserve-3d]" style={{ transform: "translate(-50%, -50%) rotateX(58deg) rotateZ(-40deg)" }}>
            {LAYERS.map((l, i) => {
              const z = (LAYERS.length - 1 - i) * gap + (focus === i ? 22 : 0);
              const shown = p > 0.02 + i * 0.05;
              return (
                <div
                  key={l.id}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  className="absolute inset-x-0 aspect-square transition-[transform,background-color,border-color,opacity] duration-700"
                  style={{
                    transform: `translateZ(${shown ? z : -60}px)`,
                    opacity: shown ? 1 : 0,
                    transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                    background: focus === i ? "rgba(116,31,56,0.9)" : i === 0 ? "rgba(237,227,216,0.95)" : `rgba(116,31,56,${0.08 + i * 0.07})`,
                    border: `1px solid ${focus === i ? "#4d1025" : "#cbbcad"}`,
                    boxShadow: "0 30px 50px -30px rgba(84,32,49,0.45)",
                  }}
                >
                  {l.id === "apps" && (
                    <div className="absolute inset-[12%] grid grid-cols-3 gap-[6%]">
                      {[0, 1, 2].map((k) => (
                        <div key={k} className={`border ${focus === i ? "border-[#f7f1e9]/50" : "border-[#741f38]/30"}`} />
                      ))}
                    </div>
                  )}
                  {l.id !== "apps" && <div className={`absolute inset-[14%] border border-dashed ${focus === i ? "border-[#f7f1e9]/40" : "border-[#741f38]/25"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <ol className="w-[13.5rem] space-y-3">
          {LAYERS.map((l, i) => (
            <li key={l.id}>
              <button
                type="button"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className={`w-full border-l-2 pl-3 text-left transition-colors ${focus === i ? "border-[#741f38]" : "border-[#e4d5ca]"}`}
              >
                <span className={`block text-[0.62rem] font-semibold uppercase tracking-[0.18em] ${focus === i ? "text-[#741f38]" : "text-[#8a7f78]"}`}>
                  {String(i + 1).padStart(2, "0")} {l.name}
                </span>
                <span className="block font-editorial text-[1.15rem] leading-tight text-[#4d1025]">{l.tech}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* Responsibilities of the focused layer */}
      <div className="min-h-[5.5rem] border-t border-[#e4d5ca] pt-3">
        <AnimatePresence mode="wait">
          <motion.ul
            key={LAYERS[focus].id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease }}
            className="grid gap-x-6 gap-y-1.5 text-[0.8rem] leading-snug text-[#625A56] sm:grid-cols-3"
          >
            {LAYERS[focus].roles.map((r) => (
              <li key={r.who}>
                <span className="block text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-[#741f38]">{r.who}</span>
                {r.does}
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>

      {/* Trust workflow */}
      <ol className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.72rem]">
        {FLOW.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span className={`px-2 py-1 transition-colors duration-500 ${i < flowOn ? "bg-[#741f38] text-[#f7f1e9]" : "border border-[#e4d5ca] text-[#8a7f78]"}`}>{s}</span>
            {i < FLOW.length - 1 && <span className={i < flowOn - 1 ? "text-[#741f38]" : "text-[#cbbcad]"}>→</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
