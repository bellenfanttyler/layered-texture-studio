export interface TexturePreviewLayerRequest {
  id: string;
  maskWeights: Float32Array;
  textureUrl: string;
  textureScale: number;
  amplitude: number;
  midpoint: number;
  influence: number;
  invert: boolean;
  visible: boolean;
  blendMode: "add" | "subtract" | "replace";
}

export interface TexturePreviewRequest {
  positions: Float32Array;
  normals: Float32Array;
  layers: TexturePreviewLayerRequest[];
  activeLayerId: string;
}

export interface TexturePreviewResult {
  positions: Float32Array;
  heights: Float32Array;
}

export type TexturePreviewWorkerResponse =
  | { type: "result"; result: TexturePreviewResult }
  | { type: "error"; message: string };
