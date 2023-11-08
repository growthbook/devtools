import { test, expect } from "@playwright/test";

const URL = "https://github.com/growthbook/growthbook";

test("has title", async ({ page }) => {
  await page.goto(URL);

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/growthbook\/growthbook/);
});
