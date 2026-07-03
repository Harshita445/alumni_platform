# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: student-register.spec.ts >> Student registration page >> rejects be23 emails and prompts alumni registration
- Location: tests\student-register.spec.ts:7:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('This email looks like an alumni email. Please register as an alumni instead.')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('This email looks like an alumni email. Please register as an alumni instead.')

```

```yaml
- banner:
  - navigation:
    - link "Alumly":
      - /url: /
    - link "Explore":
      - /url: /search
    - link "Dashboard":
      - /url: /dashboard
    - link "Bookings":
      - /url: /bookings
    - link "Profile":
      - /url: /profile
    - link "Login":
      - /url: /login
    - link "Register":
      - /url: /register
- main:
  - heading "Student Registration" [level=1]
  - textbox "Full name": Test Student
  - textbox "xyz_be24@thapar.edu": student_be23@thapar.edu
  - textbox "Admission year"
  - textbox "Graduation year"
  - textbox "Password": Password123!
  - button "Continue"
  - button "Continue with Google" [disabled]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const suffixes = ['be23', 'be24', 'be25', 'be26'];
  4  | 
  5  | test.describe('Student registration page', () => {
  6  |   for (const suffix of suffixes) {
  7  |     test(`rejects ${suffix} emails and prompts alumni registration`, async ({ page }) => {
  8  |       page.on('console', (msg) => {
  9  |         console.log('PW_CONSOLE:', msg.text());
  10 |       });
  11 |       page.on('pageerror', (err) => {
  12 |         console.log('PW_PAGEERROR:', err.message);
  13 |       });
  14 | 
  15 |       await page.goto('/register/student');
  16 |       await page.waitForLoadState('networkidle');
  17 | 
  18 |       await page.locator('input[placeholder="xyz_be24@thapar.edu"]').fill(`student_${suffix}@thapar.edu`);
  19 |       await page.locator('input[placeholder="Full name"]').fill('Test Student');
  20 |       await page.locator('input[placeholder="Password"]').fill('Password123!');
  21 | 
  22 |       await page.locator('button:not([disabled]):has-text("Continue")').first().click();
  23 |       await page.waitForTimeout(1000);
  24 |       console.log('MAIN TEXT:', await page.locator('main').innerText());
  25 |       console.log('ERROR TEXT:', await page.locator('p').allInnerTexts());
  26 | 
  27 |       await expect(
  28 |         page.getByText('This email looks like an alumni email. Please register as an alumni instead.')
> 29 |       ).toBeVisible({ timeout: 5000 });
     |         ^ Error: expect(locator).toBeVisible() failed
  30 |     });
  31 |   }
  32 | });
  33 | 
```