interface NormalSum {
  x: number;
  y: number;
  z: number;
}

const coordinateKey = (
  x: number,
  y: number,
  z: number,
  tolerance: number,
): string =>
  `${Math.round(x / tolerance)},${Math.round(y / tolerance)},${Math.round(z / tolerance)}`;

const cornerAngle = (
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
): number => {
  const aLength = Math.hypot(ax, ay, az);
  const bLength = Math.hypot(bx, by, bz);
  if (aLength === 0 || bLength === 0) return 0;
  const cosine = Math.max(
    -1,
    Math.min(1, (ax * bx + ay * by + az * bz) / (aLength * bLength)),
  );
  return Math.acos(cosine);
};

export const calculateSmoothNormals = (
  positions: Float32Array,
): Float32Array => {
  if (positions.length === 0 || positions.length % 9 !== 0)
    throw new Error("Smooth normals require complete triangle geometry.");

  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (let offset = 0; offset < positions.length; offset += 3) {
    const x = positions[offset] ?? 0;
    const y = positions[offset + 1] ?? 0;
    const z = positions[offset + 2] ?? 0;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    minZ = Math.min(minZ, z);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    maxZ = Math.max(maxZ, z);
  }
  const tolerance = Math.max(
    Math.max(maxX - minX, maxY - minY, maxZ - minZ) * 1e-7,
    1e-9,
  );
  const sums = new Map<string, NormalSum>();

  for (let offset = 0; offset < positions.length; offset += 9) {
    const vertices = [
      [
        positions[offset] ?? 0,
        positions[offset + 1] ?? 0,
        positions[offset + 2] ?? 0,
      ],
      [
        positions[offset + 3] ?? 0,
        positions[offset + 4] ?? 0,
        positions[offset + 5] ?? 0,
      ],
      [
        positions[offset + 6] ?? 0,
        positions[offset + 7] ?? 0,
        positions[offset + 8] ?? 0,
      ],
    ] as const;
    const abx = vertices[1][0] - vertices[0][0];
    const aby = vertices[1][1] - vertices[0][1];
    const abz = vertices[1][2] - vertices[0][2];
    const acx = vertices[2][0] - vertices[0][0];
    const acy = vertices[2][1] - vertices[0][1];
    const acz = vertices[2][2] - vertices[0][2];
    let nx = aby * acz - abz * acy;
    let ny = abz * acx - abx * acz;
    let nz = abx * acy - aby * acx;
    const normalLength = Math.hypot(nx, ny, nz);
    if (normalLength === 0) continue;
    nx /= normalLength;
    ny /= normalLength;
    nz /= normalLength;

    for (let corner = 0; corner < 3; corner += 1) {
      const vertex = vertices[corner]!;
      const next = vertices[(corner + 1) % 3]!;
      const previous = vertices[(corner + 2) % 3]!;
      const angle = cornerAngle(
        next[0] - vertex[0],
        next[1] - vertex[1],
        next[2] - vertex[2],
        previous[0] - vertex[0],
        previous[1] - vertex[1],
        previous[2] - vertex[2],
      );
      const key = coordinateKey(vertex[0], vertex[1], vertex[2], tolerance);
      const sum = sums.get(key) ?? { x: 0, y: 0, z: 0 };
      sum.x += nx * angle;
      sum.y += ny * angle;
      sum.z += nz * angle;
      sums.set(key, sum);
    }
  }

  const normals = new Float32Array(positions.length);
  for (let offset = 0; offset < positions.length; offset += 3) {
    const key = coordinateKey(
      positions[offset] ?? 0,
      positions[offset + 1] ?? 0,
      positions[offset + 2] ?? 0,
      tolerance,
    );
    const sum = sums.get(key) ?? { x: 0, y: 0, z: 0 };
    const length = Math.hypot(sum.x, sum.y, sum.z) || 1;
    normals[offset] = sum.x / length;
    normals[offset + 1] = sum.y / length;
    normals[offset + 2] = sum.z / length;
  }
  return normals;
};
