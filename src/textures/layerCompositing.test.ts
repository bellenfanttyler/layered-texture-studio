import { describe, expect, it } from "vitest";
import { combineLayerDisplacement } from "./layerCompositing";

describe("combineLayerDisplacement", () => {
  it("adds and subtracts layer displacement", () => {
    expect(combineLayerDisplacement(0.2, 0.3, 1, "add")).toBeCloseTo(0.5);
    expect(combineLayerDisplacement(0.2, 0.3, 1, "subtract")).toBeCloseTo(-0.1);
  });

  it("replaces the existing result through the layer mask", () => {
    expect(combineLayerDisplacement(0.8, 0.2, 1, "replace")).toBeCloseTo(0.2);
    expect(combineLayerDisplacement(0.8, 0.1, 0.25, "replace")).toBeCloseTo(
      0.7,
    );
  });
});
