import type { ParsedMeshData, SupportedMeshFormat } from "../types/mesh";
import type {
  ParseMeshRequest,
  ParseMeshWorkerResponse,
} from "../workers/meshParser.types";

interface ParseMeshOptions {
  signal?: AbortSignal;
  onProgress?: (message: string, progress: number) => void;
}

export const parseMesh = (
  buffer: ArrayBuffer,
  format: SupportedMeshFormat,
  options: ParseMeshOptions = {},
): Promise<ParsedMeshData> =>
  new Promise((resolve, reject) => {
    const requestId = crypto.randomUUID();
    const worker = new Worker(
      new URL("../workers/meshParser.worker.ts", import.meta.url),
      {
        type: "module",
      },
    );

    const finish = () => {
      worker.terminate();
      options.signal?.removeEventListener("abort", handleAbort);
    };

    const handleAbort = () => {
      finish();
      reject(new DOMException("Model import cancelled.", "AbortError"));
    };

    worker.onmessage = (event: MessageEvent<ParseMeshWorkerResponse>) => {
      const response = event.data;
      if (response.requestId !== requestId) return;

      if (response.type === "progress") {
        options.onProgress?.(response.message, response.progress);
        return;
      }

      finish();
      if (response.type === "success") resolve(response.data);
      else reject(new Error(response.message));
    };

    worker.onerror = () => {
      finish();
      reject(new Error("The model worker stopped unexpectedly."));
    };

    if (options.signal?.aborted) {
      handleAbort();
      return;
    }

    options.signal?.addEventListener("abort", handleAbort, { once: true });
    const request: ParseMeshRequest = {
      type: "parse",
      requestId,
      format,
      buffer,
    };
    worker.postMessage(request, [buffer]);
  });
