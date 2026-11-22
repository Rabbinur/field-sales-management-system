import { test, expect } from "@playwright/test";

test.describe("Field Sales Admin Dashboard Smoke Tests", () => {
  test("Desktop: renders dashboard overview with KPI cards and table", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    // Check page title and brand
    await expect(page.getByText("FieldSales Pro").first()).toBeVisible();
    await expect(page.getByText("Operational Overview")).toBeVisible();

    // Verify presence of KPI cards
    await expect(page.getByText("Total Dealerships")).toBeVisible();
    await expect(page.getByText("Active Sales Reps")).toBeVisible();
    await expect(page.getByText("Orders Today")).toBeVisible();
    await expect(page.getByText("Confirmed Sales")).toBeVisible();

    // Verify operational table and map view
    await expect(page.getByText("Live Field Dispatch View")).toBeVisible();
    await expect(page.getByText("ORD-2026-0842")).toBeVisible();

    // Verify Order Drawer interaction
    await page.getByText("ORD-2026-0842").click();
    await expect(page.getByText("Operational Dispatch Timeline")).toBeVisible();
    await page.getByRole("button", { name: "Dismiss" }).click();
  });

  test("Desktop: toggles sidebar collapse and expand", async ({ page }) => {
    await page.goto("/dashboard");

    // Click collapse button
    const collapseBtn = page.getByTitle("Collapse sidebar");
    await expect(collapseBtn).toBeVisible();
    await collapseBtn.click();

    // Expand button should now be visible
    const expandBtn = page.getByTitle("Expand sidebar");
    await expect(expandBtn).toBeVisible();
    await expandBtn.click();
    await expect(page.getByText("FieldSales Pro").first()).toBeVisible();
  });

  test("Mobile: supports responsive navigation via mobile drawer", async ({
    page,
    isMobile,
  }) => {
    // Only test on mobile viewport
    if (!isMobile) return;

    await page.goto("/dashboard");

    // Desktop sidebar should be hidden on mobile
    const toggleBtn = page.getByLabel("Toggle mobile menu");
    await expect(toggleBtn).toBeVisible();

    // Open mobile menu
    await toggleBtn.click();
    await expect(page.getByText("Core Operations")).toBeVisible();

    // Close mobile menu
    await page.getByLabel("Close navigation menu").click();
  });
});
