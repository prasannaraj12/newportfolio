"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

export type Form = { freq: number; amp: number; twist: number; speed: number };

const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
uniform float uTime; uniform float uFreq; uniform float uAmp; uniform float uTwist;
vec3 liquid(vec3 p){
  float a = p.y * uTwist;
  float c = cos(a), s = sin(a);
  vec3 q = vec3(c*p.x - s*p.z, p.y, s*p.x + c*p.z);
  float n = snoise(q*uFreq + vec3(0.0, uTime*0.22, uTime*0.1));
  n += 0.45 * snoise(q*uFreq*2.2 - vec3(uTime*0.15));
  return p * (1.0 + n * uAmp);
}
`;

function Sculpture({ form, detail }: { form: Form; detail: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const t = useRef(0);

  const res = useMemo(() => {
    const uniforms = {
      uTime: { value: 0 },
      uFreq: { value: form.freq },
      uAmp: { value: form.amp },
      uTwist: { value: form.twist },
    };
    const material = new THREE.MeshPhysicalMaterial({
      color: "#d9dee6",
      metalness: 1,
      roughness: 0.14,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.35,
    });
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>\n${NOISE}`)
        .replace(
          "#include <beginnormal_vertex>",
          `
          vec3 nrm0 = normalize(position);
          vec3 helper = abs(nrm0.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
          vec3 tng = normalize(cross(nrm0, helper));
          vec3 btg = normalize(cross(nrm0, tng));
          vec3 lp0 = liquid(position);
          vec3 lp1 = liquid(normalize(position + tng * 0.012));
          vec3 lp2 = liquid(normalize(position + btg * 0.012));
          vec3 objectNormal = normalize(cross(lp1 - lp0, lp2 - lp0));
          if (dot(objectNormal, nrm0) < 0.0) objectNormal = -objectNormal;
          `,
        )
        .replace("#include <begin_vertex>", "vec3 transformed = lp0;");
    };
    const geometry = new THREE.IcosahedronGeometry(1, detail);
    return {
      material,
      geometry,
      step(dt: number, f: Form) {
        t.current += dt * f.speed;
        uniforms.uTime.value = t.current;
        uniforms.uFreq.value = THREE.MathUtils.damp(uniforms.uFreq.value, f.freq, 2.2, dt);
        uniforms.uAmp.value = THREE.MathUtils.damp(uniforms.uAmp.value, f.amp, 2.2, dt);
        uniforms.uTwist.value = THREE.MathUtils.damp(uniforms.uTwist.value, f.twist, 2.2, dt);
      },
    };
    // Built once; `form` changes are eased in step().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail]);

  useEffect(
    () => () => {
      res.material.dispose();
      res.geometry.dispose();
    },
    [res],
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    res.step(dt, form);
    const m = mesh.current;
    if (!m) return;
    m.rotation.y += dt * 0.12;
    m.rotation.x = THREE.MathUtils.damp(m.rotation.x, state.pointer.y * 0.35, 2, dt);
    m.rotation.z = THREE.MathUtils.damp(m.rotation.z, -state.pointer.x * 0.25, 2, dt);
  });

  return <mesh ref={mesh} geometry={res.geometry} material={res.material} scale={1.0} />;
}

export default function LiquidMetal({ form, active }: { form: Form; active: boolean }) {
  const lowPower = typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 4) <= 4;
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 5.2], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
    >
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 4, -2]} scale={[10, 1, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 0.5, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[5, -2, 1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer form="rect" color="#2f7bff" intensity={2.4} position={[0, -4, 1]} rotation-x={Math.PI / 2} scale={[3, 0.6, 1]} />
      </Environment>
      <Sculpture form={form} detail={lowPower ? 28 : 40} />
    </Canvas>
  );
}
