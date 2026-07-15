import { Box, Check, Circle, Disc3, Layers3 } from "lucide-react";
import { useWelcomeStore } from "../app/store";
import { copy } from "../config/copy";
import { sampleModels, sampleTextures } from "../config/sampleAssets";

const modelIcons = {
  cube: Box,
  sphere: Circle,
  torus: Disc3,
} as const;

export function SampleSelector() {
  const selectedModelId = useWelcomeStore((state) => state.selectedModelId);
  const selectedTextureIds = useWelcomeStore(
    (state) => state.selectedTextureIds,
  );
  const selectSampleModel = useWelcomeStore((state) => state.selectSampleModel);
  const toggleSampleTexture = useWelcomeStore(
    (state) => state.toggleSampleTexture,
  );

  const selectedModel = sampleModels.find(
    (model) => model.id === selectedModelId,
  );

  return (
    <section className="sample-section" aria-labelledby="samples-heading">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Curated starting points</span>
          <h2 id="samples-heading">{copy.welcome.sampleHeading}</h2>
        </div>
        <p>{copy.welcome.sampleSubheading}</p>
      </div>

      <fieldset className="asset-group model-group">
        <legend>{copy.welcome.modelGroup}</legend>
        <div className="model-grid">
          {sampleModels.map((model) => {
            const Icon = modelIcons[model.id as keyof typeof modelIcons] ?? Box;
            const isSelected = model.id === selectedModelId;

            return (
              <button
                className={`model-card ${isSelected ? "asset-card--selected" : ""}`}
                type="button"
                key={model.id}
                aria-pressed={isSelected}
                onClick={() => selectSampleModel(model.id)}
              >
                <span
                  className="model-card__visual"
                  style={
                    { "--model-accent": model.accent } as React.CSSProperties
                  }
                >
                  <span className="model-card__rings" />
                  <Icon size={50} strokeWidth={1.25} aria-hidden="true" />
                </span>
                <span className="model-card__copy">
                  <strong>{model.name}</strong>
                  <small>{model.description}</small>
                  <span>
                    {model.format.toUpperCase()} · {model.units}
                  </span>
                </span>
                <span className="selection-indicator" aria-hidden="true">
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="asset-group texture-group">
        <legend>{copy.welcome.textureGroup}</legend>
        <div className="texture-grid">
          {sampleTextures.map((texture) => {
            const isSelected = selectedTextureIds.includes(texture.id);
            return (
              <button
                className={`texture-card ${isSelected ? "asset-card--selected" : ""}`}
                type="button"
                key={texture.id}
                aria-pressed={isSelected}
                onClick={() => toggleSampleTexture(texture.id)}
              >
                <span className="texture-card__image-wrap">
                  <img
                    src={texture.thumbnailUrl ?? texture.imageUrl}
                    alt=""
                    loading="lazy"
                  />
                  <span className="texture-card__category">
                    {texture.category}
                  </span>
                </span>
                <span className="texture-card__copy">
                  <strong>{texture.name}</strong>
                  <small>{texture.license}</small>
                </span>
                <span className="selection-indicator" aria-hidden="true">
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div
        className={`selection-summary ${selectedModel ? "selection-summary--ready" : ""}`}
        aria-live="polite"
      >
        <span className="selection-summary__icon" aria-hidden="true">
          <Layers3 size={20} />
        </span>
        <span>
          <strong>
            {selectedModel
              ? copy.welcome.selectionReady
              : copy.welcome.selectionEmpty}
          </strong>
          {selectedModel && (
            <small>
              {selectedModel.name} · {selectedTextureIds.length} texture
              {selectedTextureIds.length === 1 ? "" : "s"} selected
            </small>
          )}
        </span>
      </div>
    </section>
  );
}
