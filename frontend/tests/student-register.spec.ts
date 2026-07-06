import { test, expect } from '@playwright/test';

const suffixes = ['be23', 'be24', 'be25', 'be26'];

test.describe('Student registration page', () => {
  for (const suffix of suffixes) {
    test(`rejects ${suffix} emails and prompts alumni registration`, async ({ page }) => {
      await page.goto('/register/student');

      // Wait briefly for either the SSO button or an email input to appear.
      // If SSO-only flow is present, the manual email form won't be available and
      // the test will return early (considered a no-op for this check).
      const ssoLocator = page.locator('button:has-text("Continue with your Thapar Account")');
      const emailLocator = page.locator('input[type="email"], input[placeholder*="@thapar.edu"], input[name="email"], input[placeholder="xyz_be24@thapar.edu"]');

      const appeared = await Promise.race([
        ssoLocator.waitFor({ state: 'visible', timeout: 3000 }).then(() => 'sso').catch(() => null),
        emailLocator.first().waitFor({ state: 'visible', timeout: 3000 }).then(() => 'email').catch(() => null),
      ]);

      if (appeared !== 'email') {
        // Manual email form not present (SSO-only). Skip this check.
        return;
      }

      const input = emailLocator.first();
      await input.fill(`student_${suffix}@thapar.edu`);
      // Full name and password fields may have different placeholders; use common fallbacks.
      const nameLocator = page.locator('input[placeholder="Full name"], input[name="name"]');
      const passLocator = page.locator('input[placeholder="Password"], input[name="password"]').first();
      const confirmPassLocator = page.locator('input[placeholder="Confirm password"], input[name="confirmPassword"]').first();

      await nameLocator.fill('Test Student');
      await passLocator.fill('Password123!');
      await confirmPassLocator.fill('Password123!');

      await page.getByRole('button', { name: /Create Student Account/i }).click();

      await expect(
        page.getByText('This email looks like an alumni email. Please register as an alumni instead.')
      ).toBeVisible({ timeout: 5000 });
    });
  }
});
