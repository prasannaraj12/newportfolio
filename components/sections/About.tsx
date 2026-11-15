"use client";

import { useRef } from "react";
import { GraduationCap, MapPin } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { education, experience, profile } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function About() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Word-by-word illumination of the statement as it scrolls through view.
      gsap.fromTo(
        "[data-word]",
        { opacity: 0.14 },
        {
          opacity: 1,
          stagger: 0.05,
          ease: "none",
          scrollTrigger: { trigger: "[data-statement]", start: "top 78%", end: "bottom 45%", scrub: true },
        },
      );

      // Timeline spine fills with signal as you scroll the experience log.
      gsap.fromTo(
        "[data-spine-fill]",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: "[data-timeline]", start: "top 70%", end: "bottom 60%", scrub: true },
        },
      );

      gsap.utils.toArray<HTMLElement>("[data-exp]").forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 1.2,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });

      gsap.from("[data-edu]", {
        y: 30,
        opacity: 0,
        duration: 1.2,
        scrollTrigger: { trigger: "[data-edu]", start: "top 88%", once: true },
      });
    },
    { scope: root },
  );

  const words = `${profile.summary} ${profile.summaryDetail}`.split(" ");

  return (
    <section ref={root} id="about" className="relative py-28 md:py-40">
      <div className="container-noir">
        <SectionHeading
          index="01"
          kicker="About / Experience"
          title={
            <>
              Signal over <span className="font-serif font-normal italic text-volt-gradient">noise.</span>
            </>
          }
        />

        <div className="grid gap-16 lg:grid-cols-12">
          <p
            data-statement
            className="font-display text-[clamp(1.35rem,2.6vw,2.15rem)] font-medium leading-[1.3] tracking-[-0.02em] text-titanium-100 lg:col-span-8"
          >
            {words.map((w, i) => (
              <span key={i} data-word className="inline-block whitespace-pre">
                {w}{" "}
              </span>
            ))}
          </p>

          <aside data-edu className="panel h-fit rounded-2xl p-6 lg:col-span-4">
            <div className="mb-5 flex items-center justify-between">
              <span className="label">Education</span>
              <GraduationCap className="size-4 text-volt-bright" />
            </div>
            <p className="font-display text-lg font-semibold leading-snug text-titanium-50">{education.degree}</p>
            <p className="mt-2 text-sm text-titanium-400">{education.school}</p>
            <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-hairline pt-5">
              {[
                ["University", education.university],
                ["Graduating", "2027"],
                ["CGPA", education.cgpa],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="label text-[0.6rem]">{k}</dt>
                  <dd className="mt-1.5 font-mono text-sm text-titanium-100">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 flex items-center gap-2 text-xs text-titanium-400">
              <MapPin className="size-3.5" /> {profile.location}
            </p>
          </aside>
        </div>

        {/* Experience log */}
        <div className="mt-28 md:mt-36">
          <p className="label mb-10">Internship experience</p>
          <ol data-timeline className="relative">
            <div aria-hidden className="absolute bottom-0 left-[7px] top-2 w-px bg-hairline-strong md:left-[calc(25%+7px)]">
              <div
                data-spine-fill
                className="h-full w-full origin-top bg-gradient-to-b from-volt-bright via-volt to-volt-deep shadow-[0_0_12px_rgb(47_123_255/0.8)]"
              />
            </div>

            {experience.map((e) => (
              <li key={e.company} data-exp className="relative grid gap-3 pb-14 pl-10 last:pb-0 md:grid-cols-4 md:gap-10 md:pl-0">
                <p className="font-mono text-xs tracking-wider text-titanium-400 md:pr-10 md:pt-1 md:text-right">
                  {e.period}
                </p>
                <span
                  aria-hidden
                  className={`absolute left-0 top-1 grid size-[15px] place-items-center rounded-full border md:left-[25%] ${
                    e.current ? "border-volt bg-volt/20" : "border-hairline-strong bg-obsidian"
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${e.current ? "bg-volt-bright animate-pulse" : "bg-titanium-500"}`} />
                </span>
                <div className="md:col-span-3 md:pl-12">
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-titanium-50 md:text-3xl">
                    {e.role}
                  </h3>
                  <p className="mt-1 text-sm text-volt-glow">{e.company}</p>
                  {e.points.map((p) => (
                    <p key={p} className="mt-4 max-w-2xl leading-relaxed text-titanium-300">
                      {p}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
