import { combineLayerDisplacement } from "./layerCompositing";
import { calculateTriplanarWeights } from "./triplanar";
import type { TexturePreviewLayerRequest } from "./texturePreview.types";

const textureSampleSize = 1024;
const wrap = (value: number): number => ((value % 1) + 1) % 1;

const sampleChannel = (
  pixels: Uint8ClampedArray,
  u: number,
  v: number,
): number => {
  const x = Math.min(
    textureSampleSize - 1,
    Math.floor(wrap(u) * textureSampleSize),
  );
  const y = Math.min(
    textureSampleSize - 1,
    Math.floor(wrap(v) * textureSampleSize),
  );
  return (pixels[(y * textureSampleSize + x) * 4] ?? 0) / 255;
};

const loadTexturePixels = async (
  textureUrl: string,
): Promise<Uint8ClampedArray> => {
  const response = await fetch(textureUrl);
  if (!response.ok)
    throw new Error(`Texture request failed (${response.status}).`);
  const bitmap = await createImageBitmap(await response.blob(), {
    resizeWidth: textureSampleSize,
    resizeHeight: textureSampleSize,
    resizeQuality: "high",
  });
  const canvas = new OffscreenCanvas(textureSampleSize, textureSampleSize);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Texture pixels could not be read.");
  context.drawImage(bitmap, 0, 0, textureSampleSize, textureSampleSize);
  bitmap.close();
  return context.getImageData(0, 0, textureSampleSize, textureSampleSize).data;
};

const sampleLayer = (
  layer: TexturePreviewLayerRequest,
  positions: Float32Array,
  normals: Float32Array,
  pixels: Uint8ClampedArray,
): Float32Array => {
  const heights = new Float32Array(layer.maskWeights.length);
  for (let index = 0; index < layer.maskWeights.length; index += 1) {
    const offset = index * 3;
    const x = positions[offset] ?? 0;
    const y = positions[offset + 1] ?? 0;
    const z = positions[offset + 2] ?? 0;
    const weights = calculateTriplanarWeights({
      x: normals[offset] ?? 0,
      y: normals[offset + 1] ?? 0,
      z: normals[offset + 2] ?? 0,
    });
    const scale = layer.textureScale;
    let value =
      sampleChannel(pixels, y * scale, z * scale) * weights.x +
      sampleChannel(pixels, x * scale, z * scale) * weights.y +
      sampleChannel(pixels, x * scale, y * scale) * weights.z;
    if (layer.invert) value = 1 - value;
    heights[index] = value;
  }
  return heights;
};

export interface CompositeSamplingRequest {
  positions: Float32Array;
  normals: Float32Array;
  layers: TexturePreviewLayerRequest[];
  activeLayerId?: string;
}

export interface CompositeSamplingResult {
  positions: Float32Array;
  activeHeights: Float32Array;
}

export const buildCompositePositions = async (
  request: CompositeSamplingRequest,
  onLayerSampled?: (completed: number, total: number) => void,
): Promise<CompositeSamplingResult> => {
  const positions = request.positions;
  if (positions.length === 0 || request.normals.length !== positions.length)
    throw new Error("Texture sampling received invalid source geometry.");
  if (
    request.layers.some(
      (layer) => layer.maskWeights.length !== positions.length / 3,
    )
  )
    throw new Error("A texture layer mask does not match the source mesh.");
  const pixelRequests = new Map<string, Promise<Uint8ClampedArray>>();
  let completedLayers = 0;
  const sampledLayers = await Promise.all(
    request.layers.map(async (layer) => {
      let pixels = pixelRequests.get(layer.textureUrl);
      if (!pixels) {
        pixels = loadTexturePixels(layer.textureUrl);
        pixelRequests.set(layer.textureUrl, pixels);
      }
      const result = {
        layer,
        heights: sampleLayer(layer, positions, request.normals, await pixels),
      };
      completedLayers += 1;
      onLayerSampled?.(completedLayers, request.layers.length);
      return result;
    }),
  );

  const activeHeights =
    sampledLayers.find(({ layer }) => layer.id === request.activeLayerId)
      ?.heights ?? new Float32Array(positions.length / 3);
  const displacement = new Float32Array(positions.length / 3);

  for (const { layer, heights } of sampledLayers) {
    if (!layer.visible) continue;
    for (let index = 0; index < layer.maskWeights.length; index += 1) {
      const mask = layer.maskWeights[index] ?? 0;
      const layerDisplacement =
        ((heights[index] ?? 0.5) - layer.midpoint) *
        layer.amplitude *
        layer.influence *
        mask;
      displacement[index] = combineLayerDisplacement(
        displacement[index] ?? 0,
        layerDisplacement,
        mask,
        layer.blendMode,
      );
    }
  }

  for (let index = 0; index < displacement.length; index += 1) {
    const offset = index * 3;
    const amount = displacement[index] ?? 0;
    positions[offset] =
      (positions[offset] ?? 0) + (request.normals[offset] ?? 0) * amount;
    positions[offset + 1] =
      (positions[offset + 1] ?? 0) +
      (request.normals[offset + 1] ?? 0) * amount;
    positions[offset + 2] =
      (positions[offset + 2] ?? 0) +
      (request.normals[offset + 2] ?? 0) * amount;
  }

  return { positions, activeHeights };
};
