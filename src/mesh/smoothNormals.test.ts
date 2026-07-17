import { describe, expect, it } from "vitest";
import { calculateSmoothNormals } from "./smoothNormals";

describe("calculateSmoothNormals", () => {
  it("gives coincident vertices one angle-weighted displacement direction", () => {
    const positions = new Float32Array([
      0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0,
    ]);
    const normals = calculateSmoothNormals(positions);
    const expected = Math.SQRT1_2;

    expect(normals[0]).toBeCloseTo(0);
    expect(normals[1]).toBeCloseTo(expected);
    expect(normals[2]).toBeCloseTo(expected);
    expect(normals[9]).toBeCloseTo(normals[0]!);
    expect(normals[10]).toBeCloseTo(normals[1]!);
    expect(normals[11]).toBeCloseTo(normals[2]!);
  });
});
