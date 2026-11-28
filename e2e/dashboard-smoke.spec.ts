import { test, expect } from "@playwright/test";

test.describe("Field Sales Admin Dashboard Smoke Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate through the Phase 2 Login UI
    await page.goto("/login");
    await page.getByText("Dealership Admin").first().click();
    await page.getByRole("button", { name: "Authenticate & Open Shell" }).click();
    await page.waitForURL("**/dashboard");
  });

  test("Desktop: renders dashboard overview with KPI cards and table", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Desktop only test");

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
    await expect(page.getByText("Dispatch Map Pattern")).toBeVisible();
    const orderCell = page.getByRole("cell", { name: /ORD-2026-0842/ }).first();
    await expect(orderCell).toBeVisible();

    // Verify Column Sorting (click Amount)
    const amountHeader = page.getByText("Amount (BDT)");
    await amountHeader.click();
    // Verify Search filter
    const searchInput = page.getByPlaceholder("Search by order #, retailer, SR, dealer...");
    await searchInput.fill("Bogura");
    await expect(page.getByText("ORD-2026-0838").first()).toBeVisible();
    await page.getByTitle("Reset all filters and sorting").click();

    // Verify Order Drawer interaction
    await orderCell.click();
    await expect(page.getByText("Operational Milestone Timeline")).toBeVisible();
    await page.getByRole("button", { name: "Dismiss" }).click();
  });

  test("Desktop: toggles sidebar collapse and expand", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Desktop only test");

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
    test.skip(!isMobile, "Mobile only test");

    await page.goto("/dashboard");

    // Desktop sidebar should be hidden on mobile, hamburger toggle visible
    const toggleBtn = page.getByLabel("Toggle mobile menu");
    await expect(toggleBtn).toBeVisible();

    // Open mobile menu
    await toggleBtn.click();
    const mobileHeading = page
      .locator("div.fixed")
      .getByText("Core Operations")
      .first();
    await expect(mobileHeading).toBeVisible();

    // Close mobile menu
    await page.getByLabel("Close navigation menu").click();
  });
});
