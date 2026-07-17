import { Download, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { copy } from "../config/copy";
import {
  downloadMeshExport,
  exportVisibleLayerMesh,
} from "../export/workspaceExport";
import { binaryStlByteLength } from "../export/binaryStl";
import { formatBytes } from "../utils/fileSelection";

interface ExportPanelProps {
  triangleCount: number;
  visibleLayerCount: number;
  units: string;
}

export function ExportPanel({
  triangleCount,
  visibleLayerCount,
  units,
}: ExportPanelProps) {
  const controllerRef = useRef<AbortController | null>(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string>(copy.workspace.exportReady);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
    },
    [],
  );

  const startExport = (): void => {
    const controller = new AbortController();
    controllerRef.current = controller;
    setError(null);
    setProgress(5);
    setMessage(copy.workspace.exportPreparing);
    setIsExporting(true);
    void exportVisibleLayerMesh({
      signal: controller.signal,
      onProgress: (nextMessage, nextProgress) => {
        setMessage(nextMessage);
        setProgress(nextProgress);
      },
    })
      .then((result) => {
        downloadMeshExport(result.buffer, result.filename);
        setProgress(100);
        setMessage(
          `${copy.workspace.exportComplete} · ${formatBytes(result.byteLength)}`,
        );
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") {
          setMessage(copy.workspace.exportCancelled);
          setProgress(0);
          return;
        }
        setError(
          reason instanceof Error
            ? reason.message
            : copy.workspace.exportFailed,
        );
        setMessage(copy.workspace.exportFailed);
        setProgress(0);
      })
      .finally(() => {
        controllerRef.current = null;
        setIsExporting(false);
      });
  };

  return (
    <section className="export-panel" aria-labelledby="export-heading">
      <div className="export-panel__heading">
        <div>
          <small>{copy.workspace.exportKicker}</small>
          <h3 id="export-heading">{copy.workspace.exportHeading}</h3>
        </div>
        <strong>STL</strong>
      </div>
      <dl>
        <div>
          <dt>{copy.workspace.exportLayers}</dt>
          <dd>{visibleLayerCount}</dd>
        </div>
        <div>
          <dt>{copy.workspace.exportTriangles}</dt>
          <dd>{triangleCount.toLocaleString()}</dd>
        </div>
        <div>
          <dt>{copy.workspace.exportEstimate}</dt>
          <dd>{formatBytes(binaryStlByteLength(triangleCount))}</dd>
        </div>
      </dl>
      <p>{copy.workspace.exportDetail}</p>
      <p className="export-panel__units">
        {copy.workspace.exportUnits.replace("{units}", units)}
      </p>
      {(isExporting || progress > 0) && (
        <div className="export-progress" aria-live="polite">
          <div
            className="progress-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <small>{message}</small>
        </div>
      )}
      {error && (
        <p className="export-panel__error" role="alert">
          {error}
        </p>
      )}
      <div className="export-panel__actions">
        <button
          className="button button--primary"
          type="button"
          disabled={isExporting}
          onClick={startExport}
        >
          <Download size={15} aria-hidden="true" />
          {copy.workspace.exportButton}
        </button>
        {isExporting && (
          <button
            className="button button--quiet"
            type="button"
            onClick={() => controllerRef.current?.abort()}
          >
            <X size={15} aria-hidden="true" />
            {copy.workspace.cancelExport}
          </button>
        )}
      </div>
    </section>
  );
}
