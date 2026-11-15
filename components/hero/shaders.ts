export const particleVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  attribute float aScale;
  attribute float aSeed;
  varying float vSeed;
  varying float vFade;

  void main() {
    vec3 p = position;
    float t = uTime * 0.12 + aSeed * 6.2831;
    p.x += sin(t + p.y * 0.4) * 0.35;
    p.y += cos(t * 0.8 + p.x * 0.3) * 0.25;
    p.z += sin(t * 0.6 + p.z * 0.5) * 0.35;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aScale * uPixelRatio * (1.0 / -mv.z);

    vSeed = aSeed;
    vFade = 0.55 + 0.45 * sin(uTime * 0.9 + aSeed * 40.0);
  }
`;

export const particleFragment = /* glsl */ `
  varying float vSeed;
  varying float vFade;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    vec3 silver = vec3(0.78, 0.82, 0.88);
    vec3 volt = vec3(0.37, 0.63, 1.0);
    vec3 col = mix(silver, volt, step(0.62, vSeed));
    gl_FragColor = vec4(col, a * a * vFade * 0.75);
  }
`;

export const latticeVertex = /* glsl */ `
  attribute float aProgress;
  attribute float aSeed;
  varying float vProgress;
  varying float vSeed;
  void main() {
    vProgress = aProgress;
    vSeed = aSeed;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const latticeFragment = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  varying float vProgress;
  varying float vSeed;
  void main() {
    float head = fract(uTime * (0.18 + vSeed * 0.22) + vSeed * 9.0);
    float dist = vProgress - head;
    float pulse = smoothstep(-0.22, 0.0, dist) * (1.0 - smoothstep(0.0, 0.02, dist));
    float live = step(0.45, fract(vSeed * 17.0));
    vec3 base = vec3(0.45, 0.52, 0.62);
    vec3 volt = vec3(0.45, 0.72, 1.0);
    float alpha = 0.07 + pulse * live * 0.9;
    gl_FragColor = vec4(mix(base, volt, pulse * live), alpha * uIntensity);
  }
`;

export const nodeVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSeed;
  varying float vGlow;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    vGlow = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(uTime * 1.6 + aSeed * 30.0), 4.0);
    gl_PointSize = (5.0 + vGlow * 7.0) * uPixelRatio * (1.0 / -mv.z) * 6.0;
  }
`;

export const nodeFragment = /* glsl */ `
  uniform float uIntensity;
  varying float vGlow;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.18, 0.0, d);
    float halo = smoothstep(0.5, 0.0, d) * 0.35;
    vec3 col = mix(vec3(0.75, 0.82, 0.92), vec3(0.45, 0.72, 1.0), vGlow);
    gl_FragColor = vec4(col, (core + halo) * vGlow * uIntensity);
  }
`;
