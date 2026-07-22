import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { useWelcomeStore } from "./store";

const importSampleModel = vi.hoisted(() => vi.fn(() => Promise.resolve()));

vi.mock("../mesh/modelImportController", () => ({ importSampleModel }));

describe("workspace startup", () => {
  beforeEach(() => {
    importSampleModel.mockClear();
    useWelcomeStore.setState({
      theme: "dark",
      screen: "welcome",
      importError: null,
      loadedModel: null,
      layers: [],
      activeLayer: null,
    });
  });

  it("loads the configured cube directly with no selected textures", async () => {
    render(<App />);

    await waitFor(() =>
      expect(importSampleModel).toHaveBeenCalledWith(
        expect.objectContaining({ id: "cube" }),
        [],
      ),
    );
  });
});
