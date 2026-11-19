import { expect, test } from '@playwright/test';
import { watchCsp } from './csp';

for (const path of ['/', '/blog/', '/styleguide/', '/no-such-page/']) {
  test(`${path} loads without Content Security Policy violations`, async ({ page }) => {
    const violations = await watchCsp(page);
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('meta[http-equiv="content-security-policy"]')).toHaveCount(1);
    expect(await violations()).toEqual([]);
  });
}

test('interactive features still run under the policy', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const violations = await watchCsp(page);
  await page.goto('/');
  await page
    .getByRole('button', { name: /Switch to (dark|light) theme/ })
    .first()
    .click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', /dark|light/);
  await page.getByRole('button', { name: 'Copy email' }).click();
  await expect(page.getByRole('status')).toHaveText('Email address copied');
  expect(await violations()).toEqual([]);
});

test('describes the person with structured data', async ({ page }) => {
  await page.goto('/');
  const json = await page.locator('script[type="application/ld+json"]').textContent();
  const data = JSON.parse(json ?? '{}');
  expect(data['@type']).toBe('Person');
  expect(data.sameAs).toContain('https://github.com/Mosiur99');
});

test('serves the social preview image and icons', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://mosiur99.github.io/og.png',
  );
  for (const path of ['/og.png', '/apple-touch-icon.png', '/favicon.svg']) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
});

test('publishes robots.txt and a sitemap without hidden pages', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Sitemap: https://mosiur99.github.io/sitemap-index.xml');
  const sitemap = await (await request.get('/sitemap-0.xml')).text();
  expect(sitemap).toContain('<loc>https://mosiur99.github.io/</loc>');
  expect(sitemap).not.toContain('styleguide');
  expect(sitemap).not.toContain('404');
});

test('shows a helpful 404 page', async ({ page }) => {
  const response = await page.goto('/no-such-page/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
  await expect(page.getByRole('link', { name: 'Go to the home page' })).toHaveAttribute(
    'href',
    '/',
  );
});

test('pages hidden from search have no canonical link', async ({ page }) => {
  await page.goto('/styleguide/');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
});

test('preloads the fonts used above the fold so the text does not jump', async ({
  page,
  request,
}) => {
  await page.goto('/');
  const hrefs = await page
    .locator('link[rel="preload"][as="font"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
  expect(hrefs).toHaveLength(4);
  const css = await page.evaluate(() =>
    [...document.styleSheets]
      .flatMap((sheet) => [...sheet.cssRules].map((rule) => rule.cssText))
      .join('\n'),
  );
  for (const href of hrefs) {
    expect((await request.get(href)).status(), href).toBe(200);
    expect(css, `${href} is used by a @font-face rule`).toContain(href);
  }
});
