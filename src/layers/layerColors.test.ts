import { describe, expect, it } from "vitest";
import { createLayerDisplayColor } from "./layerColors";

describe("createLayerDisplayColor", () => {
  it("produces distinct practical layer colors", () => {
    const colors = Array.from({ length: 16 }, (_, index) =>
      createLayerDisplayColor(index),
    );

    expect(new Set(colors).size).toBe(colors.length);
  });
});
