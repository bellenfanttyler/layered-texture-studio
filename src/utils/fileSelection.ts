import { features } from "../config/features";

export interface FileValidationResult {
  valid: boolean;
  extension: string;
  message?: string;
}

export const validateModelFile = (file: File): FileValidationResult => {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (
    !features.importFormats.includes(
      extension as (typeof features.importFormats)[number],
    )
  ) {
    return {
      valid: false,
      extension,
      message: "Choose an STL, OBJ, GLB, or GLTF model.",
    };
  }

  if (file.size === 0) {
    return { valid: false, extension, message: "This model file is empty." };
  }

  return { valid: true, extension };
};

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = units[0];

  for (let index = 1; value >= 1024 && index < units.length; index += 1) {
    value /= 1024;
    unit = units[index];
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`;
};
