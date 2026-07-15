export interface NormalVector {
  x: number;
  y: number;
  z: number;
}

export interface TriplanarWeights {
  x: number;
  y: number;
  z: number;
}

export const calculateTriplanarWeights = (
  normal: NormalVector,
  sharpness = 4,
): TriplanarWeights => {
  const x = Math.abs(normal.x) ** sharpness;
  const y = Math.abs(normal.y) ** sharpness;
  const z = Math.abs(normal.z) ** sharpness;
  const total = Math.max(x + y + z, Number.EPSILON);
  return { x: x / total, y: y / total, z: z / total };
};
