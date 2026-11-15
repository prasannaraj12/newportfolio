"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { education, experience, portraits, profile } from "@/lib/content";

/** 02 — The Journey. Letterboxed portrait, outlined headline, editorial timeline. */
export function Journey() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-frame]",
        { clipPath: "inset(0% 22% 0% 22%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          scrollTrigger: { trigger: "[data-frame]", start: "top 90%", end: "center 45%", scrub: true },
        },
      );
      gsap.fromTo(
        "[data-frame-img]",
        { scale: 1.18, yPercent: -4 },
        {
          scale: 1,
          yPercent: 4,
          ease: "none",
          scrollTrigger: { trigger: "[data-frame]", start: "top bottom", end: "bottom top", scrub: true },
        },
      );

      gsap.from("[data-journey-word]", {
        xPercent: -8,
        opacity: 0,
        duration: 1.6,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-journey-word]", start: "top 88%", once: true },
      });

      gsap.fromTo(
        "[data-word]",
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.05,
          ease: "none",
          scrollTrigger: { trigger: "[data-statement-p]", start: "top 80%", end: "bottom 50%", scrub: true },
        },
      );

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
          scrollTrigger: { trigger: el, start: "top 86%", once: true },
        });
      });
    },
    { scope: root },
  );

  const words = `${profile.summary} ${profile.summaryDetail}`.split(" ");

  return (
    <section ref={root} id="journey" aria-label="The Journey" className="theme-rose relative pb-28 pt-24 md:pb-40 md:pt-32">
      <div className="container-noir">
        <p className="label mb-8 flex items-center gap-3">
          The Journey
        </p>

        {/* Letterboxed frame */}
        <figure>
          <div data-frame className="relative aspect-[4/3] w-full overflow-hidden md:aspect-[2.39/1]">
            <div data-frame-img className="absolute inset-0">
              <Image
                src={portraits.monochrome.src}
                alt={`${profile.name}, monochrome portrait`}
                fill
                sizes="(max-width: 1440px) 100vw, 1440px"
                className="object-cover"
                style={{ objectPosition: "58% 28%" }}
              />
            </div>
          </div>
          <figcaption className="mt-3 flex justify-between font-mono text-[0.62rem] uppercase tracking-[0.2em] text-titanium-500">
            <span>Fig. 02</span>
            <span>{profile.location}</span>
          </figcaption>
        </figure>

        {/* Outlined headline — a different voice from the other chapters */}
        <h2 className="relative mt-16 select-none md:mt-24" aria-label="The Journey">
          <span
            data-journey-word
            aria-hidden
            className="block font-display font-extrabold uppercase leading-[0.8] tracking-[-0.06em] text-transparent"
            style={{ fontSize: "clamp(4.2rem, 17vw, 17rem)", WebkitTextStroke: "1px var(--color-titanium-400)" }}
          >
            Journey
          </span>
          <span
            aria-hidden
            className="absolute left-[3%] top-[-0.35em] font-serif text-titanium-50"
            style={{ fontSize: "clamp(2.2rem, 6vw, 6rem)" }}
          >
            The
          </span>
        </h2>

        <div className="mt-14 grid gap-14 md:mt-20 lg:grid-cols-12">
          <p
            data-statement-p
            className="font-display text-[clamp(1.3rem,2.4vw,2rem)] font-medium leading-[1.32] tracking-[-0.02em] text-titanium-100 lg:col-span-7"
          >
            {words.map((w, i) => (
              <span key={i} data-word className="inline-block whitespace-pre">
                {w}{" "}
              </span>
            ))}
          </p>

          <dl className="self-start border-t border-titanium-500/40 lg:col-span-4 lg:col-start-9">
            {[
              ["Degree", education.degree],
              ["Institution", education.school],
              ["University", `${education.university} — ${education.year}`],
              ["CGPA", education.cgpa],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-hairline py-4">
                <dt className="label pt-0.5 text-[0.6rem]">{k}</dt>
                <dd className="text-[0.92rem] leading-snug text-titanium-100">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Experience */}
        <div className="mt-28 md:mt-40">
          <div className="mb-12 flex items-end justify-between gap-6 border-b border-hairline pb-5">
            <p className="font-serif text-3xl text-titanium-50 md:text-4xl">Internship experience</p>
            <p className="label hidden md:block">{String(experience.length).padStart(2, "0")} roles</p>
          </div>

          <ol data-timeline className="relative">
            <div aria-hidden className="absolute bottom-0 left-[5px] top-2 w-px bg-hairline-strong md:left-[calc(25%+5px)]">
              <div data-spine-fill className="h-full w-full origin-top bg-titanium-100" />
            </div>

            {experience.map((e) => (
              <li key={e.company} data-exp className="relative grid gap-3 pb-16 pl-9 last:pb-0 md:grid-cols-4 md:gap-10 md:pl-0">
                <p className="font-mono text-xs tracking-wider text-titanium-400 md:pr-10 md:pt-2 md:text-right">
                  {e.period}
                </p>
                <span
                  aria-hidden
                  className={`absolute left-0 top-2 size-[11px] rotate-45 border md:left-[25%] ${
                    e.current ? "border-volt-bright bg-volt-bright" : "border-titanium-400 bg-void"
                  }`}
                />
                <div className="md:col-span-3 md:pl-12">
                  <h3 className="font-display text-[clamp(1.6rem,3.2vw,2.8rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-titanium-50">
                    {e.role}
                  </h3>
                  <p className="mt-2 font-serif text-xl text-titanium-300">{e.company}</p>
                  {e.points.map((p) => (
                    <p key={p} className="mt-4 max-w-2xl leading-relaxed text-titanium-400">
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
