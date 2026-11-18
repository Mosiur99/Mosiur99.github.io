import { expect, test } from '@playwright/test';

test('home page shows the profile and every section', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mosiur Zzaman');
  for (const id of ['about', 'experience', 'projects', 'skills', 'cp', 'education', 'contact']) {
    await expect(page.locator(`#${id}`)).toBeAttached();
  }
});

test('files linked from the page are served', async ({ request }) => {
  for (const path of ['/Mosiur_Zzaman_CV.pdf', '/og.png', '/rss.xml', '/sitemap-index.xml']) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
});

test('blog and missing pages respond correctly', async ({ page }) => {
  expect((await page.goto('/blog/'))?.status()).toBe(200);
  expect((await page.goto('/this-page-does-not-exist/'))?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
});
