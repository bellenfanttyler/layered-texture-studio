import { getLocalModel } from "../assets/localFileRegistry";
import { sourceMeshManager } from "../assets/sourceMeshManager";
import { useWelcomeStore, type LocalModelSelection } from "../app/store";
import type { SampleModel } from "../config/sampleAssets";
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
    const sourceAssetId = sourceMeshManager.register(parsed);
    if (previousAssetId) sourceMeshManager.remove(previousAssetId);

    useWelcomeStore.getState().finishImport({
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
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;
    useWelcomeStore
      .getState()
      .failImport(
        error instanceof Error
          ? error.message
          : "The model could not be imported.",
      );
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
  useWelcomeStore.getState().returnToWelcome();
};

export const closeWorkspace = (): void => {
  const assetId = useWelcomeStore.getState().loadedModel?.sourceAssetId;
  if (assetId) sourceMeshManager.remove(assetId);
  useWelcomeStore.getState().returnToWelcome();
};
