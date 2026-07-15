import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "./App";
import { useWelcomeStore } from "./store";

describe("welcome sample selection", () => {
  beforeEach(() => {
    useWelcomeStore.setState({
      theme: "dark",
      selectedModelId: null,
      selectedTextureIds: [],
      localModel: null,
    });
  });

  it("selects a sample model and independent texture choices", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /Sphere/i }));
    await user.click(screen.getByRole("button", { name: /Fabric 025/i }));

    expect(screen.getByRole("button", { name: /Sphere/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /Fabric 025/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("Sphere · 1 texture selected")).toBeInTheDocument();
  });
});
