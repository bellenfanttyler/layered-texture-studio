import { useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Color } from "three";
import { sourceMeshManager } from "../assets/sourceMeshManager";
import { brand } from "../config/brand";
import type { LoadedModelSummary } from "../types/mesh";

function PreviewMesh({ model }: { model: LoadedModelSummary }) {
  const geometry = useMemo(
    () => sourceMeshManager.createPreviewGeometry(model.sourceAssetId),
    [model.sourceAssetId],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh
      geometry={geometry}
      position={[-model.center.x, -model.center.y, -model.center.z]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={new Color("#b9c8c0")}
        roughness={0.62}
        metalness={0.08}
      />
    </mesh>
  );
}

export function ModelViewport({ model }: { model: LoadedModelSummary }) {
  const maximumDimension = Math.max(
    model.dimensions.width,
    model.dimensions.height,
    model.dimensions.depth,
    1,
  );
  const cameraDistance = maximumDimension * 1.65;

  return (
    <div className="model-viewport" data-testid="model-viewport">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => gl.setClearColor(new Color("#101713"))}
      >
        <PerspectiveCamera
          makeDefault
          position={[cameraDistance, cameraDistance * 0.72, cameraDistance]}
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
        <PreviewMesh model={model} />
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
          target={[0, 0, 0]}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
}
