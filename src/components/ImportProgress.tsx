import { LoaderCircle, X } from "lucide-react";
import { useWelcomeStore } from "../app/store";
import { copy } from "../config/copy";
import { cancelModelImport } from "../mesh/modelImportController";

export function ImportProgress() {
  const message = useWelcomeStore((state) => state.importMessage);
  const progress = useWelcomeStore((state) => state.importProgress);

  return (
    <main className="import-screen">
      <section className="import-card" aria-live="polite">
        <span className="import-card__icon" aria-hidden="true">
          <LoaderCircle size={26} />
        </span>
        <span className="section-kicker">{copy.loading.detail}</span>
        <h1>{copy.loading.title}</h1>
        <p>{message}</p>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-value">{progress}%</span>
        <button
          className="button button--quiet"
          type="button"
          onClick={cancelModelImport}
        >
          <X size={15} aria-hidden="true" />
          {copy.loading.cancel}
        </button>
      </section>
    </main>
  );
}
