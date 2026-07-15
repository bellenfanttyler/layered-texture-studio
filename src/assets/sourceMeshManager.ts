import { BufferAttribute, BufferGeometry } from "three";
import type { ParsedMeshData } from "../types/mesh";

export interface SourceMeshAsset extends ParsedMeshData {
  id: string;
}

const sourceMeshes = new Map<string, SourceMeshAsset>();

export const sourceMeshManager = {
  register(data: ParsedMeshData): string {
    const id = crypto.randomUUID();
    sourceMeshes.set(id, { id, ...data });
    return id;
  },

  get(id: string): SourceMeshAsset {
    const asset = sourceMeshes.get(id);
    if (!asset) throw new Error("Source mesh asset is unavailable.");
    return asset;
  },

  createPreviewGeometry(id: string): BufferGeometry {
    const asset = this.get(id);
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new BufferAttribute(asset.positions.slice(), 3),
    );
    geometry.setAttribute(
      "normal",
      new BufferAttribute(asset.normals.slice(), 3),
    );
    geometry.computeBoundingSphere();
    return geometry;
  },

  remove(id: string): void {
    sourceMeshes.delete(id);
  },

  clear(): void {
    sourceMeshes.clear();
  },

  has(id: string): boolean {
    return sourceMeshes.has(id);
  },
};
