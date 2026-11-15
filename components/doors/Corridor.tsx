"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ATRIUM, CORRIDOR, DOOR, OPENINGS } from "./layout";
import type { Materials } from "./materials";

const { halfWidth: HW, height: H, start: Z0, end: Z1, wall: T } = CORRIDOR;
const LEN = Z0 - Z1;

/** Split [Z1, Z0] into wall segments that skip the door openings. */
function segments(openings: readonly (readonly [number, number])[]) {
  const sorted = [...openings].sort((a, b) => b[1] - a[1]);
  const out: [number, number][] = [];
  let top: number = Z0;
  for (const [lo, hi] of sorted) {
    out.push([hi, top]);
    top = lo;
  }
  out.push([Z1, top]);
  return out.filter(([lo, hi]) => hi - lo > 0.01);
}

function Wall({ side, mats }: { side: -1 | 1; mats: Materials }) {
  const openings = side < 0 ? OPENINGS.left : OPENINGS.right;
  const x = side * (HW + T / 2);
  return (
    <group>
      {segments(openings).map(([lo, hi]) => (
        <mesh key={`${lo}`} position={[x, H / 2, (lo + hi) / 2]} material={mats.stone}>
          <boxGeometry args={[T, H, hi - lo]} />
        </mesh>
      ))}
      {/* lintels above each opening */}
      {openings.map(([lo, hi]) => (
        <mesh key={`l${lo}`} position={[x, (DOOR.height + H) / 2, (lo + hi) / 2]} material={mats.stone}>
          <boxGeometry args={[T, H - DOOR.height, hi - lo]} />
        </mesh>
      ))}
    </group>
  );
}

/** Instanced pilasters along both walls, skipping the doorways. */
function Pilasters({ mats }: { mats: Materials }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const spots = useMemo(() => {
    const list: [number, number][] = [];
    for (let z = Z0 - 2; z > Z1 + 1; z -= 4) {
      for (const side of [-1, 1] as const) {
        const ops = side < 0 ? OPENINGS.left : OPENINGS.right;
        if (ops.some(([lo, hi]) => z > lo - 0.9 && z < hi + 0.9)) continue;
        list.push([side * (HW - 0.12), z]);
      }
    }
    return list;
  }, []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    spots.forEach(([x, z], i) => {
      o.position.set(x, H / 2, z);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [spots]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, spots.length]} material={mats.stoneLight}>
      <boxGeometry args={[0.24, H, 0.55]} />
    </instancedMesh>
  );
}

export function Corridor({ mats }: { mats: Materials }) {
  return (
    <group>
      {/* Polished stone floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, (Z0 + Z1) / 2]} material={mats.floor}>
        <planeGeometry args={[HW * 2, LEN]} />
      </mesh>
      {/* Inlaid runner: burgundy band with gold edges */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, (Z0 + Z1) / 2]} material={mats.burgundyDeep}>
        <planeGeometry args={[1.1, LEN]} />
      </mesh>
      {[-0.6, 0.6].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.003, (Z0 + Z1) / 2]} material={mats.gold}>
          <planeGeometry args={[0.04, LEN]} />
        </mesh>
      ))}

      <Wall side={-1} mats={mats} />
      <Wall side={1} mats={mats} />
      <Pilasters mats={mats} />

      {/* Cornice + skirting */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * (HW - 0.18), H - 0.25, (Z0 + Z1) / 2]} material={mats.stoneLight}>
            <boxGeometry args={[0.36, 0.3, LEN]} />
          </mesh>
          <mesh position={[s * (HW - 0.03), 0.09, (Z0 + Z1) / 2]} material={mats.espresso}>
            <boxGeometry args={[0.06, 0.18, LEN]} />
          </mesh>
        </group>
      ))}

      {/* Ceiling with recessed light coves */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, (Z0 + Z1) / 2]} material={mats.ceiling}>
        <planeGeometry args={[HW * 2, LEN]} />
      </mesh>
      {Array.from({ length: Math.floor(LEN / 4) }, (_, i) => (
        <mesh key={i} position={[0, H - 0.02, Z0 - 2 - i * 4]} material={mats.glow}>
          <boxGeometry args={[2.2, 0.03, 0.22]} />
        </mesh>
      ))}

      {/* Entrance wall behind the visitor */}
      <mesh position={[0, H / 2, Z0]} rotation={[0, Math.PI, 0]} material={mats.stone}>
        <planeGeometry args={[HW * 2, H]} />
      </mesh>

      <Atrium mats={mats} />
    </group>
  );
}

/** The final destination: an open ivory hall at the end of the corridor. */
function Atrium({ mats }: { mats: Materials }) {
  const { halfWidth: aw, depth: ad, height: ah } = ATRIUM;
  const zc = Z1 - ad / 2;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, zc]} material={mats.floor}>
        <planeGeometry args={[aw * 2, ad]} />
      </mesh>
      <mesh position={[0, ah / 2, Z1 - ad]} material={mats.stone}>
        <planeGeometry args={[aw * 2, ah]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * aw, ah / 2, zc]} rotation={[0, -s * (Math.PI / 2), 0]} material={mats.stone}>
          <planeGeometry args={[ad, ah]} />
        </mesh>
      ))}
      {/* wall returning from the atrium to the corridor mouth */}
      {[-1, 1].map((s) => (
        <mesh key={`r${s}`} position={[s * (HW + (aw - HW) / 2), ah / 2, Z1]} rotation={[0, Math.PI, 0]} material={mats.stone}>
          <planeGeometry args={[aw - HW, ah]} />
        </mesh>
      ))}
      <mesh position={[0, (H + ah) / 2, Z1]} rotation={[0, Math.PI, 0]} material={mats.stone}>
        <planeGeometry args={[HW * 2, ah - H]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ah, zc]} material={mats.ceiling}>
        <planeGeometry args={[aw * 2, ad]} />
      </mesh>
      {/* Colonnade */}
      {[-1, 1].flatMap((s) =>
        [0, 1, 2, 3].map((k) => (
          <mesh key={`c${s}${k}`} position={[s * (aw - 2), ah / 2, Z1 - 3 - k * 4.5]} material={mats.stoneLight}>
            <cylinderGeometry args={[0.42, 0.48, ah, 24]} />
          </mesh>
        )),
      )}
      {/* "The next door": an open, unhung frame waiting at the far wall */}
      <group position={[0, 0, Z1 - ad + 0.6]}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 1.75, 2.6, 0]} material={mats.gold}>
            <boxGeometry args={[0.16, 5.2, 0.16]} />
          </mesh>
        ))}
        <mesh position={[0, 5.2, 0]} material={mats.gold}>
          <boxGeometry args={[3.66, 0.16, 0.16]} />
        </mesh>
        <mesh position={[0, 2.6, -0.3]} material={mats.glow}>
          <planeGeometry args={[3.3, 5.2]} />
        </mesh>
      </group>
    </group>
  );
}
