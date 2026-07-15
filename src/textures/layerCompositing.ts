export type RequiredBlendMode = "add" | "subtract" | "replace";

export const combineLayerDisplacement = (
  current: number,
  layerDisplacement: number,
  maskWeight: number,
  blendMode: RequiredBlendMode,
): number => {
  if (blendMode === "subtract") return current - layerDisplacement;
  if (blendMode === "replace")
    return current * (1 - maskWeight) + layerDisplacement;
  return current + layerDisplacement;
};
