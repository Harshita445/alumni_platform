import { test, expect } from '@playwright/test';

test.describe('Login page', () => {
  const tokenData = {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    token_type: 'bearer',
  };

  test('allows alumni to log in with valid credentials and redirects to onboarding', async ({ page }) => {
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(tokenData),
      });
    });

    await page.route('**/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'demo-alumni@example.com',
          role: 'alumni',
          verification_status: 'verified',
          onboarding_step: 0,
        }),
      });
    });

    await page.route('**/profile/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          full_name: 'Demo Alumni',
          company: 'Demo Company',
          designation: 'Engineering Lead',
          bio: 'Demo alumni profile for local testing.',
        }),
      });
    });

    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.locator('h1', { hasText: 'Login to your account' })).toBeVisible({ timeout: 30000 });

    await page.getByRole('button', { name: /^Login$/ }).click();
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 20000 });
    await expect(page.getByText(/Complete your mentor profile/i)).toBeVisible({ timeout: 20000 });
  });

  test('allows student to use the demo login button and redirects to onboarding', async ({ page }) => {
    await page.route('**/auth/demo-login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(tokenData),
      });
    });

    await page.route('**/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 2,
          email: 'demo-student@example.com',
          role: 'student',
          verification_status: 'verified',
          onboarding_step: 0,
        }),
      });
    });

    await page.route('**/profile/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          full_name: 'Demo Student',
          branch: 'CSE',
          graduation_year: 2026,
          bio: 'Demo student profile for local testing.',
        }),
      });
    });

    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.getByRole('button', { name: /Demo sign in as student/i })).toBeVisible({ timeout: 30000 });

    await page.getByRole('button', { name: /Demo sign in as student/i }).click();
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 20000 });
    await expect(page.getByText(/Complete your student profile/i)).toBeVisible({ timeout: 20000 });
  });
});
