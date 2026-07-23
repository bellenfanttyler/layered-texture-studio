import { Color } from "three";
import { brand } from "../config/brand";
import type { MaskLayerSummary } from "../types/mesh";

const goldenAngle = 0.618033988749895;

export const createLayerDisplayColor = (index: number): string => {
  if (index === 0) return brand.colors.primary;
  const base = new Color(brand.colors.primary).getHSL({
    h: 0,
    s: 0,
    l: 0,
  });
  const color = new Color().setHSL(
    (base.h + index * goldenAngle) % 1,
    Math.max(base.s, 0.58),
    Math.min(Math.max(base.l, 0.58), 0.72),
  );
  return `#${color.getHexString()}`;
};

export const nextLayerDisplayColor = (layers: MaskLayerSummary[]): string => {
  const colors = new Set(
    layers.map((layer) => layer.displayColor.toLowerCase()),
  );
  let index = 0;
  let candidate = createLayerDisplayColor(index);
  while (colors.has(candidate.toLowerCase())) {
    index += 1;
    candidate = createLayerDisplayColor(index);
  }
  return candidate;
};
