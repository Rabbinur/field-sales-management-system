import { test, expect } from "@playwright/test";

test.describe("Phase 2: Authentication & Authorization E2E", () => {
  test("1. Redirects unauthenticated visitor from /dashboard to /login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByText("Sign In to Operations")).toBeVisible();
  });

  test("2. Rejects invalid credentials with generic error banner without setting session cookie", async ({
    page,
    context,
  }) => {
    await page.goto("/login");
    await page.locator("#email").fill("invalid.user@field-sales.test");
    await page.locator("#password").fill("WrongPassword123!");
    await page.getByRole("button", { name: "Authenticate & Open Shell" }).click();

    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByText("Invalid email or password")).toBeVisible();

    // Verify no session cookie was created
    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name === "fsms_session");
    expect(sessionCookie).toBeUndefined();
  });

  test("3. Authenticates successfully, verifies HttpOnly session cookie, safe DTO, and session revocation on logout", async ({
    page,
    context,
    request,
    isMobile,
  }) => {
    await page.goto("/login");

    // Select Mother Co. Admin demo account
    await page.getByText("Mother Co. Admin").first().click();
    await page.getByRole("button", { name: "Authenticate & Open Shell" }).click();

    // Verify redirected to dashboard with live session
    await page.waitForURL("**/dashboard");
    if (!isMobile) {
      await expect(page.getByText("Operational Overview")).toBeVisible();
      await expect(page.getByText("Phase 2 • Authenticated Session")).toBeVisible();
    } else {
      await expect(page.getByLabel("Toggle mobile menu")).toBeVisible();
    }

    // Verify session cookie security attributes
    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name === "fsms_session");
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.httpOnly).toBe(true);
    expect(sessionCookie?.sameSite).toBe("Lax");
    expect(sessionCookie?.path).toBe("/");
    expect(sessionCookie?.value).toBeTruthy();

    const capturedToken = sessionCookie!.value;

    // Verify /api/auth/me returns only safe DTO without sensitive fields
    const meRes = await request.get("/api/auth/me", {
      headers: {
        Cookie: `fsms_session=${capturedToken}`,
      },
    });
    expect(meRes.status()).toBe(200);
    const meData = await meRes.json();
    expect(meData.success).toBe(true);
    expect(meData.user.email).toBe("motheradmin@field-sales.test");
    expect(meData.user.role).toBe("MOTHER_COMPANY_ADMIN");
    // Verify no password hash or internal hashes are returned
    expect(meData.user).not.toHaveProperty("passwordHash");
    expect(meData).not.toHaveProperty("tokenHash");
    expect(meData).not.toHaveProperty("password");

    // Log out via the user menu in UI
    const userMenuBtn = page.getByLabel("User account menu");
    await expect(userMenuBtn).toBeVisible();
    await userMenuBtn.click();
    await expect(page.getByText("Sign Out")).toBeVisible();

    // Click Sign Out
    await page.getByText("Sign Out").click();
    await page.waitForURL("**/login");
    await expect(page.getByText("Sign In to Operations")).toBeVisible();

    // Verify that attempting to reuse the revoked token fails with 401 Unauthorized
    const postLogoutMeRes = await request.get("/api/auth/me", {
      headers: {
        Cookie: `fsms_session=${capturedToken}`,
      },
    });
    expect(postLogoutMeRes.status()).toBe(401);
    const postLogoutData = await postLogoutMeRes.json();
    expect(postLogoutData.success).toBe(false);
  });
});
