import { create } from "zustand";

export type Theme = "dark" | "light";

interface LocalModelSelection {
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
  setTheme: (theme: Theme) => void;
  selectSampleModel: (id: string) => void;
  toggleSampleTexture: (id: string) => void;
  selectLocalModel: (model: LocalModelSelection) => void;
}

export const useWelcomeStore = create<WelcomeState>((set) => ({
  theme: "dark",
  selectedModelId: null,
  selectedTextureIds: [],
  localModel: null,
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
}));
