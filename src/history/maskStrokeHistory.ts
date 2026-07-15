import { maskAssetManager } from "../assets/maskAssetManager";

interface MaskDelta {
  maskAssetId: string;
  indices: Uint32Array;
  before: Float32Array;
  after: Float32Array;
}

interface ActiveStroke {
  maskAssetId: string;
  before: Map<number, number>;
}

let activeStroke: ActiveStroke | null = null;
const undoStack: MaskDelta[] = [];
const redoStack: MaskDelta[] = [];
const historyLimit = 50;

export const maskStrokeHistory = {
  begin(maskAssetId: string): void {
    activeStroke = { maskAssetId, before: new Map() };
  },

  record(index: number, previousValue: number): void {
    if (!activeStroke || activeStroke.before.has(index)) return;
    activeStroke.before.set(index, previousValue);
  },

  commit(): boolean {
    if (!activeStroke || activeStroke.before.size === 0) {
      activeStroke = null;
      return false;
    }

    const mask = maskAssetManager.get(activeStroke.maskAssetId).weights;
    const entries = [...activeStroke.before.entries()].sort(
      ([a], [b]) => a - b,
    );
    const indices = new Uint32Array(entries.length);
    const before = new Float32Array(entries.length);
    const after = new Float32Array(entries.length);

    entries.forEach(([index, value], entryIndex) => {
      indices[entryIndex] = index;
      before[entryIndex] = value;
      after[entryIndex] = mask[index] ?? 0;
    });

    undoStack.push({
      maskAssetId: activeStroke.maskAssetId,
      indices,
      before,
      after,
    });
    if (undoStack.length > historyLimit) undoStack.shift();
    redoStack.length = 0;
    activeStroke = null;
    return true;
  },

  cancel(): void {
    if (!activeStroke) return;
    const mask = maskAssetManager.get(activeStroke.maskAssetId).weights;
    for (const [index, value] of activeStroke.before) mask[index] = value;
    activeStroke = null;
  },

  undo(maskAssetId: string): Uint32Array | null {
    const delta = undoStack.pop();
    if (!delta || delta.maskAssetId !== maskAssetId) return null;
    const mask = maskAssetManager.get(maskAssetId).weights;
    delta.indices.forEach((index, entryIndex) => {
      mask[index] = delta.before[entryIndex] ?? 0;
    });
    redoStack.push(delta);
    return delta.indices;
  },

  redo(maskAssetId: string): Uint32Array | null {
    const delta = redoStack.pop();
    if (!delta || delta.maskAssetId !== maskAssetId) return null;
    const mask = maskAssetManager.get(maskAssetId).weights;
    delta.indices.forEach((index, entryIndex) => {
      mask[index] = delta.after[entryIndex] ?? 0;
    });
    undoStack.push(delta);
    return delta.indices;
  },

  canUndo(): boolean {
    return undoStack.length > 0;
  },

  canRedo(): boolean {
    return redoStack.length > 0;
  },

  clear(): void {
    activeStroke = null;
    undoStack.length = 0;
    redoStack.length = 0;
  },
};
