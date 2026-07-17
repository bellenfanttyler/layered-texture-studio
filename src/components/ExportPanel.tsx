import { Download, ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { copy } from "../config/copy";
import { binaryStlByteLength } from "../export/binaryStl";
import type { ExportValidationReport } from "../export/binaryStl";
import {
  downloadMeshExport,
  exportVisibleLayerMesh,
} from "../export/workspaceExport";
import { formatBytes } from "../utils/fileSelection";

interface ExportPanelProps {
  triangleCount: number;
  visibleLayerCount: number;
  units: string;
}

interface PreparedDownload {
  buffer: ArrayBuffer;
  filename: string;
}

export function ExportPanel({
  triangleCount,
  visibleLayerCount,
  units,
}: ExportPanelProps) {
  const controllerRef = useRef<AbortController | null>(null);
  const preparedRef = useRef<PreparedDownload | null>(null);
  const [report, setReport] = useState<ExportValidationReport | null>(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string>(copy.workspace.exportReady);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
      preparedRef.current = null;
    },
    [],
  );

  const prepareExport = (): void => {
    const controller = new AbortController();
    controllerRef.current = controller;
    preparedRef.current = null;
    setReport(null);
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
        preparedRef.current = {
          buffer: result.buffer,
          filename: result.filename,
        };
        setReport({
          triangleCount: result.triangleCount,
          byteLength: result.byteLength,
          boundaryEdgeCount: result.boundaryEdgeCount,
          nonManifoldEdgeCount: result.nonManifoldEdgeCount,
          changedVertexCount: result.changedVertexCount,
          maximumDisplacement: result.maximumDisplacement,
          warnings: result.warnings,
        });
        setProgress(100);
        setMessage(copy.workspace.preflightComplete);
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

  const downloadPrepared = (): void => {
    const prepared = preparedRef.current;
    if (!prepared) return;
    downloadMeshExport(prepared.buffer, prepared.filename);
    setMessage(
      `${copy.workspace.exportComplete} · ${formatBytes(prepared.buffer.byteLength)}`,
    );
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
      {report && (
        <div className="export-report" data-testid="export-preflight">
          <div className="export-report__heading">
            <ShieldCheck size={16} aria-hidden="true" />
            <strong>{copy.workspace.preflightHeading}</strong>
          </div>
          <dl>
            <div>
              <dt>{copy.workspace.preflightCoordinates}</dt>
              <dd>{copy.workspace.preflightPassed}</dd>
            </div>
            <div>
              <dt>{copy.workspace.preflightDegenerate}</dt>
              <dd>0</dd>
            </div>
            <div>
              <dt>{copy.workspace.preflightBoundary}</dt>
              <dd data-testid="boundary-edge-count">
                {report.boundaryEdgeCount.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt>{copy.workspace.preflightNonManifold}</dt>
              <dd data-testid="non-manifold-edge-count">
                {report.nonManifoldEdgeCount.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt>{copy.workspace.preflightChanged}</dt>
              <dd data-testid="displaced-vertex-count">
                {report.changedVertexCount.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt>{copy.workspace.preflightMaximum}</dt>
              <dd>
                {report.maximumDisplacement.toFixed(4)} {units}
              </dd>
            </div>
          </dl>
          {report.warnings.length === 0 ? (
            <p className="export-report__passed">
              {copy.workspace.preflightNoWarnings}
            </p>
          ) : (
            <div className="export-report__warnings">
              <strong>{copy.workspace.preflightWarnings}</strong>
              <ul>
                {report.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {error && (
        <p className="export-panel__error" role="alert">
          {error}
        </p>
      )}
      <div className="export-panel__actions">
        {!report && (
          <button
            className="button button--primary"
            type="button"
            disabled={isExporting}
            onClick={prepareExport}
          >
            <ShieldCheck size={15} aria-hidden="true" />
            {copy.workspace.prepareExport}
          </button>
        )}
        {report && (
          <button
            className="button button--primary"
            type="button"
            onClick={downloadPrepared}
          >
            <Download size={15} aria-hidden="true" />
            {copy.workspace.exportButton}
          </button>
        )}
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
