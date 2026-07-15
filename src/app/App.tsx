import { lazy, Suspense, useState } from "react";
import { LockKeyhole, TriangleAlert } from "lucide-react";
import { useWelcomeStore } from "./store";
import { useBrandMetadata } from "./useBrandMetadata";
import { brand } from "../config/brand";
import { copy } from "../config/copy";
import { AppFooter } from "../components/AppFooter";
import { AppHeader } from "../components/AppHeader";
import { ImportProgress } from "../components/ImportProgress";
import { ModelDropzone } from "../components/ModelDropzone";
import { SampleSelector } from "../components/SampleSelector";
import { WorkflowSteps } from "../components/WorkflowSteps";
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
  const [webglAvailable] = useState(supportsWebGL2);

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
        <>
          <main>
            {importError && (
              <div className="import-error" role="alert">
                <TriangleAlert size={18} aria-hidden="true" />
                <span>
                  <strong>{copy.welcome.importErrorTitle}</strong>
                  {importError}
                </span>
              </div>
            )}
            <section className="welcome-hero">
              <div className="welcome-hero__glow" aria-hidden="true" />
              <div className="welcome-copy">
                <span className="eyebrow">
                  <LockKeyhole size={14} aria-hidden="true" />
                  {copy.welcome.eyebrow}
                </span>
                <h1>{copy.welcome.title}</h1>
                <p>{copy.welcome.introduction}</p>
                <span className="brand-tagline">{brand.tagline}</span>
              </div>
              <ModelDropzone />
            </section>

            <WorkflowSteps />
            <SampleSelector />

            <p className="milestone-note">{copy.welcome.initializationNote}</p>
          </main>
          <AppFooter />
        </>
      )}
    </div>
  );
}
