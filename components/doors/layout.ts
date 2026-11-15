/**
 * Shared geometry for "The Doors of Experience".
 *
 * World: the corridor runs along -z. Each door + room is built in its own
 * LOCAL frame — doorway centred at the origin, corridor on +z, room on -z —
 * then rotated into the left or right wall. Camera keyframes are authored in
 * that local frame and converted with `toWorld`, so every door is framed the
 * same way regardless of which wall it sits in.
 */

export const EYE = 1.65;

export const CORRIDOR = { halfWidth: 3, height: 6.4, start: 4, end: -46, wall: 0.3 } as const;

export const DOOR = { width: 3, height: 4.6, leaf: 1.5, thick: 0.14 } as const;

export const ROOM = { halfWidth: 5, depth: 11, height: 5.6 } as const;

export const ATRIUM = { halfWidth: 11, depth: 20, height: 9 } as const;

export type Assembly = { x: number; z: number; rotY: number };

/** Door 01 left wall, Door 02 right wall, Door 03 left wall. */
export const ASSEMBLIES: Assembly[] = [
  { x: -CORRIDOR.halfWidth, z: -10, rotY: Math.PI / 2 },
  { x: CORRIDOR.halfWidth, z: -22, rotY: -Math.PI / 2 },
  { x: -CORRIDOR.halfWidth, z: -34, rotY: Math.PI / 2 },
];

/** Openings cut into each corridor wall: [zMin, zMax]. */
export const OPENINGS = {
  left: ASSEMBLIES.filter((a) => a.x < 0).map((a) => [a.z - DOOR.width / 2, a.z + DOOR.width / 2] as const),
  right: ASSEMBLIES.filter((a) => a.x > 0).map((a) => [a.z - DOOR.width / 2, a.z + DOOR.width / 2] as const),
};

/** Local (lx, lz) in an assembly's frame → world (x, z). */
export function toWorld(a: Assembly, lx: number, lz: number) {
  const c = Math.cos(a.rotY);
  const s = Math.sin(a.rotY);
  return { x: a.x + lx * c + lz * s, z: a.z - lx * s + lz * c };
}

/** Everything the scroll timeline animates. Read every frame by the scene. */
export type DoorsDriver = {
  x: number;
  z: number;
  yaw: number;
  pitch: number;
  // door i: handle (0..1), open (0..1), nameplate light (0..1), room story (0..1)
  h1: number; d1: number; l1: number; r1: number;
  h2: number; d2: number; l2: number; r2: number;
  h3: number; d3: number; l3: number; r3: number;
  fin: number;
};

export const initialDriver = (): DoorsDriver => ({
  x: 0,
  z: 3.2,
  yaw: 0,
  pitch: 0.06,
  h1: 0, d1: 0, l1: 0, r1: 0,
  h2: 0, d2: 0, l2: 0, r2: 0,
  h3: 0, d3: 0, l3: 0, r3: 0,
  fin: 0,
});

export const key = (i: number, k: "h" | "d" | "l" | "r") => `${k}${i + 1}` as keyof DoorsDriver;
