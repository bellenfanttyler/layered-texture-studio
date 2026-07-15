export interface MaskAsset {
  id: string;
  weights: Float32Array;
}

const masks = new Map<string, MaskAsset>();

export const maskAssetManager = {
  create(vertexCount: number): string {
    const id = crypto.randomUUID();
    masks.set(id, { id, weights: new Float32Array(vertexCount) });
    return id;
  },

  get(id: string): MaskAsset {
    const asset = masks.get(id);
    if (!asset) throw new Error("The active mask asset is unavailable.");
    return asset;
  },

  coverage(id: string): number {
    const { weights } = this.get(id);
    let affected = 0;
    for (const weight of weights) {
      if (weight > 0.001) affected += 1;
    }
    return weights.length ? affected / weights.length : 0;
  },

  remove(id: string): void {
    masks.delete(id);
  },

  clear(): void {
    masks.clear();
  },
};
