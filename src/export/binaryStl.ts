export interface ExportValidationReport {
  triangleCount: number;
  byteLength: number;
}

export const binaryStlByteLength = (triangleCount: number): number =>
  84 + triangleCount * 50;

export const validateExportPositions = (
  positions: Float32Array,
): ExportValidationReport => {
  if (positions.length === 0 || positions.length % 9 !== 0)
    throw new Error("Export geometry must contain complete triangles.");

  let degenerateCount = 0;
  for (let offset = 0; offset < positions.length; offset += 9) {
    for (let index = 0; index < 9; index += 1) {
      if (!Number.isFinite(positions[offset + index]))
        throw new Error("Export geometry contains a non-finite coordinate.");
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
  return {
    triangleCount,
    byteLength: binaryStlByteLength(triangleCount),
  };
};

export const serializeBinaryStl = (
  positions: Float32Array,
  headerText: string,
): { buffer: ArrayBuffer; report: ExportValidationReport } => {
  const report = validateExportPositions(positions);
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
