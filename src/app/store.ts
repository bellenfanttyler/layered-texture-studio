import { create } from "zustand";
import type { LoadedModelSummary, MaskLayerSummary } from "../types/mesh";

export type Theme = "dark" | "light";

export interface LocalModelSelection {
  assetId: string;
  name: string;
  size: number;
  extension: string;
}

interface WelcomeState {
  theme: Theme;
  selectedModelId: string | null;
  selectedTextureIds: string[];
  localModel: LocalModelSelection | null;
  screen: "welcome" | "loading" | "workspace";
  importMessage: string;
  importProgress: number;
  importError: string | null;
  loadedModel: LoadedModelSummary | null;
  layers: MaskLayerSummary[];
  activeLayer: MaskLayerSummary | null;
  activeTool: "orbit" | "paint";
  brushRadius: number;
  brushHardness: number;
  brushStrength: number;
  maskRevision: number;
  canUndo: boolean;
  canRedo: boolean;
  setTheme: (theme: Theme) => void;
  selectSampleModel: (id: string) => void;
  toggleSampleTexture: (id: string) => void;
  selectLocalModel: (model: LocalModelSelection) => void;
  startImport: () => void;
  updateImportProgress: (message: string, progress: number) => void;
  finishImport: (model: LoadedModelSummary, layer: MaskLayerSummary) => void;
  failImport: (message: string) => void;
  returnToWelcome: () => void;
  setActiveTool: (tool: "orbit" | "paint") => void;
  setBrushRadius: (radius: number) => void;
  setBrushHardness: (hardness: number) => void;
  setBrushStrength: (strength: number) => void;
  updateActiveLayer: (changes: Partial<MaskLayerSummary>) => void;
  setLayers: (layers: MaskLayerSummary[], activeLayerId: string) => void;
  setActiveLayer: (id: string) => void;
  updateMaskState: (
    coverage: number,
    canUndo: boolean,
    canRedo: boolean,
  ) => void;
}

export const useWelcomeStore = create<WelcomeState>((set) => ({
  theme: "dark",
  selectedModelId: null,
  selectedTextureIds: [],
  localModel: null,
  screen: "welcome",
  importMessage: "Preparing model",
  importProgress: 0,
  importError: null,
  loadedModel: null,
  layers: [],
  activeLayer: null,
  activeTool: "orbit",
  brushRadius: 5,
  brushHardness: 0.55,
  brushStrength: 0.7,
  maskRevision: 0,
  canUndo: false,
  canRedo: false,
  setTheme: (theme) => set({ theme }),
  selectSampleModel: (id) => set({ selectedModelId: id, localModel: null }),
  toggleSampleTexture: (id) =>
    set((state) => ({
      selectedTextureIds: state.selectedTextureIds.includes(id)
        ? state.selectedTextureIds.filter((textureId) => textureId !== id)
        : [...state.selectedTextureIds, id],
    })),
  selectLocalModel: (model) =>
    set({ localModel: model, selectedModelId: null }),
  startImport: () =>
    set({
      screen: "loading",
      importMessage: "Reading model",
      importProgress: 10,
      importError: null,
    }),
  updateImportProgress: (message, progress) =>
    set({ importMessage: message, importProgress: progress }),
  finishImport: (model, layer) =>
    set({
      screen: "workspace",
      loadedModel: model,
      layers: [layer],
      activeLayer: layer,
      activeTool: "orbit",
      brushRadius:
        Math.max(
          model.dimensions.width,
          model.dimensions.height,
          model.dimensions.depth,
        ) * 0.08,
      importMessage: "Model ready",
      importProgress: 100,
      importError: null,
    }),
  failImport: (message) =>
    set({
      screen: "welcome",
      importError: message,
      importMessage: "Import failed",
      importProgress: 0,
    }),
  returnToWelcome: () =>
    set({
      screen: "welcome",
      loadedModel: null,
      layers: [],
      activeLayer: null,
      activeTool: "orbit",
      importError: null,
      importProgress: 0,
      canUndo: false,
      canRedo: false,
    }),
  setActiveTool: (activeTool) => set({ activeTool }),
  setBrushRadius: (brushRadius) => set({ brushRadius }),
  setBrushHardness: (brushHardness) => set({ brushHardness }),
  setBrushStrength: (brushStrength) => set({ brushStrength }),
  updateActiveLayer: (changes) =>
    set((state) => ({
      activeLayer: state.activeLayer
        ? { ...state.activeLayer, ...changes }
        : null,
      layers: state.layers.map((layer) =>
        layer.id === state.activeLayer?.id ? { ...layer, ...changes } : layer,
      ),
      maskRevision: state.maskRevision + 1,
    })),
  setLayers: (layers, activeLayerId) =>
    set((state) => ({
      layers,
      activeLayer: layers.find((layer) => layer.id === activeLayerId) ?? null,
      maskRevision: state.maskRevision + 1,
    })),
  setActiveLayer: (id) =>
    set((state) => ({
      activeLayer: state.layers.find((layer) => layer.id === id) ?? null,
      canUndo: false,
      canRedo: false,
      maskRevision: state.maskRevision + 1,
    })),
  updateMaskState: (coverage, canUndo, canRedo) =>
    set((state) => ({
      activeLayer: state.activeLayer
        ? { ...state.activeLayer, coverage }
        : null,
      layers: state.layers.map((layer) =>
        layer.id === state.activeLayer?.id ? { ...layer, coverage } : layer,
      ),
      canUndo,
      canRedo,
      maskRevision: state.maskRevision + 1,
    })),
}));
