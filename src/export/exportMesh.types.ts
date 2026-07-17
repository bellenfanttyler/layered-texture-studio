import type { TexturePreviewLayerRequest } from "../textures/texturePreview.types";
import type { ExportValidationReport } from "./binaryStl";

export interface ExportMeshRequest {
  type: "export";
  requestId: string;
  positions: Float32Array;
  normals: Float32Array;
  layers: TexturePreviewLayerRequest[];
  header: string;
}

export type ExportMeshWorkerResponse =
  | {
      type: "progress";
      requestId: string;
      message: string;
      progress: number;
    }
  | {
      type: "success";
      requestId: string;
      buffer: ArrayBuffer;
      report: ExportValidationReport;
    }
  | { type: "error"; requestId: string; message: string };
