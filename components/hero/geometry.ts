import * as THREE from "three";

/** Deterministic PRNG so geometry is stable across renders (and pure). */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth, position-based field so shared vertices displace identically (no tearing). */
function field(x: number, y: number, z: number) {
  return (
    0.11 * Math.sin(2.7 * x + 1.3) * Math.sin(2.9 * y + 0.4) * Math.sin(2.3 * z + 0.7) +
    0.05 * Math.sin(6.1 * x + 2.0) * Math.sin(5.7 * y) * Math.sin(6.4 * z + 1.1)
  );
}

/**
 * Faceted titanium shell: a displaced icosphere whose triangles are each
 * shrunk toward their centroid, leaving luminous seams between plates.
 */
export function createShellGeometry(radius = 1, detail = 3, plateScale = 0.9) {
  const base = new THREE.IcosahedronGeometry(radius, detail); // non-indexed
  const pos = base.getAttribute("position") as THREE.BufferAttribute;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = v.clone().normalize();
    v.copy(n.multiplyScalar(radius * (1 + field(n.x, n.y, n.z))));
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const centroid = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i);
    b.fromBufferAttribute(pos, i + 1);
    c.fromBufferAttribute(pos, i + 2);
    centroid.copy(a).add(b).add(c).divideScalar(3);
    [a, b, c].forEach((p, k) => {
      p.sub(centroid).multiplyScalar(plateScale).add(centroid);
      pos.setXYZ(i + k, p.x, p.y, p.z);
    });
  }

  pos.needsUpdate = true;
  base.computeVertexNormals();
  base.computeBoundingSphere();
  return base;
}

/** Flat annulus split into arc segments with gaps — machined orbital band. */
export function createSegmentedRing(
  radius: number,
  width: number,
  segments: number,
  gap = 0.18,
  arcSteps = 24,
) {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const inner = radius - width / 2;
  const outer = radius + width / 2;
  const span = (Math.PI * 2) / segments;
  let vi = 0;

  for (let s = 0; s < segments; s++) {
    const start = s * span + (span * gap) / 2;
    const end = (s + 1) * span - (span * gap) / 2;
    for (let k = 0; k <= arcSteps; k++) {
      const t = start + ((end - start) * k) / arcSteps;
      const cos = Math.cos(t);
      const sin = Math.sin(t);
      positions.push(cos * inner, sin * inner, 0, cos * outer, sin * outer, 0);
      normals.push(0, 0, 1, 0, 0, 1);
      if (k < arcSteps) {
        const i0 = vi + k * 2;
        indices.push(i0, i0 + 1, i0 + 2, i0 + 1, i0 + 3, i0 + 2);
      }
    }
    vi += (arcSteps + 1) * 2;
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  g.setIndex(indices);
  return g;
}

/** Radial instrument ticks around a circle. */
export function createTickRing(radius: number, count: number, major = 8) {
  const positions: number[] = [];
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const len = i % major === 0 ? 0.16 : 0.06;
    const c = Math.cos(t);
    const s = Math.sin(t);
    positions.push(c * radius, s * radius, 0, c * (radius + len), s * (radius + len), 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return g;
}

/**
 * Neural lattice: nodes on a Fibonacci sphere, each linked to its nearest
 * neighbours. Each segment carries progress (0→1) and a seed so a shader can
 * send signal pulses along the connections.
 */
export function createLattice(count: number, radius: number, links = 3, seed = 7) {
  const rand = mulberry32(seed);
  const nodes: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const jitter = 1 + (rand() - 0.5) * 0.16;
    nodes.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius * jitter));
  }

  const seen = new Set<string>();
  const positions: number[] = [];
  const progress: number[] = [];
  const seeds: number[] = [];

  nodes.forEach((n, i) => {
    const nearest = nodes
      .map((m, j) => ({ j, d: n.distanceToSquared(m) }))
      .filter((o) => o.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, links);
    for (const { j } of nearest) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const m = nodes[j];
      const s = rand();
      positions.push(n.x, n.y, n.z, m.x, m.y, m.z);
      progress.push(0, 1);
      seeds.push(s, s);
    }
  });

  const lines = new THREE.BufferGeometry();
  lines.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  lines.setAttribute("aProgress", new THREE.Float32BufferAttribute(progress, 1));
  lines.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 1));

  const points = new THREE.BufferGeometry();
  points.setFromPoints(nodes);
  points.setAttribute(
    "aSeed",
    new THREE.Float32BufferAttribute(nodes.map(() => rand()), 1),
  );

  return { lines, points };
}

/** Ambient particle field in a thick spherical shell. */
export function createParticles(count: number, inner: number, outer: number, seed = 42) {
  const rand = mulberry32(seed);
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const u = rand() * 2 - 1;
    const t = rand() * Math.PI * 2;
    const r = inner + Math.pow(rand(), 0.6) * (outer - inner);
    const s = Math.sqrt(1 - u * u);
    positions[i * 3] = Math.cos(t) * s * r;
    positions[i * 3 + 1] = u * r * 0.7;
    positions[i * 3 + 2] = Math.sin(t) * s * r;
    scales[i] = 0.4 + rand() * 1.2;
    seeds[i] = rand();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  g.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  return g;
}

/** Soft radial glow texture for the core halo. */
export function createGlowTexture(size = 128) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(156,196,255,1)");
  g.addColorStop(0.25, "rgba(47,123,255,0.55)");
  g.addColorStop(0.6, "rgba(21,70,184,0.12)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
