"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { RoundedBoxGeometry } from "three-stdlib";
import * as THREE from "three";
import { mulberry32 } from "@/lib/random";

/**
 * Kinetic sculpture — "ideas into intelligence".
 * order 0   : plates scattered (ideas)
 * order 0.5 : plates gathered into a spiral
 * order 1   : plates locked into a monolith (intelligence)
 */
export type SculptureDriver = {
  intro: number; // entrance 0..1
  order: number; // scroll-driven structure 0..1
  travel: number; // 0 = hero anchor, 1 = centre of the Ideas chapter
  burst: number; // click impulse 0..1 (scatters, then decays)
};

export type Anchor = { x: number; y: number; s: number };

type Props = {
  driver: SculptureDriver;
  from: Anchor;
  to: Anchor;
  plates: number;
  active: boolean;
};

const CAM_Z = 10;
const FOV = 30;
const W = 1.5;
const H = 0.075;
const D = 0.85;

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

function Plates({ driver, from, to, plates }: Omit<Props, "active">) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const size = useThree((s) => s.size);

  const sim = useMemo(() => {
    const rand = mulberry32(11);
    const geometry = new RoundedBoxGeometry(W, H, D, 3, 0.025);
    // Burgundy lacquer over steel: low metalness + clearcoat reads as enamel.
    const material = new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      metalness: 0.35,
      roughness: 0.32,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.2,
    });
    const copper = Math.floor(plates * 0.62);
    const scatter = Array.from({ length: plates }, () => {
      const u = rand() * 2 - 1;
      const a = rand() * Math.PI * 2;
      const r = 1.2 + rand() * 1.1;
      const s = Math.sqrt(1 - u * u);
      return {
        p: new THREE.Vector3(Math.cos(a) * s * r * 1.25, u * r * 0.9, Math.sin(a) * s * r * 0.6),
        r: new THREE.Euler((rand() - 0.5) * 2.4, rand() * Math.PI * 2, (rand() - 0.5) * 2.4),
      };
    });
    const stiff = Array.from({ length: plates }, () => 0.75 + rand() * 0.45);
    const state = Array.from({ length: plates }, (_, i) => ({
      p: scatter[i].p.clone().multiplyScalar(2.2),
      v: new THREE.Vector3(),
      r: new THREE.Vector3(scatter[i].r.x, scatter[i].r.y, scatter[i].r.z),
      w: new THREE.Vector3(),
    }));
    const dummy = new THREE.Object3D();
    const target = new THREE.Vector3();
    const targetR = new THREE.Vector3();
    const delta = new THREE.Vector3();
    const pv = new THREE.Vector2();
    const steel = new THREE.Color("#7a2e3f"); // burgundy lacquer
    const copperColor = new THREE.Color("#c9a070"); // antique gold

    return {
      geometry,
      material,
      paint(m: THREE.InstancedMesh) {
        for (let i = 0; i < plates; i++) m.setColorAt(i, i === copper ? copperColor : steel);
        if (m.instanceColor) m.instanceColor.needsUpdate = true;
      },
      /** Advance springs toward the structure for `order`, then write matrices. */
      step(m: THREE.InstancedMesh, dt: number, order: number, fan: number, pointerY: number, groupY: number, scale: number) {
        const pointer = pv.set(fan, pointerY);
        const spiralT = smooth(clamp01(order / 0.5));
        const blockT = smooth(clamp01((order - 0.5) / 0.5));
        for (let i = 0; i < plates; i++) {
          const t = i / (plates - 1);
          // Spiral and monolith targets.
          const sy = (t - 0.5) * 2.7;
          const by = (t - 0.5) * plates * 0.088;
          const sr = t * Math.PI * 1.6;
          const sc = scatter[i];
          target.set(
            THREE.MathUtils.lerp(sc.p.x, 0, spiralT),
            THREE.MathUtils.lerp(THREE.MathUtils.lerp(sc.p.y, sy, spiralT), by, blockT),
            THREE.MathUtils.lerp(sc.p.z, 0, spiralT),
          );
          targetR.set(
            THREE.MathUtils.lerp(sc.r.x, 0, spiralT),
            THREE.MathUtils.lerp(THREE.MathUtils.lerp(sc.r.y, sr, spiralT), 0, blockT),
            THREE.MathUtils.lerp(sc.r.z, 0, spiralT),
          );

          // Pointer fan: plates near the pointer's height swing open.
          const worldY = groupY + target.y * scale;
          const dy = worldY - pointer.y;
          const infl = Math.exp(-dy * dy * 5) * pointer.x;
          targetR.y += infl * 0.9;
          target.x += infl * 0.18;

          const st = state[i];
          const k = 48 * stiff[i];
          const c = 10.5;
          st.v.addScaledVector(delta.subVectors(target, st.p), k * dt).multiplyScalar(Math.exp(-c * dt));
          st.p.addScaledVector(st.v, dt);
          st.w.addScaledVector(delta.subVectors(targetR, st.r), k * dt).multiplyScalar(Math.exp(-c * dt));
          st.r.addScaledVector(st.w, dt);

          dummy.position.copy(st.p);
          dummy.rotation.set(st.r.x, st.r.y, st.r.z);
          dummy.updateMatrix();
          m.setMatrixAt(i, dummy.matrix);
        }
        m.instanceMatrix.needsUpdate = true;
      },
    };
  }, [plates]);

  useEffect(() => {
    if (mesh.current) sim.paint(mesh.current);
    return () => {
      sim.geometry.dispose();
      sim.material.dispose();
    };
  }, [sim]);

  const pointer = useRef({ x: 0, y: 0, active: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      pointer.current.active = 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const g = group.current;
    const m = mesh.current;
    if (!g || !m) return;

    const vh = 2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const vw = vh * (size.width / size.height);

    // Where on the page the sculpture sits (hero corner → chapter centre).
    const tr = smooth(clamp01(driver.travel));
    const ax = THREE.MathUtils.lerp(from.x, to.x, tr);
    const ay = THREE.MathUtils.lerp(from.y, to.y, tr);
    const as = THREE.MathUtils.lerp(from.s, to.s, tr);
    g.position.set((ax - 0.5) * vw, (0.5 - ay) * vh, 0);
    g.scale.setScalar(as * (0.85 + 0.15 * driver.intro));

    const p = pointer.current;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, 0.5 + state.clock.elapsedTime * 0.05 + p.x * 0.35, 2, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.22 - p.y * 0.12, 2, dt);

    // Pointer in world space; fan strength fades with horizontal distance.
    const px = p.x * (vw / 2);
    const py = p.y * (vh / 2);
    const near = Math.exp(-Math.pow((px - g.position.x) / (1.8 * as), 2));
    const order = Math.max(driver.intro * 0.42, driver.order) * (1 - driver.burst * 0.95);
    sim.step(m, dt, order, near * p.active, py, g.position.y, g.scale.x);

    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, p.x * 0.25, 2, dt);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, p.y * 0.15, 2, dt);
    state.camera.lookAt(state.camera.position.x, state.camera.position.y, 0);
  });

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[sim.geometry, sim.material, plates]} frustumCulled={false} />
      <ContactShadows position={[0, -1.75, 0]} scale={6} blur={2.6} far={4} opacity={0.42} resolution={256} color="#403638" />
    </group>
  );
}

export default function KineticSculpture({ active, ...props }: Props) {
  const [dpr, setDpr] = useState(1.5);
  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, CAM_Z], fov: FOV, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
      <ambientLight intensity={0.6} color="#fff3ea" />
      <directionalLight position={[-4, 6, 5]} intensity={2.4} color="#fff1e4" />
      <directionalLight position={[5, -1, 3]} intensity={0.6} color="#e7d5d2" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} color="#fff6ec" />
        <Lightformer form="rect" intensity={2} position={[-6, 1, 3]} rotation-y={Math.PI / 2} scale={[4, 8, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[0, 0, 8]} rotation-y={Math.PI} scale={[12, 6, 1]} color="#f2efe8" />
        <Lightformer form="rect" intensity={0.9} position={[6, 0, 1]} rotation-y={-Math.PI / 2} scale={[4, 8, 1]} color="#e9e5dc" />
        <Lightformer form="rect" intensity={0.7} position={[0, -4, 3]} rotation-x={-Math.PI / 2} scale={[10, 2, 1]} color="#e7d5d2" />
      </Environment>
      <Plates {...props} />
    </Canvas>
  );
}
