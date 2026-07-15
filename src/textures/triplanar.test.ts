import { describe, expect, it } from "vitest";
import { calculateTriplanarWeights } from "./triplanar";

describe("calculateTriplanarWeights", () => {
  it("fully favors the aligned projection axis", () => {
    expect(calculateTriplanarWeights({ x: -1, y: 0, z: 0 })).toEqual({
      x: 1,
      y: 0,
      z: 0,
    });
  });

  it("normalizes equal diagonal weights", () => {
    const weights = calculateTriplanarWeights({ x: 1, y: 1, z: 1 });
    expect(weights.x).toBeCloseTo(1 / 3);
    expect(weights.y).toBeCloseTo(1 / 3);
    expect(weights.z).toBeCloseTo(1 / 3);
    expect(weights.x + weights.y + weights.z).toBeCloseTo(1);
  });

  it("uses sharpness to suppress weak axes", () => {
    const soft = calculateTriplanarWeights({ x: 1, y: 0.5, z: 0 }, 1);
    const sharp = calculateTriplanarWeights({ x: 1, y: 0.5, z: 0 }, 8);
    expect(sharp.x).toBeGreaterThan(soft.x);
    expect(sharp.y).toBeLessThan(soft.y);
  });
});
