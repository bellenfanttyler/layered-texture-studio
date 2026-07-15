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
  bvh: SerializedBVH;
}

export interface MaskLayerSummary {
  id: string;
  name: string;
  maskAssetId: string;
  coverage: number;
  displayColor: string;
  textureId: string;
  visible: boolean;
  mappingScale: number;
  amplitude: number;
  midpoint: number;
  influence: number;
  invert: boolean;
  blendMode: "add" | "subtract" | "replace";
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
import type { SerializedBVH } from "three-mesh-bvh";
