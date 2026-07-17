import { describe, expect, it } from "vitest";
import type { TexturePreviewLayerRequest } from "./texturePreview.types";
import { buildCompositePositions } from "./workerTextureSampling";

describe("buildCompositePositions input validation", () => {
  it("rejects mismatched normals and layer masks before texture decoding", async () => {
    await expect(
      buildCompositePositions({
        positions: new Float32Array(9),
        normals: new Float32Array(8),
        layers: [],
      }),
    ).rejects.toThrow(/invalid source geometry/);

    const layer = {
      maskWeights: new Float32Array(2),
    } as TexturePreviewLayerRequest;
    await expect(
      buildCompositePositions({
        positions: new Float32Array(9),
        normals: new Float32Array(9),
        layers: [layer],
      }),
    ).rejects.toThrow(/mask does not match/);
  });
});
