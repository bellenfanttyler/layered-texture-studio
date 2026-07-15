export interface FeatureFlags {
  lightTheme: boolean;
  proceduralTextures: boolean;
  localProjectLibrary: boolean;
  advancedSelection: boolean;
  meshRepair: boolean;
  sampleProjects: boolean;
  helpLinks: boolean;
  importFormats: readonly ["stl", "obj", "glb", "gltf"];
}

export const features: FeatureFlags = {
  lightTheme: true,
  proceduralTextures: false,
  localProjectLibrary: false,
  advancedSelection: false,
  meshRepair: false,
  sampleProjects: true,
  helpLinks: true,
  importFormats: ["stl", "obj", "glb", "gltf"],
};
