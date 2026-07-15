import { expect, test } from "@playwright/test";

test("a visitor can paint and undo a surface selection", async ({ page }) => {
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
  await expect(page.getByTestId("model-viewport")).toBeVisible();
  await expect(page.getByText("Immutable source")).toBeVisible();

  await page.getByRole("button", { name: /Paint selection/i }).click();
  const viewport = page.getByTestId("model-viewport");
  const bounds = await viewport.boundingBox();
  if (!bounds) throw new Error("Viewport bounds are unavailable.");
  await page.mouse.move(
    bounds.x + bounds.width * 0.5,
    bounds.y + bounds.height * 0.5,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width * 0.56,
    bounds.y + bounds.height * 0.5,
    {
      steps: 5,
    },
  );
  await page.mouse.up();

  const coverage = page.getByTestId("mask-coverage");
  await expect(coverage).not.toHaveText("0.0%");
  await page.getByRole("button", { name: "Undo stroke" }).click();
  await expect(coverage).toHaveText("0.0%");
  await page.getByRole("button", { name: "Redo stroke" }).click();
  await expect(coverage).not.toHaveText("0.0%");
});
