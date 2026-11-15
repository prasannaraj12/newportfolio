"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Html, Lightformer, PerformanceMonitor } from "@react-three/drei";
import type { MotionValue } from "motion/react";
import * as THREE from "three";
import { agentdbTools } from "@/lib/content";

const R_TOOLS = 1.95;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const win = (t: number, a: number, b: number) => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};

type Props = {
  progress: MotionValue<number>;
  selected: number;
  onSelect: (i: number | null) => void;
  active: boolean;
};

const angle = (i: number) => ((-90 + i * 72) * Math.PI) / 180;

function Engine({ progress, selected, onSelect }: Omit<Props, "active">) {
  const tools = useRef<(THREE.Group | null)[]>([]);
  const links = useRef<(THREE.Mesh | null)[]>([]);
  const tops = useRef<(THREE.Mesh | null)[]>([]);
  const bead = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Group>(null);

  const mats = useMemo(() => {
    const stone = new THREE.MeshStandardMaterial({ color: "#efe7dc", roughness: 0.85 });
    const stoneDark = new THREE.MeshStandardMaterial({ color: "#e3d8ca", roughness: 0.9 });
    const lacquer = new THREE.MeshPhysicalMaterial({ color: "#782d40", roughness: 0.32, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.12 });
    const brass = new THREE.MeshStandardMaterial({ color: "#b99265", metalness: 1, roughness: 0.3, envMapIntensity: 1.3 });
    const top = new THREE.MeshStandardMaterial({ color: "#782d40", roughness: 0.5 });
    // Satin brass for the selected tool: lit by direct light, not only reflections.
    const lit = new THREE.MeshStandardMaterial({ color: "#c9a271", metalness: 0.45, roughness: 0.35, emissive: new THREE.Color("#5a3d1d"), emissiveIntensity: 0.35 });
    const all = [stone, stoneDark, lacquer, brass, top, lit];
    return { stone, stoneDark, lacquer, brass, top, lit, dispose: () => all.forEach((m) => m.dispose()) };
  }, []);
  useEffect(() => () => mats.dispose(), [mats]);

  useFrame((state, delta) => {
    const p = progress.get();
    const dt = Math.min(delta, 1 / 30);
    // Camera: a slow architectural orbit driven by scroll, with pointer parallax.
    const az = -0.55 + p * 0.9 + state.pointer.x * 0.08;
    const el = 0.58 - state.pointer.y * 0.04;
    const r = 10.4;
    state.camera.position.set(Math.sin(az) * Math.cos(el) * r, Math.sin(el) * r + 0.4, Math.cos(az) * Math.cos(el) * r);
    state.camera.lookAt(0, 0.35, 0);

    if (core.current) core.current.scale.y = Math.max(0.001, win(p, 0, 0.08));

    agentdbTools.forEach((_, i) => {
      const rise = win(p, 0.06 + i * 0.07, 0.14 + i * 0.07);
      const link = win(p, 0.1 + i * 0.07, 0.2 + i * 0.07);
      const on = selected === i;
      const g = tools.current[i];
      if (g) {
        g.scale.y = Math.max(0.001, rise);
        g.position.y = THREE.MathUtils.damp(g.position.y, on ? 0.14 : 0, 6, dt);
      }
      const t = tops.current[i];
      if (t) t.material = on ? mats.lit : mats.top;
      const l = links.current[i];
      if (l) {
        const a = angle(i);
        const len = (R_TOOLS - 0.78) * link;
        const mid = 0.46 + len / 2;
        l.position.set(Math.cos(a) * mid, 0.42, Math.sin(a) * mid);
        l.scale.set(on ? 1.6 : 1, Math.max(0.001, len), on ? 1.6 : 1);
      }
    });

    // A bead of signal travels the selected connection: request out, result back.
    if (bead.current) {
      const a = angle(selected);
      const u = (Math.sin(state.clock.elapsedTime * 2.2) + 1) / 2;
      const d = 0.46 + (R_TOOLS - 0.78) * u;
      bead.current.position.set(Math.cos(a) * d, 0.42, Math.sin(a) * d);
      bead.current.visible = win(p, 0.1 + selected * 0.07, 0.2 + selected * 0.07) > 0.95;
    }
  });

  return (
    <group>
      {/* Plinth */}
      <mesh position={[0, 0.06, 0]} material={mats.stone} receiveShadow>
        <cylinderGeometry args={[2.75, 2.85, 0.12, 64]} />
      </mesh>
      <mesh position={[0, 0.125, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.brass}>
        <torusGeometry args={[2.75, 0.014, 8, 96]} />
      </mesh>
      {/* engraved orbit */}
      <mesh position={[0, 0.123, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.stoneDark}>
        <ringGeometry args={[R_TOOLS - 0.02, R_TOOLS + 0.02, 96]} />
      </mesh>

      {/* The agent: lacquered core with a brass crown */}
      <group ref={core} position={[0, 0.12, 0]}>
        <mesh position={[0, 0.62, 0]} material={mats.lacquer}>
          <cylinderGeometry args={[0.4, 0.46, 1.24, 48]} />
        </mesh>
        <mesh position={[0, 1.26, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.brass}>
          <torusGeometry args={[0.42, 0.035, 12, 64]} />
        </mesh>
        <mesh position={[0, 1.25, 0]} material={mats.brass}>
          <cylinderGeometry args={[0.3, 0.3, 0.03, 48]} />
        </mesh>
      </group>
      <Html position={[0, 1.75, 0]} center className="pointer-events-none select-none">
        <span className="whitespace-nowrap text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[#782D40]">ReAct agent · LangGraph</span>
      </Html>

      {/* Five tools */}
      {agentdbTools.map((tool, i) => {
        const a = angle(i);
        const x = Math.cos(a) * R_TOOLS;
        const z = Math.sin(a) * R_TOOLS;
        return (
          <group key={tool.id} position={[x, 0.12, z]} rotation={[0, -a, 0]}>
            <group ref={(g) => { tools.current[i] = g; }}>
              <mesh position={[0, 0.27, 0]} material={mats.stone}>
                <boxGeometry args={[0.62, 0.54, 0.62]} />
              </mesh>
              <mesh ref={(m) => { tops.current[i] = m; }} position={[0, 0.555, 0]} material={mats.top}>
                <boxGeometry args={[0.5, 0.035, 0.5]} />
              </mesh>
            </group>
            <Html position={[0, 1.0, 0]} center zIndexRange={[20, 0]}>
              <button
                type="button"
                onMouseEnter={() => onSelect(i)}
                onMouseLeave={() => onSelect(null)}
                onFocus={() => onSelect(i)}
                onBlur={() => onSelect(null)}
                onClick={() => onSelect(i)}
                className={`whitespace-nowrap border px-2.5 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.14em] transition-colors ${
                  selected === i ? "border-[#782D40] bg-[#782D40] text-[#F6F0E7]" : "border-[#d9cfc3] bg-[#F6F0E7]/90 text-[#542031]"
                }`}
              >
                {String(i + 1).padStart(2, "0")} {tool.name}
              </button>
            </Html>
          </group>
        );
      })}

      {/* Connections (brass), grown from the core */}
      {agentdbTools.map((t, i) => (
        <mesh key={t.id} ref={(m) => { links.current[i] = m; }} rotation={[0, -angle(i), Math.PI / 2]} material={mats.brass}>
          <cylinderGeometry args={[0.018, 0.018, 1, 10]} />
        </mesh>
      ))}
      <mesh ref={bead} material={mats.lacquer}>
        <sphereGeometry args={[0.06, 16, 12]} />
      </mesh>

      <ContactShadows position={[0, 0.125, 0]} scale={6} blur={2.2} far={1.6} opacity={0.38} resolution={256} color="#542031" />
    </group>
  );
}

export default function AgentEngineScene({ active, ...props }: Props) {
  const [dpr, setDpr] = useState(1.4);
  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 32, near: 0.1, far: 50, position: [0, 4, 7] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.4)} />
      <hemisphereLight args={["#fff6ec", "#e3d8ca", 0.9]} />
      <directionalLight position={[-4, 7, 4]} intensity={1.8} color="#fff1e4" />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2} position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} color="#fff6ec" />
        <Lightformer form="rect" intensity={1} position={[-6, 2, 3]} rotation-y={Math.PI / 2} scale={[4, 6, 1]} color="#f6f0e7" />
        <Lightformer form="rect" intensity={0.8} position={[6, 1, -2]} rotation-y={-Math.PI / 2} scale={[4, 6, 1]} color="#ede3d8" />
      </Environment>
      <Engine {...props} />
    </Canvas>
  );
}
