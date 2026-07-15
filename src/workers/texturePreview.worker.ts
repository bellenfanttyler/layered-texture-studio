/// <reference lib="webworker" />

import { calculateTriplanarWeights } from "../textures/triplanar";
import type {
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

const buildPreview = async (
  request: TexturePreviewRequest,
): Promise<TexturePreviewWorkerResponse> => {
  const response = await fetch(request.textureUrl);
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
  const pixels = context.getImageData(0, 0, previewSize, previewSize).data;
  const positions = request.positions;
  const heights = new Float32Array(request.maskWeights.length);

  for (let index = 0; index < request.maskWeights.length; index += 1) {
    const offset = index * 3;
    const x = positions[offset] ?? 0;
    const y = positions[offset + 1] ?? 0;
    const z = positions[offset + 2] ?? 0;
    const nx = request.normals[offset] ?? 0;
    const ny = request.normals[offset + 1] ?? 0;
    const nz = request.normals[offset + 2] ?? 0;
    const weights = calculateTriplanarWeights({ x: nx, y: ny, z: nz });
    const scale = request.textureScale;
    let heightValue =
      sampleChannel(pixels, previewSize, previewSize, y * scale, z * scale) *
        weights.x +
      sampleChannel(pixels, previewSize, previewSize, x * scale, z * scale) *
        weights.y +
      sampleChannel(pixels, previewSize, previewSize, x * scale, y * scale) *
        weights.z;
    if (request.invert) heightValue = 1 - heightValue;
    heights[index] = heightValue;
    const displacement = request.visible
      ? (heightValue - request.midpoint) *
        request.amplitude *
        request.influence *
        (request.maskWeights[index] ?? 0)
      : 0;
    positions[offset] = x + nx * displacement;
    positions[offset + 1] = y + ny * displacement;
    positions[offset + 2] = z + nz * displacement;
  }

  return { type: "result", result: { positions, heights } };
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
