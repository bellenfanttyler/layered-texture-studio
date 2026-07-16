export interface FeatureFlags {
  lightTheme: boolean;
  proceduralTextures: boolean;
  advancedSelection: boolean;
  meshRepair: boolean;
  helpLinks: boolean;
  importFormats: readonly "stl"[];
}

export const features: FeatureFlags = {
  lightTheme: true,
  proceduralTextures: false,
  advancedSelection: false,
  meshRepair: false,
  helpLinks: true,
  importFormats: ["stl"],
};
