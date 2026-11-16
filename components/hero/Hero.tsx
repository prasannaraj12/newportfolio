"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight, Award, CodeXml, Layers, Trophy } from "lucide-react";
import { achievements, archive, hero, portraits, profile, resumeUrl } from "@/lib/content";
import { work } from "@/lib/work";
import { MagneticLink } from "@/components/ui/MagneticLink";

const ease = [0.16, 1, 0.3, 1] as const;

// Every figure is counted from the content files, never typed in.
const projectCount = work.length + archive.filter((p) => p.id !== "trust-cv" && p.id !== "satquery").length;
const hackathonCount = achievements.hackathons.length;
const metrics = [
  { icon: Layers, value: projectCount >= 10 ? "10+" : String(projectCount), label: "Projects" },
  { icon: Trophy, value: hackathonCount > 3 ? "3+" : String(hackathonCount), label: "Hackathons" },
  { icon: Award, value: String(achievements.certifications.length), label: "Certifications" },
];

/* ── The portrait card: two rounded quadrilaterals drawn in one SVG ── */
type Pt = [number, number];

/** A closed path through `pts` with every corner rounded by `r`. */
function roundedQuad(pts: Pt[], r: number) {
  const n = pts.length;
  const toward = (a: Pt, b: Pt, d: number): Pt => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    return [a[0] + (dx / len) * d, a[1] + (dy / len) * d];
  };
  let d = "";
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const a = toward(cur, prev, r);
    const b = toward(cur, next, r);
    d += `${i === 0 ? "M" : "L"}${a[0].toFixed(1)},${a[1].toFixed(1)} Q${cur[0]},${cur[1]} ${b[0].toFixed(1)},${b[1].toFixed(1)} `;
  }
  return `${d}Z`;
}

const VB = { w: 680, h: 720 };
// Front card leans: its left edge slants and its top edge rises to the right.
const FRONT: Pt[] = [[196, 90], [668, 8], [668, 640], [76, 702]];
const BACK: Pt[] = [[60, 152], [430, 30], [588, 714], [72, 714]];
const FRONT_D = roundedQuad(FRONT, 50);
const BACK_D = roundedQuad(BACK, 46);

/**
 * The cover. Left: name, role, a two-line serif headline, the way in and
 * the record. Right: the portrait on a leaning card over a burgundy plane,
 * with a small glass caption and a vertical signature line.
 */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end start"] });
  const backY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -24]);


  const rise = (delay: number) =>
    reduced ? {} : { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, transition: { duration: 1, ease, delay } };
  const line = (delay: number) =>
    reduced ? {} : { initial: { y: "105%" }, animate: { y: "0%" }, transition: { duration: 1.2, ease, delay } };

  return (
    <section
      ref={section}
      id="top"
      aria-label="Introduction"
      className="theme-ivory relative overflow-hidden bg-[radial-gradient(55%_60%_at_74%_82%,rgba(183,123,133,0.16),transparent_70%),linear-gradient(180deg,#fbf5f1,#f7f1e9)] lg:min-h-[100svh]"
    >
      <div className="container-wide grid gap-x-8 gap-y-16 pb-16 pt-32 lg:min-h-[100svh] lg:grid-cols-12 lg:items-center lg:pb-14 lg:pt-28">
        {/* ───── Introduction ───── */}
        <div className="relative z-10 min-w-0 lg:col-span-6">
          <motion.div {...rise(0.15)}>
            <p className="flex items-center gap-5">
              <span className="text-[0.85rem] font-semibold uppercase tracking-[0.38em] text-burgundy sm:text-[1rem] sm:tracking-[0.45em]">{profile.name}.</span>
              <span aria-hidden className="h-px w-16 bg-burgundy/60 sm:w-24" />
            </p>
            <p className="mt-4 text-[1.08rem] text-espresso/80">{hero.role}</p>
          </motion.div>

          <h1 className="mt-10 font-serif font-semibold leading-[1.08] tracking-[-0.025em] text-espresso lg:mt-14" style={{ fontSize: "clamp(2.45rem, 4.15vw, 4.8rem)" }}>
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span className="block lg:whitespace-nowrap" {...line(0.3)}>
                Building Intelligent,
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span className="block lg:whitespace-nowrap" {...line(0.42)}>
                <span className="text-burgundy">Real-World AI</span> Solutions.
              </motion.span>
            </span>
          </h1>

          <motion.p {...rise(0.65)} className="mt-8 max-w-[38rem] text-[1.08rem] leading-[1.55] text-titanium-300 sm:text-[1.18rem]">
            {hero.intro}
          </motion.p>

          <motion.div {...rise(0.78)} className="mt-10 flex flex-wrap items-center gap-4 sm:gap-6">
            <MagneticLink
              href="#laboratory"
              variant="primary"
              className="h-14 !rounded-md px-9 text-[1rem] font-semibold shadow-[0_16px_28px_-18px_rgba(77,16,37,0.8)] hover:shadow-[0_22px_34px_-18px_rgba(77,16,37,0.85)] sm:px-11"
            >
              View Selected Work <ArrowUpRight className="size-[18px]" />
            </MagneticLink>
            <MagneticLink
              href={resumeUrl}
              external
              className="h-14 !rounded-md border-2 !border-burgundy px-9 text-[1rem] font-semibold !text-[#4d1025] hover:bg-burgundy/5 sm:px-11"
            >
              Résumé <ArrowUpRight className="size-[18px]" />
            </MagneticLink>
          </motion.div>

          {/* The record */}
          <motion.ul {...rise(0.92)} aria-label="Record" className="mt-14 grid grid-cols-3 sm:flex sm:items-stretch lg:mt-20">
            {metrics.map(({ icon: Icon, value, label }, i) => (
              <li key={label} className={`flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-5 ${i > 0 ? "border-l border-line pl-4 sm:ml-12 sm:pl-12" : ""}`}>
                <Icon aria-hidden className="size-7 shrink-0 stroke-[1.3] text-burgundy sm:size-10" />
                <span>
                  <span className="block font-display text-[1.35rem] font-bold leading-none tracking-[-0.02em] text-burgundy sm:text-[1.7rem]">{value}</span>
                  <span className="mt-1.5 block text-[0.82rem] text-espresso/80 sm:text-[1.02rem]">{label}</span>
                </span>
              </li>
            ))}
          </motion.ul>
        </div>

        {/* ───── Portrait card ───── */}
        <div className="relative min-w-0 lg:col-span-6">
          <div className="relative mx-auto w-full max-w-[34rem] lg:ml-[7%] lg:mr-0 lg:w-[min(85%,42rem,calc((100svh-9rem)*0.944))] lg:max-w-none">
            <motion.svg
              viewBox={`0 0 ${VB.w} ${VB.h}`}
              role="img"
              aria-label={`${profile.name}, ${hero.role}`}
              className="relative block h-auto w-full overflow-visible"
              {...(reduced ? {} : { initial: { opacity: 0, scale: 0.97 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 1.5, ease, delay: 0.3 } })}
            >
              <defs>
                <linearGradient id="hero-back" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#8a2a47" />
                  <stop offset="1" stopColor="#4d1025" />
                </linearGradient>
                <linearGradient id="hero-rim" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#ffffff" stopOpacity="0.75" />
                  <stop offset="1" stopColor="#e8c9c9" stopOpacity="0.35" />
                </linearGradient>
                <clipPath id="hero-front">
                  <path d={FRONT_D} />
                </clipPath>
                <filter id="hero-shadow" x="-20%" y="-20%" width="140%" height="150%">
                  <feDropShadow dx="0" dy="26" stdDeviation="26" floodColor="#4d1025" floodOpacity="0.32" />
                </filter>
              </defs>

              {/* burgundy plane behind */}
              <motion.path d={BACK_D} fill="url(#hero-back)" filter="url(#hero-shadow)" style={{ y: backY }} />

              {/* the photograph on the leaning card */}
              <motion.g style={{ y: cardY }} filter="url(#hero-shadow)">
                <path d={FRONT_D} fill="#2a1a1c" />
                <image
                  href={portraits.hero.src}
                  x={FRONT[3][0]}
                  y={FRONT[1][1]}
                  width={FRONT[1][0] - FRONT[3][0]}
                  height={FRONT[3][1] - FRONT[1][1]}
                  preserveAspectRatio="xMidYMin slice"
                  clipPath="url(#hero-front)"
                />
                {/* warm light from the upper right */}
                <path d={FRONT_D} fill="url(#hero-warm)" opacity="0.5" />
                <path d={FRONT_D} fill="none" stroke="url(#hero-rim)" strokeWidth="2.5" />
              </motion.g>
              <defs>
                <radialGradient id="hero-warm" cx="0.8" cy="0.15" r="0.7">
                  <stop offset="0" stopColor="#f3d7c4" stopOpacity="0.35" />
                  <stop offset="1" stopColor="#f3d7c4" stopOpacity="0" />
                </radialGradient>
              </defs>
            </motion.svg>

            {/* glass caption */}
            <motion.div
              {...(reduced ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 1, ease, delay: 1.1 } })}
              className="absolute left-[0.5%] top-[68.5%] w-[37%] min-w-[12.5rem] rounded-xl border border-white/30 bg-[rgba(124,52,72,0.55)] px-[5%] py-[4%] text-white shadow-[0_20px_40px_-24px_rgba(41,35,34,0.6)] backdrop-blur-md"
            >
              <CodeXml aria-hidden className="size-6 stroke-[1.6] sm:size-8" />
              <p className="mt-2 font-display text-[1rem] font-semibold leading-tight sm:text-[1.3rem]">AI Systems</p>
              <p className="mt-1 whitespace-nowrap text-[0.72rem] text-white/85 sm:text-[0.86rem]">
                Build <span className="mx-1">·</span> Train <span className="mx-1">·</span> Deploy
              </p>
            </motion.div>
          </div>

          {/* vertical signature line */}
          <motion.div
            aria-hidden
            {...rise(1.2)}
            className="absolute right-0 bottom-[12%] top-[14%] hidden flex-col items-center gap-4 lg:flex"
          >
            <span className="size-1.5 rounded-full bg-burgundy" />
            <span className="w-px flex-1 bg-espresso/60" />
            <span className="whitespace-nowrap text-[0.68rem] font-medium uppercase tracking-[0.24em] text-espresso/80 [writing-mode:vertical-rl] rotate-180">
              {hero.role} · {profile.name}.
            </span>
            <span className="w-px flex-1 bg-espresso/60" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
