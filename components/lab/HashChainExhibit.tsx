"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { archive } from "@/lib/content";

const trust = archive.find((p) => p.id === "trust-cv")!;

const STAGES = [
  "Dataset manifest sealed",
  "Training-data integrity check",
  "Model identity hash",
  "Behavioural fingerprint",
  "Inference provenance record",
  "Assurance report signed",
];

type Block = { payload: string; prev: string; sealed: string; hash: string };

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

const GENESIS = "0".repeat(64);

/** Build a chain where each block commits to the previous block's hash. */
async function seal(payloads: string[]) {
  const blocks: Block[] = [];
  let prev = GENESIS;
  for (let i = 0; i < payloads.length; i++) {
    const hash = await sha256(`${i}|${payloads[i]}|${prev}`);
    blocks.push({ payload: payloads[i], prev, sealed: hash, hash });
    prev = hash;
  }
  return blocks;
}

/** Recompute hashes for (possibly edited) payloads against the sealed record. */
async function verify(blocks: Block[]) {
  const next: Block[] = [];
  let prev = GENESIS;
  for (let i = 0; i < blocks.length; i++) {
    const hash = await sha256(`${i}|${blocks[i].payload}|${prev}`);
    next.push({ ...blocks[i], prev, hash });
    prev = hash;
  }
  return next;
}

const short = (h: string) => `${h.slice(0, 6)}…${h.slice(-4)}`;
const ease = [0.16, 1, 0.3, 1] as const;

/** Exhibit E — TRUST-CV: a live, tamper-evident hash chain. */
export function HashChainExhibit() {
  const [blocks, setBlocks] = useState<Block[] | null>(null);
  const [tampered, setTampered] = useState<number | null>(null);

  const reset = useCallback(async () => {
    setTampered(null);
    setBlocks(await seal(STAGES));
  }, []);

  useEffect(() => {
    let cancelled = false;
    seal(STAGES).then((b) => {
      if (!cancelled) setBlocks(b);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const tamper = async (i: number) => {
    if (!blocks) return;
    const edited = blocks.map((b, k) => (k === i ? { ...b, payload: `${b.payload} (edited)` } : b));
    setTampered(i);
    setBlocks(await verify(edited));
  };

  const firstBroken = blocks?.findIndex((b) => b.hash !== b.sealed) ?? -1;

  return (
    <article data-exhibit className="theme-ivory relative py-24 md:py-36">
      <div className="container-noir">
        <div data-exhibit-reveal className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="label">
              Exhibit E — {trust.context}
            </p>
            <h3
              className="mt-5 font-display font-extrabold leading-[0.88] tracking-[-0.05em] text-titanium-50"
              style={{ fontSize: "clamp(2.6rem, 5.2vw, 5.6rem)" }}
            >
              {trust.title}
            </h3>
            <p className="mt-3 font-serif text-[1.45rem] leading-snug text-titanium-300">{trust.subtitle}</p>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <p className="text-[0.95rem] leading-relaxed text-titanium-400">{trust.overview}</p>
            {trust.link && (
              <a
                href={trust.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-5 inline-flex items-center gap-2 border-b border-titanium-500 pb-1 text-sm text-titanium-50"
              >
                {trust.link.label}
                <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            )}
          </div>
        </div>

        <div data-exhibit-reveal className="mt-16">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
            <p className="font-serif text-xl text-titanium-200">
              {tampered === null
                ? "Every record commits to the one before it. Tamper with any record."
                : firstBroken >= 0
                  ? `Record ${tampered + 1} was edited — its hash no longer matches the seal, and every record after it breaks.`
                  : "Chain intact."}
            </p>
            <button
              type="button"
              onClick={reset}
              disabled={tampered === null}
              className="inline-flex items-center gap-2 text-sm text-titanium-300 transition-colors hover:text-titanium-50 disabled:opacity-30"
            >
              <RotateCcw className="size-3.5" /> Re-seal chain
            </button>
          </div>

          <div className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] pb-4 [scrollbar-width:none]">
            <ol className="flex min-w-[900px] items-stretch">
              {(blocks ?? STAGES.map((s) => ({ payload: s, prev: GENESIS, sealed: "", hash: "" }))).map((b, i) => {
                const broken = blocks ? b.hash !== b.sealed : false;
                const isSource = tampered === i;
                return (
                  <li key={i} className="flex flex-1 items-center">
                    <motion.div
                      layout
                      animate={{ y: broken ? 6 : 0, rotate: broken ? (i % 2 ? 1.2 : -1.2) : 0 }}
                      transition={{ duration: 0.6, ease, delay: broken && tampered !== null ? (i - tampered) * 0.12 : 0 }}
                      className={`relative flex-1 border p-4 transition-colors duration-500 ${
                        broken ? "border-terracotta bg-terracotta/10" : "border-titanium-500/40 bg-obsidian"
                      }`}
                    >
                      <p className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-titanium-500">Record {i + 1}</p>
                      <p className="mt-2 min-h-[2.6em] text-[0.88rem] leading-snug text-titanium-50">{b.payload}</p>
                      <dl className="mt-3 space-y-1 font-mono text-[0.62rem] text-titanium-400">
                        <div className="flex justify-between gap-2">
                          <dt>prev</dt>
                          <dd>{blocks ? short(b.prev) : "…"}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt>hash</dt>
                          <dd className={broken ? "text-terracotta" : "text-titanium-100"}>{blocks ? short(b.hash) : "…"}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt>sealed</dt>
                          <dd>{blocks ? short(b.sealed) : "…"}</dd>
                        </div>
                      </dl>
                      <button
                        type="button"
                        onClick={() => tamper(i)}
                        disabled={!blocks || tampered !== null}
                        className="mt-4 text-[0.75rem] font-medium text-titanium-300 underline decoration-titanium-500 underline-offset-4 transition-colors hover:text-terracotta disabled:no-underline disabled:opacity-0"
                      >
                        Tamper with this record
                      </button>
                      {isSource && <span className="absolute -top-2.5 right-3 bg-terracotta px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wider text-ivory">Edited</span>}
                    </motion.div>
                    {i < STAGES.length - 1 && (
                      <span
                        aria-hidden
                        className={`mx-1 h-px w-6 shrink-0 transition-colors duration-500 ${
                          blocks && blocks[i + 1].hash !== blocks[i + 1].sealed ? "bg-terracotta [background-image:repeating-linear-gradient(90deg,currentColor_0_3px,transparent_3px_6px)]" : "bg-titanium-500"
                        }`}
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          <p className="mt-6 text-[0.78rem] leading-relaxed text-titanium-500">
            Illustration of a hash-chained evidence log. Hashes are SHA-256, computed live in your browser with the Web Crypto API — this is not output from TRUST-CV itself.
          </p>
        </div>
      </div>
    </article>
  );
}
