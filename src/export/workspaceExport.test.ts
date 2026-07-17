import { describe, expect, it } from "vitest";
import { createExportFilename } from "./workspaceExport";

describe("createExportFilename", () => {
  it("uses the configured prefix and filesystem-safe model name", () => {
    expect(createExportFilename("My Model (final).stl")).toBe(
      "layered-texture-my-model-final.stl",
    );
  });
});
