import { expect, test } from "@playwright/test";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

test.describe("authenticated care workflow", () => {
  test.skip(
    !email || !password,
    "Set E2E_EMAIL and E2E_PASSWORD for a dedicated test account.",
  );

  test("login, restore demo, CRUD and run a mock follow-up", async ({
    page,
  }) => {
    await page.goto("/auth/login");
    await page.getByLabel("Email address").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/settings");
    await page.getByLabel(/I understand/).check();
    await page.getByRole("button", { name: "Restore demo workspace" }).click();
    await expect(page.getByText(/restored successfully/i)).toBeVisible();

    await page.goto("/patients/new");
    await page.getByLabel("Full name *").fill("E2E Test Patient");
    await page.getByLabel("Birth date *").fill("1990-01-01");
    await page.getByLabel("Phone number *").fill("+12025550105");
    await page.getByLabel("Primary doctor").selectOption({ index: 1 });
    await page.getByLabel(/Consent to automated/).check();
    await page.getByRole("button", { name: "Create patient" }).click();
    await expect(
      page.getByRole("heading", { name: "E2E Test Patient" }),
    ).toBeVisible();

    const patientUrl = page.url();
    const patientId = patientUrl.split("/patients/")[1]?.split("?")[0];
    await page.getByRole("link", { name: "Add consultation" }).click();
    await page.getByLabel("Doctor *").selectOption({ index: 1 });
    await page.getByLabel("Date and time *").fill("2026-09-06T10:00");
    await page.getByLabel("Reason *").fill("Automated test consultation");
    await page
      .getByLabel("Recommendations (one per line)")
      .fill("Rest and maintain hydration.");
    await page.getByRole("button", { name: "Save consultation" }).click();
    await expect(page.getByText(/Consultation saved/i)).toBeVisible();

    await page.goto(`/followups/new?patient=${patientId}`);
    await page.getByLabel("Call date and time *").fill("2030-01-01T12:00");
    await page.getByRole("button", { name: "Schedule follow-up" }).click();
    await page
      .getByLabel("Simulation scenario")
      .first()
      .selectOption("clinical_review");
    await page.getByRole("button", { name: "Run scenario" }).first().click();
    await expect(page.getByText(/Mock call completed/i)).toBeVisible();

    await page.goto(`/patients/${patientId}`);
    await expect(page.getByText("Needs clinical review")).toBeVisible();
    await page.getByRole("button", { name: "Mark as reviewed" }).click();
    await expect(page.getByText(/marked as reviewed/i)).toBeVisible();

    await page.goto("/appointments/new");
    await page.getByLabel("Patient *").selectOption(patientId);
    await page.getByLabel("Doctor *").selectOption({ index: 1 });
    await page.getByLabel("Date and time *").fill("2030-01-02T12:00");
    await page.getByRole("button", { name: "Create appointment" }).click();
    await expect(page.getByText("E2E Test Patient")).toBeVisible();
  });
});
