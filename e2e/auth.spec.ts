import { test, expect } from "@playwright/test";

test.describe("Phase 2: Authentication & Authorization E2E", () => {
  test("redirects unauthenticated visitor from /dashboard to /login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByText("Sign In to Operations")).toBeVisible();
  });

  test("displays error alert when invalid credentials are provided", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Work Email Address").fill("invalid.user@field-sales.test");
    await page.getByLabel("Password").fill("WrongPassword123!");
    await page.getByRole("button", { name: "Authenticate & Open Shell" }).click();

    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByText("Invalid email or password")).toBeVisible();
  });

  test("successfully signs in as Mother Company Admin and signs out cleanly", async ({
    page,
  }) => {
    await page.goto("/login");

    // Select Mother Co. Admin demo account
    await page.getByText("Mother Co. Admin").first().click();
    await page.getByRole("button", { name: "Authenticate & Open Shell" }).click();

    // Verify redirected to dashboard with authenticated session
    await page.waitForURL("**/dashboard");
    await expect(page.getByText("Operational Overview")).toBeVisible();
    await expect(page.getByText("Phase 2 • Authenticated Session")).toBeVisible();

    // Verify Mother Co. Admin identity in user menu
    const userMenuBtn = page.getByLabel("User account menu");
    await expect(userMenuBtn).toBeVisible();
    await userMenuBtn.click();
    await expect(page.getByText("Mother Co. Admin").first()).toBeVisible();

    // Click Sign Out
    await page.getByText("Sign Out").click();
    await page.waitForURL("**/login");
    await expect(page.getByText("Sign In to Operations")).toBeVisible();
  });
});
