import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`style guide in ${colorScheme} mode`, () => {
    test.use({ colorScheme });

    test('has no accessibility violations', async ({ page }) => {
      await page.goto('/styleguide');
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  });
}

test('is hidden from search engines', async ({ page }) => {
  await page.goto('/styleguide');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});

test('dark theme changes the page background', async ({ page }) => {
  await page.goto('/styleguide');
  const background = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(await background()).toBe('rgb(247, 248, 250)');
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  expect(await background()).toBe('rgb(11, 16, 32)');
});

test('loads the self-hosted fonts', async ({ page }) => {
  await page.goto('/styleguide');
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() =>
    [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family),
  );
  expect(loaded).toEqual(expect.arrayContaining(['Inter', 'Montserrat']));
});
