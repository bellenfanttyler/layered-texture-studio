import type {
  TexturePreviewRequest,
  TexturePreviewResult,
  TexturePreviewWorkerResponse,
} from "./texturePreview.types";

export const createTexturePreview = (
  request: TexturePreviewRequest,
  signal: AbortSignal,
): Promise<TexturePreviewResult> =>
  new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("../workers/texturePreview.worker.ts", import.meta.url),
      { type: "module" },
    );

    const cleanup = () => {
      signal.removeEventListener("abort", handleAbort);
      worker.terminate();
    };
    const handleAbort = () => {
      cleanup();
      reject(new DOMException("Texture preview cancelled.", "AbortError"));
    };

    signal.addEventListener("abort", handleAbort, { once: true });
    worker.onerror = (event) => {
      cleanup();
      reject(new Error(event.message || "Texture preview failed."));
    };
    worker.onmessage = (event: MessageEvent<TexturePreviewWorkerResponse>) => {
      cleanup();
      if (event.data.type === "error") reject(new Error(event.data.message));
      else resolve(event.data.result);
    };
    worker.postMessage(request, [
      request.positions.buffer,
      request.normals.buffer,
      ...request.layers.map((layer) => layer.maskWeights.buffer),
    ]);
  });
