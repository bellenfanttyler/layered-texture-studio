import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { CheckCircle2, FileBox, Upload } from "lucide-react";
import { registerLocalModel } from "../assets/localFileRegistry";
import { useWelcomeStore } from "../app/store";
import { copy } from "../config/copy";
import { importLocalModel } from "../mesh/modelImportController";
import { formatBytes, validateModelFile } from "../utils/fileSelection";

export function ModelDropzone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const localModel = useWelcomeStore((state) => state.localModel);
  const selectLocalModel = useWelcomeStore((state) => state.selectLocalModel);

  const processFile = (file: File | undefined) => {
    if (!file) return;
    const validation = validateModelFile(file);
    if (!validation.valid) {
      setError(validation.message ?? "That file cannot be selected.");
      return;
    }

    setError(null);
    selectLocalModel({
      assetId: registerLocalModel(file),
      name: file.name,
      size: file.size,
      extension: validation.extension,
    });
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    processFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    processFile(event.dataTransfer.files[0]);
  };

  return (
    <div
      className={`dropzone ${isDragging ? "dropzone--active" : ""}`}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="dropzone__orb" aria-hidden="true">
        {localModel ? <CheckCircle2 size={27} /> : <Upload size={27} />}
      </div>
      <div>
        <h2>
          {localModel ? copy.welcome.selectedFile : copy.welcome.dropTitle}
        </h2>
        {localModel ? (
          <p className="selected-file">
            <FileBox size={16} aria-hidden="true" />
            <span>{localModel.name}</span>
            <span className="selected-file__meta">
              {localModel.extension.toUpperCase()} ·{" "}
              {formatBytes(localModel.size)}
            </span>
          </p>
        ) : (
          <p>{copy.welcome.dropHint}</p>
        )}
      </div>
      <button
        className="button button--primary"
        type="button"
        onClick={() => {
          if (localModel) void importLocalModel(localModel);
          else inputRef.current?.click();
        }}
      >
        {localModel ? copy.welcome.openLocal : copy.welcome.chooseFile}
      </button>
      {localModel && (
        <button
          className="button button--quiet"
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          {copy.welcome.chooseFile}
        </button>
      )}
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept=".stl"
        onChange={handleInput}
        aria-hidden="true"
        tabIndex={-1}
      />
      {error && (
        <p className="dropzone__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
