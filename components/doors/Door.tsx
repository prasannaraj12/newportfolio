"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DOOR, ROOM, key, type Assembly, type DoorsDriver } from "./layout";
import { nameplateTexture, type Materials } from "./materials";

type Props = {
  index: number;
  assembly: Assembly;
  plate: string;
  mats: Materials;
  variant: "burgundy" | "sage";
  driver: DoorsDriver;
  roomMaterial: THREE.Material;
  children?: React.ReactNode; // room contents, in the local frame
};

const OPEN_ANGLE = THREE.MathUtils.degToRad(96);

/** One leaf: slab + raised panels + trim + lever handle, pivoting at its hinge edge. */
function Leaf({ side, mats, variant }: { side: 1 | -1; mats: Materials; variant: "burgundy" | "sage" }) {
  // side = 1 → hinge on the left, leaf extends to +x. side = -1 → mirror.
  const L = DOOR.leaf - 0.01;
  const slab = variant === "sage" ? mats.mutedBurgundy : mats.burgundy;
  const panel = variant === "sage" ? mats.sage : mats.burgundyDeep;
  const cx = (side * L) / 2;
  return (
    <>
      <mesh position={[cx, DOOR.height / 2, 0]} material={slab}>
        <boxGeometry args={[L, DOOR.height - 0.02, DOOR.thick]} />
      </mesh>
      {/* raised panels, both faces */}
      {[1.25, 3.25].map((y) => (
        <group key={y}>
          <mesh position={[cx, y, DOOR.thick / 2 + 0.015]} material={panel}>
            <boxGeometry args={[L - 0.42, y > 2 ? 1.8 : 1.6, 0.03]} />
          </mesh>
          <mesh position={[cx, y, -DOOR.thick / 2 - 0.015]} material={panel}>
            <boxGeometry args={[L - 0.42, y > 2 ? 1.8 : 1.6, 0.03]} />
          </mesh>
        </group>
      ))}
      {/* gold rail between panels */}
      <mesh position={[cx, 2.26, DOOR.thick / 2 + 0.02]} material={mats.gold}>
        <boxGeometry args={[L - 0.3, 0.025, 0.02]} />
      </mesh>
    </>
  );
}

export function Door({ index, assembly, plate, mats, variant, driver, roomMaterial, children }: Props) {
  const leftLeaf = useRef<THREE.Group>(null);
  const rightLeaf = useRef<THREE.Group>(null);
  const leverL = useRef<THREE.Group>(null);
  const leverR = useRef<THREE.Group>(null);
  const bolt = useRef<THREE.Mesh>(null);
  const spot = useRef<THREE.SpotLight>(null);
  const roomLight = useRef<THREE.PointLight>(null);
  const room = useRef<THREE.Group>(null);

  const res = useMemo(() => {
    const tex = nameplateTexture(plate);
    const plateMat = new THREE.MeshStandardMaterial({ map: tex, metalness: 0.75, roughness: 0.32, envMapIntensity: 1.2 });
    const target = new THREE.Object3D();
    target.position.set(0, 1.7, 0);
    return { tex, plateMat, target };
  }, [plate]);

  useEffect(() => {
    if (spot.current) spot.current.target = res.target;
    return () => {
      res.tex.dispose();
      res.plateMat.dispose();
    };
  }, [res]);

  useFrame(() => {
    const h = driver[key(index, "h")];
    const d = driver[key(index, "d")];
    const l = driver[key(index, "l")];
    // Hinged leaves swing inward (into the room, local -z).
    const ease = d * d * (3 - 2 * d);
    if (leftLeaf.current) leftLeaf.current.rotation.y = ease * OPEN_ANGLE;
    if (rightLeaf.current) rightLeaf.current.rotation.y = -ease * OPEN_ANGLE;
    if (leverL.current) leverL.current.rotation.z = h * 0.75;
    if (leverR.current) leverR.current.rotation.z = -h * 0.75;
    if (bolt.current) bolt.current.position.y = DOOR.height - 0.22 + h * 0.18;
    if (spot.current) spot.current.intensity = 6 + l * 70;
    if (roomLight.current) roomLight.current.intensity = d * 38;
    if (room.current) room.current.visible = d > 0.002;
  });

  const W = DOOR.width;
  const H = DOOR.height;

  return (
    <group position={[assembly.x, 0, assembly.z]} rotation={[0, assembly.rotY, 0]}>
      {/* Stone architrave on the corridor face */}
      <mesh position={[-W / 2 - 0.2, H / 2 + 0.2, 0.06]} material={mats.stoneLight}>
        <boxGeometry args={[0.4, H + 0.4, 0.14]} />
      </mesh>
      <mesh position={[W / 2 + 0.2, H / 2 + 0.2, 0.06]} material={mats.stoneLight}>
        <boxGeometry args={[0.4, H + 0.4, 0.14]} />
      </mesh>
      <mesh position={[0, H + 0.28, 0.08]} material={mats.stoneLight}>
        <boxGeometry args={[W + 1.1, 0.56, 0.2]} />
      </mesh>
      {/* Reveal (inner jambs) so the wall thickness reads as solid stone */}
      <mesh position={[-W / 2 - 0.02, H / 2, -0.15]} material={mats.stone}>
        <boxGeometry args={[0.04, H, 0.3]} />
      </mesh>
      <mesh position={[W / 2 + 0.02, H / 2, -0.15]} material={mats.stone}>
        <boxGeometry args={[0.04, H, 0.3]} />
      </mesh>

      {/* Engraved brass nameplate */}
      <mesh position={[0, H + 0.95, 0.06]} material={res.plateMat}>
        <boxGeometry args={[1.7, 0.37, 0.03]} />
      </mesh>

      {/* Leaves, pivoting at their hinges */}
      <group ref={leftLeaf} position={[-W / 2, 0, -0.15]}>
        <Leaf side={1} mats={mats} variant={variant} />
        {/* hinges */}
        {[0.6, 2.3, 4.0].map((y) => (
          <mesh key={y} position={[0, y, 0]} material={mats.gold}>
            <cylinderGeometry args={[0.035, 0.035, 0.22, 10]} />
          </mesh>
        ))}
        {/* lever handle (corridor side) */}
        <group ref={leverL} position={[DOOR.leaf - 0.16, 1.55, DOOR.thick / 2 + 0.03]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={mats.gold}>
            <cylinderGeometry args={[0.055, 0.055, 0.03, 20]} />
          </mesh>
          <mesh position={[-0.11, 0, 0.04]} material={mats.gold}>
            <boxGeometry args={[0.24, 0.035, 0.035]} />
          </mesh>
        </group>
      </group>

      <group ref={rightLeaf} position={[W / 2, 0, -0.15]}>
        <Leaf side={-1} mats={mats} variant={variant} />
        {[0.6, 2.3, 4.0].map((y) => (
          <mesh key={y} position={[0, y, 0]} material={mats.gold}>
            <cylinderGeometry args={[0.035, 0.035, 0.22, 10]} />
          </mesh>
        ))}
        <group ref={leverR} position={[-(DOOR.leaf - 0.16), 1.55, DOOR.thick / 2 + 0.03]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={mats.gold}>
            <cylinderGeometry args={[0.055, 0.055, 0.03, 20]} />
          </mesh>
          <mesh position={[0.11, 0, 0.04]} material={mats.gold}>
            <boxGeometry args={[0.24, 0.035, 0.035]} />
          </mesh>
        </group>
        {/* Lock bolt at the meeting edge */}
        <mesh ref={bolt} position={[-(DOOR.leaf - 0.05), DOOR.height - 0.22, DOOR.thick / 2 + 0.02]} material={mats.gold}>
          <boxGeometry args={[0.04, 0.3, 0.04]} />
        </mesh>
      </group>

      {/* Light that finds the handles and nameplate as you approach */}
      <primitive object={res.target} />
      <spotLight ref={spot} position={[0, 5.9, 2.6]} angle={0.55} penumbra={0.85} decay={1.6} distance={12} color="#ffe9cf" intensity={6} />

      {/* Room behind the door (local -z) */}
      <group ref={room} visible={false}>
        <pointLight ref={roomLight} position={[0, ROOM.height - 0.8, -ROOM.depth / 2]} distance={16} decay={1.5} color="#ffe6c8" intensity={0} />
        <RoomShell material={roomMaterial} mats={mats} />
        {children}
      </group>
    </group>
  );
}

/** Floor, walls and ceiling of a room behind a doorway (local frame). */
function RoomShell({ material, mats }: { material: THREE.Material; mats: Materials }) {
  const { halfWidth: hw, depth: dp, height: rh } = ROOM;
  const z0 = -0.3; // back face of the corridor wall
  const zc = z0 - dp / 2;
  const sideW = hw - DOOR.width / 2;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, zc]} material={mats.floor}>
        <planeGeometry args={[hw * 2, dp]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, rh, zc]} material={mats.ceiling}>
        <planeGeometry args={[hw * 2, dp]} />
      </mesh>
      {/* back wall */}
      <mesh position={[0, rh / 2, z0 - dp]} material={material}>
        <planeGeometry args={[hw * 2, rh]} />
      </mesh>
      {/* side walls */}
      <mesh position={[-hw, rh / 2, zc]} rotation={[0, Math.PI / 2, 0]} material={material}>
        <planeGeometry args={[dp, rh]} />
      </mesh>
      <mesh position={[hw, rh / 2, zc]} rotation={[0, -Math.PI / 2, 0]} material={material}>
        <planeGeometry args={[dp, rh]} />
      </mesh>
      {/* inner face of the front wall, around the doorway */}
      <mesh position={[-(DOOR.width / 2 + sideW / 2), rh / 2, z0]} rotation={[0, Math.PI, 0]} material={material}>
        <planeGeometry args={[sideW, rh]} />
      </mesh>
      <mesh position={[DOOR.width / 2 + sideW / 2, rh / 2, z0]} rotation={[0, Math.PI, 0]} material={material}>
        <planeGeometry args={[sideW, rh]} />
      </mesh>
      <mesh position={[0, (DOOR.height + rh) / 2, z0]} rotation={[0, Math.PI, 0]} material={material}>
        <planeGeometry args={[DOOR.width, rh - DOOR.height]} />
      </mesh>
      {/* skirting */}
      <mesh position={[0, 0.06, z0 - dp + 0.02]} material={mats.espresso}>
        <boxGeometry args={[hw * 2, 0.12, 0.03]} />
      </mesh>
    </group>
  );
}
