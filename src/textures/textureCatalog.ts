import { localTextureManager } from "../assets/localTextureManager";
import { layerTextureDefaults, sampleTextures } from "../config/sampleAssets";

export interface TextureSource {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl?: string;
  defaultScale: number;
  defaultAmplitude: number;
  kind: "built-in" | "local";
  width?: number;
  height?: number;
}

export const getTextureSource = (id: string): TextureSource | undefined => {
  const sample = sampleTextures.find((texture) => texture.id === id);
  if (sample) return { ...sample, kind: "built-in" };
  if (!localTextureManager.has(id)) return undefined;
  const asset = localTextureManager.get(id);
  return {
    id: asset.id,
    name: asset.name,
    imageUrl: asset.objectUrl,
    defaultScale: layerTextureDefaults.scale,
    defaultAmplitude: layerTextureDefaults.amplitude,
    kind: "local",
    width: asset.width,
    height: asset.height,
  };
};
