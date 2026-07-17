import { describe, expect, it } from "vitest";
import {
  binaryStlByteLength,
  serializeBinaryStl,
  validateExportPositions,
} from "./binaryStl";

describe("binary STL export", () => {
  const triangle = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);

  it("writes a little-endian binary STL with recalculated face normals", () => {
    const { buffer, report } = serializeBinaryStl(triangle, "Test export");
    const view = new DataView(buffer);

    expect(buffer.byteLength).toBe(binaryStlByteLength(1));
    expect(report).toEqual({ triangleCount: 1, byteLength: 134 });
    expect(view.getUint32(80, true)).toBe(1);
    expect(view.getFloat32(84, true)).toBeCloseTo(0);
    expect(view.getFloat32(88, true)).toBeCloseTo(0);
    expect(view.getFloat32(92, true)).toBeCloseTo(1);
    expect(view.getFloat32(108, true)).toBeCloseTo(1);
  });

  it("rejects invalid and degenerate geometry", () => {
    expect(() =>
      validateExportPositions(new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0])),
    ).toThrow(/degenerate triangle/);
    const invalid = triangle.slice();
    invalid[0] = Number.NaN;
    expect(() => validateExportPositions(invalid)).toThrow(/non-finite/);
  });
});
