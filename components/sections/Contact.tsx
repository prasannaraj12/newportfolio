"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Copy, Mail, Phone } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { portraits, profile, resumeUrl } from "@/lib/content";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { ContactForm } from "./ContactForm";
import { SplitChars } from "@/components/ui/SplitChars";

export function Contact() {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useGSAP(
    () => {
      gsap.from("[data-cta] [data-char]", {
        yPercent: 110,
        duration: 1.3,
        stagger: 0.025,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-cta]", start: "top 80%", once: true },
      });
      gsap.from("[data-contact-fade]", {
        y: 24,
        opacity: 0,
        stagger: 0.1,
        duration: 1.1,
        scrollTrigger: { trigger: "[data-cta]", start: "top 70%", once: true },
      });
    },
    { scope: root },
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.links.email);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.links.email}`;
    }
  };

  return (
    <section ref={root} id="connection" aria-label="Connection" className="theme-burgundy relative overflow-hidden pb-10 pt-28 md:pt-40">
      {/* Studio portrait — a quiet presence behind the closing words */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 aspect-[836/451] w-full opacity-70 md:w-[min(836px,58vw)]"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 45%), linear-gradient(to bottom, black 55%, transparent)",
          maskComposite: "intersect",
        }}
      >
        <Image
          src={portraits.doubleExposure.src}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 836px"
          className="object-cover grayscale contrast-[1.05] mix-blend-multiply"
          style={{ objectPosition: "55% 25%" }}
        />
      </div>
      <div className="container-noir relative">
        <p className="label mb-8">Contact</p>

        <h2
          data-cta
          className="max-w-[12ch] font-display font-semibold leading-[0.9] tracking-[-0.05em] text-titanium-50 mt-[24svh] md:mt-0"
          style={{ fontSize: "clamp(3rem, 9vw, 9.5rem)" }}
        >
          <SplitChars text="Have an idea?" charClass="text-titanium" />
          <span className="split-line">
            <span data-char className="split-inner font-serif font-light tracking-[-0.03em] text-titanium-200">
              Let&apos;s make it
            </span>
          </span>
          <SplitChars text="intelligent." charClass="text-terracotta" />
        </h2>

        <div className="mt-14 grid gap-10 border-t border-hairline pt-10 md:grid-cols-12">
          <div data-contact-fade className="md:col-span-7">
            <span className="label">Email</span>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${profile.links.email}`}
                className="break-all font-display text-2xl font-medium tracking-tight text-titanium-50 underline-offset-8 transition-colors hover:text-terracotta hover:underline md:text-4xl"
              >
                {profile.links.email}
              </a>
              <button
                type="button"
                onClick={copy}
                aria-label="Copy email address"
                className="relative grid size-10 place-items-center overflow-hidden rounded-full border border-hairline-strong text-titanium-200 transition-colors hover:border-terracotta hover:text-white"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={copied ? "ok" : "copy"}
                    initial={{ y: 14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -14, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {copied ? <Check className="size-4 text-volt-bright" /> : <Copy className="size-4" />}
                  </motion.span>
                </AnimatePresence>
              </button>
              <span aria-live="polite" className="sr-only">
                {copied ? "Email copied" : ""}
              </span>
            </div>
          </div>

          <div data-contact-fade className="flex flex-wrap items-end gap-3 md:col-span-5 md:justify-end">
            <MagneticLink href={profile.links.linkedin} external variant="primary">
              LinkedIn <ArrowUpRight className="size-4" />
            </MagneticLink>
            <MagneticLink href={profile.links.github} external>
              GitHub <ArrowUpRight className="size-4" />
            </MagneticLink>
            <MagneticLink href={resumeUrl} external>
              Résumé <ArrowUpRight className="size-4" />
            </MagneticLink>
            <MagneticLink href={`tel:${profile.links.phone.replace(/\s/g, "")}`} external={false}>
              <Phone className="size-4" /> Call
            </MagneticLink>
          </div>
        </div>

        <div data-contact-fade className="mt-16 grid gap-10 md:grid-cols-12">
          <p className="font-serif text-[1.3rem] leading-snug text-titanium-200 md:col-span-4">
            Write to me directly — the form opens your own mail app with the message ready.
          </p>
          <div className="md:col-span-7 md:col-start-6">
            <ContactForm />
          </div>
        </div>

        <footer data-contact-fade className="mt-28 flex flex-col gap-4 border-t border-hairline pt-6 text-xs text-titanium-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <Mail className="size-3.5" /> {profile.name} — {profile.location}
          </p>
          <p>Prasanna Portfolio © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </section>
  );
}
