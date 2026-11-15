"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { portraitFragment, portraitVertex } from "./portraitShader";

/** Mutable state written by GSAP / pointer handlers and read every frame. */
export type PortraitDriver = { reveal: number; exit: number };

type Props = {
  src: string;
  size: { w: number; h: number };
  /** Point of the image (uv, y up) kept in frame when cropping. */
  focus: [number, number];
  /** Face centre (uv, y up) and radius, protected from pointer smears. */
  face: [number, number, number];
  mask: [number, number, number, number];
  driver: PortraitDriver;
  onReady?: () => void;
};

function PortraitPlane({ src, size, focus, face, mask, driver, onReady }: Props) {
  const tex = useTexture(src);
  const { size: viewport, gl } = useThree();
  const pointer = useRef({ x: 0, y: 0, cx: 0, cy: 0, vy: 0.5, speed: 0, lastX: 0, lastY: 0 });

  const mat = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      vertexShader: portraitVertex,
      fragmentShader: portraitFragment,
      transparent: true,
      depthTest: false,
      uniforms: {
        uTex: { value: null },
        uTexSize: { value: new THREE.Vector2(size.w, size.h) },
        uRes: { value: new THREE.Vector2(1, 1) },
        uFocus: { value: new THREE.Vector2(...focus) },
        uFace: { value: new THREE.Vector3(...face) },
        uMouse: { value: new THREE.Vector2() },
        uMouseY: { value: 0.5 },
        uVel: { value: 0 },
        uReveal: { value: 0 },
        uExit: { value: 0 },
        uTime: { value: 0 },
        uRows: { value: 96 },
        uMask: { value: new THREE.Vector4(...mask) },
      },
    });
    return {
      material: m,
      setTexture(t: THREE.Texture) {
        t.colorSpace = THREE.NoColorSpace; // shader grades raw sRGB values directly
        t.minFilter = THREE.LinearFilter;
        t.generateMipmaps = false;
        t.needsUpdate = true;
        m.uniforms.uTex.value = t;
      },
      resize(w: number, h: number) {
        m.uniforms.uRes.value.set(w, h);
        m.uniforms.uRows.value = h < 500 ? 64 : 96;
      },
      frame(t: number, d: { mx: number; my: number; vy: number; vel: number }) {
        m.uniforms.uTime.value = t;
        m.uniforms.uMouse.value.set(d.mx, d.my);
        m.uniforms.uMouseY.value = d.vy;
        m.uniforms.uVel.value = d.vel;
        m.uniforms.uReveal.value = driver.reveal;
        m.uniforms.uExit.value = driver.exit;
      },
    };
  }, [size.w, size.h, focus, face, mask, driver]);

  useEffect(() => mat.setTexture(tex), [mat, tex]);
  useEffect(() => mat.resize(viewport.width, viewport.height), [mat, viewport.width, viewport.height]);
  useEffect(() => () => mat.material.dispose(), [mat]);

  // Track the pointer over the whole window; the canvas itself ignores events.
  useEffect(() => {
    const el = gl.domElement;
    const onMove = (e: PointerEvent) => {
      const p = pointer.current;
      p.x = (e.clientX / window.innerWidth) * 2 - 1;
      p.y = (e.clientY / window.innerHeight) * 2 - 1;
      const r = el.getBoundingClientRect();
      p.vy = 1 - (e.clientY - r.top) / r.height;
      const dx = e.clientX - p.lastX;
      const dy = e.clientY - p.lastY;
      p.speed = Math.min(1, p.speed + Math.hypot(dx, dy) / 260);
      p.lastX = e.clientX;
      p.lastY = e.clientY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [gl]);

  const announced = useRef(false);
  useFrame((state, delta) => {
    const p = pointer.current;
    const dt = Math.min(delta, 1 / 30);
    p.cx = THREE.MathUtils.damp(p.cx, p.x, 3, dt);
    p.cy = THREE.MathUtils.damp(p.cy, p.y, 3, dt);
    p.speed = THREE.MathUtils.damp(p.speed, 0, 2.5, dt);
    mat.frame(state.clock.elapsedTime, { mx: p.cx, my: -p.cy, vy: p.vy, vel: p.speed });
    if (!announced.current) {
      announced.current = true;
      requestAnimationFrame(() => onReady?.());
    }
  });

  return (
    <mesh frustumCulled={false} material={mat.material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

export default function PortraitStage(props: Props & { active: boolean }) {
  const { active, ...rest } = props;
  return (
    <Canvas
      flat
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance", stencil: false, depth: false }}
      style={{ pointerEvents: "none" }}
    >
      <PortraitPlane {...rest} />
    </Canvas>
  );
}
