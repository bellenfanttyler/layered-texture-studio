import { describe, expect, it } from "vitest";
import { formatBytes, validateModelFile } from "./fileSelection";

describe("validateModelFile", () => {
  it("accepts configured mesh formats case-insensitively", () => {
    const file = new File(["solid sample"], "sample.STL");
    expect(validateModelFile(file)).toEqual({ valid: true, extension: "stl" });
  });

  it("rejects unsupported and empty model files", () => {
    expect(validateModelFile(new File(["data"], "sample.3mf")).valid).toBe(
      false,
    );
    expect(validateModelFile(new File([], "empty.obj"))).toMatchObject({
      valid: false,
      message: "This model file is empty.",
    });
  });
});

describe("formatBytes", () => {
  it("formats model sizes for the welcome summary", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1_572_864)).toBe("1.5 MB");
  });
});
