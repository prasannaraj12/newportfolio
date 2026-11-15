import * as THREE from "three";

/** Shared, palette-true materials for the corridor installation. */
export function createMaterials() {
  const stone = new THREE.MeshStandardMaterial({ color: "#ede6da", roughness: 0.92, metalness: 0 });
  const stoneLight = new THREE.MeshStandardMaterial({ color: "#f6f2ea", roughness: 0.8 });
  const floor = new THREE.MeshStandardMaterial({ color: "#e6dece", roughness: 0.28, metalness: 0.05, envMapIntensity: 0.9 });
  const ceiling = new THREE.MeshStandardMaterial({ color: "#f3efe6", roughness: 1 });
  const glow = new THREE.MeshBasicMaterial({ color: "#fff6e6", toneMapped: false });
  const burgundy = new THREE.MeshPhysicalMaterial({
    color: "#702c3b",
    roughness: 0.38,
    clearcoat: 0.8,
    clearcoatRoughness: 0.25,
    envMapIntensity: 0.9,
  });
  const burgundyDeep = new THREE.MeshPhysicalMaterial({ color: "#5c2230", roughness: 0.45, clearcoat: 0.6, clearcoatRoughness: 0.3 });
  const mutedBurgundy = new THREE.MeshPhysicalMaterial({ color: "#7d4250", roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.3 });
  const sage = new THREE.MeshStandardMaterial({ color: "#a7b39b", roughness: 0.7 });
  const gold = new THREE.MeshStandardMaterial({ color: "#b58b60", metalness: 1, roughness: 0.32, envMapIntensity: 1.3 });
  const rose = new THREE.MeshStandardMaterial({ color: "#e7d5d2", roughness: 0.85 });
  const espresso = new THREE.MeshStandardMaterial({ color: "#403638", roughness: 0.6 });

  const all = { stone, stoneLight, floor, ceiling, glow, burgundy, burgundyDeep, mutedBurgundy, sage, gold, rose, espresso };
  return {
    ...all,
    dispose() {
      Object.values(all).forEach((m) => m.dispose());
    },
  };
}

export type Materials = ReturnType<typeof createMaterials>;

/** Engraved brass nameplate drawn to a canvas texture (no font download needed). */
export function nameplateTexture(text: string) {
  const w = 1024;
  const h = 224;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#9a7148");
  g.addColorStop(0.35, "#d1ad84");
  g.addColorStop(0.55, "#b58b60");
  g.addColorStop(1, "#8a643f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // brushed grain
  ctx.globalAlpha = 0.08;
  for (let y = 0; y < h; y += 2) {
    ctx.fillStyle = y % 4 ? "#fff" : "#000";
    ctx.fillRect(0, y, w, 1);
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(64,54,56,0.55)";
  ctx.lineWidth = 6;
  ctx.strokeRect(14, 14, w - 28, h - 28);
  ctx.font = "600 92px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // engraved: light lip below, dark cut above
  ctx.fillStyle = "rgba(255,240,220,0.55)";
  ctx.fillText(text, w / 2 + 2, h / 2 + 4);
  ctx.fillStyle = "#3a2a25";
  ctx.fillText(text, w / 2, h / 2 + 1);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
