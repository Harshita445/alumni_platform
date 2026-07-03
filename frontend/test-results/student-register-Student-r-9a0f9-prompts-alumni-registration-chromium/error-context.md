# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: student-register.spec.ts >> Student registration page >> rejects be25 emails and prompts alumni registration
- Location: tests\student-register.spec.ts:7:9

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - navigation [ref=e3]:
      - link "Alumly" [ref=e4] [cursor=pointer]:
        - /url: /
      - generic [ref=e5]:
        - link "Explore" [ref=e6] [cursor=pointer]:
          - /url: /search
        - link "Dashboard" [ref=e7] [cursor=pointer]:
          - /url: /dashboard
        - link "Bookings" [ref=e8] [cursor=pointer]:
          - /url: /bookings
        - link "Profile" [ref=e9] [cursor=pointer]:
          - /url: /profile
      - generic [ref=e10]:
        - link "Login" [ref=e11] [cursor=pointer]:
          - /url: /login
        - link "Register" [ref=e12] [cursor=pointer]:
          - /url: /register
  - main [ref=e13]:
    - heading "Student Registration" [level=1] [ref=e14]
    - generic [ref=e15]:
      - textbox "Full name" [ref=e16]
      - textbox "xyz_be24@thapar.edu" [ref=e17]
      - textbox "Admission year" [ref=e18]
      - textbox "Graduation year" [ref=e19]
      - textbox "Password" [ref=e20]
      - button "Continue" [ref=e21] [cursor=pointer]
      - button "Continue with Google" [disabled] [ref=e22] [cursor=pointer]
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
> 16 |       await page.waitForLoadState('networkidle');
     |                  ^ Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
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
  29 |       ).toBeVisible({ timeout: 5000 });
  30 |     });
  31 |   }
  32 | });
  33 | 
```