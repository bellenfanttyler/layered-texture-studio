export interface TexturePreviewRequest {
  positions: Float32Array;
  normals: Float32Array;
  maskWeights: Float32Array;
  textureUrl: string;
  textureScale: number;
  amplitude: number;
  midpoint: number;
  influence: number;
  invert: boolean;
  visible: boolean;
}

export interface TexturePreviewResult {
  positions: Float32Array;
  heights: Float32Array;
}

export type TexturePreviewWorkerResponse =
  | { type: "result"; result: TexturePreviewResult }
  | { type: "error"; message: string };
