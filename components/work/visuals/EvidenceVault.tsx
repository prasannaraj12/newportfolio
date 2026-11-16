"use client";

import { motion, useMotionValueEvent, type MotionValue } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";

const RECORDS = [
  "Dataset manifest",
  "Training-data integrity",
  "Model identity",
  "Behavioural fingerprint",
  "Inference provenance",
  "Assurance report",
];
const GENESIS = "0".repeat(64);

type Rec = { payload: string; prev: string; sealed: string; hash: string };

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}
async function chain(payloads: string[], sealed?: string[]) {
  const out: Rec[] = [];
  let prev = GENESIS;
  for (let i = 0; i < payloads.length; i++) {
    const hash = await sha256(`${i}|${payloads[i]}|${prev}`);
    out.push({ payload: payloads[i], prev, hash, sealed: sealed ? sealed[i] : hash });
    prev = hash;
  }
  return out;
}
const short = (h: string) => (h ? `${h.slice(0, 6)}…${h.slice(-4)}` : "……");

/** TRUST-CV: a scroll-driven, tamper-evident evidence chain (real SHA-256). */
export function EvidenceVault({ progress }: { progress: MotionValue<number>; active: boolean }) {
  const [recs, setRecs] = useState<Rec[] | null>(null);
  const [p, setP] = useState(0);
  const [tampered, setTampered] = useState<number | null>(null);
  useMotionValueEvent(progress, "change", (v) => setP(Math.round(v * 100) / 100));

  useEffect(() => {
    let live = true;
    chain(RECORDS).then((r) => live && setRecs(r));
    return () => {
      live = false;
    };
  }, []);

  const tamper = useCallback(
    async (i: number) => {
      if (!recs) return;
      const edited = recs.map((r, k) => (k === i ? `${r.payload} (edited)` : r.payload));
      setTampered(i);
      setRecs(await chain(edited, recs.map((r) => r.sealed)));
    },
    [recs],
  );
  const reset = async () => {
    setTampered(null);
    setRecs(await chain(RECORDS));
  };

  const entered = (i: number) => p > 0.04 + i * 0.06;
  const linked = (i: number) => p > 0.32 + i * 0.04;
  const sweep = Math.min(1, Math.max(0, (p - 0.55) / 0.28));
  const verified = (i: number) => sweep * RECORDS.length > i + 0.5;
  const broken = (r: Rec) => r.hash !== r.sealed;
  const allChecked = sweep >= 1;
  const intact = recs?.every((r) => !broken(r)) ?? true;

  return (
    <div className="flex h-full flex-col">
      <div className="relative grid min-h-0 flex-1 content-center [perspective:1400px]">
        <div className="grid grid-cols-3 gap-x-6 gap-y-10 [transform:rotateX(14deg)] [transform-style:preserve-3d]">
          {RECORDS.map((name, i) => {
            const r = recs?.[i];
            const bad = r ? broken(r) && allChecked : false;
            const ok = r && verified(i) && !broken(r);
            return (
              <motion.div
                key={name}
                animate={{ opacity: entered(i) ? 1 : 0, z: entered(i) ? 0 : -220, y: bad ? 8 : 0, rotateZ: bad ? (i % 2 ? 1.5 : -1.5) : 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className={`relative border p-4 transition-colors duration-500 ${
                  bad ? "border-[#b77b85] bg-[#b77b85]/20" : ok ? "border-[#c9a777] bg-[#f7f1e9]/[0.07]" : "border-[#f7f1e9]/15 bg-[#f7f1e9]/[0.04]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-[#c9a777]">Record {i + 1}</span>
                  {ok && <Check className="size-3.5 text-[#c9a777]" />}
                  {bad && <X className="size-3.5 text-[#e2b7b8]" />}
                </div>
                <p className="mt-1.5 text-[0.86rem] leading-tight text-[#f7f1e9]">{r?.payload ?? name}</p>
                <dl className="mt-3 space-y-0.5 font-mono text-[0.6rem] text-[#e8d8d2]/70">
                  <div className="flex justify-between gap-2">
                    <dt>prev</dt>
                    <dd>{short(r?.prev ?? "")}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>hash</dt>
                    <dd className={bad ? "text-[#e2b7b8]" : "text-[#f7f1e9]"}>{short(r?.hash ?? "")}</dd>
                  </div>
                </dl>
                {allChecked && tampered === null && (
                  <button type="button" onClick={() => tamper(i)} className="mt-2 text-[0.66rem] text-[#e8d8d2]/70 underline underline-offset-4 hover:text-[#f7f1e9]">
                    Tamper
                  </button>
                )}
                {/* hash link to the next record */}
                {i < RECORDS.length - 1 && i % 3 !== 2 && (
                  <span
                    aria-hidden
                    className="absolute left-full top-1/2 h-px w-6 origin-left transition-transform duration-700"
                    style={{ transform: `scaleX(${linked(i) ? 1 : 0})`, background: recs && broken(recs[i + 1]) && allChecked ? "#b77b85" : "#c9a777" }}
                  />
                )}
                {i === 2 && (
                  <span
                    aria-hidden
                    className="absolute -bottom-10 left-1/2 h-10 w-px origin-top transition-transform duration-700"
                    style={{ transform: `scaleY(${linked(i) ? 1 : 0})`, background: recs && broken(recs[3]) && allChecked ? "#b77b85" : "#c9a777" }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
        {/* verification sweep */}
        <div aria-hidden className="mt-8 h-px w-full bg-[#f7f1e9]/10">
          <div className="h-full origin-left bg-[#c9a777]" style={{ transform: `scaleX(${sweep})` }} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#f7f1e9]/15 pt-3 text-[0.78rem] text-[#e8d8d2]">
        <span>
          {!allChecked
            ? "Verifying the chain of custody…"
            : intact
              ? "Chain intact — 6 of 6 records verified, offline."
              : `Record ${(tampered ?? 0) + 1} was edited — its hash no longer matches the seal, and every record after it breaks.`}
        </span>
        {tampered !== null && (
          <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-[#f7f1e9] hover:text-[#c9a777]">
            <RotateCcw className="size-3.5" /> Re-seal
          </button>
        )}
      </div>
      <p className="mt-1.5 text-[0.66rem] text-[#e8d8d2]/55">
        Illustration of a hash-chained evidence log — SHA-256 computed live in your browser, no network calls. Not output from TRUST-CV itself.
      </p>
    </div>
  );
}
