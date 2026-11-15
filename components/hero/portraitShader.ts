export const portraitVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/**
 * Editorial portrait shader.
 * - cover-fit with a focus point (never stretches the photo)
 * - silver tonal grade that keeps a trace of natural skin tone
 * - depth parallax: the subject moves slightly more than the backdrop
 * - slice reveal / exit smear (echoes the double-exposure portrait)
 * - pointer-velocity smear that is masked OUT around the face
 */
export const portraitFragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2 uTexSize;
  uniform vec2 uRes;
  uniform vec2 uFocus;
  uniform vec3 uFace;      // face centre (image uv) + radius
  uniform vec2 uMouse;     // damped pointer, -1..1
  uniform float uMouseY;   // pointer y in canvas uv
  uniform float uVel;      // pointer speed, 0..1
  uniform float uReveal;   // 0 → 1 entrance
  uniform float uExit;     // 0 → 1 scroll-out
  uniform float uTime;
  uniform float uRows;
  uniform vec4 uMask;      // left, right, bottom, top fade widths
  varying vec2 vUv;

  float hash(float n) { return fract(sin(n * 91.3458) * 47453.5453); }

  vec2 coverUv(vec2 uv) {
    float ca = uRes.x / uRes.y;
    float ia = uTexSize.x / uTexSize.y;
    vec2 s = ca > ia ? vec2(1.0, ia / ca) : vec2(ca / ia, 1.0);
    return uv * s + (1.0 - s) * uFocus;
  }

  void main() {
    float row = floor(vUv.y * uRows);
    float rnd = hash(row + 1.0);
    float rnd2 = hash(row * 3.7 + 11.0);

    // Entrance: rows arrive at staggered times, sliding in from the side.
    float t0 = rnd * 0.55;
    float local = clamp((uReveal - t0) / 0.45, 0.0, 1.0);
    local = 1.0 - pow(1.0 - local, 3.0);
    float shift = (1.0 - local) * (rnd2 - 0.5) * 0.7;

    // Exit: the portrait disperses into horizontal streaks.
    shift += uExit * uExit * (rnd2 - 0.5) * 0.9;

    // Base uv with a little zoom headroom for parallax.
    vec2 uv = (vUv - 0.5) / 1.05 + 0.5;
    vec2 img = coverUv(uv);

    // Face protection mask (image space, aspect corrected).
    vec2 fd = (img - uFace.xy) * vec2(uTexSize.x / uTexSize.y, 1.0);
    float face = 1.0 - smoothstep(uFace.z * 0.75, uFace.z * 1.15, length(fd));

    // Depth parallax: subject region moves more than the backdrop.
    vec2 sd = (img - vec2(uFace.x, 0.38)) * vec2(1.6, 0.9);
    float subject = 1.0 - smoothstep(0.35, 0.75, length(sd));
    img += uMouse * (0.006 + 0.012 * subject) * vec2(-1.0, -1.0);

    // Pointer-velocity smear near the cursor row, never across the face.
    float band = exp(-pow((vUv.y - uMouseY) * 9.0, 2.0));
    shift += uVel * band * (rnd2 - 0.5) * 0.06 * (1.0 - face);

    img.x += shift;

    // Chromatic separation only where rows are displaced.
    float split = abs(shift) * 0.35;
    vec3 c;
    c.r = texture2D(uTex, img + vec2(split, 0.0)).r;
    c.g = texture2D(uTex, img).g;
    c.b = texture2D(uTex, img - vec2(split, 0.0)).b;

    // Silver grade.
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    vec3 mono = vec3(l) * vec3(0.94, 0.975, 1.03);
    vec3 col = mix(mono, c, 0.14);
    col = smoothstep(vec3(0.03), vec3(0.97), col);
    col = pow(col, vec3(1.06));

    // Electric-blue accent lives only in the displaced streaks.
    col += vec3(0.16, 0.42, 1.0) * clamp(abs(shift) * 2.4, 0.0, 0.55);

    // A single light sweep crosses the portrait during the entrance.
    float sweepPos = uReveal * 1.8 - 0.4;
    float sweep = smoothstep(0.08, 0.0, abs(vUv.x * 0.9 + vUv.y * 0.35 - sweepPos));
    col += vec3(0.85, 0.9, 1.0) * sweep * 0.22 * (1.0 - uReveal * uReveal);

    // Cinematic falloff.
    float vig = smoothstep(1.25, 0.35, length((vUv - vec2(0.58, 0.62)) * vec2(1.0, 1.15)));
    col *= mix(0.5, 1.0, vig);

    // Edges dissolve into the page (obsidian), no hard frame.
    float a = smoothstep(0.0, uMask.x, vUv.x)
            * smoothstep(1.0, 1.0 - uMask.y, vUv.x)
            * smoothstep(0.0, uMask.z, vUv.y)
            * smoothstep(1.0, 1.0 - uMask.w, vUv.y);
    a *= local;
    a *= 1.0 - smoothstep(0.55, 1.0, uExit);
    // Row gaps during transitions read as scan slices.
    a *= mix(1.0, step(0.18, fract(vUv.y * uRows)), clamp(abs(shift) * 6.0, 0.0, 1.0));

    gl_FragColor = vec4(col * a, a);
  }
`;
