export interface ExportValidationReport {
  triangleCount: number;
  byteLength: number;
  boundaryEdgeCount: number;
  nonManifoldEdgeCount: number;
  changedVertexCount: number;
  maximumDisplacement: number;
  warnings: string[];
}

export interface ExportValidationMetrics {
  changedVertexCount?: number;
  maximumDisplacement?: number;
  sourceMaximumDimension?: number;
}

export const binaryStlByteLength = (triangleCount: number): number =>
  84 + triangleCount * 50;

export const validateExportPositions = (
  positions: Float32Array,
  metrics: ExportValidationMetrics = {},
): ExportValidationReport => {
  if (positions.length === 0 || positions.length % 9 !== 0)
    throw new Error("Export geometry must contain complete triangles.");

  let degenerateCount = 0;
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (let offset = 0; offset < positions.length; offset += 9) {
    for (let index = 0; index < 9; index += 1) {
      if (!Number.isFinite(positions[offset + index]))
        throw new Error("Export geometry contains a non-finite coordinate.");
    }
    for (let index = 0; index < 9; index += 3) {
      const x = positions[offset + index] ?? 0;
      const y = positions[offset + index + 1] ?? 0;
      const z = positions[offset + index + 2] ?? 0;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      minZ = Math.min(minZ, z);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      maxZ = Math.max(maxZ, z);
    }
    const abx = (positions[offset + 3] ?? 0) - (positions[offset] ?? 0);
    const aby = (positions[offset + 4] ?? 0) - (positions[offset + 1] ?? 0);
    const abz = (positions[offset + 5] ?? 0) - (positions[offset + 2] ?? 0);
    const acx = (positions[offset + 6] ?? 0) - (positions[offset] ?? 0);
    const acy = (positions[offset + 7] ?? 0) - (positions[offset + 1] ?? 0);
    const acz = (positions[offset + 8] ?? 0) - (positions[offset + 2] ?? 0);
    const nx = aby * acz - abz * acy;
    const ny = abz * acx - abx * acz;
    const nz = abx * acy - aby * acx;
    if (nx * nx + ny * ny + nz * nz <= 1e-20) degenerateCount += 1;
  }

  if (degenerateCount > 0)
    throw new Error(
      `Export stopped: ${degenerateCount.toLocaleString()} degenerate triangle${degenerateCount === 1 ? "" : "s"} detected.`,
    );

  const triangleCount = positions.length / 9;
  const tolerance = Math.max(
    Math.max(maxX - minX, maxY - minY, maxZ - minZ) * 1e-7,
    1e-9,
  );
  const vertexKey = (offset: number): string =>
    `${Math.round((positions[offset] ?? 0) / tolerance)},${Math.round((positions[offset + 1] ?? 0) / tolerance)},${Math.round((positions[offset + 2] ?? 0) / tolerance)}`;
  const edgeCounts = new Map<string, number>();
  for (let offset = 0; offset < positions.length; offset += 9) {
    const vertices = [
      vertexKey(offset),
      vertexKey(offset + 3),
      vertexKey(offset + 6),
    ] as const;
    const edges: ReadonlyArray<readonly [string, string]> = [
      [vertices[0]!, vertices[1]!],
      [vertices[1]!, vertices[2]!],
      [vertices[2]!, vertices[0]!],
    ];
    for (const [first, second] of edges) {
      const edge = first < second ? `${first}|${second}` : `${second}|${first}`;
      edgeCounts.set(edge, (edgeCounts.get(edge) ?? 0) + 1);
    }
  }
  let boundaryEdgeCount = 0;
  let nonManifoldEdgeCount = 0;
  for (const count of edgeCounts.values()) {
    if (count === 1) boundaryEdgeCount += 1;
    else if (count > 2) nonManifoldEdgeCount += 1;
  }
  const maximumDisplacement = metrics.maximumDisplacement ?? 0;
  const warnings: string[] = [];
  if (boundaryEdgeCount > 0)
    warnings.push(
      `${boundaryEdgeCount.toLocaleString()} open boundary edge${boundaryEdgeCount === 1 ? "" : "s"} detected.`,
    );
  if (nonManifoldEdgeCount > 0)
    warnings.push(
      `${nonManifoldEdgeCount.toLocaleString()} non-manifold edge${nonManifoldEdgeCount === 1 ? "" : "s"} detected.`,
    );
  if (
    metrics.sourceMaximumDimension &&
    maximumDisplacement > metrics.sourceMaximumDimension * 0.05
  )
    warnings.push("Maximum displacement exceeds 5% of the model size.");
  if (binaryStlByteLength(triangleCount) > 100 * 1024 * 1024)
    warnings.push("The binary STL will be larger than 100 MB.");
  return {
    triangleCount,
    byteLength: binaryStlByteLength(triangleCount),
    boundaryEdgeCount,
    nonManifoldEdgeCount,
    changedVertexCount: metrics.changedVertexCount ?? 0,
    maximumDisplacement,
    warnings,
  };
};

export const serializeBinaryStl = (
  positions: Float32Array,
  headerText: string,
  metrics: ExportValidationMetrics = {},
): { buffer: ArrayBuffer; report: ExportValidationReport } => {
  const report = validateExportPositions(positions, metrics);
  const buffer = new ArrayBuffer(report.byteLength);
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const header = new TextEncoder().encode(headerText.slice(0, 80));
  bytes.set(header.subarray(0, 80), 0);
  view.setUint32(80, report.triangleCount, true);

  let cursor = 84;
  for (let offset = 0; offset < positions.length; offset += 9) {
    const ax = positions[offset] ?? 0;
    const ay = positions[offset + 1] ?? 0;
    const az = positions[offset + 2] ?? 0;
    const abx = (positions[offset + 3] ?? 0) - ax;
    const aby = (positions[offset + 4] ?? 0) - ay;
    const abz = (positions[offset + 5] ?? 0) - az;
    const acx = (positions[offset + 6] ?? 0) - ax;
    const acy = (positions[offset + 7] ?? 0) - ay;
    const acz = (positions[offset + 8] ?? 0) - az;
    let nx = aby * acz - abz * acy;
    let ny = abz * acx - abx * acz;
    let nz = abx * acy - aby * acx;
    const length = Math.hypot(nx, ny, nz);
    nx /= length;
    ny /= length;
    nz /= length;

    for (const value of [nx, ny, nz]) {
      view.setFloat32(cursor, value, true);
      cursor += 4;
    }
    for (let index = 0; index < 9; index += 1) {
      view.setFloat32(cursor, positions[offset + index] ?? 0, true);
      cursor += 4;
    }
    view.setUint16(cursor, 0, true);
    cursor += 2;
  }

  return { buffer, report };
};
