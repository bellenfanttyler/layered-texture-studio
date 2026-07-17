import { maskAssetManager } from "../assets/maskAssetManager";
import { sourceMeshManager } from "../assets/sourceMeshManager";
import { useWelcomeStore } from "../app/store";
import { brand } from "../config/brand";
import { getTextureSource } from "../textures/textureCatalog";
import { createMeshExport, type MeshExportOptions } from "./createMeshExport";

const safeFilenamePart = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

export const createExportFilename = (modelName: string): string => {
  const model = safeFilenamePart(modelName.replace(/\.[^.]+$/, ""));
  return `${safeFilenamePart(brand.exportFilenamePrefix)}-${model || "model"}.stl`;
};

export const exportVisibleLayerMesh = async (
  options: MeshExportOptions = {},
) => {
  const state = useWelcomeStore.getState();
  const model = state.loadedModel;
  if (!model) throw new Error("Open a model before exporting.");
  const source = sourceMeshManager.get(model.sourceAssetId);
  const maximumDimension = Math.max(
    model.dimensions.width,
    model.dimensions.height,
    model.dimensions.depth,
    1,
  );
  const visibleLayers = state.layers.filter((layer) => layer.visible);
  const layers = visibleLayers.map((layer) => {
    const texture = getTextureSource(layer.textureId);
    if (!texture)
      throw new Error(`Texture for ${layer.name} is no longer available.`);
    return {
      id: layer.id,
      maskWeights: maskAssetManager.get(layer.maskAssetId).weights.slice(),
      textureUrl: texture.imageUrl,
      textureScale: (layer.mappingScale * 4) / maximumDimension,
      amplitude: layer.amplitude,
      midpoint: layer.midpoint,
      influence: layer.influence,
      invert: layer.invert,
      visible: true,
      blendMode: layer.blendMode,
    };
  });
  const result = await createMeshExport(
    {
      positions: source.positions.slice(),
      normals: source.normals.slice(),
      layers,
      header: `${brand.productName} visible-layer export`,
    },
    options,
  );
  return {
    ...result,
    filename: createExportFilename(model.name),
    visibleLayerCount: visibleLayers.length,
  };
};

export const downloadMeshExport = (
  buffer: ArrayBuffer,
  filename: string,
): void => {
  const url = URL.createObjectURL(new Blob([buffer], { type: "model/stl" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};
