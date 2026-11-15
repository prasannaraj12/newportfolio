"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ArrowDownRight } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { doors } from "@/lib/content";
import { useLenis } from "@/components/providers/SmoothScroll";
import { ASSEMBLIES, initialDriver, key, toWorld, type DoorsDriver } from "./layout";
import { DoorsFallback } from "./DoorsFallback";

const DoorsScene = dynamic(() => import("./DoorsScene"), { ssr: false });

const PX_PER_UNIT = 260;

type Marks = { door: number[]; finale: number; total: number };

/**
 * One scrubbed timeline drives the camera, doors, lights, rooms and copy.
 * Scrolling backwards plays every step in reverse.
 */
function buildTimeline(tl: gsap.core.Timeline, d: DoorsDriver): Marks {
  const marks: Marks = { door: [], finale: 0, total: 0 };
  const show = (sel: string, start: number, end: number) => {
    tl.fromTo(sel, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, start);
    tl.to(sel, { autoAlpha: 0, y: -18, duration: 0.45, ease: "power2.in" }, end - 0.45);
  };

  // Opening — the corridor
  tl.to(d, { z: -1.6, pitch: 0.03, duration: 2.2, ease: "power1.inOut" }, 0);
  tl.to("[data-ov='intro']", { autoAlpha: 0, y: -20, duration: 0.6, ease: "power2.in" }, 1.5);
  let t = 2.2;

  ASSEMBLIES.forEach((a, i) => {
    const yawDoor = a.rotY;
    const front = toWorld(a, 0, 4.3);
    const near = toWorld(a, 0, 2.3);
    const inside = toWorld(a, 0, -3.2);
    const back = toWorld(a, 0, 3.6);
    const H = key(i, "h");
    const D = key(i, "d");
    const L = key(i, "l");
    const R = key(i, "r");

    marks.door.push(t);
    tl.addLabel(`door${i}`, t);

    // Approach: walk the corridor and turn to face the door
    tl.to(d, { x: front.x, z: front.z, duration: 2, ease: "power1.inOut" }, t);
    tl.to(d, { yaw: yawDoor, pitch: 0.17, duration: 1.4, ease: "power2.inOut" }, t + 0.6);
    tl.to(d, { [L]: 1, duration: 1.2, ease: "power1.inOut" }, t + 0.8);
    const labelStart = t + 0.9;
    t += 2;

    // Focus on the handles
    tl.to(d, { x: near.x, z: near.z, pitch: 0.02, duration: 1, ease: "power1.inOut" }, t);
    t += 1;
    // Unlock: levers drop, bolt slides
    tl.to(d, { [H]: 1, duration: 0.8, ease: "power2.inOut" }, t);
    t += 0.8;
    // Open on the hinges
    tl.to(d, { [D]: 1, duration: 1.8, ease: "power1.inOut" }, t);
    t += 1.2;
    // Walk through
    tl.to(d, { x: inside.x, z: inside.z, duration: 2, ease: "power1.inOut" }, t);
    tl.to(d, { [L]: 0, duration: 1 }, t + 1);
    show(`[data-ov='door${i}']`, labelStart, t + 1.2);
    t += 2;

    // Explore the environment
    const explore = 3.6;
    tl.to(d, { [R]: 1, duration: explore, ease: "none" }, t);
    if (i === 0) {
      tl.to(d, { yaw: yawDoor + 0.6, duration: 0.8, ease: "power2.inOut" }, t);
      tl.to(d, { yaw: yawDoor, duration: 0.8, ease: "power2.inOut" }, t + 1.3);
      tl.to(d, { yaw: yawDoor - 0.6, duration: 0.8, ease: "power2.inOut" }, t + 2.5);
      doors[0].panels.forEach((p, k) => show(`[data-ov='p0-${k}']`, t + k * 1.2 + 0.1, t + (k + 1) * 1.2 + 0.1));
    } else {
      tl.to(d, { yaw: yawDoor + 0.28, duration: 1.6, ease: "power2.inOut" }, t);
      tl.to(d, { yaw: yawDoor - 0.22, duration: 1.6, ease: "power2.inOut" }, t + 1.9);
      show(`[data-ov='p${i}-0']`, t + 0.2, t + explore);
    }
    t += explore;

    // Exit: step back, the door closes, turn back down the corridor
    tl.to(d, { x: back.x, z: back.z, yaw: yawDoor, duration: 1.8, ease: "power1.inOut" }, t);
    t += 1.8;
    tl.to(d, { [D]: 0, [H]: 0, duration: 1.2, ease: "power1.inOut" }, t);
    tl.to(d, { yaw: 0, pitch: 0.04, x: 0, duration: 1.2, ease: "power2.inOut" }, t + 0.4);
    t += 1.6;
  });

  // Final destination — the atrium, then look back at the three doors
  marks.finale = t;
  tl.addLabel("finale", t);
  tl.to(d, { z: -52, x: 0, duration: 3, ease: "power1.inOut" }, t);
  t += 3;
  tl.to(d, { yaw: Math.PI, z: -55, pitch: 0.06, duration: 2.2, ease: "power2.inOut" }, t);
  tl.to(d, { fin: 1, duration: 1.4 }, t + 0.6);
  tl.fromTo("[data-ov='finale']", { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.8 }, t + 1.2);
  t += 2.6;
  // Hold the final frame so the timeline ends exactly at t (scroll ↔ time stay 1:1).
  tl.set({}, {}, t);
  marks.total = tl.duration();
  return marks;
}

export function DoorsExperience() {
  const [mode, setMode] = useState<"3d" | "lite" | null>(null);

  useEffect(() => {
    const gl = (() => {
      try {
        const c = document.createElement("canvas");
        return !!(c.getContext("webgl2") || c.getContext("webgl"));
      } catch {
        return false;
      }
    })();
    const small = window.matchMedia("(max-width: 767px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- capability probe on the client
    setMode(gl && !small && !reduced ? "3d" : "lite");
  }, []);

  return (
    <section id="experience" aria-label="Experience" className="theme-ivory relative">
      {mode === "3d" ? <Cinematic /> : mode === "lite" ? <DoorsFallback /> : <div className="h-[100svh]" />}
    </section>
  );
}

function Cinematic() {
  const pin = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const [driver] = useState<DoorsDriver>(initialDriver);
  const [active, setActive] = useState(false);
  const [current, setCurrent] = useState(-1);
  const st = useRef<ScrollTrigger | null>(null);
  const marks = useRef<Marks | null>(null);

  useEffect(() => {
    const el = pin.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power1.inOut" } });
      const m = buildTimeline(tl, driver);
      marks.current = m;
      st.current = ScrollTrigger.create({
        trigger: pin.current,
        start: "top top",
        end: `+=${Math.round(m.total * PX_PER_UNIT)}`,
        pin: true,
        scrub: 0.9,
        animation: tl,
        anticipatePin: 1,
        onUpdate: (self) => {
          const time = self.progress * m.total;
          let idx = -1;
          m.door.forEach((s, k) => {
            if (time >= s - 0.2) idx = k;
          });
          if (time >= m.finale - 0.2) idx = 3;
          setCurrent((c) => (c === idx ? c : idx));
        },
      });
      // This trigger mounts after the sections around it (client-only), so
      // re-sort every trigger into page order before refreshing; otherwise pins
      // above and below compute their spacing against stale positions.
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    },
    { scope: pin },
  );

  const jump = (label: number) => {
    const s = st.current;
    const m = marks.current;
    if (!s || !m) return;
    const time = label === 3 ? m.finale : m.door[label] + 0.01;
    const y = s.start + (time / m.total) * (s.end - s.start);
    if (lenis) lenis.scrollTo(y, { duration: 1.8 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  const goProjects = (e: React.MouseEvent) => {
    e.preventDefault();
    if (lenis) lenis.scrollTo("#laboratory", { duration: 1.8 });
    else document.getElementById("laboratory")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div ref={pin} className="relative h-[100svh] overflow-hidden bg-[#efe8dc]">
      {/* Full text of the experience for screen readers, copy and search —
          the visible overlays below are timed to the camera and hidden otherwise. */}
      <div className="sr-only">
        <h3>Internship experience</h3>
        <ol>
          {doors.map((d) => (
            <li key={d.id}>
              <h4>
                {d.role}, {d.company}
              </h4>
              <p>{d.period}</p>
              <p>{d.summary}</p>
              {d.panels.map((p) => (
                <div key={p.id}>
                  <p>
                    {p.title}. {p.body}
                  </p>
                  {p.points && (
                    <ul>
                      {p.points.map((pt) => (
                        <li key={pt}>{pt}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </li>
          ))}
        </ol>
      </div>
      <div className="absolute inset-0">
        <DoorsScene driver={driver} active={active} />
      </div>

      {/* Copy layer */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {/* Opening */}
        <div data-ov="intro" className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-[#efe8dc]/90 via-[#efe8dc]/40 to-transparent">
          <div className="container-noir pt-[18svh]">
            <p className="label">Experience</p>
            <h2 className="mt-5 font-display font-bold leading-[0.9] tracking-[-0.045em] text-burgundy" style={{ fontSize: "clamp(3rem, 7vw, 7.6rem)" }}>
              Every experience
              <br />
              <span className="font-extralight">opens a new door.</span>
            </h2>
            <p className="mt-6 max-w-md font-serif text-[1.3rem] leading-snug text-espresso">
              Three experiences. Three different environments. One continuous journey of learning and building.
            </p>
            <p className="mt-8 text-[0.8rem] font-medium uppercase tracking-[0.14em] text-titanium-400">Scroll to enter ↓</p>
          </div>
        </div>

        {/* Door labels */}
        {doors.map((d, i) => (
          <div key={d.id} aria-hidden data-ov={`door${i}`} className="invisible absolute bottom-[7svh] left-[var(--gutter)] max-w-sm border-l-2 border-gold bg-ivory/92 px-6 py-5">
            <p className="font-display text-5xl font-extralight leading-none text-burgundy">{d.number}</p>
            <p className="mt-3 font-display text-xl font-bold leading-tight tracking-[-0.02em] text-burgundy">{d.company}</p>
            <p className="mt-1 text-[0.92rem] text-espresso">{d.role}</p>
            <p className="mt-1 text-[0.78rem] text-titanium-400">{d.period}</p>
          </div>
        ))}

        {/* Room panels */}
        {doors.map((d, i) =>
          d.panels.map((p, k) => (
            <div
              key={p.id}
              aria-hidden
              data-ov={`p${i}-${k}`}
              className={`invisible absolute bottom-[8svh] max-w-[25rem] bg-ivory/94 px-7 py-6 shadow-[0_30px_60px_-30px_rgb(64_54_56/0.35)] ${
                i === 0 && k === 0 ? "right-[var(--gutter)]" : i === 0 && k === 2 ? "left-[var(--gutter)]" : "right-[var(--gutter)]"
              }`}
            >
              <p className="text-[0.72rem] font-medium uppercase tracking-[0.12em] text-gold">
                {d.environment} · {p.kicker}
              </p>
              <p className="mt-3 font-display text-[1.6rem] font-bold leading-[1.05] tracking-[-0.025em] text-burgundy">{p.title}</p>
              <p className="mt-3 font-serif text-[1.08rem] leading-snug text-espresso">{p.body}</p>
              {p.points && (
                <ul className="mt-4 grid grid-cols-2 gap-x-5 gap-y-1.5 border-t border-hairline pt-4 text-[0.85rem] text-espresso">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-baseline gap-2">
                      <span className="size-1.5 shrink-0 rotate-45 bg-burgundy" />
                      {pt}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )),
        )}

        {/* Finale */}
        <div data-ov="finale" className="invisible absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#efe8dc] via-[#efe8dc]/85 to-transparent pb-[9svh] pt-40">
          <div className="container-noir">
            <h3 className="font-display font-bold uppercase leading-[0.9] tracking-[-0.04em] text-burgundy" style={{ fontSize: "clamp(2.4rem, 5.6vw, 6rem)" }}>
              Three doors.
              <br />
              <span className="font-extralight">Countless lessons.</span>
              <br />
              More to build<span className="text-gold">.</span>
            </h3>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
              <p className="max-w-md font-serif text-[1.2rem] leading-snug text-espresso">
                Every experience has shaped the way I approach engineering, problem-solving and intelligent systems.
              </p>
              <a
                href="#laboratory"
                onClick={goProjects}
                className="pointer-events-auto inline-flex items-center gap-2 bg-burgundy px-6 py-3.5 text-[0.95rem] font-medium text-ivory transition-colors hover:bg-[#5a2230]"
              >
                Explore my projects <ArrowDownRight className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Jump navigation */}
      <nav aria-label="Experience doors" className="absolute right-[var(--gutter)] top-1/2 z-20 hidden -translate-y-1/2 lg:block">
        <ol className="space-y-3 text-right">
          {[...doors.map((d) => ({ n: d.number, label: d.company.split(" ")[0] === "1M1B" ? "1M1B" : d.company.split(" ").slice(0, 2).join(" ") })), { n: "→", label: "Finale" }].map(
            (it, i) => (
              <li key={it.label}>
                <button
                  type="button"
                  onClick={() => jump(i)}
                  className={`group inline-flex items-center gap-3 text-[0.8rem] transition-colors ${
                    current === i ? "text-burgundy" : "text-titanium-400 hover:text-burgundy"
                  }`}
                >
                  <span className={`transition-opacity ${current === i ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>{it.label}</span>
                  <span className={`grid size-8 place-items-center border text-[0.7rem] font-medium ${current === i ? "border-burgundy bg-burgundy text-ivory" : "border-hairline-strong bg-ivory/80"}`}>
                    {it.n}
                  </span>
                </button>
              </li>
            ),
          )}
        </ol>
      </nav>
    </div>
  );
}
