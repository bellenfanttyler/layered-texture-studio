import { expect, test } from "@playwright/test";
import { isActionableBrowserIssue } from "../src/test/browserConsole";

test("a visitor can paint a textured surface selection", async ({ page }) => {
  const browserIssues: string[] = [];
  page.on("console", (message) => {
    if (isActionableBrowserIssue(message.type(), message.text()))
      browserIssues.push(`${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) =>
    browserIssues.push(`error: ${error.message}`),
  );
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Build texture stories",
  );
  await page.getByRole("button", { name: /Sphere/i }).click();
  await page.getByRole("button", { name: /Tile 014/i }).click();

  await expect(page.getByText("Sphere · 1 texture selected")).toBeVisible();
  await page.getByRole("button", { name: "Open sample model" }).click();

  await expect(
    page.getByRole("heading", { name: "Sphere", level: 1 }),
  ).toBeVisible({
    timeout: 15_000,
  });
  const viewport = page.getByTestId("model-viewport");
  await expect(viewport).toBeVisible();
  await expect(viewport).toHaveAttribute("data-preview-ready", "true", {
    timeout: 15_000,
  });
  await expect(page.getByText("Immutable source")).toBeVisible();
  const canvas = viewport.locator("canvas");
  await canvas.evaluate((element) => {
    element.addEventListener("webglcontextlost", () => {
      element.dataset.contextLost = "true";
    });
  });
  await expect(page.getByRole("button", { name: "Tile 014" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.getByRole("button", { name: /Paint selection/i }).click();
  const bounds = await viewport.boundingBox();
  if (!bounds) throw new Error("Viewport bounds are unavailable.");
  const coverage = page.getByTestId("mask-coverage");
  for (const verticalRatio of [0.5, 0.65, 0.8]) {
    await page.mouse.move(
      bounds.x + bounds.width * 0.5,
      bounds.y + bounds.height * verticalRatio,
    );
    await page.mouse.down();
    await page.mouse.move(
      bounds.x + bounds.width * 0.56,
      bounds.y + bounds.height * verticalRatio,
      { steps: 5 },
    );
    await page.mouse.up();
    if ((await coverage.textContent()) !== "0.0%") break;
  }

  await expect(coverage).not.toHaveText("0.0%");
  await page.getByRole("button", { name: "Undo stroke" }).click();
  await expect(coverage).toHaveText("0.0%");
  await page.getByRole("button", { name: "Redo stroke" }).click();
  await expect(coverage).not.toHaveText("0.0%");

  await page.getByRole("button", { name: "Fabric 025" }).click();
  await expect(
    page.getByRole("button", { name: "Fabric 025" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByTestId("texture-scale").fill("2");
  await page.getByTestId("texture-amplitude").fill("0.08");
  await page.getByRole("checkbox", { name: "Invert height" }).check();
  await expect(
    page.getByRole("checkbox", { name: "Invert height" }),
  ).toBeChecked();

  await page.getByRole("button", { name: "Add layer" }).click();
  await expect(page.getByLabel("Layer name")).toHaveValue("Texture Layer 2");
  await expect(viewport).toHaveAttribute("data-preview-ready", "true", {
    timeout: 15_000,
  });
  await expect(coverage).toHaveText("0.0%");
  const secondBounds = await viewport.boundingBox();
  if (!secondBounds) throw new Error("Viewport bounds are unavailable.");
  for (const verticalRatio of [0.5, 0.65, 0.8]) {
    await page.mouse.move(
      secondBounds.x + secondBounds.width * 0.5,
      secondBounds.y + secondBounds.height * verticalRatio,
    );
    await page.mouse.down();
    await page.mouse.move(
      secondBounds.x + secondBounds.width * 0.44,
      secondBounds.y + secondBounds.height * verticalRatio,
      { steps: 5 },
    );
    await page.mouse.up();
    if ((await coverage.textContent()) !== "0.0%") break;
  }
  await expect(coverage).not.toHaveText("0.0%");
  await page.getByRole("button", { name: "Select Texture Layer 1" }).click();
  await expect(coverage).not.toHaveText("0.0%");
  await page.getByRole("button", { name: "Select Texture Layer 2" }).click();
  await page.getByLabel("Layer name").fill("Grip details");
  await page.getByLabel("Blend mode").selectOption("subtract");
  await page.getByRole("button", { name: "Hide Grip details" }).click();
  await expect(
    page.getByRole("button", { name: "Show Grip details" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Show Grip details" }).click();
  await page.getByRole("button", { name: "Duplicate" }).click();
  await expect(page.getByLabel("Layer name")).toHaveValue("Grip details Copy");
  await page.getByRole("button", { name: "Delete active layer" }).click();
  await expect(page.getByLabel("Layer name")).toHaveValue("Grip details");
  await expect(viewport).toHaveAttribute("data-preview-ready", "true", {
    timeout: 15_000,
  });
  await page.waitForTimeout(10_000);
  await expect(canvas).not.toHaveAttribute("data-context-lost", "true");
  expect(browserIssues).toEqual([]);
});
