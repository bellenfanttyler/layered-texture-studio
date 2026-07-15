import { describe, expect, it } from "vitest";
import { isActionableBrowserIssue } from "./browserConsole";

describe("isActionableBrowserIssue", () => {
  it("ignores Chromium's ReadPixels driver performance diagnostic", () => {
    expect(
      isActionableBrowserIssue(
        "warning",
        "[.WebGL-0x123]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels",
      ),
    ).toBe(false);
  });

  it("keeps application warnings and errors actionable", () => {
    expect(isActionableBrowserIssue("warning", "Texture failed")).toBe(true);
    expect(isActionableBrowserIssue("error", "WebGL context lost")).toBe(true);
  });

  it("does not hide similarly worded application warnings", () => {
    expect(
      isActionableBrowserIssue(
        "warning",
        "GPU stall due to ReadPixels while exporting",
      ),
    ).toBe(true);
  });
});
