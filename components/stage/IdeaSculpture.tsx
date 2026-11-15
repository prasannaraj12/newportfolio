"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { mulberry32 } from "@/lib/random";

/**
 * IDEA → INTELLIGENCE.
 * A twisted architectural truss. At order 0 it is only loose brass joints
 * (ideas). As order rises the joints settle into a tower, burgundy beams grow
 * between them, spokes tie every level to a central spine, and glass panes
 * close the faces — a connected, complete system.
 */
export type SculptureDriver = { intro: number; order: number; travel: number; burst: number };
export type Anchor = { x: number; y: number; s: number };

type Props = { driver: SculptureDriver; from: Anchor; to: Anchor; levels: number; active: boolean };

const CAM_Z = 10;
const FOV = 30;
const SIDES = 5;

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
const win = (t: number, a: number, b: number) => smooth((t - a) / (b - a));

type Beam = { a: number; b: number; kind: "ring" | "brace" | "spoke" | "spine"; w: [number, number] };

function buildTruss(levels: number) {
  const nodes: THREE.Vector3[] = [];
  const isHub: boolean[] = [];
  const span = 0.82;
  for (let l = 0; l < levels; l++) {
    const r = 0.86 * (1 - l * 0.07);
    const y = (l - (levels - 1) / 2) * span;
    for (let k = 0; k < SIDES; k++) {
      const a = (k / SIDES) * Math.PI * 2 + (l * Math.PI) / SIDES;
      nodes.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
      isHub.push(false);
    }
  }
  const hub0 = nodes.length;
  for (let l = 0; l < levels; l++) {
    nodes.push(new THREE.Vector3(0, (l - (levels - 1) / 2) * span, 0));
    isHub.push(true);
  }
  const id = (l: number, k: number) => l * SIDES + (((k % SIDES) + SIDES) % SIDES);
  const beams: Beam[] = [];
  const faces: [number, number, number][] = [];
  for (let l = 0; l < levels; l++) {
    for (let k = 0; k < SIDES; k++) {
      beams.push({ a: id(l, k), b: id(l, k + 1), kind: "ring", w: [0.22 + l * 0.04, 0.42 + l * 0.04] });
      beams.push({ a: id(l, k), b: hub0 + l, kind: "spoke", w: [0.62, 0.82] });
      if (l < levels - 1) {
        beams.push({ a: id(l, k), b: id(l + 1, k), kind: "brace", w: [0.36 + l * 0.05, 0.6 + l * 0.05] });
        beams.push({ a: id(l, k + 1), b: id(l + 1, k), kind: "brace", w: [0.38 + l * 0.05, 0.62 + l * 0.05] });
        if (k % 2 === 0) faces.push([id(l, k), id(l, k + 1), id(l + 1, k)]);
      }
    }
    if (l < levels - 1) beams.push({ a: hub0 + l, b: hub0 + l + 1, kind: "spine", w: [0.55, 0.75] });
  }
  return { nodes, isHub, beams, faces };
}

function Truss({ driver, from, to, levels }: Omit<Props, "active">) {
  const group = useRef<THREE.Group>(null);
  const beamMesh = useRef<THREE.InstancedMesh>(null);
  const jointMesh = useRef<THREE.InstancedMesh>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const size = useThree((s) => s.size);

  const sim = useMemo(() => {
    const t = buildTruss(levels);
    const rand = mulberry32(5);
    const scatter = t.nodes.map((_, i) => {
      const u = rand() * 2 - 1;
      const a = rand() * Math.PI * 2;
      const r = 1.2 + rand() * 1.1;
      const s = Math.sqrt(1 - u * u);
      // hubs start closer to the centre — the "seed" of the idea
      const k = t.isHub[i] ? 0.35 : 1;
      return new THREE.Vector3(Math.cos(a) * s * r * 1.3 * k, u * r * k, Math.sin(a) * s * r * 0.7 * k);
    });
    const pos = scatter.map((p) => p.clone());
    const vel = t.nodes.map(() => new THREE.Vector3());
    const stiff = t.nodes.map(() => 0.8 + rand() * 0.4);
    const settle = t.nodes.map((_, i) => (t.isHub[i] ? 0.5 : 0.08 + rand() * 0.22));

    const beamGeo = new THREE.CylinderGeometry(1, 1, 1, 8, 1);
    const jointGeo = new THREE.SphereGeometry(1, 16, 12);
    const lacquer = new THREE.MeshPhysicalMaterial({
      color: "#702d40",
      metalness: 0.55,
      roughness: 0.3,
      clearcoat: 0.9,
      clearcoatRoughness: 0.15,
      envMapIntensity: 1.1,
    });
    const brass = new THREE.MeshStandardMaterial({ color: "#b99265", metalness: 1, roughness: 0.32, envMapIntensity: 1.3 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: "#f3e3df",
      roughness: 0.06,
      metalness: 0,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      envMapIntensity: 1.4,
    });
    const glassGeo = new THREE.BufferGeometry();
    glassGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(t.faces.length * 9), 3));

    // Beams: lacquer for structure, brass for the connections to the spine.
    const beamColors = t.beams.map((b) => (b.kind === "spoke" || b.kind === "spine" ? new THREE.Color("#b99265") : new THREE.Color("#ffffff")));

    const o = new THREE.Object3D();
    const up = new THREE.Vector3(0, 1, 0);
    const dir = new THREE.Vector3();
    const target = new THREE.Vector3();
    const push = new THREE.Vector3();
    const end = new THREE.Vector3();
    const local = new THREE.Vector3();

    return {
      t,
      /** Pointer position in the sculpture's local space (ignores rotation). */
      pointerLocal(x: number, y: number) {
        return local.set(x, y, 0.4);
      },
      beamGeo,
      jointGeo,
      lacquer,
      brass,
      glassMat,
      glassGeo,
      paint(m: THREE.InstancedMesh) {
        beamColors.forEach((c, i) => m.setColorAt(i, c));
        if (m.instanceColor) m.instanceColor.needsUpdate = true;
      },
      step(beams: THREE.InstancedMesh, joints: THREE.InstancedMesh, dt: number, order: number, pointer: THREE.Vector3 | null) {
        // Joints: springs toward scatter ↔ structure
        t.nodes.forEach((n, i) => {
          const k = smooth((order - settle[i]) / 0.42);
          target.lerpVectors(scatter[i], n, k);
          if (pointer) {
            push.subVectors(target, pointer);
            const d = push.length();
            if (d < 0.9) target.addScaledVector(push.normalize(), (0.9 - d) * 0.14);
          }
          const sk = 46 * stiff[i];
          vel[i].addScaledVector(dir.subVectors(target, pos[i]), sk * dt).multiplyScalar(Math.exp(-10 * dt));
          pos[i].addScaledVector(vel[i], dt);
          const s = t.isHub[i] ? 0.072 : 0.056;
          o.position.copy(pos[i]);
          o.quaternion.identity();
          o.scale.setScalar(s * (0.6 + 0.4 * Math.max(k, 0.25)));
          o.updateMatrix();
          joints.setMatrixAt(i, o.matrix);
        });
        joints.instanceMatrix.needsUpdate = true;

        // Beams grow from joint a toward joint b
        t.beams.forEach((b, i) => {
          const g = win(order, b.w[0], b.w[1]);
          const pa = pos[b.a];
          end.lerpVectors(pa, pos[b.b], g);
          dir.subVectors(end, pa);
          const len = dir.length();
          const r = b.kind === "ring" ? 0.026 : b.kind === "spine" ? 0.03 : b.kind === "spoke" ? 0.013 : 0.02;
          o.position.addVectors(pa, end).multiplyScalar(0.5);
          if (len > 1e-4) o.quaternion.setFromUnitVectors(up, dir.normalize());
          o.scale.set(g > 0.001 ? r : 0.0001, Math.max(len, 0.0001), g > 0.001 ? r : 0.0001);
          o.updateMatrix();
          beams.setMatrixAt(i, o.matrix);
        });
        beams.instanceMatrix.needsUpdate = true;

        // Glass panes close the faces last
        const arr = glassGeo.getAttribute("position") as THREE.BufferAttribute;
        t.faces.forEach((f, i) => {
          f.forEach((n, j) => arr.setXYZ(i * 3 + j, pos[n].x, pos[n].y, pos[n].z));
        });
        arr.needsUpdate = true;
        glassGeo.computeVertexNormals();
        glassMat.opacity = 0.32 * win(order, 0.82, 1);
      },
      dispose() {
        beamGeo.dispose();
        jointGeo.dispose();
        glassGeo.dispose();
        lacquer.dispose();
        brass.dispose();
        glassMat.dispose();
      },
    };
  }, [levels]);

  useEffect(() => {
    if (beamMesh.current) sim.paint(beamMesh.current);
    return () => sim.dispose();
  }, [sim]);

  const ptr = useRef({ x: 0, y: 0, on: false });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      ptr.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ptr.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      ptr.current.on = true;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const g = group.current;
    const bm = beamMesh.current;
    const jm = jointMesh.current;
    if (!g || !bm || !jm) return;

    const vh = 2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const vw = vh * (size.width / size.height);
    const tr = smooth(driver.travel);
    const ax = THREE.MathUtils.lerp(from.x, to.x, tr);
    const ay = THREE.MathUtils.lerp(from.y, to.y, tr);
    const as = THREE.MathUtils.lerp(from.s, to.s, tr);
    g.position.set((ax - 0.5) * vw, (0.5 - ay) * vh, 0);
    g.scale.setScalar(as);

    const p = ptr.current;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, 0.35 + p.x * 0.3 + state.clock.elapsedTime * 0.03, 2, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.12 - p.y * 0.1, 2, dt);

    // Pointer in the sculpture's local space (approximate: ignores rotation)
    let pointer: THREE.Vector3 | null = null;
    if (p.on) pointer = sim.pointerLocal(((p.x * vw) / 2 - g.position.x) / as, ((p.y * vh) / 2 - g.position.y) / as);

    // The cover shows the idea taking shape (rings formed, braces growing);
    // the Ideas chapter completes the system.
    const order = Math.max(driver.intro * 0.5, driver.order) * (1 - driver.burst * 0.92);
    sim.step(bm, jm, dt, order, pointer);

    // The key light follows the pointer — the lacquer and brass catch it.
    if (key.current) {
      key.current.position.x = THREE.MathUtils.damp(key.current.position.x, -3 + p.x * 4, 2, dt);
      key.current.position.y = THREE.MathUtils.damp(key.current.position.y, 5 + p.y * 2, 2, dt);
    }
  });

  return (
    <>
      <directionalLight ref={key} position={[-3, 5, 5]} intensity={2.3} color="#fff1e2" />
      <group ref={group}>
        <instancedMesh ref={beamMesh} args={[sim.beamGeo, sim.lacquer, sim.t.beams.length]} frustumCulled={false} />
        <instancedMesh ref={jointMesh} args={[sim.jointGeo, sim.brass, sim.t.nodes.length]} frustumCulled={false} />
        <mesh geometry={sim.glassGeo} material={sim.glassMat} frustumCulled={false} renderOrder={2} />
        <ContactShadows position={[0, -1.85, 0]} scale={5} blur={2.8} far={4} opacity={0.32} resolution={256} color="#45403d" />
      </group>
    </>
  );
}

export default function IdeaSculpture({ active, ...props }: Props) {
  const [dpr, setDpr] = useState(1.5);
  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, CAM_Z], fov: FOV, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
      <ambientLight intensity={0.55} color="#fff4ea" />
      <directionalLight position={[5, -1, 3]} intensity={0.5} color="#e7d5d2" />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2} position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} color="#fff6ec" />
        <Lightformer form="rect" intensity={1.4} position={[-6, 1, 3]} rotation-y={Math.PI / 2} scale={[4, 8, 1]} color="#f5f0e8" />
        <Lightformer form="rect" intensity={0.8} position={[6, 0, 1]} rotation-y={-Math.PI / 2} scale={[4, 8, 1]} color="#e7d5d2" />
        <Lightformer form="rect" intensity={1} position={[0, 0, 8]} rotation-y={Math.PI} scale={[12, 6, 1]} color="#f5f0e8" />
      </Environment>
      <Truss {...props} />
    </Canvas>
  );
}
