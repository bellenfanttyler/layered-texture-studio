import { afterEach, describe, expect, it } from "vitest";
import { sourceMeshManager } from "./sourceMeshManager";

describe("sourceMeshManager", () => {
  afterEach(() => sourceMeshManager.clear());

  it("creates disposable preview copies without mutating source buffers", () => {
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]);
    const id = sourceMeshManager.register({
      positions,
      normals,
      vertexCount: 3,
      triangleCount: 1,
      dimensions: { width: 1, height: 1, depth: 0 },
      center: { x: 0.5, y: 0.5, z: 0 },
    });

    const preview = sourceMeshManager.createPreviewGeometry(id);
    const previewPositions = preview.getAttribute("position")
      .array as Float32Array;
    previewPositions[0] = 42;

    expect(sourceMeshManager.get(id).positions[0]).toBe(0);
    expect(previewPositions.buffer).not.toBe(positions.buffer);
    preview.dispose();
  });

  it("removes source assets explicitly", () => {
    const id = sourceMeshManager.register({
      positions: new Float32Array(9),
      normals: new Float32Array(9),
      vertexCount: 3,
      triangleCount: 1,
      dimensions: { width: 0, height: 0, depth: 0 },
      center: { x: 0, y: 0, z: 0 },
    });

    sourceMeshManager.remove(id);
    expect(sourceMeshManager.has(id)).toBe(false);
  });
});
