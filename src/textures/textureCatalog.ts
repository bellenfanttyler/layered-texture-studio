import { localTextureManager } from "../assets/localTextureManager";
import { sampleTextures } from "../config/sampleAssets";

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
    defaultScale: 1,
    defaultAmplitude: 0.3,
    kind: "local",
    width: asset.width,
    height: asset.height,
  };
};
