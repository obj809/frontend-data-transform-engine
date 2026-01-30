import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display the main heading", async ({ page }) => {
    // Arrange & Act
    await page.goto("/");

    // Assert
    const heading = page.getByRole("heading", {
      name: "Data Transform Engine",
    });
    await expect(heading).toBeVisible();
  });

  test("should show loading state initially", async ({ page }) => {
    // Arrange & Act
    await page.goto("/");

    // Assert
    // The page should either show loading or have transitioned to connected/error
    const loadingText = page.getByText("Connecting to backend...");
    const connectedText = page.getByText("Connected");
    const errorText = page.getByText("Connection failed");

    // At least one of these states should be visible
    const isLoadingVisible = await loadingText.isVisible().catch(() => false);
    const isConnectedVisible = await connectedText
      .isVisible()
      .catch(() => false);
    const isErrorVisible = await errorText.isVisible().catch(() => false);

    expect(
      isLoadingVisible || isConnectedVisible || isErrorVisible
    ).toBeTruthy();
  });

  test("should have proper page structure", async ({ page }) => {
    // Arrange & Act
    await page.goto("/");

    // Assert
    // Check for main semantic elements
    const main = page.locator("main");
    await expect(main).toBeVisible();

    // Check that the page has the correct title or heading
    await expect(page).toHaveTitle(/Data Transform Engine/i);
  });

  test("should be responsive", async ({ page }) => {
    // Arrange & Act
    await page.goto("/");

    // Assert - check at different viewport sizes
    await page.setViewportSize({ width: 1920, height: 1080 });
    const heading = page.getByRole("heading", {
      name: "Data Transform Engine",
    });
    await expect(heading).toBeVisible();

    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(heading).toBeVisible();
  });
});
