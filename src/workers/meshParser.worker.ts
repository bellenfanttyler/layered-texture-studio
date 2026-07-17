/// <reference lib="webworker" />

import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { MeshBVH } from "three-mesh-bvh";
import { calculateSmoothNormals } from "../mesh/smoothNormals";
import type { MeshCenter, MeshDimensions } from "../types/mesh";
import type {
  ParseMeshRequest,
  ParseMeshWorkerResponse,
} from "./meshParser.types";

const worker = self as DedicatedWorkerGlobalScope;

const post = (
  message: ParseMeshWorkerResponse,
  transfer: Transferable[] = [],
): void => {
  worker.postMessage(message, transfer);
};

const measurePositions = (
  positions: Float32Array,
): { center: MeshCenter; dimensions: MeshDimensions } => {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;

  for (let index = 0; index < positions.length; index += 3) {
    const x = positions[index] ?? 0;
    const y = positions[index + 1] ?? 0;
    const z = positions[index + 2] ?? 0;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    minZ = Math.min(minZ, z);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    maxZ = Math.max(maxZ, z);
  }

  return {
    center: {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
      z: (minZ + maxZ) / 2,
    },
    dimensions: { width: maxX - minX, height: maxY - minY, depth: maxZ - minZ },
  };
};

worker.onmessage = (event: MessageEvent<ParseMeshRequest>) => {
  const request = event.data;
  if (request.type !== "parse") return;

  try {
    post({
      type: "progress",
      requestId: request.requestId,
      message: "Parsing STL geometry",
      progress: 45,
    });

    const geometry = new STLLoader().parse(request.buffer);
    if (!geometry.getAttribute("normal")) geometry.computeVertexNormals();

    post({
      type: "progress",
      requestId: request.requestId,
      message: "Building surface acceleration",
      progress: 60,
    });

    const bvh = new MeshBVH(geometry, {
      onProgress: (progress) =>
        post({
          type: "progress",
          requestId: request.requestId,
          message: "Building surface acceleration",
          progress: 60 + Math.round(progress * 30),
        }),
    });
    const serializedBvh = MeshBVH.serialize(bvh);

    const positions = new Float32Array(geometry.getAttribute("position").array);
    const normals = calculateSmoothNormals(positions);
    geometry.dispose();

    if (positions.length === 0 || positions.length % 9 !== 0) {
      throw new Error("The STL does not contain usable triangle geometry.");
    }

    const measurement = measurePositions(positions);
    post(
      {
        type: "success",
        requestId: request.requestId,
        data: {
          positions,
          normals,
          vertexCount: positions.length / 3,
          triangleCount: positions.length / 9,
          bvh: serializedBvh,
          ...measurement,
        },
      },
      [
        positions.buffer,
        normals.buffer,
        ...serializedBvh.roots,
        ...(serializedBvh.index ? [serializedBvh.index.buffer] : []),
        ...(serializedBvh.indirectBuffer
          ? [serializedBvh.indirectBuffer.buffer]
          : []),
      ],
    );
  } catch (error) {
    post({
      type: "error",
      requestId: request.requestId,
      message:
        error instanceof Error ? error.message : "The STL could not be parsed.",
    });
  }
};
