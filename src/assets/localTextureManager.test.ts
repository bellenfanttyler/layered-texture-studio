import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  localTextureManager,
  registerLocalTexture,
  validateTextureFile,
} from "./localTextureManager";

describe("localTextureManager", () => {
  const close = vi.fn();
  const createObjectURL = vi.fn(() => "blob:local-texture");
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async () => ({
        width: 512,
        height: 256,
        close,
      })),
    );
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
  });

  afterEach(() => {
    localTextureManager.clear();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("accepts PNG, JPEG, and WebP files and rejects unsupported input", () => {
    expect(validateTextureFile(new File(["x"], "height.PNG"))).toMatchObject({
      valid: true,
      type: "image/png",
    });
    expect(
      validateTextureFile(
        new File(["x"], "height.jpg", { type: "image/jpeg" }),
      ),
    ).toMatchObject({ valid: true });
    expect(
      validateTextureFile(
        new File(["x"], "height.webp", { type: "image/webp" }),
      ),
    ).toMatchObject({ valid: true });
    expect(validateTextureFile(new File(["x"], "height.svg"))).toMatchObject({
      valid: false,
    });
    expect(validateTextureFile(new File([], "empty.png"))).toMatchObject({
      valid: false,
      message: "This texture file is empty.",
    });
  });

  it("decodes assets outside application state and revokes their URLs", async () => {
    const asset = await registerLocalTexture(
      new File(["pixels"], "custom-height.png", { type: "image/png" }),
    );

    expect(asset).toMatchObject({
      name: "custom-height",
      objectUrl: "blob:local-texture",
      width: 512,
      height: 256,
    });
    expect(localTextureManager.get(asset.id).file).toBeInstanceOf(File);
    expect(close).toHaveBeenCalledOnce();

    localTextureManager.remove(asset.id);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:local-texture");
    expect(localTextureManager.has(asset.id)).toBe(false);
  });
});
