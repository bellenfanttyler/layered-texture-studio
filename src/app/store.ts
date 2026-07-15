import { create } from "zustand";
import type { LoadedModelSummary } from "../types/mesh";

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
  setTheme: (theme: Theme) => void;
  selectSampleModel: (id: string) => void;
  toggleSampleTexture: (id: string) => void;
  selectLocalModel: (model: LocalModelSelection) => void;
  startImport: () => void;
  updateImportProgress: (message: string, progress: number) => void;
  finishImport: (model: LoadedModelSummary) => void;
  failImport: (message: string) => void;
  returnToWelcome: () => void;
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
  finishImport: (model) =>
    set({
      screen: "workspace",
      loadedModel: model,
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
      importError: null,
      importProgress: 0,
    }),
}));
