import { expect, test } from '@playwright/test';

const email = 'mosiurzzaman99@gmail.com';

test.describe('contact', () => {
  test('copies the email address', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
    await page.getByRole('button', { name: 'Copy email' }).click();
    await expect(page.getByRole('status')).toHaveText('Email address copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(email);
  });

  test('selects the address when copying is not allowed', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: () => Promise.reject(new Error('denied')) },
      });
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'Copy email' }).click();
    await expect(page.getByRole('status')).toContainText('Ctrl+C');
    expect(await page.evaluate(() => window.getSelection()?.toString())).toBe(email);
  });

  test('offers a mail link and LinkedIn', async ({ page }) => {
    await page.goto('/');
    const contact = page.locator('#contact');
    await expect(contact.getByRole('link', { name: 'Send email' })).toHaveAttribute(
      'href',
      `mailto:${email}`,
    );
    await expect(contact.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'target',
      '_blank',
    );
  });
});

test.describe('education and writing', () => {
  test('shows the degree', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#education')).toContainText(
      'Noakhali Science and Technology University',
    );
  });

  test('hides Writing while there are no published posts', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#writing')).toHaveCount(0);
    await expect(page.locator('[data-section-link="writing"]')).toHaveCount(0);
  });
});
