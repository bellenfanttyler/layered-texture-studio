const supportedTextureTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const extensionTypes: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

const maximumTextureFileSize = 64 * 1024 * 1024;
const maximumTextureDimension = 16_384;
const maximumTexturePixels = 64 * 1024 * 1024;

export type TextureFileValidation =
  { valid: true; type: string } | { valid: false; message: string };

export interface LocalTextureAsset {
  id: string;
  name: string;
  file: File;
  objectUrl: string;
  width: number;
  height: number;
}

const assets = new Map<string, LocalTextureAsset>();

export const validateTextureFile = (file: File): TextureFileValidation => {
  if (file.size === 0)
    return { valid: false, message: "This texture file is empty." };
  if (file.size > maximumTextureFileSize)
    return {
      valid: false,
      message: "Choose a texture smaller than 64 MB.",
    };
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const type = file.type.toLowerCase() || extensionTypes[extension];
  if (!type || !supportedTextureTypes.has(type))
    return {
      valid: false,
      message: "Choose a PNG, JPEG, or WebP image.",
    };
  return { valid: true, type };
};

export const registerLocalTexture = async (
  file: File,
): Promise<LocalTextureAsset> => {
  const validation = validateTextureFile(file);
  if (!validation.valid) throw new Error(validation.message);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This image could not be decoded.");
  }
  const { width, height } = bitmap;
  bitmap.close();
  if (width < 1 || height < 1)
    throw new Error("This image has invalid dimensions.");
  if (
    width > maximumTextureDimension ||
    height > maximumTextureDimension ||
    width * height > maximumTexturePixels
  )
    throw new Error("Choose a texture no larger than 64 megapixels.");

  const id = `local-texture:${crypto.randomUUID()}`;
  const asset: LocalTextureAsset = {
    id,
    name: file.name.replace(/\.[^.]+$/, "") || file.name,
    file,
    objectUrl: URL.createObjectURL(file),
    width,
    height,
  };
  assets.set(id, asset);
  return asset;
};

export const localTextureManager = {
  get(id: string): LocalTextureAsset {
    const asset = assets.get(id);
    if (!asset) throw new Error("The local texture is no longer available.");
    return asset;
  },

  has(id: string): boolean {
    return assets.has(id);
  },

  remove(id: string): void {
    const asset = assets.get(id);
    if (!asset) return;
    URL.revokeObjectURL(asset.objectUrl);
    assets.delete(id);
  },

  clear(): void {
    for (const asset of assets.values()) URL.revokeObjectURL(asset.objectUrl);
    assets.clear();
  },
};
