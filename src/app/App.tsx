import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { useWelcomeStore } from "./store";
import { useBrandMetadata } from "./useBrandMetadata";
import { copy } from "../config/copy";
import { defaultSampleModelId, sampleModels } from "../config/sampleAssets";
import { AppHeader } from "../components/AppHeader";
import { ImportProgress } from "../components/ImportProgress";
import { importSampleModel } from "../mesh/modelImportController";
import { supportsWebGL2 } from "../utils/webgl";

const Workspace = lazy(() =>
  import("../components/Workspace").then((module) => ({
    default: module.Workspace,
  })),
);

export function App() {
  useBrandMetadata();
  const theme = useWelcomeStore((state) => state.theme);
  const screen = useWelcomeStore((state) => state.screen);
  const importError = useWelcomeStore((state) => state.importError);
  const loadedModel = useWelcomeStore((state) => state.loadedModel);
  const [webglAvailable] = useState(supportsWebGL2);
  const starterImportStarted = useRef(false);
  const starterModel = sampleModels.find(
    (model) => model.id === defaultSampleModelId,
  );

  useEffect(() => {
    if (
      starterImportStarted.current ||
      screen !== "welcome" ||
      loadedModel ||
      !starterModel
    )
      return;
    starterImportStarted.current = true;
    void importSampleModel(starterModel, []);
  }, [loadedModel, screen, starterModel]);

  return (
    <div className="app" data-theme={theme}>
      <AppHeader />
      {!webglAvailable && (
        <div className="compatibility-banner" role="status">
          <TriangleAlert size={18} aria-hidden="true" />
          <span>
            <strong>{copy.welcome.compatibilityTitle}</strong>{" "}
            {copy.welcome.compatibilityDetail}
          </span>
        </div>
      )}

      {screen === "loading" && <ImportProgress />}
      {screen === "workspace" && (
        <Suspense
          fallback={
            <main className="workspace-loading" role="status">
              {copy.loading.openingViewport}
            </main>
          }
        >
          <Workspace />
        </Suspense>
      )}
      {screen === "welcome" && (
        <main
          className="workspace-loading"
          role={importError ? "alert" : "status"}
        >
          {importError ? (
            <div className="startup-error">
              <TriangleAlert size={20} aria-hidden="true" />
              <strong>{copy.welcome.importErrorTitle}</strong>
              <span>{importError}</span>
              <button
                className="button button--primary"
                type="button"
                onClick={() => {
                  if (!starterModel) return;
                  starterImportStarted.current = true;
                  void importSampleModel(starterModel, []);
                }}
              >
                {copy.workspace.retryStarter}
              </button>
            </div>
          ) : (
            copy.workspace.initializing
          )}
        </main>
      )}
    </div>
  );
}
