"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";

/**
 * THE INTELLIGENCE PRISM.
 * A single brass ray (the idea) enters a column of burgundy glass. Inside it
 * becomes a line of light; out of the far face it refracts into five rays,
 * each ending in a brass node, and a lacquer arc ties the nodes into one
 * structure: an idea turned into a system.
 *
 * Driver: `order` 0 → 1 tells the story; `burst` retracts it for a replay.
 */
export type SculptureDriver = { intro: number; order: number; travel: number; burst: number };
export type Anchor = { x: number; y: number; s: number };

type Props = { driver: SculptureDriver; from: Anchor; to: Anchor; active: boolean };

const CAM_Z = 10;
const FOV = 30;
const R = 0.95; // prism circumradius
const H = 2.5; // prism height
const RAY_LEN = 2.05;
const ARC_SEGS = 48;
const ARC_RADIAL = 6;
const RAY_COLORS = ["#c6a77b", "#b98a6e", "#a75b68", "#8a3c52", "#702c40"];

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
const win = (t: number, a: number, b: number) => smooth((t - a) / (b - a));

function buildPrism() {
  const root = new THREE.Group();
  const prism = new THREE.Group();
  root.add(prism);

  // ── Glass column: back faces first, then front faces (clean transparency)
  const prismGeo = new THREE.CylinderGeometry(R, R, H, 3, 1);
  const glassBase = {
    color: "#8c3a52",
    roughness: 0.06,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    transparent: true,
    depthWrite: false,
    envMapIntensity: 1.7,
    emissive: new THREE.Color("#702c40"),
    emissiveIntensity: 0,
  };
  const glassBack = new THREE.MeshPhysicalMaterial({ ...glassBase, opacity: 0.38, side: THREE.BackSide });
  const glassFront = new THREE.MeshPhysicalMaterial({ ...glassBase, opacity: 0.5, side: THREE.FrontSide });
  const back = new THREE.Mesh(prismGeo, glassBack);
  back.renderOrder = 1;
  const front = new THREE.Mesh(prismGeo, glassFront);
  front.renderOrder = 3;

  // ── Brass: caps and the three vertical edges
  const brass = new THREE.MeshStandardMaterial({ color: "#c6a77b", metalness: 1, roughness: 0.28, envMapIntensity: 1.4 });
  const capGeo = new THREE.CylinderGeometry(R * 1.04, R * 1.04, 0.05, 3, 1);
  const capTop = new THREE.Mesh(capGeo, brass);
  capTop.position.y = H / 2 + 0.025;
  const capBottom = new THREE.Mesh(capGeo, brass);
  capBottom.position.y = -H / 2 - 0.025;
  const edgeGeo = new THREE.CylinderGeometry(0.014, 0.014, H, 6, 1);
  const edges = [0, 1, 2].map((k) => {
    const a = (k / 3) * Math.PI * 2; // CylinderGeometry: x = sin, z = cos
    const m = new THREE.Mesh(edgeGeo, brass);
    m.position.set(Math.sin(a) * R, 0, Math.cos(a) * R);
    return m;
  });
  prism.add(back, front, capTop, capBottom, ...edges);

  // ── Light paths (live in the root, so they stay put while the prism turns)
  const rayGeo = new THREE.CylinderGeometry(1, 1, 1, 8, 1);
  const beadGeo = new THREE.SphereGeometry(1, 20, 14);
  const ray = (color: string, glow: number) =>
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: glow, metalness: 0.35, roughness: 0.35 });

  const entry = new THREE.Vector3(-R * 0.43, 0.32, R * 0.26);
  const exit = new THREE.Vector3(R * 0.43, -0.12, R * 0.26);
  const source = entry.clone().add(new THREE.Vector3(-0.86, 0.5, 0.06).normalize().multiplyScalar(2.1));

  const inRayMat = ray("#c6a77b", 0.3);
  const inRay = new THREE.Mesh(rayGeo, inRayMat);
  const innerMat = ray("#e9cf9e", 0.9);
  innerMat.transparent = true;
  const inner = new THREE.Mesh(rayGeo, innerMat);
  inner.renderOrder = 2;
  const seed = new THREE.Mesh(beadGeo, brass);
  seed.position.copy(source);

  const rayMats = RAY_COLORS.map((c) => ray(c, 0.28));
  const dirs = RAY_COLORS.map((_, i) => {
    const a = -0.06 - i * 0.16;
    return new THREE.Vector3(Math.cos(a), Math.sin(a), 0.04).normalize();
  });
  const rays = rayMats.map((m) => new THREE.Mesh(rayGeo, m));
  const ends = dirs.map((d) => exit.clone().addScaledVector(d, RAY_LEN));
  const beads = ends.map((p) => {
    const b = new THREE.Mesh(beadGeo, brass);
    b.position.copy(p);
    return b;
  });

  // ── The structure: a lacquer arc drawn through the nodes
  const lacquer = new THREE.MeshPhysicalMaterial({ color: "#702c40", metalness: 0.5, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12 });
  const curve = new THREE.CatmullRomCurve3(ends, false, "centripetal");
  const arcGeo = new THREE.TubeGeometry(curve, ARC_SEGS, 0.02, ARC_RADIAL, false);
  arcGeo.setDrawRange(0, 0);
  const arc = new THREE.Mesh(arcGeo, lacquer);

  root.add(inRay, inner, seed, ...rays, ...beads, arc);

  const up = new THREE.Vector3(0, 1, 0);
  const d = new THREE.Vector3();
  const tip = new THREE.Vector3();
  const place = (m: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3, r: number) => {
    d.subVectors(b, a);
    const len = d.length();
    m.visible = len > 1e-3;
    if (!m.visible) return;
    m.position.addVectors(a, b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(up, d.divideScalar(len));
    m.scale.set(r, len, r);
  };

  return {
    root,
    step(dt: number, time: number, order: number, burst: number, px: number, py: number) {
      // 1 · the idea arrives
      const g0 = win(order, 0.02, 0.3);
      place(inRay, source, tip.lerpVectors(source, entry, g0), 0.016);
      seed.scale.setScalar(0.065 * (1 + Math.sin(time * 2.2) * 0.12));

      // 2 · inside the glass it becomes light
      const g1 = win(order, 0.3, 0.46);
      place(inner, entry, tip.lerpVectors(entry, exit, g1), 0.024);
      innerMat.opacity = 0.85 * g1;
      glassFront.emissiveIntensity = 0.22 * g1;

      // 3 · it refracts into five rays, each ending in a node
      dirs.forEach((dir, i) => {
        const g = win(order, 0.5 + i * 0.035, 0.74 + i * 0.035);
        place(rays[i], exit, tip.copy(exit).addScaledVector(dir, RAY_LEN * g), 0.013);
        beads[i].scale.setScalar(0.058 * win(order, 0.7 + i * 0.035, 0.8 + i * 0.035));
      });

      // 4 · the nodes are tied into one structure
      const f = win(order, 0.84, 1);
      arcGeo.setDrawRange(0, Math.floor(f * ARC_SEGS) * ARC_RADIAL * 6);

      // The column turns gently toward the pointer; a replay twists it.
      const yaw = -0.06 + px * 0.22 + Math.sin(time * 0.25) * 0.05 + burst * 2.4;
      prism.rotation.y = THREE.MathUtils.damp(prism.rotation.y, yaw, 2.4, dt);
      root.rotation.x = THREE.MathUtils.damp(root.rotation.x, 0.12 - py * 0.07, 2, dt);
      root.rotation.y = THREE.MathUtils.damp(root.rotation.y, px * 0.08, 2, dt);
    },
    dispose() {
      [prismGeo, capGeo, edgeGeo, rayGeo, beadGeo, arcGeo].forEach((g) => g.dispose());
      [glassBack, glassFront, brass, inRayMat, innerMat, lacquer, ...rayMats].forEach((m) => m.dispose());
    },
  };
}

function Prism({ driver, from, to }: Omit<Props, "active">) {
  const anchor = useRef<THREE.Group>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const size = useThree((s) => s.size);
  const sim = useMemo(() => buildPrism(), []);
  useEffect(() => () => sim.dispose(), [sim]);

  const ptr = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      ptr.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ptr.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const g = anchor.current;
    if (!g) return;

    const vh = 2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const vw = vh * (size.width / size.height);
    const tr = smooth(driver.travel);
    const ax = THREE.MathUtils.lerp(from.x, to.x, tr);
    const ay = THREE.MathUtils.lerp(from.y, to.y, tr);
    const as = THREE.MathUtils.lerp(from.s, to.s, tr);
    g.position.set((ax - 0.5) * vw, (0.5 - ay) * vh, 0);
    g.scale.setScalar(as);

    // The cover lets the idea enter the glass; the Ideas chapter completes it.
    const order = Math.max(driver.intro * 0.5, driver.order) * (1 - driver.burst * 0.95);
    const p = ptr.current;
    sim.step(dt, state.clock.elapsedTime, order, driver.burst, p.x, p.y);

    // The key light follows the pointer across the glass and brass.
    if (key.current) {
      key.current.position.x = THREE.MathUtils.damp(key.current.position.x, -3 + p.x * 4, 2, dt);
      key.current.position.y = THREE.MathUtils.damp(key.current.position.y, 5 + p.y * 2, 2, dt);
    }
  });

  return (
    <>
      <directionalLight ref={key} position={[-3, 5, 5]} intensity={2.2} color="#fff1e2" />
      <group ref={anchor}>
        <primitive object={sim.root} />
        <ContactShadows position={[0, -H / 2 - 0.08, 0]} scale={5} blur={2.8} far={3} opacity={0.3} resolution={256} color="#4c4140" />
      </group>
    </>
  );
}

export default function IntelligencePrism({ active, ...props }: Props) {
  const [dpr, setDpr] = useState(1.5);
  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, CAM_Z], fov: FOV, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
      <ambientLight intensity={0.6} color="#fff4ea" />
      <directionalLight position={[5, -1, 3]} intensity={0.5} color="#e8d8d2" />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2} position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} color="#fff6ec" />
        <Lightformer form="rect" intensity={1.6} position={[-6, 1, 3]} rotation-y={Math.PI / 2} scale={[3, 8, 1]} color="#f5efe6" />
        <Lightformer form="rect" intensity={0.9} position={[6, 0, 1]} rotation-y={-Math.PI / 2} scale={[3, 8, 1]} color="#e8d8d2" />
        <Lightformer form="rect" intensity={1} position={[0, 0, 8]} rotation-y={Math.PI} scale={[12, 6, 1]} color="#f5efe6" />
      </Environment>
      <Prism {...props} />
    </Canvas>
  );
}
