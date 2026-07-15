import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Canvas,
  type ThreeEvent,
  useFrame,
  useThree,
} from "@react-three/fiber";
import { Grid, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Mesh,
  Quaternion,
  Vector3,
} from "three";
import { acceleratedRaycast } from "three-mesh-bvh";
import { maskAssetManager } from "../assets/maskAssetManager";
import { sourceMeshManager } from "../assets/sourceMeshManager";
import { useWelcomeStore } from "../app/store";
import { brand } from "../config/brand";
import { copy } from "../config/copy";
import { sampleTextures } from "../config/sampleAssets";
import { maskStrokeHistory } from "../history/maskStrokeHistory";
import { applyBrushSample } from "../selection/applyBrushSample";
import { commitMaskStroke } from "../selection/maskCommands";
import {
  updateMaskColors,
  updateTexturePreviewColors,
} from "../selection/maskColors";
import { createTexturePreview } from "../textures/createTexturePreview";
import type { LoadedModelSummary, MaskLayerSummary } from "../types/mesh";

const zAxis = new Vector3(0, 0, 1);

function PaintCameraTarget({ active }: { active: boolean }) {
  useFrame(({ camera }) => {
    if (active) camera.lookAt(0, 0, 0);
  });
  return null;
}

interface PreviewMeshProps {
  model: LoadedModelSummary;
  layers: MaskLayerSummary[];
  layer: MaskLayerSummary;
  onReady: () => void;
  onPending: () => void;
  onError: (message: string) => void;
}

function PreviewMesh({
  model,
  layers,
  layer,
  onReady,
  onPending,
  onError,
}: PreviewMeshProps) {
  const interactionRef = useRef<Mesh>(null);
  const cursorRef = useRef<Mesh>(null);
  const paintingRef = useRef(false);
  const strokeModeRef = useRef<"add" | "subtract">("add");
  const lastPointRef = useRef<Vector3 | null>(null);
  const { camera, invalidate } = useThree();
  const activeTool = useWelcomeStore((state) => state.activeTool);
  const brushRadius = useWelcomeStore((state) => state.brushRadius);
  const brushHardness = useWelcomeStore((state) => state.brushHardness);
  const brushStrength = useWelcomeStore((state) => state.brushStrength);
  const maskRevision = useWelcomeStore((state) => state.maskRevision);

  const interactionGeometry = useMemo(() => {
    const nextGeometry = sourceMeshManager.createPreviewGeometry(
      model.sourceAssetId,
    );
    return nextGeometry;
  }, [model.sourceAssetId]);

  const visualGeometry = useMemo(() => {
    const source = sourceMeshManager.get(model.sourceAssetId);
    const nextGeometry = new BufferGeometry();
    nextGeometry.setAttribute(
      "position",
      new BufferAttribute(source.positions.slice(), 3),
    );
    nextGeometry.setAttribute(
      "normal",
      new BufferAttribute(source.normals.slice(), 3),
    );
    updateMaskColors(
      nextGeometry,
      maskAssetManager.get(layer.maskAssetId).weights,
      layer.displayColor,
    );
    nextGeometry.computeBoundingSphere();
    return nextGeometry;
  }, [layer.displayColor, layer.maskAssetId, model.sourceAssetId]);

  const maximumDimension = Math.max(
    model.dimensions.width,
    model.dimensions.height,
    model.dimensions.depth,
    1,
  );

  useEffect(() => {
    const weights = maskAssetManager.get(layer.maskAssetId).weights;
    updateMaskColors(visualGeometry, weights, layer.displayColor);
  }, [layer.displayColor, layer.maskAssetId, maskRevision, visualGeometry]);

  useEffect(() => {
    const controller = new AbortController();
    const source = sourceMeshManager.get(model.sourceAssetId);
    const timer = window.setTimeout(() => {
      onPending();
      void createTexturePreview(
        {
          positions: source.positions.slice(),
          normals: source.normals.slice(),
          activeLayerId: layer.id,
          layers: layers.map((item) => {
            const texture =
              sampleTextures.find(
                (candidate) => candidate.id === item.textureId,
              ) ?? sampleTextures[0]!;
            return {
              id: item.id,
              maskWeights: maskAssetManager
                .get(item.maskAssetId)
                .weights.slice(),
              textureUrl: texture.imageUrl,
              textureScale: (item.mappingScale * 4) / maximumDimension,
              amplitude: item.amplitude,
              midpoint: item.midpoint,
              influence: item.influence,
              invert: item.invert,
              visible: item.visible,
              blendMode: item.blendMode,
            };
          }),
        },
        controller.signal,
      )
        .then((result) => {
          visualGeometry.setAttribute(
            "position",
            new BufferAttribute(result.positions, 3),
          );
          updateTexturePreviewColors(
            visualGeometry,
            maskAssetManager.get(layer.maskAssetId).weights,
            result.heights,
            layer.displayColor,
            layer.visible,
          );
          visualGeometry.computeBoundingSphere();
          invalidate();
          onReady();
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError")
            return;
          onError(
            error instanceof Error
              ? error.message
              : "Texture preview could not be created.",
          );
        });
    }, 120);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    layer.displayColor,
    layer.id,
    layer.maskAssetId,
    layer.visible,
    layers,
    invalidate,
    maskRevision,
    maximumDimension,
    model.sourceAssetId,
    onError,
    onPending,
    onReady,
    visualGeometry,
  ]);

  useEffect(
    () => () => {
      interactionGeometry.boundsTree = undefined;
      interactionGeometry.dispose();
    },
    [interactionGeometry],
  );
  useEffect(() => () => visualGeometry.dispose(), [visualGeometry]);

  const resolvePointer = (event: ThreeEvent<PointerEvent>) => {
    if (!event.face || !interactionRef.current) return null;
    const point = interactionRef.current.worldToLocal(event.point.clone());
    const normal = event.face.normal.clone().normalize();
    const cameraPosition = interactionRef.current.worldToLocal(
      camera.position.clone(),
    );
    return { point, normal, cameraPosition };
  };

  const positionCursor = (point: Vector3, normal: Vector3) => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    cursor.visible = activeTool === "paint";
    cursor.position
      .copy(point)
      .addScaledVector(normal, Math.max(brushRadius * 0.004, 0.001));
    cursor.quaternion.copy(new Quaternion().setFromUnitVectors(zAxis, normal));
    cursor.scale.setScalar(brushRadius);
    invalidate();
  };

  const paintAt = (
    point: Vector3,
    normal: Vector3,
    cameraPosition: Vector3,
  ) => {
    const weights = maskAssetManager.get(layer.maskAssetId).weights;
    const previousPoint = lastPointRef.current;
    const spacing = Math.max(brushRadius * 0.22, 0.001);
    const distance = previousPoint ? previousPoint.distanceTo(point) : 0;
    const sampleCount = previousPoint
      ? Math.max(1, Math.ceil(distance / spacing))
      : 1;
    const changed = new Set<number>();

    for (let sampleIndex = 1; sampleIndex <= sampleCount; sampleIndex += 1) {
      const samplePoint = previousPoint
        ? previousPoint.clone().lerp(point, sampleIndex / sampleCount)
        : point;
      for (const index of applyBrushSample(
        interactionGeometry,
        layer.maskAssetId,
        {
          center: samplePoint,
          hitNormal: normal,
          cameraPosition,
          radius: brushRadius,
          hardness: brushHardness,
          strength: brushStrength,
          mode: strokeModeRef.current,
        },
      )) {
        changed.add(index);
      }
    }

    if (changed.size)
      updateMaskColors(visualGeometry, weights, layer.displayColor, changed);
    if (changed.size) invalidate();
    lastPointRef.current = point.clone();
  };

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (activeTool !== "paint" || event.button !== 0) return;
    const pointer = resolvePointer(event);
    if (!pointer) return;
    event.stopPropagation();
    (event.target as Element | null)?.setPointerCapture(event.pointerId);
    strokeModeRef.current = event.altKey ? "subtract" : "add";
    paintingRef.current = true;
    lastPointRef.current = null;
    maskStrokeHistory.begin(layer.maskAssetId);
    positionCursor(pointer.point, pointer.normal);
    paintAt(pointer.point, pointer.normal, pointer.cameraPosition);
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (activeTool !== "paint") return;
    const pointer = resolvePointer(event);
    if (!pointer) return;
    event.stopPropagation();
    positionCursor(pointer.point, pointer.normal);
    if (paintingRef.current)
      paintAt(pointer.point, pointer.normal, pointer.cameraPosition);
  };

  const finishStroke = (event: ThreeEvent<PointerEvent>) => {
    if (!paintingRef.current) return;
    event.stopPropagation();
    paintingRef.current = false;
    lastPointRef.current = null;
    (event.target as Element | null)?.releasePointerCapture(event.pointerId);
    commitMaskStroke(layer.maskAssetId);
  };

  return (
    <group position={[-model.center.x, -model.center.y, -model.center.z]}>
      <mesh
        ref={interactionRef}
        geometry={interactionGeometry}
        raycast={acceleratedRaycast}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerCancel={finishStroke}
        onPointerOut={() => {
          if (cursorRef.current && !paintingRef.current)
            cursorRef.current.visible = false;
        }}
      >
        <meshBasicMaterial
          transparent
          opacity={0}
          colorWrite={false}
          depthWrite={false}
        />
      </mesh>
      <mesh geometry={visualGeometry} receiveShadow raycast={() => null}>
        <meshStandardMaterial vertexColors roughness={0.68} metalness={0.04} />
      </mesh>
      <mesh ref={cursorRef} visible={false} renderOrder={10}>
        <ringGeometry args={[0.9, 1, 48]} />
        <meshBasicMaterial
          color={brand.colors.primary}
          transparent
          opacity={0.92}
          depthTest={false}
        />
      </mesh>
    </group>
  );
}

export function ModelViewport({ model }: { model: LoadedModelSummary }) {
  const [previewReady, setPreviewReady] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const markPreviewReady = useCallback(() => {
    setPreviewError(null);
    setPreviewReady(true);
  }, []);
  const markPreviewPending = useCallback(() => {
    setPreviewError(null);
    setPreviewReady(false);
  }, []);
  const markPreviewError = useCallback((message: string) => {
    setPreviewError(message);
    setPreviewReady(false);
  }, []);
  const layer = useWelcomeStore((state) => state.activeLayer);
  const layers = useWelcomeStore((state) => state.layers);
  const activeTool = useWelcomeStore((state) => state.activeTool);
  const maximumDimension = Math.max(
    model.dimensions.width,
    model.dimensions.height,
    model.dimensions.depth,
    1,
  );
  const cameraDistance = maximumDimension * 1.8;

  if (!layer) return null;

  return (
    <div
      className={`model-viewport ${activeTool === "paint" ? "model-viewport--paint" : ""}`}
      data-testid="model-viewport"
      data-preview-ready={previewReady}
      data-preview-error={previewError ?? undefined}
    >
      <Canvas
        shadows
        frameloop="demand"
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => gl.setClearColor(new Color("#101713"))}
      >
        <PerspectiveCamera
          makeDefault
          position={[cameraDistance, 0, cameraDistance]}
          onUpdate={(camera) => camera.lookAt(0, 0, 0)}
          near={Math.max(maximumDimension / 10_000, 0.001)}
          far={maximumDimension * 100}
          fov={38}
        />
        <ambientLight intensity={1.15} />
        <directionalLight
          castShadow
          position={[
            cameraDistance,
            cameraDistance * 1.2,
            cameraDistance * 0.6,
          ]}
          intensity={2.6}
        />
        <directionalLight
          position={[-cameraDistance, cameraDistance * 0.3, -cameraDistance]}
          intensity={0.75}
          color={brand.colors.primary}
        />
        <PreviewMesh
          model={model}
          layers={layers}
          layer={layer}
          onReady={markPreviewReady}
          onPending={markPreviewPending}
          onError={markPreviewError}
        />
        <Grid
          position={[0, -model.dimensions.height / 2, 0]}
          args={[maximumDimension * 5, maximumDimension * 5]}
          cellSize={Math.max(maximumDimension / 20, 0.1)}
          sectionSize={Math.max(maximumDimension / 4, 0.5)}
          cellColor="#29352f"
          sectionColor="#42544b"
          fadeDistance={maximumDimension * 4}
          infiniteGrid
        />
        <OrbitControls
          makeDefault
          enabled={activeTool === "orbit"}
          target={[0, 0, 0]}
          enableDamping
          dampingFactor={0.08}
        />
        <PaintCameraTarget active={activeTool === "paint"} />
      </Canvas>
      {!previewReady && (
        <div
          className="preview-status"
          role={previewError ? "alert" : "status"}
        >
          <strong>
            {previewError
              ? copy.workspace.previewError
              : copy.workspace.previewBuilding}
          </strong>
          {previewError && <span>{previewError}</span>}
        </div>
      )}
    </div>
  );
}
