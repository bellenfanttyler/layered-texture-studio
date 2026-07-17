import type {
  ExportMeshRequest,
  ExportMeshWorkerResponse,
} from "./exportMesh.types";
import type { ExportValidationReport } from "./binaryStl";

export interface MeshExportOptions {
  signal?: AbortSignal;
  onProgress?: (message: string, progress: number) => void;
}

export interface MeshExportResult extends ExportValidationReport {
  buffer: ArrayBuffer;
}

export const createMeshExport = (
  request: Omit<ExportMeshRequest, "type" | "requestId">,
  options: MeshExportOptions = {},
): Promise<MeshExportResult> =>
  new Promise((resolve, reject) => {
    const requestId = crypto.randomUUID();
    const worker = new Worker(
      new URL("../workers/exportMesh.worker.ts", import.meta.url),
      { type: "module" },
    );

    const finish = (): void => {
      worker.terminate();
      options.signal?.removeEventListener("abort", handleAbort);
    };
    const handleAbort = (): void => {
      finish();
      reject(new DOMException("Mesh export cancelled.", "AbortError"));
    };

    worker.onmessage = (event: MessageEvent<ExportMeshWorkerResponse>) => {
      const response = event.data;
      if (response.requestId !== requestId) return;
      if (response.type === "progress") {
        options.onProgress?.(response.message, response.progress);
        return;
      }
      finish();
      if (response.type === "error") reject(new Error(response.message));
      else resolve({ buffer: response.buffer, ...response.report });
    };
    worker.onerror = () => {
      finish();
      reject(new Error("The export worker stopped unexpectedly."));
    };

    if (options.signal?.aborted) {
      handleAbort();
      return;
    }
    options.signal?.addEventListener("abort", handleAbort, { once: true });
    const message: ExportMeshRequest = {
      ...request,
      type: "export",
      requestId,
    };
    worker.postMessage(message, [
      message.positions.buffer,
      message.normals.buffer,
      ...message.layers.map((layer) => layer.maskWeights.buffer),
    ]);
  });
