import { getLocalModel } from "../assets/localFileRegistry";
import { localTextureManager } from "../assets/localTextureManager";
import { maskAssetManager } from "../assets/maskAssetManager";
import { sourceMeshManager } from "../assets/sourceMeshManager";
import { useWelcomeStore, type LocalModelSelection } from "../app/store";
import { brand } from "../config/brand";
import { copy } from "../config/copy";
import {
  layerTextureDefaults,
  sampleTextures,
  type SampleModel,
} from "../config/sampleAssets";
import { maskStrokeHistory } from "../history/maskStrokeHistory";
import { parseMesh } from "./parseMesh";

let activeImport: AbortController | null = null;

interface ImportSource {
  name: string;
  size: number;
  units: "mm" | "cm" | "in" | "m";
  read: (signal: AbortSignal) => Promise<ArrayBuffer>;
}

const runImport = async (
  source: ImportSource,
  selectedTextureIds: string[],
): Promise<void> => {
  activeImport?.abort();
  activeImport = new AbortController();
  const { signal } = activeImport;
  const state = useWelcomeStore.getState();
  const isReplacement = state.loadedModel !== null;
  state.startImport();

  try {
    const buffer = await source.read(signal);
    const fileSize = source.size || buffer.byteLength;
    if (signal.aborted) return;
    useWelcomeStore
      .getState()
      .updateImportProgress("Starting geometry worker", 30);

    const parsed = await parseMesh(buffer, "stl", {
      signal,
      onProgress: (message, progress) =>
        useWelcomeStore.getState().updateImportProgress(message, progress),
    });

    const previousAssetId =
      useWelcomeStore.getState().loadedModel?.sourceAssetId;
    const previousLayers = useWelcomeStore.getState().layers;
    const sourceAssetId = sourceMeshManager.register(parsed);
    const maskAssetId = maskAssetManager.create(parsed.vertexCount);
    if (previousAssetId) sourceMeshManager.remove(previousAssetId);
    previousLayers.forEach((layer) =>
      maskAssetManager.remove(layer.maskAssetId),
    );
    localTextureManager.clear();
    maskStrokeHistory.clear();
    const initialTexture =
      sampleTextures.find((texture) =>
        selectedTextureIds.includes(texture.id),
      ) ?? sampleTextures[0];
    if (!initialTexture) throw new Error("No bundled texture is configured.");

    useWelcomeStore.getState().finishImport(
      {
        sourceAssetId,
        name: source.name,
        format: "stl",
        units: source.units,
        fileSize,
        vertexCount: parsed.vertexCount,
        triangleCount: parsed.triangleCount,
        dimensions: parsed.dimensions,
        center: parsed.center,
        selectedTextureIds: [...selectedTextureIds],
      },
      {
        id: crypto.randomUUID(),
        name: copy.workspace.defaultLayerName,
        maskAssetId,
        coverage: 0,
        displayColor: brand.colors.primary,
        textureId: initialTexture.id,
        visible: true,
        mappingScale: initialTexture.defaultScale,
        amplitude: layerTextureDefaults.amplitude,
        midpoint: layerTextureDefaults.midpoint,
        influence: layerTextureDefaults.influence,
        invert: false,
        blendMode: "add",
      },
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;
    const message =
      error instanceof Error
        ? error.message
        : "The model could not be imported.";
    const currentState = useWelcomeStore.getState();
    if (isReplacement) currentState.failReplacement(message);
    else currentState.failImport(message);
  } finally {
    if (activeImport?.signal === signal) activeImport = null;
  }
};

export const importSampleModel = (
  model: SampleModel,
  selectedTextureIds: string[],
): Promise<void> =>
  runImport(
    {
      name: model.name,
      size: 0,
      units: model.units,
      read: async (signal) => {
        const response = await fetch(model.fileUrl, { signal });
        if (!response.ok)
          throw new Error("The sample model could not be loaded.");
        return response.arrayBuffer();
      },
    },
    selectedTextureIds,
  );

export const importLocalModel = (
  selection: LocalModelSelection,
): Promise<void> => {
  const file = getLocalModel(selection.assetId);
  return runImport(
    {
      name: selection.name,
      size: selection.size,
      units: "mm",
      read: async () => file.arrayBuffer(),
    },
    useWelcomeStore.getState().selectedTextureIds,
  );
};

export const cancelModelImport = (): void => {
  activeImport?.abort();
  activeImport = null;
  const state = useWelcomeStore.getState();
  if (state.loadedModel) state.cancelImport();
  else state.failImport("The starter model import was cancelled.");
};

export const closeWorkspace = (): void => {
  const state = useWelcomeStore.getState();
  const assetId = state.loadedModel?.sourceAssetId;
  if (assetId) sourceMeshManager.remove(assetId);
  state.layers.forEach((layer) => maskAssetManager.remove(layer.maskAssetId));
  localTextureManager.clear();
  maskStrokeHistory.clear();
  useWelcomeStore.getState().returnToWelcome();
};
