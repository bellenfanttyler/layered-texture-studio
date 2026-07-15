import { expect, test } from "@playwright/test";

test("a visitor can open a sample in the private viewport", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Build texture stories",
  );
  await page.getByRole("button", { name: /Torus/i }).click();
  await page.getByRole("button", { name: /Tile 014/i }).click();

  await expect(page.getByText("Torus · 1 texture selected")).toBeVisible();
  await page.getByRole("button", { name: "Open sample model" }).click();

  await expect(
    page.getByRole("heading", { name: "Torus", level: 1 }),
  ).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByTestId("model-viewport")).toBeVisible();
  await expect(page.getByText("Immutable source")).toBeVisible();
});
