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

export const getLocalModel = (id: string): File => {
  const file = localFiles.get(id);
  if (!file)
    throw new Error("The selected local model is no longer available.");
  return file;
};
