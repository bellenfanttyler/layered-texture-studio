import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExportPanel } from "./ExportPanel";

const exportLayeredMesh = vi.hoisted(() => vi.fn());
const downloadMeshExport = vi.hoisted(() => vi.fn());

vi.mock("../export/workspaceExport", () => ({
  exportLayeredMesh,
  downloadMeshExport,
}));

const exportResult = (warnings: string[] = []) => ({
  buffer: new ArrayBuffer(84),
  filename: "layered-texture-cube.stl",
  triangleCount: 0,
  byteLength: 84,
  boundaryEdgeCount: 0,
  nonManifoldEdgeCount: 0,
  changedVertexCount: 0,
  maximumDisplacement: 0,
  warnings,
  layerCount: 1,
});

describe("ExportPanel", () => {
  beforeEach(() => {
    exportLayeredMesh.mockReset();
    downloadMeshExport.mockReset();
  });

  it("downloads immediately without opening a report when there are no warnings", async () => {
    exportLayeredMesh.mockResolvedValue(exportResult());
    const user = userEvent.setup();
    render(<ExportPanel />);

    await user.click(screen.getByRole("button", { name: "Download STL" }));

    await waitFor(() =>
      expect(downloadMeshExport).toHaveBeenCalledWith(
        expect.any(ArrayBuffer),
        "layered-texture-cube.stl",
      ),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows returned geometry warnings in a dismissible dialog", async () => {
    exportLayeredMesh.mockResolvedValue(
      exportResult(["The mesh has 3 boundary edges."]),
    );
    const user = userEvent.setup();
    render(<ExportPanel />);

    await user.click(screen.getByRole("button", { name: "Download STL" }));

    expect(
      await screen.findByRole("dialog", { name: "Geometry warnings" }),
    ).toHaveTextContent("The mesh has 3 boundary edges.");
    await user.click(
      screen.getByRole("button", { name: "Dismiss geometry warnings" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
