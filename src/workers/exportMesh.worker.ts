/// <reference lib="webworker" />

import { serializeBinaryStl } from "../export/binaryStl";
import type {
  ExportMeshRequest,
  ExportMeshWorkerResponse,
} from "../export/exportMesh.types";
import { buildCompositePositions } from "../textures/workerTextureSampling";

const worker = self as DedicatedWorkerGlobalScope;

const post = (message: ExportMeshWorkerResponse): void => {
  if (message.type === "success")
    worker.postMessage(message, { transfer: [message.buffer] });
  else worker.postMessage(message);
};

worker.onmessage = (event: MessageEvent<ExportMeshRequest>) => {
  const request = event.data;
  if (request.type !== "export") return;

  post({
    type: "progress",
    requestId: request.requestId,
    message: "Sampling visible texture layers",
    progress: 15,
  });
  void buildCompositePositions(request, (completed, total) =>
    post({
      type: "progress",
      requestId: request.requestId,
      message: "Sampling visible texture layers",
      progress: 15 + Math.round((completed / Math.max(total, 1)) * 55),
    }),
  )
    .then(({ positions }) => {
      post({
        type: "progress",
        requestId: request.requestId,
        message: "Validating displaced geometry",
        progress: 78,
      });
      const result = serializeBinaryStl(positions, request.header);
      post({
        type: "success",
        requestId: request.requestId,
        ...result,
      });
    })
    .catch((error: unknown) =>
      post({
        type: "error",
        requestId: request.requestId,
        message: error instanceof Error ? error.message : "Mesh export failed.",
      }),
    );
};
