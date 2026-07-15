import { afterEach, describe, expect, it } from "vitest";
import { BufferAttribute, BufferGeometry, Vector3 } from "three";
import { MeshBVH } from "three-mesh-bvh";
import { maskAssetManager } from "../assets/maskAssetManager";
import { maskStrokeHistory } from "../history/maskStrokeHistory";
import { applyBrushSample } from "./applyBrushSample";

const createTriangle = (): BufferGeometry => {
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), 3),
  );
  geometry.setAttribute(
    "normal",
    new BufferAttribute(new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]), 3),
  );
  geometry.boundsTree = new MeshBVH(geometry);
  return geometry;
};

describe("applyBrushSample", () => {
  afterEach(() => {
    maskAssetManager.clear();
    maskStrokeHistory.clear();
  });

  it("paints one undoable mask stroke with falloff", () => {
    const geometry = createTriangle();
    const maskAssetId = maskAssetManager.create(3);
    maskStrokeHistory.begin(maskAssetId);

    const changed = applyBrushSample(geometry, maskAssetId, {
      center: new Vector3(0.2, 0.2, 0),
      hitNormal: new Vector3(0, 0, 1),
      cameraPosition: new Vector3(0, 0, 5),
      radius: 2,
      hardness: 0.5,
      strength: 0.8,
      mode: "add",
    });

    expect(changed).toHaveLength(3);
    expect(maskAssetManager.get(maskAssetId).weights[0]).toBeCloseTo(0.8);
    expect(maskStrokeHistory.commit()).toBe(true);

    maskStrokeHistory.undo(maskAssetId);
    expect([...maskAssetManager.get(maskAssetId).weights]).toEqual([0, 0, 0]);
    maskStrokeHistory.redo(maskAssetId);
    expect(maskAssetManager.get(maskAssetId).weights[0]).toBeCloseTo(0.8);
    geometry.dispose();
  });

  it("rejects back-facing vertices", () => {
    const geometry = createTriangle();
    const maskAssetId = maskAssetManager.create(3);
    maskStrokeHistory.begin(maskAssetId);

    const changed = applyBrushSample(geometry, maskAssetId, {
      center: new Vector3(0.2, 0.2, 0),
      hitNormal: new Vector3(0, 0, 1),
      cameraPosition: new Vector3(0, 0, -5),
      radius: 2,
      hardness: 0.5,
      strength: 1,
      mode: "add",
    });

    expect(changed).toHaveLength(0);
    expect([...maskAssetManager.get(maskAssetId).weights]).toEqual([0, 0, 0]);
    geometry.dispose();
  });
});
