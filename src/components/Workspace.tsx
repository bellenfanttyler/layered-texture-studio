import {
  ArrowLeft,
  Box,
  Layers3,
  LockKeyhole,
  MousePointer2,
} from "lucide-react";
import { useWelcomeStore } from "../app/store";
import { copy } from "../config/copy";
import { sampleTextures } from "../config/sampleAssets";
import { closeWorkspace } from "../mesh/modelImportController";
import { formatBytes } from "../utils/fileSelection";
import { ModelViewport } from "../viewport/ModelViewport";

const formatMeasurement = (value: number): string =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);

const formatCount = (value: number): string =>
  new Intl.NumberFormat().format(value);

export function Workspace() {
  const model = useWelcomeStore((state) => state.loadedModel);
  if (!model) return null;

  const selectedTextures = sampleTextures.filter((texture) =>
    model.selectedTextureIds.includes(texture.id),
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
          <ModelViewport model={model} />
          <div className="viewport-hint">
            <MousePointer2 size={15} aria-hidden="true" />
            {copy.workspace.viewportHint}
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
              <h3>{copy.workspace.selectedMaps}</h3>
            </div>
            {selectedTextures.length ? (
              <div className="selected-map-list">
                {selectedTextures.map((texture) => (
                  <div key={texture.id}>
                    <img
                      src={texture.thumbnailUrl ?? texture.imageUrl}
                      alt=""
                    />
                    <span>{texture.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>{copy.workspace.noMaps}</p>
            )}
            <small>{copy.workspace.selectedMapsDetail}</small>
          </div>
        </aside>
      </section>
    </main>
  );
}
