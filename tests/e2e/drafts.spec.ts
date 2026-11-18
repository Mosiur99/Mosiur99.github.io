import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { watchCsp } from './csp';

const slug = '/blog/idempotency-keys-in-payledger/';

test.describe('draft preview build', () => {
  test('lists the draft with a Draft badge', async ({ page }) => {
    await page.goto('/blog/');
    const item = page.getByRole('listitem').filter({ hasText: 'idempotency key' }).first();
    await expect(item).toContainText('Draft');
    await expect(item).toContainText('min read');
  });

  test('renders the post with a table of contents', async ({ page }) => {
    await page.goto(slug);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'How an idempotency key keeps a payment from running twice',
    );
    const toc = page.getByRole('navigation', { name: 'On this page' });
    await toc.getByRole('link', { name: 'The gap that is easy to miss' }).click();
    await expect(page).toHaveURL(/#the-gap-that-is-easy-to-miss$/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  });

  test('shows the post on the home page Writing list', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#writing')).toContainText('idempotency key');
    await expect(page.locator('[data-section-link="writing"]')).toHaveCount(1);
  });

  test('keeps wide tables inside the screen on phones', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 360, height: 740 } });
    const page = await context.newPage();
    await page.goto(slug);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
    await context.close();
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`post page has no accessibility violations in ${colorScheme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(slug);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test('post page loads without Content Security Policy violations', async ({ page }) => {
    const violations = await watchCsp(page);
    await page.goto(slug);
    expect(await violations()).toEqual([]);
  });
});
