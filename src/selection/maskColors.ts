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
};
