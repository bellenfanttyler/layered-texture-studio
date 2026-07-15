export interface SampleModel {
  id: string;
  name: string;
  description: string;
  fileUrl: string;
  thumbnailUrl?: string;
  format: "stl" | "obj" | "glb";
  units: "mm" | "cm" | "in" | "m";
  accent: string;
}

export interface SampleTexture {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  thumbnailUrl?: string;
  defaultScale: number;
  defaultAmplitude: number;
  license: string;
}

const publicAsset = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

export const sampleModels: SampleModel[] = [
  {
    id: "cube",
    name: "Cube",
    description:
      "A simple cube for testing texture scale and edge transitions.",
    fileUrl: publicAsset("samples/models/cube.stl"),
    format: "stl",
    units: "mm",
    accent: "#78d9bd",
  },
  {
    id: "sphere",
    name: "Sphere",
    description:
      "A smooth sphere for testing texture projection on curved surfaces.",
    fileUrl: publicAsset("samples/models/sphere.stl"),
    format: "stl",
    units: "mm",
    accent: "#edbd75",
  },
  {
    id: "torus",
    name: "Torus",
    description:
      "A torus for testing texture continuity on complex curved surfaces.",
    fileUrl: publicAsset("samples/models/torus.stl"),
    format: "stl",
    units: "mm",
    accent: "#a6a0ff",
  },
];

export const sampleTextures: SampleTexture[] = [
  {
    id: "brick-006",
    name: "Brick 006",
    category: "Masonry",
    imageUrl: publicAsset("samples/textures/BRK_006_4K_Height_04.png"),
    defaultScale: 1,
    defaultAmplitude: 0.3,
    license: "CC BY-NC 4.0",
  },
  {
    id: "fabric-025",
    name: "Fabric 025",
    category: "Fabric",
    imageUrl: publicAsset("samples/textures/FAB_025_4K_Height_04.png"),
    defaultScale: 1,
    defaultAmplitude: 0.3,
    license: "CC BY-NC 4.0",
  },
  {
    id: "ground-013",
    name: "Ground 013",
    category: "Ground",
    imageUrl: publicAsset("samples/textures/GRD_013_4K_Height_04.png"),
    defaultScale: 1,
    defaultAmplitude: 0.3,
    license: "CC BY-NC 4.0",
  },
  {
    id: "mixed-015",
    name: "Mixed 015",
    category: "Mixed",
    imageUrl: publicAsset("samples/textures/MIX_015_4K_Height_04.png"),
    defaultScale: 1,
    defaultAmplitude: 0.3,
    license: "CC BY-NC 4.0",
  },
  {
    id: "tile-014",
    name: "Tile 014",
    category: "Tile",
    imageUrl: publicAsset("samples/textures/TIL_014_4K_Height_01.png"),
    defaultScale: 1,
    defaultAmplitude: 0.3,
    license: "CC BY-NC 4.0",
  },
  {
    id: "wood-008",
    name: "Wood 008",
    category: "Wood",
    imageUrl: publicAsset("samples/textures/WOD_008_4K_AO.png"),
    defaultScale: 1,
    defaultAmplitude: 0.3,
    license: "CC BY-NC 4.0",
  },
];
