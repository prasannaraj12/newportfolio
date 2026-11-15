"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { NeuralCore, type SceneDriver } from "./NeuralCore";

type Quality = { particles: number; maxDpr: number };

function detectQuality(): Quality {
  const mobile = window.matchMedia("(max-width: 768px)").matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  if (mobile) return { particles: 600, maxDpr: 1.5 };
  if (cores <= 4) return { particles: 900, maxDpr: 1.25 };
  // Tuned for integrated GPUs (e.g. Intel Iris Xe / UHD): modest particle
  // count and DPR capped at 1.5 even on high-density displays.
  return { particles: 1400, maxDpr: 1.5 };
}

export default function HeroCanvas({
  driver,
  active,
  onReady,
}: {
  driver: SceneDriver;
  active: boolean;
  onReady?: () => void;
}) {
  const [quality, setQuality] = useState<Quality | null>(null);
  const [dpr, setDpr] = useState(1);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const q = detectQuality();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only capability probe
    setQuality(q);
    setDpr(Math.min(window.devicePixelRatio, q.maxDpr));
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  if (!quality) return null;

  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 18], fov: 32, near: 0.1, far: 80 }}
      gl={{
        antialias: dpr < 1.5,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        // Signal after the first frame is on screen so the intro starts on a live scene.
        requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
      }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(Math.min(window.devicePixelRatio, quality.maxDpr))}
      />
      <Suspense fallback={null}>
        <NeuralCore driver={driver} particleCount={quality.particles} reducedMotion={reduced} />
      </Suspense>
    </Canvas>
  );
}
