"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { DoorsDriver } from "./layout";
import type { Materials } from "./materials";

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
/** Local progress of `t` inside the window [a, b]. */
const span = (t: number, a: number, b: number) => smooth((t - a) / (b - a));

type RoomProps = { mats: Materials; driver: DoorsDriver };

/* ───────────── Door 01 — The Intelligence Studio ───────────── */

const STAGES = 6;

export function IntelligenceStudio({ mats, driver }: RoomProps) {
  const columns = useRef<(THREE.Group | null)[]>([]);
  const signals = useRef<(THREE.Mesh | null)[]>([]);
  const slabs = useRef<(THREE.Group | null)[]>([]);
  const monoliths = useRef<(THREE.Group | null)[]>([]);

  const geo = useMemo(() => {
    const pts = Array.from({ length: STAGES }, (_, i) => new THREE.Vector3(-3.4 + Math.sin(i * 0.55) * 0.35, 1.05 + i * 0.2 + 0.08, -3.6 - i * 1.2));
    const curve = new THREE.CatmullRomCurve3(pts);
    const rail = new THREE.TubeGeometry(curve, 80, 0.018, 6, false);
    return { pts, curve, rail };
  }, []);
  useLayoutEffect(() => () => geo.rail.dispose(), [geo]);

  useFrame((state) => {
    const r = driver.r1;
    const t = state.clock.elapsedTime;
    // A — CrawlNews: stages rise one after another
    columns.current.forEach((c, i) => {
      if (!c) return;
      const k = span(r, 0.02 + i * 0.04, 0.12 + i * 0.04);
      c.scale.y = Math.max(0.001, k);
    });
    const railOn = span(r, 0.25, 0.32);
    signals.current.forEach((s, i) => {
      if (!s) return;
      s.visible = railOn > 0.01;
      const u = (t * 0.12 + i / 3) % 1;
      s.position.copy(geo.curve.getPointAt(u));
    });
    // B — RentYourMate: the architecture separates into an exploded view
    const explode = span(r, 0.36, 0.6);
    slabs.current.forEach((s, i) => {
      if (!s) return;
      s.position.y = 0.9 + i * (0.32 + explode * 0.38);
      s.rotation.y = (1 - explode) * 0.4 * (i - 1);
    });
    // C — Engineering practice: three disciplines rise
    monoliths.current.forEach((m, i) => {
      if (!m) return;
      m.scale.y = Math.max(0.001, span(r, 0.66 + i * 0.07, 0.8 + i * 0.07));
    });
  });

  return (
    <group>
      {/* Burgundy feature wall at the back */}
      <mesh position={[0, 2.6, -11.27]} material={mats.burgundy}>
        <planeGeometry args={[6.4, 3.4]} />
      </mesh>
      <mesh position={[0, 4.36, -11.26]} material={mats.gold}>
        <boxGeometry args={[6.4, 0.03, 0.02]} />
      </mesh>

      {/* A — six pipeline stages as stone columns, joined by a gold rail */}
      {geo.pts.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]} ref={(g) => { columns.current[i] = g; }}>
          <mesh position={[0, (p.y - 0.08) / 2, 0]} material={mats.stoneLight}>
            <cylinderGeometry args={[0.15, 0.18, p.y - 0.08, 20]} />
          </mesh>
          <mesh position={[0, p.y - 0.06, 0]} material={mats.gold}>
            <cylinderGeometry args={[0.2, 0.2, 0.04, 24]} />
          </mesh>
        </group>
      ))}
      <mesh geometry={geo.rail} material={mats.gold} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(m) => { signals.current[i] = m; }} material={mats.burgundy} visible={false}>
          <sphereGeometry args={[0.06, 16, 12]} />
        </mesh>
      ))}

      {/* B — client / API / data layers */}
      <group position={[0, 0, -8.2]}>
        {[mats.stoneLight, mats.rose, mats.burgundy].map((m, i) => (
          <group key={i} ref={(g) => { slabs.current[i] = g; }}>
            <mesh material={m}>
              <boxGeometry args={[2.4, 0.1, 1.5]} />
            </mesh>
            <mesh position={[0, 0.06, 0]} material={mats.gold}>
              <boxGeometry args={[2.42, 0.012, 1.52]} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.45, 0]} material={mats.espresso}>
          <cylinderGeometry args={[0.05, 0.05, 0.9, 10]} />
        </mesh>
      </group>

      {/* C — three disciplines as monoliths */}
      {[0, 1, 2].map((i) => (
        <group key={i} position={[3.4, 0, -4.4 - i * 1.6]} rotation={[0, -0.35, 0]} ref={(g) => { monoliths.current[i] = g; }}>
          <mesh position={[0, 1.35, 0]} material={mats.burgundy}>
            <boxGeometry args={[0.6, 2.7, 0.14]} />
          </mesh>
          <mesh position={[0.31, 1.35, 0]} material={mats.gold}>
            <boxGeometry args={[0.02, 2.7, 0.15]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ───────────── Door 02 — The Sustainability Gallery ───────────── */

const GROWTH = 38;

export function SustainabilityGallery({ mats, driver }: RoomProps) {
  const stems = useRef<THREE.InstancedMesh>(null);
  const arches = useRef<(THREE.Mesh | null)[]>([]);

  const layout = useMemo(() => {
    const golden = Math.PI * (3 - Math.sqrt(5));
    return Array.from({ length: GROWTH }, (_, i) => {
      const r = 0.34 * Math.sqrt(i);
      const a = i * golden;
      const n = Math.sin(i * 12.9898) * 43758.5453;
      return {
        x: Math.cos(a) * r,
        z: -7 + Math.sin(a) * r * 0.8,
        h: (2.6 - r * 0.55) * (0.75 + (n - Math.floor(n)) * 0.35),
        delay: r / 2.4,
      };
    });
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const write = useMemo(
    () => (m: THREE.InstancedMesh, g: number, t: number) => {
      layout.forEach((s, i) => {
        const k = smooth((g - s.delay * 0.5) / 0.5);
        const h = Math.max(0.001, s.h * k);
        dummy.position.set(s.x, h / 2, s.z);
        dummy.scale.set(1, h, 1);
        dummy.rotation.set(Math.sin(t * 0.4 + i) * 0.02 * k, 0, Math.cos(t * 0.35 + i) * 0.02 * k);
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
      });
      m.instanceMatrix.needsUpdate = true;
    },
    [layout, dummy],
  );

  useFrame((state) => {
    const r = driver.r2;
    if (stems.current) write(stems.current, span(r, 0.05, 0.75), state.clock.elapsedTime);
    arches.current.forEach((a, i) => {
      if (!a) return;
      const k = span(r, i * 0.12, 0.3 + i * 0.12);
      a.scale.setScalar(Math.max(0.001, k));
    });
  });

  return (
    <group>
      {/* Gallery of ivory arches */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(m) => { arches.current[i] = m; }}
          position={[0, 0, -3.4 - i * 2.6]}
          material={mats.stoneLight}
        >
          <torusGeometry args={[3.3, 0.12, 12, 48, Math.PI]} />
        </mesh>
      ))}
      {/* Organic growth: a phyllotaxis cluster of stems */}
      <instancedMesh ref={stems} args={[undefined, undefined, GROWTH]} material={mats.stoneLight}>
        <cylinderGeometry args={[0.07, 0.11, 1, 10]} />
      </instancedMesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, -7]} material={mats.rose}>
        <circleGeometry args={[2.6, 48]} />
      </mesh>
    </group>
  );
}

/* ───────────── Door 03 — The Data Laboratory ───────────── */

const COLS = 10;
const ROWS = 5;

export function DataLab({ mats, driver }: RoomProps) {
  const bars = useRef<THREE.InstancedMesh>(null);
  const line = useRef<THREE.Mesh>(null);
  const streams = useRef<(THREE.Mesh | null)[]>([]);

  const data = useMemo(() => {
    const cells = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const n = Math.sin((r * 31 + c * 17) * 12.9898) * 43758.5453;
        const noise = n - Math.floor(n);
        // raw: noisy, with gaps (missing values) and outliers
        let raw = 0.15 + noise * 0.85;
        if ((r * COLS + c) % 7 === 3) raw = 0.03;
        if ((r * COLS + c) % 11 === 5) raw = 1.6;
        const clean = 0.3 + 0.55 * (0.5 + 0.5 * Math.sin(c * 0.62 + r * 0.45)) + r * 0.08;
        cells.push({ x: -2.7 + c * 0.6, z: -6 - r * 0.7, raw, clean });
      }
    }
    const curvePts = Array.from({ length: 24 }, (_, i) => new THREE.Vector3(i * 0.31, 2.4 + 0.7 * Math.sin(i * 0.32) + i * 0.03, -10.9));
    const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curvePts), 120, 0.03, 6, false);
    return { cells, tube };
  }, []);
  useLayoutEffect(() => () => data.tube.dispose(), [data]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const write = useMemo(
    () => (m: THREE.InstancedMesh, k: number) => {
      data.cells.forEach((c, i) => {
        const h = THREE.MathUtils.lerp(c.raw, c.clean, k);
        dummy.position.set(c.x, h / 2, c.z);
        dummy.scale.set(1, h, 1);
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
      });
      m.instanceMatrix.needsUpdate = true;
    },
    [data, dummy],
  );

  useFrame((state) => {
    const r = driver.r3;
    if (bars.current) write(bars.current, span(r, 0.15, 0.6));
    if (line.current) line.current.scale.x = Math.max(0.001, span(r, 0.55, 0.85));
    const t = state.clock.elapsedTime;
    streams.current.forEach((s, i) => {
      if (!s) return;
      s.visible = r > 0.05;
      const u = (t * 0.25 + i * 0.17) % 1;
      s.position.set(-3.1 + u * 6.2, 0.05, -5.65 - (i % ROWS) * 0.7);
    });
  });

  return (
    <group>
      {/* Architectural columns framing the lab */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 4.2, 2.8, -10.4]} material={mats.stoneLight}>
          <cylinderGeometry args={[0.32, 0.36, 5.6, 24]} />
        </mesh>
      ))}
      {/* Plot "wall": rose panel with the gold trend line drawing across it */}
      <mesh position={[0, 2.7, -11.27]} material={mats.rose}>
        <planeGeometry args={[7.6, 2.6]} />
      </mesh>
      {/* geometry starts at x = 0, so scaling x draws the line from the left */}
      <mesh ref={line} geometry={data.tube} material={mats.gold} position={[-3.6, 0, 0]} />
      {/* The data field: raw → cleaned */}
      <instancedMesh ref={bars} args={[undefined, undefined, COLS * ROWS]} material={mats.burgundy}>
        <boxGeometry args={[0.3, 1, 0.3]} />
      </instancedMesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, -7.4]} material={mats.espresso}>
        <planeGeometry args={[6.6, 3.9]} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} ref={(m) => { streams.current[i] = m; }} material={mats.gold} visible={false}>
          <boxGeometry args={[0.22, 0.03, 0.05]} />
        </mesh>
      ))}
    </group>
  );
}
