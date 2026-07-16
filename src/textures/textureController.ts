import {
  localTextureManager,
  registerLocalTexture,
} from "../assets/localTextureManager";
import { useWelcomeStore } from "../app/store";
import type { MaskLayerSummary } from "../types/mesh";
import { getTextureSource } from "./textureCatalog";

const releaseIfUnused = (
  textureId: string,
  layers: MaskLayerSummary[],
): void => {
  if (
    localTextureManager.has(textureId) &&
    !layers.some((layer) => layer.textureId === textureId)
  )
    localTextureManager.remove(textureId);
};

export const assignTextureToActiveLayer = (textureId: string): void => {
  const state = useWelcomeStore.getState();
  const active = state.activeLayer;
  const model = state.loadedModel;
  const texture = getTextureSource(textureId);
  if (!active || !model || !texture) return;
  const maximumDimension = Math.max(
    model.dimensions.width,
    model.dimensions.height,
    model.dimensions.depth,
    1,
  );
  const layers = state.layers.map((layer) =>
    layer.id === active.id
      ? {
          ...layer,
          textureId,
          mappingScale: texture.defaultScale,
          amplitude: Math.min(
            texture.defaultAmplitude,
            maximumDimension * 0.05,
          ),
        }
      : layer,
  );
  state.setLayers(layers, active.id);
  releaseIfUnused(active.textureId, layers);
};

export const importTextureForActiveLayer = async (
  file: File,
): Promise<void> => {
  const asset = await registerLocalTexture(file);
  const activeLayerId = useWelcomeStore.getState().activeLayer?.id;
  if (!activeLayerId) {
    localTextureManager.remove(asset.id);
    throw new Error("Open a texture layer before importing an image.");
  }
  assignTextureToActiveLayer(asset.id);
};

export const releaseLayerTexture = (
  textureId: string,
  remainingLayers: MaskLayerSummary[],
): void => releaseIfUnused(textureId, remainingLayers);
