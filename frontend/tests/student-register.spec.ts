import { test, expect } from '@playwright/test';

const suffixes = ['be23', 'be24', 'be25', 'be26'];

test.describe('Student registration page', () => {
  for (const suffix of suffixes) {
    test(`rejects ${suffix} emails and prompts alumni registration`, async ({ page }) => {
      await page.goto('/register/student');

      await page.locator('input[placeholder="xyz_be24@thapar.edu"]').fill(`student_${suffix}@thapar.edu`);
      await page.locator('input[placeholder="Full name"]').fill('Test Student');
      await page.locator('input[placeholder="Password"]').fill('Password123!');

      await page.locator('button:not([disabled]):has-text("Continue")').first().click();

      await expect(
        page.getByText('This email looks like an alumni email. Please register as an alumni instead.')
      ).toBeVisible({ timeout: 5000 });
    });
  }
});
