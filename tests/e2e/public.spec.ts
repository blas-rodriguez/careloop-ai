import { expect, test } from "@playwright/test";

test("public showcase is responsive and has no horizontal overflow", async ({
  page,
}) => {
  await page.goto("/showcase");
  await expect(
    page.getByRole("heading", {
      name: /Every patient deserves a follow-up/i,
    }),
  ).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
});

test("protected workspace redirects unauthenticated visitors", async ({
  page,
}) => {
  await page.goto("/patients");
  await expect(page).toHaveURL(/\/auth\/login/);
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create demo account" }),
  ).toBeVisible();
});
