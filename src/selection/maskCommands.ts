import { maskAssetManager } from "../assets/maskAssetManager";
import { useWelcomeStore } from "../app/store";
import { maskStrokeHistory } from "../history/maskStrokeHistory";

const publishMaskState = (maskAssetId: string): void => {
  useWelcomeStore
    .getState()
    .updateMaskState(
      maskAssetManager.coverage(maskAssetId),
      maskStrokeHistory.canUndo(),
      maskStrokeHistory.canRedo(),
    );
};

export const commitMaskStroke = (maskAssetId: string): void => {
  if (maskStrokeHistory.commit()) publishMaskState(maskAssetId);
};

export const undoMaskStroke = (): void => {
  const maskAssetId = useWelcomeStore.getState().activeLayer?.maskAssetId;
  if (!maskAssetId || !maskStrokeHistory.undo(maskAssetId)) return;
  publishMaskState(maskAssetId);
};

export const redoMaskStroke = (): void => {
  const maskAssetId = useWelcomeStore.getState().activeLayer?.maskAssetId;
  if (!maskAssetId || !maskStrokeHistory.redo(maskAssetId)) return;
  publishMaskState(maskAssetId);
};
