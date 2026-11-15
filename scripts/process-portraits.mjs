// Produces cleaned, web-optimized crops of the portrait originals.
// Originals in public/images/portraits/ are never modified.
// Run: node scripts/process-portraits.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const SRC = "public/images/portraits";
const OUT = "public/images/portraits/edit";

/** Crop boxes remove collage strips and baked-in side labels. */
const jobs = [
  // Hero: drop the baked "AI / ML ENGINEER" (left) and truncated label (right).
  { file: "01-hero-editorial.jpg", out: "hero", box: { left: 186, top: 0, width: 548, height: 470 } },
  // About: drop the strip of another image on the left edge.
  { file: "02-monochrome-portrait.jpg", out: "monochrome", box: { left: 30, top: 0, width: 796, height: 470 } },
  // Transition: drop the strip along the top edge.
  { file: "03-double-exposure-portrait.jpg", out: "double-exposure", box: { left: 0, top: 20, width: 836, height: 451 } },
  // Contact background: drop the strip along the top and left edges.
  { file: "04-studio-portrait.jpg", out: "studio", box: { left: 22, top: 20, width: 814, height: 451 } },
];

await mkdir(OUT, { recursive: true });
for (const j of jobs) {
  const base = sharp(path.join(SRC, j.file)).extract(j.box);
  await base.clone().webp({ quality: 88 }).toFile(path.join(OUT, `${j.out}.webp`));
  await base.clone().jpeg({ quality: 90, mozjpeg: true }).toFile(path.join(OUT, `${j.out}.jpg`));
  console.log(`${j.out}: ${j.box.width}x${j.box.height}`);
}
