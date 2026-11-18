import { expect, test } from '@playwright/test';

test.describe('published blog', () => {
  test('lists no drafts and is hidden from search while empty', async ({ page }) => {
    await page.goto('/blog/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog');
    await expect(page.getByText('No posts yet.')).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  });

  test('does not build pages for drafts', async ({ request }) => {
    const response = await request.get('/blog/idempotency-keys-in-payledger/');
    expect(response.status()).toBe(404);
  });

  test('serves a valid RSS feed', async ({ request }) => {
    const response = await request.get('/rss.xml');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('<rss');
    expect(body).toContain('<title>Mosiur Zzaman · Blog</title>');
    expect(body).not.toContain('idempotency-keys-in-payledger');
  });

  test('advertises the feed in the page head', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('link[type="application/rss+xml"]')).toHaveAttribute(
      'href',
      '/rss.xml',
    );
  });
});
