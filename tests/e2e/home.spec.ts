import { expect, test } from '@playwright/test';

test.describe('home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the name and role', async ({ page }) => {
    await expect(page).toHaveTitle('Mosiur Zzaman · Backend Software Engineer');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText("Hi, I'm Mosiur Zzaman");
    await expect(page.getByText('Backend Software Engineer')).toBeVisible();
  });

  test('has no horizontal scroll', async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });
});
