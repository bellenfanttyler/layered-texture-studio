import { describe, expect, it } from "vitest";
import type { MaskLayerSummary } from "../types/mesh";
import { createExportFilename, selectLayersForExport } from "./workspaceExport";

describe("createExportFilename", () => {
  it("uses the configured prefix and filesystem-safe model name", () => {
    expect(createExportFilename("My Model (final).stl")).toBe(
      "layered-texture-my-model-final.stl",
    );
  });

  it("exports visible and hidden layers", () => {
    const createLayer = (id: string, visible: boolean): MaskLayerSummary =>
      ({
        id,
        visible,
      }) as MaskLayerSummary;
    const layers = [createLayer("visible", true), createLayer("hidden", false)];

    expect(selectLayersForExport(layers).map(({ id }) => id)).toEqual([
      "visible",
      "hidden",
    ]);
  });
});
