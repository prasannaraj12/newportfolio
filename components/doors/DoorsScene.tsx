"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { doors } from "@/lib/content";
import { ASSEMBLIES, EYE, type DoorsDriver } from "./layout";
import { createMaterials } from "./materials";
import { Corridor } from "./Corridor";
import { Door } from "./Door";
import { DataLab, IntelligenceStudio, SustainabilityGallery } from "./Rooms";

/** Camera driven entirely by the scroll timeline (no free orbit). */
function CameraRig({ driver }: { driver: DoorsDriver }) {
  useFrame((state) => {
    const c = state.camera;
    c.position.set(driver.x, EYE, driver.z);
    c.rotation.set(driver.pitch, driver.yaw, 0, "YXZ");
  });
  return null;
}

function World({ driver }: { driver: DoorsDriver }) {
  const mats = useMemo(() => createMaterials(), []);
  useEffect(() => () => mats.dispose(), [mats]);

  return (
    <>
      <color attach="background" args={["#efe8dc"]} />
      <fog attach="fog" args={["#efe8dc", 14, 46]} />
      <hemisphereLight args={["#fff6ea", "#d8ccbb", 0.85]} />
      <directionalLight position={[4, 8, 6]} intensity={1.1} color="#ffeedd" />

      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={1.6} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[8, 30, 1]} color="#fff4e6" />
        <Lightformer form="rect" intensity={0.8} position={[-6, 2, 0]} rotation-y={Math.PI / 2} scale={[30, 4, 1]} color="#efe6d8" />
        <Lightformer form="rect" intensity={0.8} position={[6, 2, 0]} rotation-y={-Math.PI / 2} scale={[30, 4, 1]} color="#efe6d8" />
      </Environment>

      <CameraRig driver={driver} />
      <Corridor mats={mats} />

      <Door index={0} assembly={ASSEMBLIES[0]} plate={doors[0].plate} mats={mats} variant="burgundy" driver={driver} roomMaterial={mats.stone}>
        <IntelligenceStudio mats={mats} driver={driver} />
      </Door>
      <Door index={1} assembly={ASSEMBLIES[1]} plate={doors[1].plate} mats={mats} variant="sage" driver={driver} roomMaterial={mats.sage}>
        <SustainabilityGallery mats={mats} driver={driver} />
      </Door>
      <Door index={2} assembly={ASSEMBLIES[2]} plate={doors[2].plate} mats={mats} variant="burgundy" driver={driver} roomMaterial={mats.stone}>
        <DataLab mats={mats} driver={driver} />
      </Door>
    </>
  );
}

export default function DoorsScene({ driver, active }: { driver: DoorsDriver; active: boolean }) {
  const [dpr, setDpr] = useState(1.25);
  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 52, near: 0.05, far: 80, position: [0, EYE, 3.2] }}
      gl={{ antialias: true, powerPreference: "high-performance", stencil: false }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.25)} />
      <World driver={driver} />
    </Canvas>
  );
}
