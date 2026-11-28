import { test, expect } from "@playwright/test";

test.describe("Phase 3: Dealership & Organization Management E2E", () => {
  test("1. Unauthenticated user is redirected from /dealerships to /login", async ({
    page,
  }) => {
    await page.goto("/dealerships");
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByText("Sign In to Operations")).toBeVisible();
  });

  test("2. Mother Company Admin: full management, registration, search, drawer, edit, and status transition", async ({
    page,
    isMobile,
  }) => {
    // 1. Log in as Mother Company Admin
    await page.goto("/login");
    await page.getByText("Mother Co. Admin").first().click();
    await page.getByRole("button", { name: "Authenticate & Open Shell" }).click();
    await page.waitForURL("**/dashboard");

    // 2. Navigate to /dealerships
    await page.goto("/dealerships");
    await expect(page.getByText("Dealership & Distribution Hubs").first()).toBeVisible();

    // 3. Verify KPI cards and seeded hubs are visible
    await expect(page.getByText("Total Dealerships")).toBeVisible();
    await expect(page.getByText("Active Hubs", { exact: true })).toBeVisible();

    const dhkHub = isMobile
      ? page.getByTestId("dealership-card-dlr-1")
      : page.getByTestId("dealership-row-dlr-1");
    await expect(dhkHub).toBeVisible();
    await expect(dhkHub.getByText("DLR-DHK-01")).toBeVisible();

    // 4. Verify Register Dealership button is available
    const registerBtn = page.getByTestId("btn-register-dealership");
    await expect(registerBtn).toBeVisible();

    // 5. Open Register Dealership dialog and create a new dealership
    await registerBtn.click();
    await expect(page.getByRole("heading", { name: "Register New Dealership" })).toBeVisible();

    const uniqueCode = `DLR-SYL-${Date.now().toString().slice(-4)}`;
    await page.getByTestId("input-dealership-name").fill("Sylhet Central Distribution");
    await page.getByTestId("input-dealership-code").fill(uniqueCode);
    await page.getByTestId("input-contact-person").fill("Shafiqul Islam");
    await page.getByTestId("input-phone").fill("+8801755667788");
    await page.getByTestId("input-email").fill("sylhet@test-hub.field-sales.test");
    await page.getByTestId("input-address").fill("Subidbazar Main Point");
    await page.getByTestId("input-city").fill("Sylhet");
    await page.getByTestId("input-district").fill("Sylhet");
    await page.getByTestId("input-region").fill("North-East");

    await page.getByTestId("submit-create-dealership").click();

    // 6. Verify newly registered dealership appears in list
    const registeredHub = isMobile
      ? page.locator('[data-testid^="dealership-card-"]').filter({ hasText: uniqueCode })
      : page.locator('[data-testid^="dealership-row-"]').filter({ hasText: uniqueCode });
    await expect(registeredHub).toBeVisible();
    await expect(registeredHub.getByText("Sylhet Central Distribution")).toBeVisible();

    // 7. Test Search filtering
    const searchInput = page.getByTestId("input-dealership-search");
    await searchInput.fill(uniqueCode);
    await expect(registeredHub).toBeVisible();

    // Clear search
    await searchInput.fill("");

    // 8. Test Details Drawer on newly created hub
    const detailsBtn = registeredHub.getByRole("button", { name: "Details" });
    await detailsBtn.click();
    await expect(page.getByText("Tenancy & Legal Entity")).toBeVisible();
    await expect(page.getByText("Facility Location & Jurisdiction")).toBeVisible();
    await expect(page.getByText("Governance & Status Audit Trail")).toBeVisible();

    // Close drawer
    await page.getByRole("button", { name: "Close drawer" }).click();

    // 9. Test Edit Dealership dialog on newly created hub
    const editBtn = registeredHub.getByRole("button", { name: "Edit" });
    await editBtn.click();
    await expect(page.getByRole("heading", { name: "Edit Dealership Profile" })).toBeVisible();

    await page.getByTestId("input-edit-contact-person").fill("Updated Contact Person");
    await page.getByTestId("submit-edit-dealership").click();
    await expect(registeredHub.getByText("Updated Contact Person")).toBeVisible();

    // 10. Test Lifecycle Status Transition dialog on newly created hub
    const statusBtn = registeredHub.getByRole("button", { name: "Status" });
    await statusBtn.click();
    await expect(page.getByRole("heading", { name: "Transition Hub Status" })).toBeVisible();

    await page.getByTestId("select-target-status").selectOption("INACTIVE");
    await page.getByTestId("input-status-reason").fill("Scheduled annual compliance review");
    await page.getByTestId("submit-status-transition").click();

    // Verify Inactive badge is displayed on the hub
    await expect(registeredHub.getByText("Inactive")).toBeVisible();
  });

  test("3. Dealership Admin: scoped strictly to assigned hub, cannot register or change status", async ({
    page,
    isMobile,
  }) => {
    // 1. Log in as Dealership Admin (assigned to dlr-1)
    await page.goto("/login");
    await page.getByText("Dealership Admin").first().click();
    await page.getByRole("button", { name: "Authenticate & Open Shell" }).click();
    await page.waitForURL("**/dashboard");

    // 2. Navigate to /dealerships
    await page.goto("/dealerships");
    await expect(page.getByText("Dealership & Distribution Hubs").first()).toBeVisible();

    // 3. Dealership Admin must NOT see Register button
    await expect(page.getByTestId("btn-register-dealership")).not.toBeVisible();

    // 4. Must see their assigned hub (DLR-DHK-01)
    const dhkHub = isMobile
      ? page.getByTestId("dealership-card-dlr-1")
      : page.getByTestId("dealership-row-dlr-1");
    await expect(dhkHub).toBeVisible();
    await expect(dhkHub.getByText("DLR-DHK-01")).toBeVisible();

    // 5. Dealership Admin must NOT see Status transition button
    await expect(dhkHub.getByRole("button", { name: "Status" })).not.toBeVisible();

    // 6. Dealership Admin can open Edit dialog, but name is disabled
    const editBtn = dhkHub.getByRole("button", { name: "Edit" });
    await editBtn.click();
    await expect(page.getByRole("heading", { name: "Edit Dealership Profile" })).toBeVisible();

    const nameInput = page.getByTestId("input-edit-dealership-name");
    await expect(nameInput).toBeDisabled();

    // Operational contact is editable
    const contactInput = page.getByTestId("input-edit-contact-person");
    await expect(contactInput).toBeEnabled();

    // Cancel edit
    await page.getByRole("button", { name: "Cancel" }).click();
  });

  test("4. Software Super Admin: infrastructure role isolation boundary is enforced", async ({
    page,
  }) => {
    // 1. Log in as Super Admin
    await page.goto("/login");
    await page.getByText("Super Admin").first().click();
    await page.getByRole("button", { name: "Authenticate & Open Shell" }).click();
    await page.waitForURL("**/dashboard");

    // 2. Navigate to /dealerships
    await page.goto("/dealerships");

    // 3. Must see the Infrastructure Role Isolation Boundary message
    await expect(page.getByText("Infrastructure Role Isolation Boundary")).toBeVisible();
    await expect(
      page.getByText("Commercial dealership records and operational sales hubs are isolated")
    ).toBeVisible();

    // No commercial table or register button should exist
    await expect(page.getByTestId("btn-register-dealership")).not.toBeVisible();
    await expect(page.getByTestId("dealerships-table")).not.toBeVisible();
  });
});
