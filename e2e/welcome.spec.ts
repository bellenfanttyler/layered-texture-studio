import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
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

  await expect(
    page.getByRole("heading", { name: "Cube", level: 1 }),
  ).toBeVisible({
    timeout: 15_000,
  });
  const viewport = page.getByTestId("model-viewport");
  await expect(viewport).toBeVisible();
  await expect(viewport).toHaveAttribute("data-preview-ready", "true", {
    timeout: 15_000,
  });
  await expect(page.getByText("Immutable source")).toBeVisible();
  await expect(page.getByRole("button", { name: "Brick 006" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const coverage = page.getByTestId("mask-coverage");
  await expect(coverage).toHaveText("0.0%");

  await page.getByRole("button", { name: "Replace model" }).click();
  const replacementDialog = page.getByRole("dialog", {
    name: "Replace the current model?",
  });
  await expect(replacementDialog).toContainText(
    "Masks and texture layers are tied to this mesh and cannot transfer",
  );
  await replacementDialog
    .getByRole("button", { name: "Keep current model" })
    .click();
  await expect(coverage).toHaveText("0.0%");

  await page.getByRole("button", { name: "Replace model" }).click();
  const fileChooserPromise = page.waitForEvent("filechooser");
  await replacementDialog
    .getByRole("button", { name: "Choose replacement" })
    .click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles("public/samples/models/sphere.stl");
  await expect(
    page.getByRole("heading", { name: "sphere.stl", level: 1 }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(coverage).toHaveText("0.0%");
  await expect(viewport).toHaveAttribute("data-preview-ready", "true", {
    timeout: 15_000,
  });
  const canvas = viewport.locator("canvas");
  await canvas.evaluate((element) => {
    element.addEventListener("webglcontextlost", () => {
      element.dataset.contextLost = "true";
    });
  });

  await page.getByRole("button", { name: /Paint selection/i }).click();
  const bounds = await viewport.boundingBox();
  if (!bounds) throw new Error("Viewport bounds are unavailable.");
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

  await page
    .locator('input[type="file"][accept*="image/png"]')
    .setInputFiles("public/samples/textures/TIL_014_4K_Height_01.png");
  await expect(
    page.getByText("TIL_014_4K_Height_01", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/Local texture · \d+×\d+px/)).toBeVisible();
  await expect(viewport).toHaveAttribute("data-preview-ready", "true", {
    timeout: 15_000,
  });

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
  await page.getByRole("button", { name: "Prepare STL export" }).click();
  const preflight = page.getByTestId("export-preflight");
  await expect(preflight).toBeVisible({ timeout: 15_000 });
  await expect(preflight.getByText("Finite coordinates")).toBeVisible();
  await expect(preflight.getByText("Passed")).toBeVisible();
  await expect(preflight.getByText("Degenerate triangles")).toBeVisible();
  await expect(page.getByTestId("boundary-edge-count")).toHaveText("0");
  await expect(page.getByTestId("non-manifold-edge-count")).toHaveText("0");
  await expect(page.getByTestId("displaced-vertex-count")).not.toHaveText("0");
  await expect(page.getByText("No geometry warnings detected.")).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export binary STL" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("layered-texture-sphere.stl");
  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  const exportedStl = await readFile(downloadPath!);
  expect(exportedStl.readUInt32LE(80)).toBe(65_024);
  expect((exportedStl.byteLength - 84) % 50).toBe(0);
  await expect(page.getByText(/STL exported/)).toBeVisible();
  await page.waitForTimeout(10_000);
  await expect(canvas).not.toHaveAttribute("data-context-lost", "true");
  expect(browserIssues).toEqual([]);
});
