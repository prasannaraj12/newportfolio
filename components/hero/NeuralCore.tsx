"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import {
  createGlowTexture,
  createLattice,
  createParticles,
  createSegmentedRing,
  createShellGeometry,
  createTickRing,
} from "./geometry";
import {
  latticeFragment,
  latticeVertex,
  nodeFragment,
  nodeVertex,
  particleFragment,
  particleVertex,
} from "./shaders";

/** Mutable, animation-driven state shared between GSAP (DOM) and the render loop. */
export type SceneDriver = { intro: number; scroll: number };

type Props = {
  driver: SceneDriver;
  particleCount: number;
  reducedMotion: boolean;
};

const { damp } = THREE.MathUtils;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function useSceneResources(particleCount: number, dpr: number) {
  return useMemo(() => {
    const shell = createShellGeometry(1, 3, 0.9);
    const ringA = createSegmentedRing(1.62, 0.055, 6, 0.12, 32);
    const ringB = createSegmentedRing(1.92, 0.018, 28, 0.45, 6);
    const ringC = createSegmentedRing(2.3, 0.012, 3, 0.3, 48);
    const ticks = createTickRing(2.5, 120, 10);
    const lattice = createLattice(72, 3.1, 3);
    const particles = createParticles(particleCount, 3.6, 10);
    const glow = createGlowTexture(128);

    const titanium = new THREE.MeshStandardMaterial({
      color: "#c9d0db",
      metalness: 1,
      roughness: 0.26,
      envMapIntensity: 1.25,
    });
    const ringMetal = new THREE.MeshStandardMaterial({
      color: "#dfe4ec",
      metalness: 1,
      roughness: 0.18,
      side: THREE.DoubleSide,
    });
    const coreGlow = new THREE.MeshBasicMaterial({ color: "#3d86ff", toneMapped: false });
    const voltLine = new THREE.MeshBasicMaterial({
      color: "#5ea0ff",
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const tickMat = new THREE.LineBasicMaterial({ color: "#7c8697", transparent: true, opacity: 0.45 });
    const halo = new THREE.SpriteMaterial({
      map: glow,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.9,
    });

    const latticeMat = new THREE.ShaderMaterial({
      vertexShader: latticeVertex,
      fragmentShader: latticeFragment,
      uniforms: { uTime: { value: 0 }, uIntensity: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const nodeMat = new THREE.ShaderMaterial({
      vertexShader: nodeVertex,
      fragmentShader: nodeFragment,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: dpr }, uIntensity: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particleMat = new THREE.ShaderMaterial({
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: dpr }, uSize: { value: 38 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    /** Per-frame uniform updates live with the materials they own. */
    const update = (t: number, speed: number, intro: number) => {
      latticeMat.uniforms.uTime.value = t;
      nodeMat.uniforms.uTime.value = t;
      particleMat.uniforms.uTime.value = t * speed;
      latticeMat.uniforms.uIntensity.value = intro;
      nodeMat.uniforms.uIntensity.value = intro;
      halo.opacity = 0.55 + 0.25 * Math.sin(t * 1.4) * speed + 0.2 * intro;
    };

    return {
      geo: { shell, ringA, ringB, ringC, ticks, lattice, particles },
      mat: { titanium, ringMetal, coreGlow, voltLine, tickMat, halo, latticeMat, nodeMat, particleMat },
      glow,
      update,
    };
  }, [particleCount, dpr]);
}

export function NeuralCore({ driver, particleCount, reducedMotion }: Props) {
  const dpr = useThree((s) => s.viewport.dpr);
  const res = useSceneResources(particleCount, dpr);

  const root = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Group>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const ringC = useRef<THREE.Group>(null);
  const lattice = useRef<THREE.Group>(null);
  const field = useRef<THREE.Points>(null);

  // Explicit GPU cleanup for every geometry/material/texture we created.
  useEffect(() => {
    return () => {
      Object.values(res.geo).forEach((g) => {
        if (g instanceof THREE.BufferGeometry) g.dispose();
        else {
          g.lines.dispose();
          g.points.dispose();
        }
      });
      Object.values(res.mat).forEach((m) => m.dispose());
      res.glow.dispose();
    };
  }, [res]);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 30); // avoid jumps after tab switches
    const t = state.clock.elapsedTime;
    const speed = reducedMotion ? 0.25 : 1;
    const intro = easeOutCubic(driver.intro);
    const scroll = driver.scroll;
    const { pointer, camera } = state;
    res.update(t, speed, intro);

    // Cinematic camera: dolly in on intro, push through on scroll, parallax on pointer.
    // Rest distance is aspect-aware so the assembly fits narrow portrait screens.
    const persp = camera as THREE.PerspectiveCamera;
    const halfTan = Math.tan(THREE.MathUtils.degToRad(persp.fov / 2));
    const fitZ = 1.75 / (halfTan * persp.aspect);
    const restZ = Math.max(6.4, fitZ);
    const portrait = persp.aspect < 0.85;
    const targetZ = THREE.MathUtils.lerp(restZ + 5.5, restZ, intro) - scroll * 3.2;
    camera.position.z = damp(camera.position.z, targetZ, 3.5, delta);
    camera.position.x = damp(camera.position.x, pointer.x * 0.45, 2.2, delta);
    camera.position.y = damp(camera.position.y, pointer.y * 0.3 + scroll * 0.9, 2.2, delta);
    // On portrait screens aim below the object so it sits above the headline.
    camera.lookAt(0, scroll * 0.4 - (portrait ? 1.4 : 0), 0);

    if (!root.current || !shell.current) return;

    // Pointer-responsive tilt of the whole assembly.
    root.current.rotation.x = damp(root.current.rotation.x, -pointer.y * 0.32, 2.8, delta);
    root.current.rotation.y = damp(root.current.rotation.y, pointer.x * 0.5, 2.8, delta);
    root.current.scale.setScalar(0.5 + 0.5 * intro);

    shell.current.rotation.y += delta * 0.14 * speed;
    shell.current.rotation.x += delta * 0.045 * speed;

    if (ringA.current) ringA.current.rotation.z += delta * 0.32 * speed;
    if (ringB.current) ringB.current.rotation.z -= delta * 0.18 * speed;
    if (ringC.current) {
      ringC.current.rotation.z += delta * 0.07 * speed;
      // Scroll opens the orbital planes like an exploded view.
      ringC.current.rotation.x = damp(ringC.current.rotation.x, 1.15 + scroll * 0.5, 3, delta);
    }
    if (lattice.current) {
      lattice.current.rotation.y -= delta * 0.05 * speed;
      lattice.current.scale.setScalar(damp(lattice.current.scale.x, 1 + scroll * 0.35, 3, delta));
    }
    if (field.current) field.current.rotation.y += delta * 0.015 * speed;
  });

  const { geo, mat } = res;

  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight position={[4, 5, 3]} intensity={2.4} color="#f4f6f9" />
      <directionalLight position={[-5, -2, -4]} intensity={3.2} color="#2f7bff" />
      <pointLight position={[0, 0, 0]} intensity={6} distance={3} color="#3d86ff" />

      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.6} position={[0, 5, -3]} scale={[12, 1.2, 1]} />
        <Lightformer
          form="rect"
          intensity={1.4}
          position={[-6, 1, 1]}
          rotation-y={Math.PI / 2}
          scale={[9, 0.6, 1]}
        />
        <Lightformer
          form="rect"
          color="#2f7bff"
          intensity={5}
          position={[6, -1, 0]}
          rotation-y={-Math.PI / 2}
          scale={[9, 1.4, 1]}
        />
        <Lightformer form="ring" color="#9cc4ff" intensity={1.6} position={[0, 0, 7]} scale={3} />
      </Environment>

      <group ref={root}>
        {/* Titanium shell + luminous processor */}
        <group ref={shell}>
          <mesh geometry={geo.shell} material={mat.titanium} />
          <mesh material={mat.coreGlow}>
            <icosahedronGeometry args={[0.86, 2]} />
          </mesh>
        </group>
        <sprite material={mat.halo} scale={4.6} />

        {/* Orbital assembly */}
        <mesh ref={ringA} geometry={geo.ringA} material={mat.ringMetal} rotation={[1.2, 0.2, 0]} />
        <mesh ref={ringB} geometry={geo.ringB} material={mat.voltLine} rotation={[-0.5, 0.9, 0]} />
        <group ref={ringC} rotation={[1.15, -0.35, 0]}>
          <mesh geometry={geo.ringC} material={mat.ringMetal} />
          <lineSegments geometry={geo.ticks} material={mat.tickMat} />
        </group>

        {/* Neural lattice */}
        <group ref={lattice}>
          <lineSegments geometry={geo.lattice.lines} material={mat.latticeMat} />
          <points geometry={geo.lattice.points} material={mat.nodeMat} />
        </group>
      </group>

      <points ref={field} geometry={geo.particles} material={mat.particleMat} />
    </>
  );
}
