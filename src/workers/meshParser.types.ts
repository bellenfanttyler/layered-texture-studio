import type { ParsedMeshData, SupportedMeshFormat } from "../types/mesh";

export interface ParseMeshRequest {
  type: "parse";
  requestId: string;
  format: SupportedMeshFormat;
  buffer: ArrayBuffer;
}

export type ParseMeshWorkerResponse =
  | { type: "progress"; requestId: string; message: string; progress: number }
  | { type: "success"; requestId: string; data: ParsedMeshData }
  | { type: "error"; requestId: string; message: string };
