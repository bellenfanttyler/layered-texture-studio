import { useEffect } from "react";
import {
  ArrowLeft,
  Box,
  Brush,
  Layers3,
  LockKeyhole,
  MousePointer2,
  Orbit,
  Redo2,
  Undo2,
} from "lucide-react";
import { useWelcomeStore } from "../app/store";
import { copy } from "../config/copy";
import { sampleTextures } from "../config/sampleAssets";
import { closeWorkspace } from "../mesh/modelImportController";
import { redoMaskStroke, undoMaskStroke } from "../selection/maskCommands";
import { formatBytes } from "../utils/fileSelection";
import { ModelViewport } from "../viewport/ModelViewport";

const formatMeasurement = (value: number): string =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);

const formatCount = (value: number): string =>
  new Intl.NumberFormat().format(value);

export function Workspace() {
  const model = useWelcomeStore((state) => state.loadedModel);
  const layer = useWelcomeStore((state) => state.activeLayer);
  const activeTool = useWelcomeStore((state) => state.activeTool);
  const setActiveTool = useWelcomeStore((state) => state.setActiveTool);
  const brushRadius = useWelcomeStore((state) => state.brushRadius);
  const brushHardness = useWelcomeStore((state) => state.brushHardness);
  const brushStrength = useWelcomeStore((state) => state.brushStrength);
  const setBrushRadius = useWelcomeStore((state) => state.setBrushRadius);
  const setBrushHardness = useWelcomeStore((state) => state.setBrushHardness);
  const setBrushStrength = useWelcomeStore((state) => state.setBrushStrength);
  const canUndo = useWelcomeStore((state) => state.canUndo);
  const canRedo = useWelcomeStore((state) => state.canRedo);
  const updateActiveLayer = useWelcomeStore((state) => state.updateActiveLayer);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      )
        return;
      if (event.key === "1") setActiveTool("orbit");
      if (event.key === "2") setActiveTool("paint");
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redoMaskStroke();
        else undoMaskStroke();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setActiveTool]);

  if (!model) return null;

  const maximumDimension = Math.max(
    model.dimensions.width,
    model.dimensions.height,
    model.dimensions.depth,
    1,
  );

  const activeTexture = sampleTextures.find(
    (texture) => texture.id === layer?.textureId,
  );

  return (
    <main className="workspace-main">
      <section className="workspace-heading">
        <button
          className="button button--quiet"
          type="button"
          onClick={closeWorkspace}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {copy.workspace.back}
        </button>
        <div>
          <span className="section-kicker">
            {model.format.toUpperCase()} · {model.units}
          </span>
          <h1>{model.name}</h1>
        </div>
        <span className="source-badge">
          <LockKeyhole size={15} aria-hidden="true" />
          {copy.workspace.sourceProtected}
        </span>
      </section>

      <section className="workspace-grid">
        <div className="viewport-panel">
          <div className="viewport-tools" aria-label={copy.workspace.tools}>
            <button
              className={
                activeTool === "orbit"
                  ? "viewport-tool viewport-tool--active"
                  : "viewport-tool"
              }
              type="button"
              aria-pressed={activeTool === "orbit"}
              onClick={() => setActiveTool("orbit")}
            >
              <Orbit size={16} aria-hidden="true" />
              {copy.workspace.orbitTool}
              <kbd>1</kbd>
            </button>
            <button
              className={
                activeTool === "paint"
                  ? "viewport-tool viewport-tool--active"
                  : "viewport-tool"
              }
              type="button"
              aria-pressed={activeTool === "paint"}
              onClick={() => setActiveTool("paint")}
            >
              <Brush size={16} aria-hidden="true" />
              {copy.workspace.paintTool}
              <kbd>2</kbd>
            </button>
          </div>
          <ModelViewport model={model} />
          <div className="viewport-hint">
            <MousePointer2 size={15} aria-hidden="true" />
            {activeTool === "paint"
              ? copy.workspace.paintHint
              : copy.workspace.viewportHint}
          </div>
        </div>

        <aside className="mesh-panel" aria-labelledby="mesh-overview-heading">
          <div className="mesh-panel__heading">
            <span className="mesh-panel__icon" aria-hidden="true">
              <Box size={20} />
            </span>
            <div>
              <h2 id="mesh-overview-heading">{copy.workspace.overview}</h2>
              <p>{copy.workspace.sourceDetail}</p>
            </div>
          </div>

          {layer && (
            <section
              className="brush-panel"
              aria-labelledby="active-layer-heading"
            >
              <div className="brush-panel__title">
                <span
                  style={{ backgroundColor: layer.displayColor }}
                  aria-hidden="true"
                />
                <div>
                  <small>{copy.workspace.activeLayer}</small>
                  <h3 id="active-layer-heading">{layer.name}</h3>
                </div>
                <strong data-testid="mask-coverage">
                  {(layer.coverage * 100).toFixed(1)}%
                </strong>
              </div>
              <div className="history-actions">
                <button
                  type="button"
                  onClick={undoMaskStroke}
                  disabled={!canUndo}
                >
                  <Undo2 size={15} aria-hidden="true" />
                  {copy.workspace.undo}
                </button>
                <button
                  type="button"
                  onClick={redoMaskStroke}
                  disabled={!canRedo}
                >
                  <Redo2 size={15} aria-hidden="true" />
                  {copy.workspace.redo}
                </button>
              </div>
              <label className="brush-control">
                <span>
                  {copy.workspace.radius}
                  <output>
                    {formatMeasurement(brushRadius)} {model.units}
                  </output>
                </span>
                <input
                  type="range"
                  min={maximumDimension * 0.01}
                  max={maximumDimension * 0.25}
                  step={maximumDimension * 0.0025}
                  value={brushRadius}
                  onChange={(event) =>
                    setBrushRadius(Number(event.target.value))
                  }
                />
              </label>
              <label className="brush-control">
                <span>
                  {copy.workspace.hardness}
                  <output>{Math.round(brushHardness * 100)}%</output>
                </span>
                <input
                  type="range"
                  min={0.05}
                  max={0.95}
                  step={0.05}
                  value={brushHardness}
                  onChange={(event) =>
                    setBrushHardness(Number(event.target.value))
                  }
                />
              </label>
              <label className="brush-control">
                <span>
                  {copy.workspace.strength}
                  <output>{Math.round(brushStrength * 100)}%</output>
                </span>
                <input
                  type="range"
                  min={0.05}
                  max={1}
                  step={0.05}
                  value={brushStrength}
                  onChange={(event) =>
                    setBrushStrength(Number(event.target.value))
                  }
                />
              </label>
            </section>
          )}

          {layer && activeTexture && (
            <section
              className="texture-panel"
              aria-labelledby="texture-heading"
            >
              <div className="texture-panel__heading">
                <div>
                  <small>{copy.workspace.selectedTexture}</small>
                  <h3 id="texture-heading">{copy.workspace.textureHeading}</h3>
                </div>
                <strong>{activeTexture.name}</strong>
              </div>
              <div
                className="texture-library"
                role="list"
                aria-label={copy.workspace.textureHeading}
              >
                {sampleTextures.map((texture) => (
                  <button
                    key={texture.id}
                    type="button"
                    aria-pressed={texture.id === layer.textureId}
                    aria-label={texture.name}
                    onClick={() =>
                      updateActiveLayer({
                        textureId: texture.id,
                        mappingScale: texture.defaultScale,
                        amplitude: Math.min(
                          texture.defaultAmplitude,
                          maximumDimension * 0.05,
                        ),
                      })
                    }
                  >
                    <img
                      src={texture.thumbnailUrl ?? texture.imageUrl}
                      alt=""
                    />
                    <span>{texture.name}</span>
                  </button>
                ))}
              </div>
              <p>{copy.workspace.textureDetail}</p>
              <label className="brush-control">
                <span>
                  {copy.workspace.mappingScale}
                  <output>{layer.mappingScale.toFixed(2)}&times;</output>
                </span>
                <input
                  data-testid="texture-scale"
                  type="range"
                  min={0.25}
                  max={8}
                  step={0.25}
                  value={layer.mappingScale}
                  onChange={(event) =>
                    updateActiveLayer({
                      mappingScale: Number(event.target.value),
                    })
                  }
                />
              </label>
              <label className="brush-control">
                <span>
                  {copy.workspace.amplitude}
                  <output>
                    {formatMeasurement(layer.amplitude)} {model.units}
                  </output>
                </span>
                <input
                  data-testid="texture-amplitude"
                  type="range"
                  min={0}
                  max={maximumDimension * 0.05}
                  step={maximumDimension * 0.0005}
                  value={layer.amplitude}
                  onChange={(event) =>
                    updateActiveLayer({ amplitude: Number(event.target.value) })
                  }
                />
              </label>
              <label className="brush-control">
                <span>
                  {copy.workspace.midpoint}
                  <output>{Math.round(layer.midpoint * 100)}%</output>
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={layer.midpoint}
                  onChange={(event) =>
                    updateActiveLayer({ midpoint: Number(event.target.value) })
                  }
                />
              </label>
              <label className="brush-control">
                <span>
                  {copy.workspace.influence}
                  <output>{Math.round(layer.influence * 100)}%</output>
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={layer.influence}
                  onChange={(event) =>
                    updateActiveLayer({ influence: Number(event.target.value) })
                  }
                />
              </label>
              <div className="texture-toggles">
                <label>
                  <input
                    type="checkbox"
                    checked={layer.visible}
                    onChange={(event) =>
                      updateActiveLayer({ visible: event.target.checked })
                    }
                  />
                  {copy.workspace.visible}
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={layer.invert}
                    onChange={(event) =>
                      updateActiveLayer({ invert: event.target.checked })
                    }
                  />
                  {copy.workspace.invert}
                </label>
              </div>
            </section>
          )}

          <dl className="mesh-metrics">
            <div>
              <dt>{copy.workspace.dimensions}</dt>
              <dd>
                {formatMeasurement(model.dimensions.width)} ×{" "}
                {formatMeasurement(model.dimensions.height)} ×{" "}
                {formatMeasurement(model.dimensions.depth)} {model.units}
              </dd>
            </div>
            <div>
              <dt>{copy.workspace.triangles}</dt>
              <dd>{formatCount(model.triangleCount)}</dd>
            </div>
            <div>
              <dt>{copy.workspace.vertices}</dt>
              <dd>{formatCount(model.vertexCount)}</dd>
            </div>
            <div>
              <dt>{copy.workspace.format}</dt>
              <dd>{model.format.toUpperCase()}</dd>
            </div>
            <div>
              <dt>{copy.workspace.units}</dt>
              <dd>{model.units}</dd>
            </div>
            {model.fileSize > 0 && (
              <div>
                <dt>{copy.workspace.fileSize}</dt>
                <dd>{formatBytes(model.fileSize)}</dd>
              </div>
            )}
          </dl>

          <div className="selected-maps">
            <div className="selected-maps__title">
              <Layers3 size={17} aria-hidden="true" />
              <h3>{layer?.name}</h3>
            </div>
            <small>{copy.workspace.sourceDetail}</small>
          </div>
        </aside>
      </section>
    </main>
  );
}
