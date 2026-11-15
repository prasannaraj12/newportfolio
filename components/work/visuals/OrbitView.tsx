"use client";

import { motion, useMotionValueEvent, type MotionValue } from "motion/react";
import { useState } from "react";

type Band = "rgb" | "nir" | "swir" | "sar";

const BANDS: { id: Band; label: string }[] = [
  { id: "sar", label: "SAR (VV)" },
  { id: "swir", label: "SWIR" },
  { id: "nir", label: "Near-infrared" },
  { id: "rgb", label: "RGB composite" },
];

// Per-band appearance of the same schematic ground: fields, river, settlement, forest.
const PALETTE: Record<Band, { field: string[]; water: string; town: string; forest: string; bg: string }> = {
  rgb: { field: ["#d8c8a6", "#cbbb94", "#bfae86", "#d2c49d"], water: "#7f8f8c", town: "#a8968c", forest: "#7d7a58", bg: "#cdbd98" },
  nir: { field: ["#f0e2dd", "#e7d5d2", "#dcc3bf", "#efdcd6"], water: "#2f2427", town: "#9a8584", forest: "#f6ece8", bg: "#e2cdc8" },
  swir: { field: ["#a76a74", "#94545f", "#b98088", "#8a4a56"], water: "#3a1c25", town: "#d2b6a8", forest: "#6d2d3d", bg: "#9b5d68" },
  sar: { field: ["#9d9692", "#8a837f", "#b0a9a4", "#958e89"], water: "#2a2626", town: "#e7e2dc", forest: "#79726e", bg: "#8f8884" },
};

const FIELDS = Array.from({ length: 24 }, (_, i) => {
  const c = i % 6;
  const r = Math.floor(i / 6);
  const j = Math.sin(i * 7.31) * 6;
  return { x: c * 68 + j, y: r * 76 - j * 0.6, w: 70 + Math.cos(i) * 8, h: 78 + Math.sin(i * 2) * 8, k: i % 4 };
});

function Terrain({ band }: { band: Band }) {
  const p = PALETTE[band];
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full" aria-hidden>
      <defs>
        <filter id={`speckle-${band}`}>
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="4" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <rect width="400" height="300" fill={p.bg} />
      {FIELDS.map((f, i) => (
        <rect key={i} x={f.x} y={f.y} width={f.w} height={f.h} fill={p.field[f.k]} stroke={p.bg} strokeWidth="1.5" />
      ))}
      {/* forest, south-west */}
      <path d="M0 210 C 40 190, 90 205, 120 235 S 140 300, 0 300 Z" fill={p.forest} />
      {/* settlement, north-east */}
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={300 + (i % 5) * 16} y={22 + Math.floor(i / 5) * 16} width="11" height="11" fill={p.town} />
      ))}
      {/* river */}
      <path d="M-10 120 C 60 110, 110 150, 170 170 S 260 200, 300 240 S 360 300, 410 290" fill="none" stroke={p.water} strokeWidth="13" strokeLinecap="round" />
      {band === "sar" && <rect width="400" height="300" filter={`url(#speckle-${band})`} fill="#fff" />}
    </svg>
  );
}

const Q1 = "Where is the water in this scene?";
const Q2 = "Describe this scene.";
const CAPTION = "Farmland on both banks of a river, a small settlement to the north-east and woodland to the south-west.";

/** SatQuery: band decomposition → fusion → grounded query → caption (schematic). */
export function OrbitView({ progress }: { progress: MotionValue<number>; active: boolean }) {
  const [p, setP] = useState(0);
  useMotionValueEvent(progress, "change", (v) => setP(Math.round(v * 200) / 200));

  const fuse = Math.min(1, Math.max(0, (p - 0.12) / 0.26));
  const typed1 = Math.round(Math.min(1, Math.max(0, (p - 0.42) / 0.14)) * Q1.length);
  const grounded = p > 0.58;
  const typed2 = Math.round(Math.min(1, Math.max(0, (p - 0.7) / 0.08)) * Q2.length);
  const captioned = p > 0.8;

  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1 [perspective:1500px]">
        <div className="absolute left-1/2 top-1/2 aspect-[4/3] w-[min(86%,520px)] [transform-style:preserve-3d]" style={{ transform: `translate(-50%,-50%) rotateX(${(1 - fuse) * 52}deg) rotateZ(${(1 - fuse) * -28}deg)` }}>
          {BANDS.map((b, i) => (
            <div
              key={b.id}
              className="absolute inset-0 overflow-hidden border border-[#542031]/20 shadow-[0_30px_60px_-30px_rgba(84,32,49,0.5)]"
              style={{ transform: `translateZ(${(i - 3) * 70 * (1 - fuse)}px)`, opacity: b.id === "rgb" ? 1 : 1 - fuse * 0.999 }}
            >
              <Terrain band={b.id} />
              <span className="absolute left-2 top-2 bg-[#F6F0E7]/90 px-1.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#542031]" style={{ opacity: 1 - fuse }}>
                {b.label}
              </span>
            </div>
          ))}
          {/* grounded region */}
          <motion.div
            initial={false}
            animate={{ opacity: grounded ? 1 : 0, scale: grounded ? 1 : 1.15 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute border-2 border-[#782D40]"
            style={{ left: "37%", top: "50%", width: "38%", height: "32%", boxShadow: "0 0 0 9999px rgba(84,32,49,0.28)" }}
          >
            <span className="absolute -top-6 left-0 whitespace-nowrap bg-[#782D40] px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#F6F0E7]">
              Grounded · water
            </span>
          </motion.div>
          {/* north arrow + scale bar, as on a survey plate */}
          <div className="absolute bottom-2 right-2 flex items-end gap-3 bg-[#F6F0E7]/85 px-2 py-1 text-[0.66rem] font-semibold text-[#542031]">
            <span>N ↑</span>
            <span className="flex flex-col items-start">
              <span className="block h-1 w-12 border-x border-b border-[#542031]" />
              schematic
            </span>
          </div>
        </div>
      </div>

      {/* Query console */}
      <div className="grid gap-1.5 border-t border-[#d6c8b9] pt-3 font-mono text-[0.76rem] text-[#542031]">
        <p className="min-h-[1.2em]">
          <span className="text-[#782D40]">query ›</span> {Q1.slice(0, typed1)}
          {typed1 > 0 && typed1 < Q1.length && <span className="animate-pulse">▍</span>}
        </p>
        <p className="min-h-[1.2em]">
          <span className="text-[#782D40]">query ›</span> {Q2.slice(0, typed2)}
        </p>
        <p className={`min-h-[2.4em] font-serif text-[0.95rem] text-[#625A56] transition-opacity duration-500 ${captioned ? "opacity-100" : "opacity-0"}`}>
          <span className="font-mono text-[0.76rem] text-[#782D40]">caption ›</span> {CAPTION}
        </p>
        <p className="font-sans text-[0.66rem] text-[#8a7f78]">Schematic scene and illustrative queries — shows the kind of task SatQuery handles, not live model output.</p>
      </div>
    </div>
  );
}
