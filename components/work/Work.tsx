"use client";

import { work } from "@/lib/work";
import { Archive } from "@/components/lab/Archive";
import { Opening } from "./Opening";
import { ExhibitRoom } from "./ExhibitRoom";
import { AgentEngine } from "./visuals/AgentEngine";
import { NewsFactory } from "./visuals/NewsFactory";
import { TrustLayers } from "./visuals/TrustLayers";
import { EvidenceVault } from "./visuals/EvidenceVault";
import { OrbitView } from "./visuals/OrbitView";

const byId = Object.fromEntries(work.map((p) => [p.id, p])) as Record<(typeof work)[number]["id"], (typeof work)[number]>;

/**
 * Selected Work — an exhibition in five rooms, each with its own layout,
 * tone and kind of visual (3D, canvas pipeline, CSS architecture, live
 * cryptography, scientific plate), followed by the archive.
 */
export function Work() {
  return (
    <section id="laboratory" aria-label="Selected work" className="relative bg-[#F6F0E7]">
      <Opening />

      <ExhibitRoom project={byId.agentdb} layout="visual-right" tone="ivory" visual={(p, a) => <AgentEngine progress={p} active={a} />} />
      <ExhibitRoom project={byId.crawlnews} layout="visual-top" tone="cream" visual={(p, a) => <NewsFactory progress={p} active={a} />} />
      <ExhibitRoom project={byId.rentyourmate} layout="visual-left" tone="ivory" visual={(p, a) => <TrustLayers progress={p} active={a} />} />
      <ExhibitRoom project={byId.trustcv} layout="visual-right" tone="wine" visual={(p, a) => <EvidenceVault progress={p} active={a} />} />
      <ExhibitRoom project={byId.satquery} layout="visual-left" tone="cream" visual={(p, a) => <OrbitView progress={p} active={a} />} />

      <Archive />
      <p className="container-noir py-8 text-[0.72rem] text-[#8a7f78]">
        Visualizations are schematic illustrations of each system — not screenshots or live model output.
      </p>
    </section>
  );
}
