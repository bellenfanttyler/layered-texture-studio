import { Download, TriangleAlert, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { copy } from "../config/copy";
import {
  downloadMeshExport,
  exportLayeredMesh,
} from "../export/workspaceExport";

export function ExportPanel() {
  const controllerRef = useRef<AbortController | null>(null);
  const exportButtonRef = useRef<HTMLButtonElement>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [message, setMessage] = useState<string>(copy.workspace.exportReady);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => () => controllerRef.current?.abort(), []);

  useEffect(() => {
    if (warnings.length === 0) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setWarnings([]);
        exportButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [warnings]);

  const closeWarnings = (): void => {
    setWarnings([]);
    exportButtonRef.current?.focus();
  };

  const exportMesh = (): void => {
    const controller = new AbortController();
    controllerRef.current = controller;
    setWarnings([]);
    setError(null);
    setMessage(copy.workspace.exportPreparing);
    setIsExporting(true);

    void exportLayeredMesh({
      signal: controller.signal,
      onProgress: (nextMessage) => setMessage(nextMessage),
    })
      .then((result) => {
        downloadMeshExport(result.buffer, result.filename);
        setMessage(copy.workspace.exportComplete);
        if (result.warnings.length > 0) setWarnings(result.warnings);
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") {
          setMessage(copy.workspace.exportCancelled);
          return;
        }
        setError(
          reason instanceof Error
            ? reason.message
            : copy.workspace.exportFailed,
        );
        setMessage(copy.workspace.exportFailed);
      })
      .finally(() => {
        controllerRef.current = null;
        setIsExporting(false);
      });
  };

  return (
    <>
      <section
        className="export-panel export-panel--compact"
        aria-label={copy.workspace.exportHeading}
      >
        <button
          ref={exportButtonRef}
          className="button button--primary"
          type="button"
          disabled={isExporting}
          onClick={exportMesh}
        >
          <Download size={16} aria-hidden="true" />
          {isExporting
            ? copy.workspace.exportingButton
            : copy.workspace.exportButton}
        </button>
        <span className="visually-hidden" role="status" aria-live="polite">
          {message}
        </span>
        {error && (
          <p className="export-panel__error" role="alert">
            {error}
          </p>
        )}
      </section>

      {warnings.length > 0 && (
        <div
          className="dialog-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeWarnings();
          }}
        >
          <section
            className="warning-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-warnings-heading"
            aria-describedby="export-warnings-detail"
          >
            <button
              className="warning-dialog__close"
              type="button"
              aria-label={copy.workspace.dismissExportWarnings}
              autoFocus
              onClick={closeWarnings}
            >
              <X size={17} aria-hidden="true" />
            </button>
            <span className="warning-dialog__icon" aria-hidden="true">
              <TriangleAlert size={22} />
            </span>
            <div>
              <h2 id="export-warnings-heading">
                {copy.workspace.exportWarningsHeading}
              </h2>
              <p id="export-warnings-detail">
                {copy.workspace.exportWarningsDetail}
              </p>
              <ul>
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
