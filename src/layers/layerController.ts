import { maskAssetManager } from "../assets/maskAssetManager";
import { useWelcomeStore } from "../app/store";
import { brand } from "../config/brand";
import { copy } from "../config/copy";
import { sampleTextures } from "../config/sampleAssets";
import { maskStrokeHistory } from "../history/maskStrokeHistory";
import { getTextureSource } from "../textures/textureCatalog";
import { releaseLayerTexture } from "../textures/textureController";
import type { MaskLayerSummary } from "../types/mesh";

const layerColors = [brand.colors.primary, brand.colors.accent];

const nextLayerNumber = (layers: MaskLayerSummary[]): number => {
  const names = new Set(layers.map((layer) => layer.name));
  let number = 1;
  while (names.has(`${copy.workspace.layerNamePrefix} ${number}`)) number += 1;
  return number;
};

const resetStrokeHistory = (): void => {
  maskStrokeHistory.clear();
};

export const selectLayer = (id: string): void => {
  resetStrokeHistory();
  useWelcomeStore.getState().setActiveLayer(id);
};

export const addLayer = (): void => {
  const state = useWelcomeStore.getState();
  const model = state.loadedModel;
  if (!model) return;
  const template = state.activeLayer;
  const texture =
    (template ? getTextureSource(template.textureId) : undefined) ??
    sampleTextures[0];
  if (!texture) return;
  const number = nextLayerNumber(state.layers);
  const layer: MaskLayerSummary = {
    id: crypto.randomUUID(),
    name: `${copy.workspace.layerNamePrefix} ${number}`,
    maskAssetId: maskAssetManager.create(model.vertexCount),
    coverage: 0,
    displayColor: layerColors[(number - 1) % layerColors.length]!,
    textureId: texture.id,
    visible: true,
    mappingScale: template?.mappingScale ?? texture.defaultScale,
    amplitude: template?.amplitude ?? texture.defaultAmplitude,
    midpoint: template?.midpoint ?? 0.5,
    influence: template?.influence ?? 1,
    invert: template?.invert ?? false,
    blendMode: "add",
  };
  resetStrokeHistory();
  state.setLayers([...state.layers, layer], layer.id);
};

export const duplicateActiveLayer = (): void => {
  const state = useWelcomeStore.getState();
  const active = state.activeLayer;
  if (!active) return;
  const index = state.layers.findIndex((layer) => layer.id === active.id);
  const duplicate: MaskLayerSummary = {
    ...active,
    id: crypto.randomUUID(),
    name: `${active.name} ${copy.workspace.layerCopySuffix}`,
    maskAssetId: maskAssetManager.create(
      maskAssetManager.get(active.maskAssetId).weights.length,
      maskAssetManager.get(active.maskAssetId).weights,
    ),
  };
  const layers = [...state.layers];
  layers.splice(index + 1, 0, duplicate);
  resetStrokeHistory();
  state.setLayers(layers, duplicate.id);
};

export const deleteActiveLayer = (): void => {
  const state = useWelcomeStore.getState();
  const active = state.activeLayer;
  if (!active || state.layers.length <= 1) return;
  const index = state.layers.findIndex((layer) => layer.id === active.id);
  const layers = state.layers.filter((layer) => layer.id !== active.id);
  const nextActive = layers[Math.min(index, layers.length - 1)]!;
  maskAssetManager.remove(active.maskAssetId);
  resetStrokeHistory();
  state.setLayers(layers, nextActive.id);
  releaseLayerTexture(active.textureId, layers);
};

export const moveActiveLayer = (direction: "up" | "down"): void => {
  const state = useWelcomeStore.getState();
  const active = state.activeLayer;
  if (!active) return;
  const index = state.layers.findIndex((layer) => layer.id === active.id);
  const target = direction === "up" ? index + 1 : index - 1;
  if (target < 0 || target >= state.layers.length) return;
  const layers = [...state.layers];
  [layers[index], layers[target]] = [layers[target]!, layers[index]!];
  resetStrokeHistory();
  state.setLayers(layers, active.id);
};
