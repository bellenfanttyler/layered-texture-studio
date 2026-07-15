import { Box3, BufferGeometry, Sphere, Vector3 } from "three";
import { MeshBVH } from "three-mesh-bvh";
import { maskAssetManager } from "../assets/maskAssetManager";
import { maskStrokeHistory } from "../history/maskStrokeHistory";

export interface BrushSample {
  center: Vector3;
  hitNormal: Vector3;
  cameraPosition: Vector3;
  radius: number;
  hardness: number;
  strength: number;
  mode: "add" | "subtract";
}

export const applyBrushSample = (
  geometry: BufferGeometry,
  maskAssetId: string,
  sample: BrushSample,
): number[] => {
  const boundsTree = geometry.boundsTree as MeshBVH | null;
  const index = geometry.getIndex();
  const positions = geometry.getAttribute("position");
  const normals = geometry.getAttribute("normal");
  if (!boundsTree || !index || !positions || !normals) return [];

  const weights = maskAssetManager.get(maskAssetId).weights;
  const sphere = new Sphere(sample.center, sample.radius);
  const visited = new Set<number>();
  const changed: number[] = [];
  const vertex = new Vector3();
  const normal = new Vector3();
  const toCamera = new Vector3();
  const safeHardness = Math.min(sample.hardness, 0.999);

  const applyVertex = (vertexIndex: number) => {
    if (visited.has(vertexIndex)) return;
    visited.add(vertexIndex);
    vertex.fromBufferAttribute(positions, vertexIndex);
    const distance = vertex.distanceTo(sample.center);
    if (distance > sample.radius) return;

    normal.fromBufferAttribute(normals, vertexIndex).normalize();
    if (normal.dot(sample.hitNormal) < 0.15) return;
    toCamera.copy(sample.cameraPosition).sub(vertex).normalize();
    if (normal.dot(toCamera) <= 0.02) return;

    const normalizedDistance = distance / sample.radius;
    const falloff =
      normalizedDistance <= safeHardness
        ? 1
        : Math.max(
            0,
            1 - (normalizedDistance - safeHardness) / (1 - safeHardness),
          );
    const amount = sample.strength * falloff;
    const previous = weights[vertexIndex] ?? 0;
    const next =
      sample.mode === "add"
        ? previous + (1 - previous) * amount
        : previous * (1 - amount);

    if (Math.abs(next - previous) < 0.0001) return;
    maskStrokeHistory.record(vertexIndex, previous);
    weights[vertexIndex] = next;
    changed.push(vertexIndex);
  };

  boundsTree.shapecast({
    intersectsBounds: (box: Box3) => sphere.intersectsBox(box),
    intersectsTriangle: (_triangle, triangleIndex) => {
      const offset = triangleIndex * 3;
      applyVertex(index.getX(offset));
      applyVertex(index.getX(offset + 1));
      applyVertex(index.getX(offset + 2));
      return false;
    },
  });

  return changed;
};
