export type SupportedMeshFormat = "stl";

export interface MeshDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface MeshCenter {
  x: number;
  y: number;
  z: number;
}

export interface ParsedMeshData {
  positions: Float32Array;
  normals: Float32Array;
  vertexCount: number;
  triangleCount: number;
  dimensions: MeshDimensions;
  center: MeshCenter;
}

export interface LoadedModelSummary {
  sourceAssetId: string;
  name: string;
  format: SupportedMeshFormat;
  units: "mm" | "cm" | "in" | "m";
  fileSize: number;
  vertexCount: number;
  triangleCount: number;
  dimensions: MeshDimensions;
  center: MeshCenter;
  selectedTextureIds: string[];
}
