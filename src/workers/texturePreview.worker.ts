/// <reference lib="webworker" />

import { buildCompositePositions } from "../textures/workerTextureSampling";
import type {
  TexturePreviewRequest,
  TexturePreviewWorkerResponse,
} from "../textures/texturePreview.types";

self.onmessage = (event: MessageEvent<TexturePreviewRequest>) => {
  void buildCompositePositions(event.data)
    .then(({ positions, activeHeights }) => {
      const message: TexturePreviewWorkerResponse = {
        type: "result",
        result: { positions, heights: activeHeights },
      };
      self.postMessage(message, {
        transfer: [positions.buffer, activeHeights.buffer],
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
