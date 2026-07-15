const localFiles = new Map<string, File>();

export const registerLocalModel = (file: File): string => {
  const id = crypto.randomUUID();
  localFiles.clear();
  localFiles.set(id, file);
  return id;
};

export const clearLocalModels = (): void => {
  localFiles.clear();
};
