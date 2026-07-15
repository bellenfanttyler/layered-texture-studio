/// <reference lib="webworker" />

import { calculateTriplanarWeights } from "../textures/triplanar";
import { combineLayerDisplacement } from "../textures/layerCompositing";
import type {
  TexturePreviewLayerRequest,
  TexturePreviewRequest,
  TexturePreviewWorkerResponse,
} from "../textures/texturePreview.types";

const previewSize = 1024;
const wrap = (value: number): number => ((value % 1) + 1) % 1;

const sampleChannel = (
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  u: number,
  v: number,
): number => {
  const x = Math.min(width - 1, Math.floor(wrap(u) * width));
  const y = Math.min(height - 1, Math.floor(wrap(v) * height));
  return (pixels[(y * width + x) * 4] ?? 0) / 255;
};

const loadTexturePixels = async (
  textureUrl: string,
): Promise<Uint8ClampedArray> => {
  const response = await fetch(textureUrl);
  if (!response.ok)
    throw new Error(`Texture request failed (${response.status}).`);
  const bitmap = await createImageBitmap(await response.blob(), {
    resizeWidth: previewSize,
    resizeHeight: previewSize,
    resizeQuality: "high",
  });
  const canvas = new OffscreenCanvas(previewSize, previewSize);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Texture pixels could not be read.");
  context.drawImage(bitmap, 0, 0, previewSize, previewSize);
  bitmap.close();
  return context.getImageData(0, 0, previewSize, previewSize).data;
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
      sampleChannel(pixels, previewSize, previewSize, y * scale, z * scale) *
        weights.x +
      sampleChannel(pixels, previewSize, previewSize, x * scale, z * scale) *
        weights.y +
      sampleChannel(pixels, previewSize, previewSize, x * scale, y * scale) *
        weights.z;
    if (layer.invert) value = 1 - value;
    heights[index] = value;
  }
  return heights;
};

const buildPreview = async (
  request: TexturePreviewRequest,
): Promise<TexturePreviewWorkerResponse> => {
  const positions = request.positions;
  const pixelRequests = new Map<string, Promise<Uint8ClampedArray>>();
  const getPixels = (url: string): Promise<Uint8ClampedArray> => {
    const existing = pixelRequests.get(url);
    if (existing) return existing;
    const pending = loadTexturePixels(url);
    pixelRequests.set(url, pending);
    return pending;
  };
  const sampledLayers = await Promise.all(
    request.layers.map(async (layer) => ({
      layer,
      heights: sampleLayer(
        layer,
        positions,
        request.normals,
        await getPixels(layer.textureUrl),
      ),
    })),
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
    const x = positions[offset] ?? 0;
    const y = positions[offset + 1] ?? 0;
    const z = positions[offset + 2] ?? 0;
    const nx = request.normals[offset] ?? 0;
    const ny = request.normals[offset + 1] ?? 0;
    const nz = request.normals[offset + 2] ?? 0;
    const amount = displacement[index] ?? 0;
    positions[offset] = x + nx * amount;
    positions[offset + 1] = y + ny * amount;
    positions[offset + 2] = z + nz * amount;
  }

  return { type: "result", result: { positions, heights: activeHeights } };
};

self.onmessage = (event: MessageEvent<TexturePreviewRequest>) => {
  void buildPreview(event.data)
    .then((message) => {
      if (message.type === "result")
        self.postMessage(message, {
          transfer: [
            message.result.positions.buffer,
            message.result.heights.buffer,
          ],
        });
    })
    .catch((error: unknown) => {
      self.postMessage({
        type: "error",
        message:
          error instanceof Error ? error.message : "Texture preview failed.",
      } satisfies TexturePreviewWorkerResponse);
    });
};
