import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  localTextureManager,
  registerLocalTexture,
} from "../assets/localTextureManager";
import type { MaskLayerSummary } from "../types/mesh";
import { releaseLayerTexture } from "./textureController";

describe("local texture references", () => {
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async () => ({
        width: 64,
        height: 64,
        close: vi.fn(),
      })),
    );
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:shared-texture"),
      revokeObjectURL,
    });
  });

  afterEach(() => {
    localTextureManager.clear();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("keeps a shared texture until its final layer reference is removed", async () => {
    const asset = await registerLocalTexture(
      new File(["pixels"], "shared.png", { type: "image/png" }),
    );
    const layer = { textureId: asset.id } as MaskLayerSummary;

    releaseLayerTexture(asset.id, [layer]);
    expect(localTextureManager.has(asset.id)).toBe(true);
    expect(revokeObjectURL).not.toHaveBeenCalled();

    releaseLayerTexture(asset.id, []);
    expect(localTextureManager.has(asset.id)).toBe(false);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:shared-texture");
  });
});
