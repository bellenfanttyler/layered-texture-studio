import { expect, test } from "@playwright/test";

test("a visitor can configure a sample starting point", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Build texture stories",
  );
  await page.getByRole("button", { name: /Torus/i }).click();
  await page.getByRole("button", { name: /Tile 014/i }).click();

  await expect(page.getByText("Torus · 1 texture selected")).toBeVisible();
});
