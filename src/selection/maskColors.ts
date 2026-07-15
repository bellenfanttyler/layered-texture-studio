import { BufferAttribute, BufferGeometry, Color } from "three";

const baseColor = new Color("#b9c8c0");

export const createMaskColors = (
  weights: Float32Array,
  displayColor: string,
): Float32Array => {
  const selectedColor = new Color(displayColor);
  const colors = new Float32Array(weights.length * 3);
  const mixed = new Color();

  weights.forEach((weight, index) => {
    mixed.copy(baseColor).lerp(selectedColor, Math.min(1, weight * 0.86));
    colors[index * 3] = mixed.r;
    colors[index * 3 + 1] = mixed.g;
    colors[index * 3 + 2] = mixed.b;
  });
  return colors;
};

export const updateMaskColors = (
  geometry: BufferGeometry,
  weights: Float32Array,
  displayColor: string,
  indices?: Iterable<number>,
): void => {
  let maskAttribute = geometry.getAttribute("maskWeight") as
    BufferAttribute | undefined;
  if (!maskAttribute) {
    maskAttribute = new BufferAttribute(weights, 1);
    geometry.setAttribute("maskWeight", maskAttribute);
  }
  let colorAttribute = geometry.getAttribute("color") as
    BufferAttribute | undefined;
  if (!colorAttribute) {
    colorAttribute = new BufferAttribute(
      createMaskColors(weights, displayColor),
      3,
    );
    geometry.setAttribute("color", colorAttribute);
  }

  const selectedColor = new Color(displayColor);
  const mixed = new Color();
  const targets = indices ?? weights.keys();
  for (const index of targets) {
    mixed
      .copy(baseColor)
      .lerp(selectedColor, Math.min(1, (weights[index] ?? 0) * 0.86));
    colorAttribute.setXYZ(index, mixed.r, mixed.g, mixed.b);
  }
  colorAttribute.needsUpdate = true;
  maskAttribute.needsUpdate = true;
};

export const updateTexturePreviewColors = (
  geometry: BufferGeometry,
  weights: Float32Array,
  heights: Float32Array,
  displayColor: string,
  visible: boolean,
): void => {
  const selectedColor = new Color(displayColor);
  const mixed = new Color();
  const colors = new Float32Array(weights.length * 3);
  weights.forEach((weight, index) => {
    const previewWeight = visible ? weight : 0;
    const tone = 0.72 + (heights[index] ?? 0.5) * 0.42;
    mixed.copy(baseColor).lerp(selectedColor, previewWeight * 0.28);
    colors[index * 3] = mixed.r * (1 + (tone - 1) * previewWeight);
    colors[index * 3 + 1] = mixed.g * (1 + (tone - 1) * previewWeight);
    colors[index * 3 + 2] = mixed.b * (1 + (tone - 1) * previewWeight);
  });
  geometry.setAttribute("color", new BufferAttribute(colors, 3));
};
